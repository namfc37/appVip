package data.ranking;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import data.KeyDefine;
import data.MiscInfo;
import data.festival.EventInfo;
import util.Time;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.List;
import java.util.NavigableSet;
import java.util.TreeMap;

public class RankingBoard
{
    private TreeMap<Integer, Board> level;
    private TreeMap<Integer, Board> appraisal;
    private TreeMap<Integer, Board> action;
    private TreeMap<Integer, Board> event;

    public static RankingBoard create ()
    {
        RankingBoard boards = new RankingBoard();
        List<String> keys = new ArrayList<String>();

        NavigableSet<Integer> lvs = ConstInfo.getRankingBoardInfo().getGroupLevels(MiscInfo.TOP_LEVEL());
        if (lvs != null && !lvs.isEmpty())
        {
            boards.level = new TreeMap<>();
            for (int lv : lvs)
            {
                Board board = Board.create(MiscInfo.TOP_LEVEL(), lv);
                String key = board.RANKING_ID() + "_" + board.GROUP_LEVEL();
                keys.add(key);
                board.update(RankingManager.getTopDaily(key), -1);
                boards.level.put(lv, board);
            }
        }

        lvs = ConstInfo.getRankingBoardInfo().getGroupLevels(MiscInfo.TOP_APPRAISAL());
        if (lvs != null && !lvs.isEmpty())
        {
            boards.appraisal = new TreeMap<>();
            for (int lv : lvs)
            {
                Board board = Board.create(MiscInfo.TOP_APPRAISAL(), lv);
                String key = board.RANKING_ID() + "_" + board.GROUP_LEVEL();
                keys.add(key);
                board.update(RankingManager.getTopDaily(key), -1);
                boards.appraisal.put(lv, board);
            }
        }

        TopAction topAction = ConstInfo.getRankingBoardInfo().CURRENT_TOP_ACTION();
        if (topAction == null)
            topAction = ConstInfo.getRankingBoardInfo().PREVIOUS_TOP_ACTION();

        lvs = topAction == null ? null : topAction.getGroups();
        if (lvs != null && !lvs.isEmpty())
        {
            boards.action = new TreeMap<>();
            for (int lv : lvs)
            {
                Board board = Board.create(topAction.RANKING_ID(), lv, topAction.UNIX_START_TIME(), topAction.UNIX_END_TIME());
                String key = board.RANKING_ID() + "_" + board.GROUP_LEVEL() + "_" + board.UNIX_START_TIME();
                keys.add(key);
                board.update(RankingManager.getTopDaily(key), -1);
                boards.action.put(lv, board);
            }
        }

        TopEvent topEvent = ConstInfo.getRankingBoardInfo().CURRENT_TOP_EVENT();
        if (topEvent == null)
            topEvent = ConstInfo.getRankingBoardInfo().PREVIOUS_TOP_EVENT();

        lvs = topEvent == null ? null : topEvent.getGroups();
        if (lvs != null && !lvs.isEmpty())
        {
            EventInfo info = ConstInfo.getFestival().getAction(topEvent.EVENT_ID());

            boards.event = new TreeMap<>();
            for (int lv : lvs)
            {
                Board board = Board.create(topEvent.RANKING_ID(), lv, info.UNIX_START_TIME(), info.UNIX_END_TIME());
                String key = board.RANKING_ID() + "_" + board.GROUP_LEVEL() + "_" + board.UNIX_START_TIME();
                keys.add(key);
                board.update(RankingManager.getTopDaily(key), -1);
                boards.event.put(lv, board);
            }
        }

        Debug.info("RANKING_LOAD_CACHE", keys);

        return boards;
    }

    public Board[] getBoards (int lv)
    {
        Board[] boards = new Board[MiscInfo.TOP_NUM()];

        if (MiscInfo.TOP_LEVEL_ACTIVE() && level != null && level.size() > 0)
            boards[MiscInfo.TOP_LEVEL_INDEX()] = level.ceilingEntry(lv).getValue();

        if (MiscInfo.TOP_APPRAISAL_ACTIVE() && appraisal != null && appraisal.size() > 0)
            boards[MiscInfo.TOP_APPRAISAL_INDEX()] = appraisal.ceilingEntry(lv).getValue();

        if (MiscInfo.TOP_ACTION_ACTIVE() && action != null && action.size() > 0)
            boards[MiscInfo.TOP_ACTION_INDEX()] = action.ceilingEntry(lv).getValue();

        if (MiscInfo.TOP_EVENT_ACTIVE() && event != null && event.size() > 0)
            boards[MiscInfo.TOP_EVENT_INDEX()] = event.ceilingEntry(lv).getValue();

        return boards;
    }

    public static class Board extends Encoder.IObject implements KeyDefine
    {
        private String id;
        private int    lv;
        private long   start;
        private byte   status;
        private int    nextUpdate;

        private List<Item> top;

        public String RANKING_ID ()
        {
            return id;
        }

        public int GROUP_LEVEL ()
        {
            return lv;
        }

        public long UNIX_START_TIME ()
        {
            return start;
        }

        public int STATUS ()
        {
            return status;
        }

        public int NEXT_UPDATE_TIME_UNIX ()
        {
            return nextUpdate;
        }

        public static Board create (String id, int groupLv)
        {
            Board board = new Board();
            board.id = id;
            board.lv = groupLv;
            board.start = -1;
            board.status = MiscInfo.RANKING_BOARD_STATUS_OPEN();
            return board;
        }

        public static Board create (String id, int groupLv, long startTime, long endTime)
        {
            Board board = Board.create(id, groupLv);
            board.start = startTime;
            if (endTime > Time.getUnixTime())
                board.status = MiscInfo.RANKING_BOARD_STATUS_OPEN();
            else
                board.status = MiscInfo.RANKING_BOARD_STATUS_CLOSE();
            return board;
        }

        public void update (List<Item> items, int nextUpdate)
        {
            this.top = items;
            this.nextUpdate = nextUpdate;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(RANK_ID, RANKING_ID());
            msg.put(RANK_GROUP_LEVEL, GROUP_LEVEL());
            msg.put(RANK_START_TIME, UNIX_START_TIME());
            msg.put(RANK_STATUS, STATUS());
            msg.put(RANK_UPDATE_TIME, NEXT_UPDATE_TIME_UNIX());
            msg.put(RANK_LIST, top);
        }
    }

    public static class Item extends Encoder.IObject implements KeyDefine
    {
        private int    userId;
        private int    userLevel;
        private String userName;
        private String userAvatar;
        private int    point;
        private int    order;

        public static Item create (int userId, int userLevel, String userName, String userAvatar, int point, int order)
        {
            Item i = new Item();
            i.userId = userId;
            i.userLevel = userLevel;
            i.userName = userName;
            i.userAvatar = userAvatar;
            i.point = point;
            i.order = order;
            return i;
        }

        public int USER_ID ()
        {
            return userId;
        }

        public int USER_LEVEL ()
        {
            return userLevel;
        }

        public String USER_NAME ()
        {
            return userName;
        }

        public String USER_AVATAR ()
        {
            return userAvatar;
        }

        public int POINT ()
        {
            return point;
        }

        public int ORDER ()
        {
            return order;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(RANK_USER_ID, USER_ID());
            msg.put(RANK_USER_LV, USER_LEVEL());
            msg.put(RANK_USER_NAME, USER_NAME());
            msg.put(RANK_USER_AVATAR, USER_AVATAR());
            msg.put(RANK_POINT, POINT());
            msg.put(RANK_ORDER, ORDER());
        }
    }
}