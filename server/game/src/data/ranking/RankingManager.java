package data.ranking;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import data.ConstInfo;
import data.MiscDefine;
import data.MiscInfo;
import data.ranking.RankingBoard.Board;
import extension.EnvConfig;
import model.UserBrief;
import model.UserOnline;
import model.mail.MailBox;
import model.ranking.RankingAddReward;
import model.ranking.RankingTopDaily;
import redis.clients.jedis.Tuple;
import service.UdpHandler;
import util.Address;
import util.Database;
import util.Time;
import util.collection.MapItem;
import util.io.ShareLoopGroup;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.redis.Redis;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class RankingManager
{
    private final static int SIZE_UPDATE = 100;
    private final static int TIME_EXPIRE = Time.SECOND_IN_30_DAY;

    private static boolean                     isRunning;

    private static ConcurrentHashMap<String, ConcurrentHashMap<Integer, UpdateScore>> mapUpdateScore = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String, ConcurrentHashMap<Integer, Boolean>>     mapRemoveScore = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String, List<RankingBoard.Item>>                 cacheTop       = new ConcurrentHashMap<>();

    private static RankingBoard rankingBoard = null;

    public static synchronized void start ()
    {
        if (!MiscInfo.RANKING_BOARD_ACTIVE())
            return;
        if (isRunning)
            return;

        Debug.info("RankingManager", "start", Address.PRIVATE_HOST, EnvConfig.group());
        Set<String> topIds = ConstInfo.getRankingBoardInfo().TOP_REWARD_IDS();
        final int PERIOD_SAVE = 10;
        long timeWait;

        //server
        if (EnvConfig.service() == EnvConfig.Service.ADMIN || EnvConfig.isLocal())
        {
            buildCache();
            long timeMidnight = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).toEpochSecond(Time.zone);
            for (int i = 0, len = MiscInfo.RANKING_UPDATE_HOURS_SIZE(); i < len; i++)
            {
                int hour = MiscInfo.RANKING_UPDATE_HOURS(i);
                long delay = timeMidnight + hour * Time.SECOND_IN_HOUR - Time.getUnixTime();
                if (delay < 0)
                    delay += Time.SECOND_IN_DAY;
                //Debug.info("delay", delay);
                ShareLoopGroup.scheduleAtFixedRate(() -> buildCache(), delay, Time.SECOND_IN_DAY, TimeUnit.SECONDS, true);
            }

            //hẹn giờ phát quà
            for (String id : topIds)
            {
                timeWait = ConstInfo.getRankingBoardInfo().getRewardTime(id) - Time.getUnixTime();
                if (timeWait > 0)
                    ShareLoopGroup.schedule(() -> addReward(id), timeWait, TimeUnit.SECONDS, true);
            }

            //hẹn giờ build cache lúc kết thúc event
            for (String id : topIds)
            {
                timeWait = ConstInfo.getRankingBoardInfo().getEndTime(id) - Time.getUnixTime();

                //build lại bảng cache bảng xếp hạng khi event kết thúc
                if (timeWait > 0)
                {
                    int periodSaveUserData = EnvConfig.getUser().getPeriodSave();
                    ShareLoopGroup.schedule(() -> buildCache(), timeWait, TimeUnit.SECONDS, true);
                    ShareLoopGroup.schedule(() -> buildCache(), timeWait + periodSaveUserData * 3 / 2, TimeUnit.SECONDS, true);
                }
            }
        }

        //client
        if (EnvConfig.service() != EnvConfig.Service.ADMIN || EnvConfig.isLocal())
        {
            //save định kỳ
            ShareLoopGroup.scheduleWithFixedDelay(() -> save(), PERIOD_SAVE, PERIOD_SAVE, TimeUnit.SECONDS, true);
            for (String id : topIds)
            {
                timeWait = ConstInfo.getRankingBoardInfo().getEndTime(id) - Time.getUnixTime();
                if (timeWait > 0)
                {
                    //save điểm khi kết thúc event
                    ShareLoopGroup.schedule(() -> save(), timeWait, TimeUnit.SECONDS, true);

                    //load lại bảng cache xếp hạng
                    int periodSaveUserData = EnvConfig.getUser().getPeriodSave();
                    ShareLoopGroup.schedule(() -> load(), timeWait + periodSaveUserData / 2, TimeUnit.SECONDS, true);
                    ShareLoopGroup.schedule(() -> load(), timeWait + periodSaveUserData * 2, TimeUnit.SECONDS, true);
                }
            }

            //load every hour
            load();
            long nextHour = LocalDateTime.now().withMinute(0).withSecond(0).plusHours(1).toEpochSecond(Time.zone);
            timeWait = nextHour - Time.getUnixTime();
            ShareLoopGroup.scheduleWithFixedDelay(() -> load(), timeWait + MiscInfo.RANKING_UPDATE_DELAY() / 2, Time.SECOND_IN_HOUR, TimeUnit.SECONDS, true);
        }

        isRunning = true;

    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        Debug.info("RankingManager", "stop", Address.PRIVATE_HOST, EnvConfig.group());

        save();

        isRunning = false;
    }

    public static void updateScore (String key, int userId, int score)
    {
        Debug.info("RankingManager", "updateScore", key, userId, score);
        if (score <= 0)
            return;
        ConcurrentHashMap<Integer, UpdateScore> queue = mapUpdateScore.get(key);
        if (queue == null)
            queue = mapUpdateScore.computeIfAbsent(key, s -> new ConcurrentHashMap<>());

        queue.put(userId, new UpdateScore(userId, score));
    }

    public static void removeScore (String key, int userId)
    {
        ConcurrentHashMap<Integer, Boolean> queue = mapRemoveScore.get(key);
        if (queue == null)
            queue = mapRemoveScore.computeIfAbsent(key, s -> new ConcurrentHashMap<>());

        Debug.info("RankingManager", "removeScore", key, userId);
        queue.put(userId, Boolean.TRUE);
    }

    public static List<RankingBoard.Item> getTopDaily (String key)
    {
        //Lấy top từ cache
        List<RankingBoard.Item> items = cacheTop.get(key);
        if (items != null)
            return items;

        //Nếu không có thì lấy từ db
        items = RankingTopDaily.get(key);

        //Nếu vẫn ko có thì thử gán vào giá trị rỗng
        if (items == null)
            items = cacheTop.computeIfAbsent(key, s -> new ArrayList<>());
        return items;
    }

    public static int getRank (String key, int userId)
    {
        return (int) Database.ranking().zrank(key, Integer.toString(userId));
    }

    public static List<RankingBoard.Item> getRedisTop (String key)
    {
        return getRedisTop(key, MiscInfo.RANKING_BOARD_ITEM_NUM());
    }

    public static List<RankingBoard.Item> getRedisTop (String key, int num)
    {
        List<RankingBoard.Item> top = new ArrayList<>(num);

        Set<Tuple> dbTop = Database.ranking().zrevrangeWithScores(key, 0, num - 1);
        for (Tuple tuple : dbTop)
        {
            int id = Integer.parseInt(tuple.getElement());
            UserBrief brief = UserBrief.get(id);
            RankingBoard.Item item;
            if (brief == null)
                item = RankingBoard.Item.create(id, 0, Integer.toString(id), null, (int) tuple.getScore(), top.size() + 1);
            else
                item = RankingBoard.Item.create(id, brief.level, brief.displayName, brief.avatar, (int) tuple.getScore(), top.size() + 1);
            top.add(item);
        }
        return top;
    }

    private static class UpdateScore
    {
        String userId;
        double score;

        public UpdateScore (int userId, int score)
        {
            this.userId = Integer.toString(userId);
            this.score = score;
        }
    }

    public static void buildCache ()
    {
        Debug.info("RankingManager", "updateMidnight", Address.PRIVATE_HOST, EnvConfig.group());

        Set<String> keys = ConstInfo.getRankingBoardInfo().TOP_IDS();
        for (String key : keys)
        {
            byte result;
            try
            {
                List<RankingBoard.Item> items = getRedisTop(key);
                RankingTopDaily.set(key, items);
                result = ErrorConst.SUCCESS;
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
                result = ErrorConst.EXCEPTION;
            }
            MetricLog.actionSystem("RANKING_BUILD_CACHE",
                                   "",
                                   result,
                                   key);
        }
    }

    private static synchronized void save ()
    {
        Debug.trace("RankingManager", "save", Address.PRIVATE_HOST, EnvConfig.group());

        Redis redis = Database.ranking();
        int userId;

        //remove old score
        List<String> ids = new ArrayList<>();
        for (Map.Entry<String, ConcurrentHashMap<Integer, Boolean>> entry : mapRemoveScore.entrySet())
        {
            String key = entry.getKey();
            ConcurrentHashMap<Integer, Boolean> map = entry.getValue();
            if (map.isEmpty())
                continue;

            for (Iterator<Integer> it = map.keySet().iterator(); it.hasNext(); )
            {
                userId = it.next();
                it.remove();

                ids.add(Integer.toString(userId));
                if (ids.size() >= SIZE_UPDATE)
                {
                    redis.zrem(key, ids, 0);
                    ids.clear();
                }
                
                MetricLog.actionUser("RANKING_REMOVE_SCORE",
                                     userId,
                                     (short) -1,
                                     "",
                                     null,
                                     null,
                                     ErrorConst.SUCCESS,
                                     key
                                    );
            }
            if (ids.size() > 0)
            {
                redis.zrem(key, ids, 0);
                ids.clear();
            }
            redis.expire(key, TIME_EXPIRE);
        }

        //update new score
        Map<String, Double> mapScore = new HashMap<>();
        for (Map.Entry<String, ConcurrentHashMap<Integer, UpdateScore>> entry : mapUpdateScore.entrySet())
        {
            String key = entry.getKey();
            ConcurrentHashMap<Integer, UpdateScore> map = entry.getValue();
            if (map.isEmpty())
                continue;
            for (Iterator<UpdateScore> it = map.values().iterator(); it.hasNext(); )
            {
                UpdateScore info = it.next();
                it.remove();

                mapScore.put(info.userId, info.score);
                if (mapScore.size() >= SIZE_UPDATE)
                {
                    redis.zadd(key, mapScore, 0);
                    mapScore.clear();
                }
                
                MetricLog.actionUser("RANKING_UPDATE_SCORE",
                                     info.userId,
                                     (short) -1,
                                     "",
                                     null,
                                     null,
                                     ErrorConst.SUCCESS,
                                     key,
                                     info.score
                                    );
            }
            if (mapScore.size() > 0)
            {
                redis.zadd(key, mapScore, 0);
                mapScore.clear();
            }
            redis.expire(key, TIME_EXPIRE);
        }
    }

    private static synchronized void load ()
    {
        Debug.trace("RankingManager", "load", Address.PRIVATE_HOST, EnvConfig.group());
        Set<String> keys = ConstInfo.getRankingBoardInfo().TOP_IDS();

        for (String key : keys)
        {
            List<RankingBoard.Item> items = RankingTopDaily.get(key);
            if (items == null)
                items = new ArrayList<>();
            if (items.size() > MiscInfo.RANKING_BOARD_VIEW_NUM())
                cacheTop.put(key, items.subList(0, MiscInfo.RANKING_BOARD_VIEW_NUM()));
            else
                cacheTop.put(key, items);
        }

        RankingManager.initBoards();
    }

    public static void initBoards ()
    {
        RankingBoard temp = RankingBoard.create();

        if (temp != null)
            rankingBoard = temp;
    }

    public static Board[] getBoards (short level)
    {
        if (rankingBoard == null)
            return null;

        return rankingBoard.getBoards(level);
    }

    public static synchronized List<ResultAddReward> addReward (String key)
    {
        List<RankingBoard.Item> top = getRedisTop(key);
        buildCache();

        String mailTitle = ConstInfo.getRankingBoardInfo().getMailTitle(key);
        String mailContent = "TXT_MAIL_TOP_REWARD_CONTENT,";

        int userId, rank;
        short userLevel;
        byte error;
        List<ResultAddReward> results = new ArrayList<>();

        for (int i = 0; i < top.size(); i++)
        {
            rank = i + 1;
            RankingBoard.Item item = top.get(i);
            userId = item.USER_ID();
            userLevel = (short) item.USER_LEVEL();
            error = ErrorConst.EMPTY;
            MapItem receiveItems = new MapItem();
            MailBox.Mail mail = null;

            if (RankingAddReward.add(key, rank, userId))
            {
                try
                {
                    UserBrief userBrief = UserBrief.get(userId);
                    if (userBrief == null)
                    {
                        error = ErrorConst.NULL_USER;
                    }
                    else
                    {
                        CasValue<MailBox> cas = MailBox.gets(userBrief.getBucketId(), userId);
                        if (cas == null)
                        {
                            error = ErrorConst.GETS_FAIL;
                        }
                        else
                        {
                            MapItem reward = ConstInfo.getRankingBoardInfo().getReward(key, userLevel, rank);
                            MapItem bonus = ConstInfo.getRankingBoardInfo().getBonus(key, userLevel, rank);

                            if (bonus != null && bonus.size() > 0 && EnvConfig.isZone(MiscDefine.COUNTRY_VIETNAM)) 
							{
                                receiveItems.increase(bonus);
                            }

                            if (reward == null || reward.isEmpty())
                            {
                                error = ErrorConst.NULL_OBJECT;
                            }
                            else
                            {
                                receiveItems.increase(reward);
                                MailBox mailBox = cas.object;
                                mail = mailBox.addMailPrivate(MiscDefine.MAIL_TOP_REWARD,
                                                              mailTitle,
                                                              mailContent + item.ORDER(),
                                                              receiveItems);

                                if (MailBox.cas(userBrief.getBucketId(), userId, cas.cas, mailBox))
                                {
                                    error = ErrorConst.SUCCESS;

                                    UserOnline online = UserOnline.get(userId);
                                    if (online != null)
                                        UdpHandler.notifyMail(online.getPrivateHost(), online.getPortUdp(), userId);
                                }
                                else
                                {
                                    error = ErrorConst.CAS_FAIL;
                                }
                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    MetricLog.exception(e);
                }
            }
            else
            {
                error = ErrorConst.DUPLICATE;
            }

            if (error != ErrorConst.SUCCESS)
                RankingAddReward.delete(key, rank);
            
            MetricLog.actionUser("RANKING_ADD_REWARD",
                                 userId,
                                 userLevel,
                                 "",
                                 null,
                                 receiveItems,
                                 error,
                                 key,
                                 rank,
                                 mail == null ? -1 : mail.getUid()
                                );
            
            results.add(new ResultAddReward(rank, userId, error));
        }

        return results;
    }

    public static class ResultAddReward
    {
        public int  rank;
        public int  userId;
        public byte result;

        public ResultAddReward (int rank, int userId, byte result)
        {
            this.rank = rank;
            this.userId = userId;
            this.result = result;
        }
    }
}