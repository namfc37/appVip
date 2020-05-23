package model.object;

import data.ConstInfo;
import data.KeyDefine;
import data.MiscInfo;
import data.UserLevelInfo;
import data.ranking.RankingBoardInfo;
import data.ranking.RankingManager;
import data.ranking.TopAction;
import data.ranking.TopEvent;
import service.friend.FriendInfo;
import util.Time;
import util.serialize.Encoder;

import java.util.ArrayList;

public class RankingPR extends Encoder.IObject implements KeyDefine
{
    private PersonalRecord level;
    private PersonalRecord appraisal;
    private PersonalRecord action;
    private PersonalRecord event;

    private transient int nextUpdate;
    private transient int ownerId;

    private RankingPR ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static RankingPR create ()
    {
        RankingPR ranking = new RankingPR();
        ranking.level = null;
        ranking.appraisal = null;
        ranking.action = null;
        ranking.event = null;
        ranking.nextUpdate = Time.getUnixTime();

        return ranking;
    }

    public PersonalRecord ACTION ()
    {
        return action;
    }

    public boolean NEED_UPDATE ()
    {
        int current = Time.getUnixTime();
        return current > nextUpdate;
    }

    public int LEVEL_POINT ()
    {
        return level == null ? 0 : level.POINT();
    }

    public int APPRAISAL_POINT ()
    {
        return appraisal == null ? 0 : appraisal.POINT();
    }

    public int ACTION_POINT ()
    {
        return action == null ? 0 : action.POINT();
    }

    public int EVENT_POINT ()
    {
        return event == null ? 0 : event.POINT();
    }

    public String LEVEL_ID ()
    {
        if (level == null)
            return null;

        return level.RANKING_ID() + "_" + level.GROUP_LEVEL();
    }

    public String APPRAISAL_ID ()
    {
        if (appraisal == null)
            return null;

        return appraisal.RANKING_ID() + "_" + appraisal.GROUP_LEVEL();
    }

    public String ACTION_ID ()
    {
        if (action == null)
            return null;

        return action.RANKING_ID() + "_" + action.GROUP_LEVEL() + "_" + action.UNIX_START_TIME();
    }

    public String EVENT_ID ()
    {
        if (event == null)
            return null;

        return event.RANKING_ID() + "_" + event.GROUP_LEVEL() + "_" + event.UNIX_START_TIME();
    }

    public void setNextUpdate ()
    {
        nextUpdate = Time.getUnixTime() + MiscInfo.TOP_APPRAISAL_REFRESH_TIME();
    }

    public void update (int userID, int lv)
    {
        this.ownerId = userID;

        if (MiscInfo.TOP_LEVEL_ACTIVE())
        {
            if (level == null)
                level = PersonalRecord.create(MiscInfo.TOP_LEVEL(), lv, -1, -1);
            else
                level.setOrder(RankingManager.getRank(LEVEL_ID(), ownerId));
        }

        if (MiscInfo.TOP_APPRAISAL_ACTIVE())
        {
            if (appraisal == null)
                appraisal = PersonalRecord.create(MiscInfo.TOP_APPRAISAL(), lv, -1, -1);
            else
                appraisal.setOrder(RankingManager.getRank(APPRAISAL_ID(), ownerId));
        }

        if (MiscInfo.TOP_ACTION_ACTIVE())
        {
            TopAction currentTopAction = ConstInfo.getRankingBoardInfo().CURRENT_TOP_ACTION();
            if (currentTopAction != null)
            {
                boolean needUpdate = action == null || !action.RANKING_ID().equalsIgnoreCase(currentTopAction.RANKING_ID()) || action.UNIX_START_TIME() != currentTopAction.UNIX_START_TIME();
                
                if (needUpdate)
                    action = PersonalRecord.create(currentTopAction.RANKING_ID(), lv, currentTopAction.UNIX_START_TIME(), currentTopAction.UNIX_END_TIME());
                else
                {
                    action.UNIX_END_TIME(currentTopAction.UNIX_END_TIME());
                    action.setOrder(RankingManager.getRank(ACTION_ID(), ownerId));
                }
            }
        }

        if (MiscInfo.TOP_EVENT_ACTIVE())
        {
            TopEvent currentTopEvent = ConstInfo.getRankingBoardInfo().CURRENT_TOP_EVENT();
            if (currentTopEvent != null)
            {
                boolean needUpdate = event == null || !event.RANKING_ID().equalsIgnoreCase(currentTopEvent.RANKING_ID()) || event.UNIX_START_TIME() != currentTopEvent.UNIX_START_TIME();
                
                if (needUpdate)
                    event = PersonalRecord.create(currentTopEvent.RANKING_ID(), lv, currentTopEvent.UNIX_START_TIME(), currentTopEvent.UNIX_END_TIME());
                else
                {
                    event.UNIX_END_TIME(currentTopEvent.UNIX_END_TIME());
                    event.setOrder(RankingManager.getRank(EVENT_ID(), ownerId));
                }
            }
        }

        setNextUpdate();
    }

    public static int pointLevel (int level)
    {
        return pointLevel(level, 0, 1);
    }

    public static int pointLevel (int level, long exp, long maxExp)
    {
        return level * 10000 + ((int) (10000.0f * exp / maxExp));
    }

    public boolean updateLevel (int lv, long exp)
    {
        if (lv < MiscInfo.RANKING_BOARD_LEVEL())
            return false;

        if (level == null)
            return false;

        boolean isChangeGroup = lv > level.GROUP_LEVEL();
        if (isChangeGroup)
            RankingManager.removeScore(this.LEVEL_ID(), ownerId);

        long maxExp = UserLevelInfo.EXP(lv);
        if (exp > maxExp)
            exp = maxExp - 1;

        int point = pointLevel(lv, exp, maxExp);
        level.set(lv, point);

        if (isChangeGroup)
        {
            RankingManager.updateScore(this.LEVEL_ID(), ownerId, this.LEVEL_POINT());
            level.setOrder(RankingManager.getRank(LEVEL_ID(), ownerId));
        }

        return true;
    }

    public boolean updateAppraisal (int lv, int point)
    {
        if (lv < MiscInfo.RANKING_BOARD_LEVEL())
            return false;

        if (appraisal == null)
            return false;

        boolean isChangeGroup = lv > appraisal.GROUP_LEVEL();
        if (isChangeGroup)
            RankingManager.removeScore(this.APPRAISAL_ID(), ownerId);

        appraisal.set(lv, point);

        if (isChangeGroup)
        {
            RankingManager.updateScore(this.APPRAISAL_ID(), ownerId, this.APPRAISAL_POINT());
            appraisal.setOrder(RankingManager.getRank(APPRAISAL_ID(), ownerId));
        }

        return true;
    }

    public boolean updateAction (String topId, int lv, int point)
    {
        if (lv < MiscInfo.RANKING_BOARD_LEVEL())
            return false;

        if (!MiscInfo.TOP_ACTION_ACTIVE())
            return false;

        if (action == null || !action.IS_ACTIVE())
        {
            TopAction current = ConstInfo.getRankingBoardInfo().CURRENT_TOP_ACTION();
            if (current == null || !current.isActive())
                return false;

        	if (action != null && action.RANKING_ID().equalsIgnoreCase(current.RANKING_ID ()))
        		return false;
        	
        	action = PersonalRecord.create(current.RANKING_ID(), lv, current.UNIX_START_TIME(), current.UNIX_END_TIME());
        }

        if (!action.RANKING_ID().equalsIgnoreCase(topId))
            return false;

        boolean isChangeGroup = lv > action.GROUP_LEVEL();
        if (isChangeGroup)
            RankingManager.removeScore(this.ACTION_ID(), ownerId);

        action.add(lv, point);

        if (isChangeGroup)
        {
            RankingManager.updateScore(this.ACTION_ID(), ownerId, this.ACTION_POINT());
            action.setOrder(RankingManager.getRank(ACTION_ID(), ownerId));
        }

        return true;
    }

    public boolean updateEvent (int lv, String itemId, int point)
    {
        if (lv < MiscInfo.RANKING_BOARD_LEVEL())
            return false;

        if (!MiscInfo.TOP_EVENT_ACTIVE())
            return false;

        if (event == null || !event.IS_ACTIVE())
            return false;

        TopEvent topEvent = ConstInfo.getRankingBoardInfo().CURRENT_TOP_EVENT();
        if (topEvent == null)
            return false;

        if (!topEvent.EVENT_TOKEN().equalsIgnoreCase(itemId))
            return false;

        boolean isChangeGroup = lv > event.GROUP_LEVEL();
        if (isChangeGroup)
            RankingManager.removeScore(this.EVENT_ID(), ownerId);

        event.set(lv, point);

        if (isChangeGroup)
        {
            RankingManager.updateScore(this.EVENT_ID(), ownerId, this.EVENT_POINT());
            event.setOrder(RankingManager.getRank(EVENT_ID(), ownerId));
        }

        return true;
    }

    public void updateGroupLv (int lv)
    {
        if (this.level != null && this.level.GROUP_LEVEL() < lv)
        {
            RankingManager.removeScore(this.LEVEL_ID(), ownerId);
            this.level.set(lv);
            RankingManager.updateScore(this.LEVEL_ID(), ownerId, this.LEVEL_POINT());
            this.level.setOrder(RankingManager.getRank(LEVEL_ID(), ownerId));
        }

        if (this.appraisal != null && this.appraisal.GROUP_LEVEL() < lv)
        {
            RankingManager.removeScore(this.APPRAISAL_ID(), ownerId);
            this.appraisal.set(lv);
            RankingManager.updateScore(this.APPRAISAL_ID(), ownerId, this.APPRAISAL_POINT());
            this.appraisal.setOrder(RankingManager.getRank(APPRAISAL_ID(), ownerId));
        }

        if (this.action != null && this.action.IS_ACTIVE() && this.action.GROUP_LEVEL() < lv && this.ACTION_POINT() > 0)
        {
            RankingManager.removeScore(this.ACTION_ID(), ownerId);
            this.action.set(lv);
            RankingManager.updateScore(this.ACTION_ID(), ownerId, this.ACTION_POINT());
            this.action.setOrder(RankingManager.getRank(ACTION_ID(), ownerId));
        }

        if (this.event != null && this.event.IS_ACTIVE() && this.event.GROUP_LEVEL() < lv && this.EVENT_POINT() > 0)
        {
            RankingManager.removeScore(this.EVENT_ID(), ownerId);
            this.event.set(lv);
            RankingManager.updateScore(this.EVENT_ID(), ownerId, this.EVENT_POINT());
            this.event.setOrder(RankingManager.getRank(EVENT_ID(), ownerId));
        }
    }

    public void updateGroupLvDailyLogin (int userID, int lv)
    {
        this.update(userID, lv);
        RankingBoardInfo rankingBoardInfo = ConstInfo.getRankingBoardInfo();

        int groupLv = -1;

        if (this.level != null)
        {
        	groupLv = rankingBoardInfo.getGroupLevel(this.level.id, lv);
        	if (this.level.GROUP_LEVEL() != groupLv)
        	{
                RankingManager.removeScore(this.LEVEL_ID(), ownerId);
                this.level.setGroupLv(lv);
                RankingManager.updateScore(this.LEVEL_ID(), ownerId, this.LEVEL_POINT());
                this.level.setOrder(RankingManager.getRank(LEVEL_ID(), ownerId));
        	}
        }

        if (this.appraisal != null)
        {
            groupLv = rankingBoardInfo.getGroupLevel(this.appraisal.id, lv);
            if (this.appraisal.GROUP_LEVEL() != groupLv)
            {
	            RankingManager.removeScore(this.APPRAISAL_ID(), ownerId);
	            this.appraisal.setGroupLv(lv);
	            RankingManager.updateScore(this.APPRAISAL_ID(), ownerId, this.APPRAISAL_POINT());
	            this.appraisal.setOrder(RankingManager.getRank(APPRAISAL_ID(), ownerId));
            }
        }

        if (this.action != null && this.action.IS_ACTIVE() && this.ACTION_POINT() > 0)
        {
            groupLv = rankingBoardInfo.getGroupLevel(this.action.id, lv);
            if (this.action.GROUP_LEVEL() != groupLv)
            {
	            RankingManager.removeScore(this.ACTION_ID(), ownerId);
	            this.action.setGroupLv(lv);
	            RankingManager.updateScore(this.ACTION_ID(), ownerId, this.ACTION_POINT());
	            this.action.setOrder(RankingManager.getRank(ACTION_ID(), ownerId));
            }
        }

        if (this.event != null && this.event.IS_ACTIVE() && this.EVENT_POINT() > 0)
        {
            groupLv = rankingBoardInfo.getGroupLevel(this.event.id, lv);
            if (this.event.GROUP_LEVEL() != groupLv)
            {
                RankingManager.removeScore(this.EVENT_ID(), ownerId);
                this.event.setGroupLv(lv);
                RankingManager.updateScore(this.EVENT_ID(), ownerId, this.EVENT_POINT());
                this.event.setOrder(RankingManager.getRank(EVENT_ID(), ownerId));
            }
        }
    }

    @Override
    public void putData (Encoder msg)
    {
        ArrayList<PersonalRecord> temp = new ArrayList<PersonalRecord>();
        temp.add(level);
        temp.add(appraisal);
        temp.add(action);
        temp.add(event);

        PersonalRecord[] records = new PersonalRecord[temp.size()];
        records = temp.toArray(records);

        msg.put(KEY_ITEMS, records);
    }

    public void updateScore ()
    {
        String id = this.LEVEL_ID();
        if (id != null)
        {
            if (this.level.HAS_CHANGED())
            {
                RankingManager.updateScore(id, ownerId, this.LEVEL_POINT());
                this.level.removeHasChanged();
            }
        }

        id = this.APPRAISAL_ID();
        if (id != null)
        {
            if (this.appraisal.HAS_CHANGED())
            {
                RankingManager.updateScore(id, ownerId, this.APPRAISAL_POINT());
                this.appraisal.removeHasChanged();
            }
        }

        int current = Time.getUnixTime();

        id = this.ACTION_ID();
        if (id != null && ConstInfo.getRankingBoardInfo().getRewardTime(id) > current)
        {
            if (this.action.HAS_CHANGED() && this.ACTION_POINT() > 0)
            {
                RankingManager.updateScore(id, ownerId, this.ACTION_POINT());
                this.action.removeHasChanged();
            }
        }

        id = this.EVENT_ID();
        if (id != null && ConstInfo.getRankingBoardInfo().getRewardTime(id) > current)
        {
            if (this.event.HAS_CHANGED() && this.EVENT_POINT() > 0)
            {
                RankingManager.updateScore(id, ownerId, this.EVENT_POINT());
                this.event.removeHasChanged();
            }
        }
    }

    public static void toFriendRanking (FriendInfo info, int level)
    {
        info.rankingData = new int[MiscInfo.TOP_NUM()];
        info.rankingExpire = new int[MiscInfo.TOP_NUM()];

        info.rankingData[MiscInfo.TOP_LEVEL_INDEX()] = pointLevel(level);
    }

    public void toFriendRanking (FriendInfo info)
    {
        final int size = MiscInfo.TOP_NUM();
        if (info.rankingData == null || info.rankingData.length != size)
            info.rankingData = new int[size];
        if (info.rankingExpire == null || info.rankingExpire.length != size)
            info.rankingExpire = new int[size];

        info.rankingData[MiscInfo.TOP_LEVEL_INDEX()] = LEVEL_POINT();
        info.rankingData[MiscInfo.TOP_APPRAISAL_INDEX()] = APPRAISAL_POINT();

        if (action == null || !action.IS_ACTIVE())
        {
            info.rankingData[MiscInfo.TOP_ACTION_INDEX()] = 0;
            info.rankingExpire[MiscInfo.TOP_ACTION_INDEX()] = 0;
        }
        else
        {
            info.rankingData[MiscInfo.TOP_ACTION_INDEX()] = ACTION_POINT();
            info.rankingExpire[MiscInfo.TOP_ACTION_INDEX()] = (int) (action.UNIX_END_TIME() + 4 * Time.SECOND_IN_HOUR);
        }

        if (event == null || !event.IS_ACTIVE())
        {
            info.rankingData[MiscInfo.TOP_EVENT_INDEX()] = 0;
            info.rankingExpire[MiscInfo.TOP_EVENT_INDEX()] = 0;
        }
        else
        {
            info.rankingData[MiscInfo.TOP_EVENT_INDEX()] = EVENT_POINT();
            info.rankingExpire[MiscInfo.TOP_EVENT_INDEX()] = (int) (event.UNIX_END_TIME() + 4 * Time.SECOND_IN_HOUR);
        }
    }

    public String[] getRankingIDs ()
    {
        String[] rankingIDs = new String[MiscInfo.TOP_NUM()];
        rankingIDs[MiscInfo.TOP_LEVEL_INDEX()] = LEVEL_ID();
        rankingIDs[MiscInfo.TOP_APPRAISAL_INDEX()] = LEVEL_ID();
        rankingIDs[MiscInfo.TOP_ACTION_INDEX()] = ACTION_ID();
        rankingIDs[MiscInfo.TOP_EVENT_INDEX()] = EVENT_ID();
        return rankingIDs;
    }

    public static class PersonalRecord extends Encoder.IObject implements KeyDefine
    {
        private           String  id;
        private           int     group;
        private           long    start;
        private transient long    end;
        private           int     point;
        private           int     order;
        private           boolean getReward;
        private           boolean hasChanged;

        private PersonalRecord ()
        {
            //DO NOT ADD CODE IN CONSTRUCTOR
        }

        public static PersonalRecord create (String topId, int lv, long startTimeUnix, long endTimeUnix)
        {
            PersonalRecord ranking = new PersonalRecord();
            ranking.id = topId;
            ranking.group = ConstInfo.getRankingBoardInfo().getGroupLevel(topId, lv);
            ranking.start = startTimeUnix;
            ranking.end = endTimeUnix;
            ranking.point = 0;
            ranking.order = 9999;
            ranking.getReward = false;
            ranking.hasChanged = true;

            return ranking;
        }

        public String RANKING_ID ()
        {
            return id;
        }

        public int GROUP_LEVEL ()
        {
            return group;
        }

        public long UNIX_START_TIME ()
        {
            return start;
        }

        public long UNIX_END_TIME ()
        {
            return end;
        }

        public void UNIX_END_TIME (int endTime)
        {
            this.end = endTime;
        }

        public int POINT ()
        {
            return point;
        }

        public int ORDER ()
        {
            return order;
        }

        public boolean IS_ACTIVE ()
        {
            if (start == -1)
                return true;

            int current = Time.getUnixTime();
            return start < current && current < end;
        }

        public boolean CLAIM_DEFAULT_REWARD ()
        {
            return getReward;
        }

        public void checkClaimDefaultReward ()
        {
            getReward = true;
        }

        public boolean HAS_CHANGED ()
        {
            return hasChanged;
        }

        public void removeHasChanged ()
        {
            hasChanged = false;
        }

        public void set (int currentLv, int point)
        {
            if (currentLv > GROUP_LEVEL())
            {
                this.group = ConstInfo.getRankingBoardInfo().getGroupLevel(id, currentLv);
                this.hasChanged = true;
            }

            if (this.point != point && point > 0)
            {
                this.point = point;
                this.hasChanged = true;
            }
        }

        public void setGroupLv(int currentLv)
        {
            this.group = ConstInfo.getRankingBoardInfo().getGroupLevel(id, currentLv);
            this.hasChanged = true;
        }

        public void set (int currentLv)
        {
            set(currentLv, -1);
        }

        public void add (int currentLv, int point)
        {
            set(currentLv, this.point + point);
        }

        private void setOrder (int order)
        {
            this.order = order;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(RANK_ID, RANKING_ID());
            msg.put(RANK_GROUP_LEVEL, GROUP_LEVEL());
            msg.put(RANK_START_TIME, UNIX_START_TIME());
            msg.put(RANK_POINT, POINT());
            msg.put(RANK_ORDER, ORDER());
            msg.put(RANK_CLAIM_REWARD, CLAIM_DEFAULT_REWARD());
        }
    }
}