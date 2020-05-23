package data;

import cmd.ErrorConst;
import model.object.QuestBook;
import util.Time;
import util.collection.MapItem;
import util.collection.MapItem.Entry;
import util.serialize.Encoder;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class QuestBookInfo
{
    private Map<String, QuestAction>          QUESTS;
    private List<SpecialReward>               SPECIAL_REWARDS;
    private NavigableMap<Integer, LevelRatio> LEVEL_RATIO;
    private LevelRatio                        DEFAULT_LEVEL_RATIO;
    private float                             SPECIAL_TOTAL_RATE;

    private Map<String, Integer> ACTION_IDS;

    public void init ()
    {
        ACTION_IDS = new HashMap<>();
        for (String action : QUESTS.keySet())
        {
            QUESTS.get(action).init();
            ACTION_IDS.put(action, QUESTS.get(action).ACTION_ID);
        }

        QUESTS = Collections.unmodifiableMap(QUESTS);
        ACTION_IDS = Collections.unmodifiableMap(ACTION_IDS);

        SPECIAL_TOTAL_RATE = 0;
        for (SpecialReward item : SPECIAL_REWARDS)
        {
            SPECIAL_TOTAL_RATE += item.RATE;
            item.REWARD = item.REWARD.toUnmodifiableMapItem();
        }

        LEVEL_RATIO = Collections.unmodifiableNavigableMap(LEVEL_RATIO);
        SPECIAL_REWARDS = Collections.unmodifiableList(SPECIAL_REWARDS);

        DEFAULT_LEVEL_RATIO = new LevelRatio();
        DEFAULT_LEVEL_RATIO.EXP = 1;
        DEFAULT_LEVEL_RATIO.GOLD = 1;
    }

    public Quest generate (QuestBook questBook, int userLevel, boolean isInit)
    {
        TreeMap<Integer, Quest> list = questBook.getList();

        if (list.size() >= MiscInfo.QUEST_BOOK_LIST_NUM())
            return null;

        Map<String, Integer> min_actions = new HashMap<>();
        Map<String, Integer> max_actions = new HashMap<>();

        for (QuestAction action : QUESTS.values())
        {
            if (action.MIN_LEVEL > userLevel)
                continue;

            if (action.MIN > 0)
                min_actions.put(action.ACTION, action.MIN);
            else
                max_actions.put(action.ACTION, action.MIN);
        }

        for (Integer id : list.keySet())
        {
            Quest quest = list.get(id);

            if (min_actions.containsKey(quest.ACTION))
            {
                int remain = min_actions.get(quest.ACTION) - 1;
                if (remain < 1)
                    min_actions.remove(quest.ACTION);
                else
                    min_actions.put(quest.ACTION, remain);
            }

            if (max_actions.containsKey(quest.ACTION))
            {
                int remain = max_actions.get(quest.ACTION) - 1;
                if (remain < 1)
                    max_actions.remove(quest.ACTION);
                else
                    max_actions.put(quest.ACTION, remain);
            }
        }

        Set<String> actions = min_actions.size() > 0 ? min_actions.keySet() : max_actions.keySet();
        if (actions.isEmpty())
            return null;

        float total_rate = 0;
        List<String> chooses = new ArrayList<String>();
        for (String actionKey : actions)
        {
            chooses.add(actionKey);
            QuestAction action = QUESTS.get(actionKey);
            total_rate += action.RATE;
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        float rate = random.nextFloat() * total_rate;
        float weight = QUESTS.get(chooses.get(0)).RATE;
        String chooseAction = null;

        for (String actionKey : chooses)
        {
            if (rate < weight)
            {
                chooseAction = actionKey;
                break;
            }

            QuestAction action = QUESTS.get(actionKey);
            weight += action.RATE;
        }

        if (chooseAction == null)
            return null;

        int questId = questBook.getNextIndex();
        int startTime = isInit ? -1 : (Time.getUnixTime() + MiscInfo.QUEST_BOOK_WAIT_TO_REFRESH());
        MapItem specialReward = null;
        LevelRatio levelRatio = this.getLevelRatio(userLevel);

        boolean hasSpecial = false;
        if (questBook.dailyFinish() >= MiscInfo.QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MAX())
            hasSpecial = true;
        else if (questBook.dailyFinish() >= MiscInfo.QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MIN())
        {
            float buff = MiscInfo.QUEST_BOOK_SPECIAL_REWARD_RATE();
            buff = 0.01f * (buff + questBook.dailyFinish() * (100 - buff) / (MiscInfo.QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MAX() - MiscInfo.QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MIN()));
            hasSpecial = random.nextFloat() > buff;
        }

        if (hasSpecial)
        {
            specialReward = generateSpecialReward(null);//levelRatio);
            questBook.resetDailyFinish();
        }

        QuestAction action = QUESTS.get(chooseAction);
        Quest newQuest = action.generate(userLevel, questId, levelRatio, startTime, specialReward);

        return newQuest;
    }

    private MapItem generateSpecialReward (LevelRatio levelRatio)
    {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        if (random.nextFloat() * 100 > MiscInfo.QUEST_BOOK_SPECIAL_REWARD_RATE())
            return null;

        if (SPECIAL_REWARDS.size() == 0)
            return null;

        float rate = random.nextFloat() * SPECIAL_TOTAL_RATE;
        float weight = SPECIAL_REWARDS.get(0).RATE;
        MapItem temp = null;
        for (SpecialReward reward : SPECIAL_REWARDS)
        {
            if (weight < rate)
            {
                weight += reward.RATE;
                continue;
            }

            temp = reward.REWARD;
            break;
        }

        if (temp == null || temp.isEmpty())
            return null;

        MapItem specialReward = new MapItem();
        if (levelRatio == null)
            specialReward.increase(temp);
        else
            for (Entry entry : temp)
            {
                String itemId = entry.key();
                int num = (int) Math.ceil(levelRatio.get(itemId) * entry.value());
                specialReward.increase(itemId, num);
            }

        return specialReward;
    }

    public int getActionId (String actionName)
    {
        return ACTION_IDS.get(actionName);
    }

    public QuestAction getAction (String actionName)
    {
        return QUESTS.get(actionName);
    }

    public LevelRatio getLevelRatio (int level)
    {
        java.util.Map.Entry<Integer, LevelRatio> entry = LEVEL_RATIO.ceilingEntry(level);
        return (entry != null) ? entry.getValue() : DEFAULT_LEVEL_RATIO;
    }

    public static class QuestAction
    {
        private String          ACTION;
        private int             ACTION_ID;
        private int             MIN;
        private int             MAX;
        private int             RATE;
        private float           RATIO;
        private List<QuestItem> QUEST_ITEMS;
        private int             MIN_LEVEL;

        public void init ()
        {
            MIN_LEVEL = 500;
            for (QuestItem item : QUEST_ITEMS)
            {
                item.REWARD = item.REWARD.toUnmodifiableMapItem();

                if (MIN_LEVEL > item.LEVEL)
                    MIN_LEVEL = item.LEVEL;
            }

            QUEST_ITEMS = Collections.unmodifiableList(QUEST_ITEMS);
        }

        public Quest generate (int userLevel, int questId, LevelRatio levelRatio, int startTime, MapItem specialReward)
        {
            List<QuestItem> LIST = new ArrayList<>();
            int TOTAL_RATE = 0;

            for (QuestItem item : QUEST_ITEMS)
            {
                if (userLevel < item.LEVEL)
                    continue;

                LIST.add(item);
                TOTAL_RATE += item.RATE;
            }

            if (LIST.size() == 0)
                return null;

            ThreadLocalRandom random = ThreadLocalRandom.current();
            float rate = random.nextFloat() * TOTAL_RATE;
            float weight = LIST.get(0).RATE;

            QuestItem choose = null;
            for (QuestItem item : LIST)
            {
                if (rate < weight)
                {
                    choose = item;
                    break;
                }

                weight += item.RATE;
            }

            if (choose == null)
                return null;

            return Quest.create(questId, this, choose, levelRatio, startTime, specialReward);
        }
    }

    public static class QuestItem
    {
        private String  TARGET;
        private int     LEVEL;
        private int     RATE;
        private int     REQUIRE_MIN;
        private int     REQUIRE_MAX;
        private String  SKIP_PRICE_TYPE;
        private int     SKIP_PRICE_NUM;
        private MapItem REWARD;
    }

    public static class Quest extends Encoder.IObject implements KeyDefine
    {
        private int     ID;
        private String  ACTION;
        private String  TARGET;
        private int     CURRENT;
        private int     REQUIRE;
        private String  SKIP_PRICE_TYPE;
        private int     SKIP_PRICE_NUM;
        private int     START_TIME;
        private MapItem REWARD;
        private MapItem SPECIAL_REWARD;

        private Quest ()
        {
        }

        public static Quest create (int id, QuestAction action, QuestItem item, LevelRatio levelRatio, int startTime, MapItem specialReward)
        {
            if (action == null || item == null)
                return null;

            Quest quest = new Quest();

            quest.ID = id;
            quest.ACTION = action.ACTION;
            quest.TARGET = item.TARGET == null ? "" : item.TARGET;
            quest.CURRENT = 0;

            if (item.REQUIRE_MIN >= item.REQUIRE_MAX)
                quest.REQUIRE = item.REQUIRE_MIN;
            else
                quest.REQUIRE = ThreadLocalRandom.current().nextInt(item.REQUIRE_MIN, item.REQUIRE_MAX);

            quest.SKIP_PRICE_TYPE = item.SKIP_PRICE_TYPE;
            quest.SKIP_PRICE_NUM = (int) Math.ceil(item.SKIP_PRICE_NUM * quest.REQUIRE * action.RATIO);

            quest.START_TIME = startTime;

            quest.REWARD = new MapItem();

            for (MapItem.Entry e : item.REWARD)
            {
                String itemId = e.key();
                int itemNum = (int) Math.ceil(e.value() * quest.REQUIRE * action.RATIO * levelRatio.get(itemId));

                quest.REWARD.increase(itemId, itemNum);
            }

            quest.SPECIAL_REWARD = specialReward;

            return quest;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(QUEST_ID, ID);
            msg.put(QUEST_ACTION, ACTION_ID());
            msg.put(QUEST_TARGET, TARGET);
            msg.put(QUEST_CURRENT, CURRENT);
            msg.put(QUEST_REQUIRE, REQUIRE);
            msg.put(QUEST_SKIP_PRICE_TYPE, SKIP_PRICE_TYPE);
            msg.put(QUEST_SKIP_PRICE_NUM, SKIP_PRICE_NUM);
            msg.put(QUEST_START_TIME, START_TIME);
            msg.put(QUEST_REWARD, REWARD);

            if (SPECIAL_REWARD != null)
                msg.put(QUEST_SPECIAL_REWARD, SPECIAL_REWARD);
        }

        public boolean isActive ()
        {
            return START_TIME < Time.getUnixTime();
        }

        public boolean isFinish ()
        {
            return this.CURRENT >= this.REQUIRE;
        }

        public boolean checkPrice (String type, int num)
        {
            return SKIP_PRICE_TYPE.equalsIgnoreCase(type) && SKIP_PRICE_NUM == num && SKIP_PRICE_NUM > 0;
        }

        public byte updateProgress (int current)
        {
            if (!isActive())
                return ErrorConst.TIME_WAIT;

            if (isFinish())
                return ErrorConst.INVALID_STATUS;

            if (current < 0 || current <= CURRENT)
                return ErrorConst.INVALID_NUM;

            CURRENT = Math.min(current, REQUIRE);
            return ErrorConst.SUCCESS;
        }

        public void addEventReward (MapItem rewards)
        {
            this.REWARD.increase(rewards);
        }

        public void resetProgress ()
        {
            CURRENT = 0;
        }

        public void gmChangeProgress (int current)
        {
            if (current < 0)
                current = 0;

            CURRENT = Math.min(current, REQUIRE);
        }

        public int ID ()
        {
            return ID;
        }

        public String ACTION ()
        {
            return ACTION;
        }

        public int ACTION_ID ()
        {
            return ConstInfo.getQuestBookInfo().getActionId(ACTION);
        }

        public String TARGET ()
        {
            return TARGET;
        }

        public int REQUIRE ()
        {
            return REQUIRE;
        }

        public int CURRENT ()
        {
            return CURRENT;
        }

        public String SKIP_PRICE_TYPE ()
        {
            return SKIP_PRICE_TYPE;
        }

        public int SKIP_PRICE_NUM ()
        {
            return SKIP_PRICE_NUM;
        }

        public MapItem REWARD ()
        {
            return this.REWARD;
        }

        public MapItem SPECIAL_REWARD ()
        {
            return this.SPECIAL_REWARD == null ? null : this.SPECIAL_REWARD.toUnmodifiableMapItem();
        }
    }

    public static class SpecialReward
    {
        private int     RATE;
        private MapItem REWARD;
    }

    public static class LevelRatio
    {
        private float EXP;
        private float GOLD;

        public float get (String itemId)
        {
            switch (itemId)
            {
                case ItemId.EXP:
                    return EXP;
                case ItemId.GOLD:
                    return GOLD;
            }

            return 1;
        }
    }
}