package model.object;

import bitzero.util.common.business.Debug;
import data.*;
import data.festival.Event02Info;
import data.festival.Event02RewardPack;
import data.festival.EventInfo;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Festival extends Encoder.IObject implements KeyDefine
{
    private           Action01                action01;
    private           Action02                action02;
    private           Action03                action03;
    private transient HashMap<String, Action> agenda;
    private transient ArrayList<String>       resetActions;

    private Festival ()
    {
    }

    public static Festival create ()
    {
        Festival f = new Festival();
        f.agenda = new HashMap<String, Action>();
        f.resetActions = new ArrayList<String>();
        return f;
    }

    public void init ()
    {
        if (agenda == null)
            agenda = new HashMap<String, Action>();

        if (resetActions == null)
            resetActions = new ArrayList<String>();

//        if (this.action01 == null || !this.action01.verify())
//            this.action01 = (Action01) Action.create(ItemId.EVENT_1);

        agenda.put(ItemId.EVENT_1, this.action01);
        agenda.put(ItemId.EVENT_2, this.action02);
        agenda.put(ItemId.EVENT_3, this.action03);
    }

    public void update (UserGame userGame)
    {
        for (String actionId : agenda.keySet())
        {
            Action action = agenda.get(actionId);
            if (action == null)
                continue;

            EventInfo info = ConstInfo.getFestival().getAction(actionId);
            if (info == null || info.UNIX_START_TIME() != action.startTime || info.UNIX_END_TIME() < Time.getUnixTime())
                resetActions.add(actionId);
        }

        userGame.handleEventExpire(ItemId.EVENT_0);
        if (resetActions.size() > 0)
        {
            for (int i = 0, size = resetActions.size(); i < size; i++)
            {
                userGame.handleEventExpire(resetActions.get(i));
            }
            resetActions.clear();
        }
    }

    public boolean isActive (String actionID)
    {
        Action action = getAction(actionID);
        return action == null ? false : action.isActive();
    }

    public MapItem collectEP (UserGame userGame, short feature)
    {
        return collectEP(userGame, feature, "default");
    }

    public MapItem collectEP (UserGame userGame, short feature, boolean option)
    {
        return collectEP(userGame, feature, String.valueOf(option));
    }

    public MapItem collectEP (UserGame userGame, short feature, long option)
    {
        return collectEP(userGame, feature, String.valueOf(option));
    }

    public MapItem collectEP (UserGame userGame, short feature, String option)
    {
        String featureName = CmdName.get(feature);
        if (featureName == null || featureName.isEmpty())
            return MapItem.EMPTY;

        List<String> actionIds = ConstInfo.getFestival().getActions();
        if (actionIds == null || actionIds.isEmpty())
            return MapItem.EMPTY;

        MapItem EPs = new MapItem();

        for (String actionId : actionIds)
        {
            Action action = getAction(actionId);
            if (action == null || !action.isActive())
                continue;
            EPs.increase(action.collectEP(userGame, featureName, option));
        }

        return EPs;
    }

    private Action getAction (String actionId)
    {
        EventInfo info = ConstInfo.getFestival().getAction(actionId);
        if (info == null)
            return null;

        boolean onActive = info.isActive();
        if (!onActive)
            return null;

        Action action = agenda.get(actionId);
        if (action == null || !action.verify(info))
        {
            action = Action.create(actionId);
            agenda.put(action.getActionId(), action);

            resetActions.add(actionId);
            if (info.TYPE() == ConstInfo.getFestival().getEvent01().TYPE())
                this.action01 = (Action01) action;
            else if (info.TYPE() == ConstInfo.getFestival().getEvent02().TYPE())
                this.action02 = (Action02) action;
            else if (info.TYPE() == ConstInfo.getFestival().getEvent03().TYPE())
                this.action03 = (Action03) action;
        }

        return action;
    }

    @Override
    public void putData (Encoder msg)
    {
        List<String> actionIds = ConstInfo.getFestival().getActions();
        for (String actionId : actionIds)
        {
            Action action = getAction(actionId);
            if (action == null || !action.isActive())
                continue;

            action.putData(msg);
        }
    }

    public boolean isCheckpointReceived (String actionId, int checkpointId)
    {
        Action action = agenda.get(actionId);
        if (action == null)
            return false;

        return action.isCheckpointReceived(checkpointId);
    }

    public boolean isRewardReceived (String actionId, int rewardId)
    {
        Action action = agenda.get(actionId);
        if (action == null)
            return false;

        return action.isRewardReceived(rewardId);
    }

    public boolean isRewardPackReceived (String actionId, int rewardId)
    {
        Action action = agenda.get(actionId);
        if (action == null)
            return false;

        return action.isRewardPackReceived(rewardId);
    }

    public void addRewardReceived (String actionId, int rewardId)
    {
        Action action = agenda.get(actionId);
        if (action == null)
            return;

        action.addRewardReceived(rewardId);
    }

    public void addRewardPackReceived (String actionId, int rewardId)
    {
        Action action = agenda.get(actionId);
        if (action == null)
            return;

        action.addRewardPackReceived(rewardId);
    }

    private static abstract class Action
    {
        private String eventId;
        private int    startTime;
        private int    nextDay;

        private   HashMap<String, MapItem>  featureDropItems;
        private   HashMap<String, MapItem>  harvestDropItems;
        protected HashMap<Integer, Integer> rewardRecieved;
        protected HashMap<Integer, Integer> rewardPackReceived;

        protected Action ()
        {
        }

        public static Action create (String eventId)
        {
            EventInfo info = ConstInfo.getFestival().getAction(eventId);
            if (!info.isActive())
                return null;

            Action action = null;
            if (info.TYPE() == ConstInfo.getFestival().getEvent01().TYPE())
                action = Action01.create();
            else if (info.TYPE() == ConstInfo.getFestival().getEvent02().TYPE())
                action = Action02.create();
            else if (info.TYPE() == ConstInfo.getFestival().getEvent03().TYPE())
                action = Action03.create();

            if (action == null)
                return null;

            action.eventId = eventId;
            action.startTime = info.UNIX_START_TIME();
            action.featureDropItems = new HashMap<String, MapItem>();
            action.harvestDropItems = new HashMap<String, MapItem>();
            action.rewardRecieved = new HashMap<Integer, Integer>();
            action.rewardPackReceived = new HashMap<Integer, Integer>();
            action.nextDay = Time.nextTimeResetDaily();

            return action;
        }

        public abstract int getLevel ();

        public abstract void putData (Encoder msg);

        public abstract boolean isCheckpointReceived (int checkpointId);

        public abstract boolean isRewardReceived (int rewardId);

        public abstract int addRewardReceived (int rewardId);

        public abstract boolean isRewardPackReceived (int rewardId);

        public abstract int addRewardPackReceived (int rewardId);

        public boolean isActive ()
        {
            EventInfo info = ConstInfo.getFestival().getAction(eventId);
            return info == null ? false : info.isActive();
        }

        public boolean verify ()
        {
            EventInfo info = ConstInfo.getFestival().getAction(eventId);
            boolean check = info != null && info.UNIX_START_TIME() == this.startTime;
            return check;
        }

        public boolean verify (EventInfo info)
        {
            boolean check = info != null;
            check &= info.ID().equals(this.eventId);
            check &= info.UNIX_START_TIME() == this.startTime;
            return check;
        }

        public String getActionId ()
        {
            return eventId;
        }

        public String getEventPointId ()
        {
            EventInfo info = ConstInfo.getFestival().getAction(eventId);
            return info == null ? "" : info.POINT();
        }

        public MapItem collectEP (UserGame userGame, String feature, String option)
        {
            EventInfo info = ConstInfo.getFestival().getAction(eventId);
//            Debug.info("Festival", "action01", "collectEP", info == null ? "null" : "info");

            if (info == null)
                return null;

            if (userGame.getLevel() < this.getLevel())
                return null;

            int current = Time.getUnixTime();
            if (current > nextDay)
            {
                featureDropItems.clear();
                harvestDropItems.clear();
                nextDay = Time.nextTimeResetDaily();
            }

            String ruleId = info.getDropRuleId(feature, option);
            if (ruleId == null || ruleId.isEmpty())
                return null;

            if (!featureDropItems.containsKey(ruleId))
                featureDropItems.put(ruleId, new MapItem());

            MapItem todayReceive = featureDropItems.get(ruleId);
            MapItem item = info.generateDropItem(feature, option, userGame, startTime, todayReceive);
            todayReceive.increase(item);

            //Event 2
            MapItem itemHarvest = new MapItem();
            MapItem todayHarvestDropReceive = new MapItem();
            if (info.isUseHarvestDropItem())
            {

                if (!harvestDropItems.containsKey(feature) && info.isHarvestDropItemContains(feature))
                    harvestDropItems.put(feature, new MapItem());
                todayHarvestDropReceive = harvestDropItems.containsKey(feature) ? harvestDropItems.get(feature) : todayHarvestDropReceive;
                itemHarvest = info.generateHarvestDropItem(feature, option, todayHarvestDropReceive);
                todayHarvestDropReceive.increase(itemHarvest);
            }

            // Event 2
            item.increase(itemHarvest); // thêm harvest event item

            Debug.info("Festival",
                       info.TYPE(),
                       "collectEP",
                       eventId,
                       feature,
                       option,
                       MetricLog.toString(item),
                       MetricLog.toString(todayReceive),
                       MetricLog.toString(todayHarvestDropReceive));
            return item;
        }
    }

    private static class Action01 extends Action
    {
        protected Action01 ()
        {
            super();
        }

        public static Action01 create ()
        {
            Action01 action = new Action01();
            return action;
        }

        @Override
        public int getLevel ()
        {
            return MiscInfo.EV01_USER_LEVEL();
        }

        @Override
        public void putData (Encoder msg)
        {
            List<Integer> temp = new ArrayList<Integer>();
            for (Integer checkpoint : rewardRecieved.keySet())
                if (rewardRecieved.get(checkpoint) > 0)
                    temp.add(checkpoint);

            int[] rewards = new int[temp.size()];
            for (int i = 0; i < temp.size(); i++)
                rewards[i] = temp.get(i);

            msg.put(EVENT_01_RECEIVED_REWARDS, rewards);
        }

        @Override
        public boolean isCheckpointReceived (int checkpoint)
        {
            if (checkpoint < 1)
                return true;

            EventInfo info = ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            for (int id : rewardRecieved.keySet())
            {
                int checkpointB = info.getRewardCheckpoint(id);
                if (checkpointB == checkpoint)
                    return true;
            }

            return false;
        }

        @Override
        public boolean isRewardReceived (int rewardId)
        {
            Integer n = rewardRecieved.get(rewardId);
            if (n != null && n.intValue() > 0)
                return true;

            EventInfo info = ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            int checkpoint = info.getRewardCheckpoint(rewardId);
            return this.isCheckpointReceived(checkpoint);
        }

        @Override
        public int addRewardReceived (int rewardId)
        {
            Integer n = rewardRecieved.get(rewardId);
            if (n == null)
                n = 1;
            else
                n = n + 1;

            rewardRecieved.put(rewardId, n);
            return n;
        }

        @Override
        public boolean isRewardPackReceived (int rewardId)
        {
            return false;
        }

        @Override
        public int addRewardPackReceived (int rewardId)
        {
            return 0;
        }
    }

    private static class Action02 extends Action
    {
        protected Action02 ()
        {
            super();
        }

        public static Action02 create ()
        {
            Action02 action = new Action02();
            return action;
        }


        @Override
        public int getLevel ()
        {
            return MiscInfo.EV02_USER_LEVEL();
        }

        @Override
        public void putData (Encoder msg)
        {

            msg.putMapItem(EVENT_02_RECEIVED_REWARDS, receivedToMapItem(rewardRecieved));
            msg.putMapItem(EVENT_02_RECEIVED_REWARDS_PACK, receivedToMapItem(rewardPackReceived));
        }

        private List<MapItem> receivedToMapItem (HashMap<Integer, Integer> map)
        {
            List<MapItem> mapItems = new ArrayList<>(map.keySet().size());
            for (Integer checkpoint : map.keySet())
            {
                MapItem mapItem = new MapItem();
                mapItem.put(checkpoint.toString(), map.get(checkpoint));
                mapItems.add(mapItem);
            }
            return mapItems;
        }

        public boolean isCheckpointReceived (int checkpoint)
        {
            if (checkpoint < 1)
                return true;

            EventInfo info = ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            for (int id : rewardRecieved.keySet())
            {
                int checkpointB = info.getRewardCheckpoint(id);
                if (checkpointB == checkpoint)
                    return true;
            }

            return false;
        }

        @Override
        public boolean isRewardReceived (int rewardId)
        {
            Integer n = rewardRecieved.get(rewardId);
            if (n != null && n.intValue() > 0)
                return true;

            EventInfo info = ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            int checkpoint = info.getRewardCheckpoint(rewardId);
            return this.isCheckpointReceived(checkpoint);
        }

        @Override
        public int addRewardReceived (int rewardId)
        {
            Integer n = rewardRecieved.get(rewardId);
            if (n == null)
                n = 1;
            else
                n = n + 1;

            rewardRecieved.put(rewardId, n);
            return n;
        }

        public boolean isRewardPackReceived (int rewardPackId)
        {
            if (rewardPackReceived == null) rewardPackReceived = new HashMap<Integer, Integer>();
            Integer n = rewardPackReceived.get(rewardPackId);

            Event02Info info = (Event02Info) ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            Event02RewardPack reward = info.getPackRewardInfo(rewardPackId);

            int group = reward.GROUP();
            int totalReceivedPack = 0;

            for (Integer rewardId : rewardPackReceived.keySet())
            {
                Event02RewardPack rewardPack = info.getPackRewardInfo(rewardId);
                Integer num = rewardPackReceived.get(rewardId);
                if (num != null && rewardPack != null && rewardPack.GROUP() == group)
                    totalReceivedPack += num.intValue();
            }
            if (totalReceivedPack >= reward.EXCHANGE_LIMIT())
                return true;

            return false;
        }

        public int addRewardPackReceived (int rewardPackId)
        {
            if (rewardPackReceived == null) rewardPackReceived = new HashMap<Integer, Integer>();
            Integer n = rewardPackReceived.get(rewardPackId);
            if (n == null)
                n = 1;
            else
                n = n + 1;

            rewardPackReceived.put(rewardPackId, n);
            return n;
        }
    }

    private static class Action03 extends Action
    {
        protected Action03 ()
        {
            super();
        }

        public static Action03 create ()
        {
            Action03 action = new Action03();
            return action;
        }

        @Override
        public int getLevel ()
        {
            return MiscInfo.EV03_USER_LEVEL();
        }

        @Override
        public void putData (Encoder msg)
        {
            List<Integer> temp = new ArrayList<Integer>();
            for (Integer checkpoint : rewardRecieved.keySet())
                if (rewardRecieved.get(checkpoint) > 0)
                    temp.add(checkpoint);

            int[] rewards = new int[temp.size()];
            for (int i = 0; i < temp.size(); i++)
                rewards[i] = temp.get(i);

            msg.put(EVENT_03_RECEIVED_REWARDS, rewards);
        }

        @Override
        public boolean isCheckpointReceived (int checkpoint)
        {
            if (checkpoint < 1)
                return true;

            EventInfo info = ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            for (int id : rewardRecieved.keySet())
            {
                int checkpointB = info.getRewardCheckpoint(id);
                if (checkpointB == checkpoint)
                    return true;
            }

            return false;
        }

        @Override
        public boolean isRewardReceived (int rewardId)
        {
            Integer n = rewardRecieved.get(rewardId);
            if (n != null && n.intValue() > 0)
                return true;

            EventInfo info = ConstInfo.getFestival().getAction(this.getActionId());
            if (info == null)
                return true;

            int checkpoint = info.getRewardCheckpoint(rewardId);
            return this.isCheckpointReceived(checkpoint);
        }

        @Override
        public int addRewardReceived (int rewardId)
        {
            Integer n = rewardRecieved.get(rewardId);
            if (n == null)
                n = 1;
            else
                n = n + 1;

            rewardRecieved.put(rewardId, n);
            return n;
        }

        @Override
        public boolean isRewardPackReceived (int rewardId)
        {
            return false;
        }

        @Override
        public int addRewardPackReceived (int rewardId)
        {
            return 0;
        }
    }
}