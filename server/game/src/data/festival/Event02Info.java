package data.festival;

import util.collection.MapItem;

import java.util.*;
import java.util.Map.Entry;

public class Event02Info extends EventInfo
{
    private String E02_TYPE;
    private String E02_ID;
    private String E02_POINT;
    private String E02_PLANT;
    private String E02_DROPITEM;
    private String E02_START_TIME;
    private String E02_END_TIME;

    private int E02_UNIX_START_TIME;
    private int E02_UNIX_END_TIME;

    private PlantDropItemInfo   E02_PLANT_DROP_LIST;
    private FeatureDropItemInfo E02_FEATURE_DROP_LIST;
    private HarvestDropItemInfo E02_HARVEST_DROP_LIST;

    private Map<Integer, TreeMap<Integer, Event02RewardPack>> E02_REWARDS_PACK;

    private Map<Integer, NavigableMap<Integer, Event02Reward>> E02_REWARDS;
    private Map<Integer, Integer>                              E02_REWARD_CHECKPOINT;

    @Override
    public String TYPE ()
    {
        return E02_TYPE;
    }

    public HarvestDropItemInfo E02_HARVEST_DROP_LIST ()
    {
        return E02_HARVEST_DROP_LIST;
    }

    @Override
    public String ID ()
    {
        return E02_ID;
    }

    @Override
    public String START_TIME ()
    {
        return E02_START_TIME;
    }

    @Override
    public String END_TIME ()
    {
        return E02_END_TIME;
    }

    @Override
    public int UNIX_START_TIME ()
    {
        return E02_UNIX_START_TIME;
    }

    @Override
    public int UNIX_END_TIME ()
    {
        return E02_UNIX_END_TIME;
    }

    @Override
    public void init ()
    {
        super.init();

        Set<Integer> checkpoints = this.E02_REWARDS.keySet();
        this.E02_REWARD_CHECKPOINT = new HashMap<Integer, Integer>();
        for (int checkpoint : checkpoints)
        {
            NavigableMap<Integer, Event02Reward> checkpoint_reward = this.E02_REWARDS.get(checkpoint);
            for (int groupLv : checkpoint_reward.keySet())
            {
                Event02Reward r = checkpoint_reward.get(groupLv);
                r.init();

                this.E02_REWARD_CHECKPOINT.put(r.ID(), checkpoint);
            }

            checkpoint_reward = Collections.unmodifiableNavigableMap(checkpoint_reward);
            this.E02_REWARDS.put(checkpoint, checkpoint_reward);
        }

        this.E02_REWARDS = Collections.unmodifiableMap(this.E02_REWARDS);
        this.E02_REWARDS_PACK = Collections.unmodifiableMap(this.E02_REWARDS_PACK);
        this.E02_REWARD_CHECKPOINT = Collections.unmodifiableMap(this.E02_REWARD_CHECKPOINT);

    }

    @Override
    public String POINT ()
    {
        return E02_POINT;
    }

    @Override
    public String PLANT ()
    {
        return E02_PLANT;
    }

    @Override
    protected FeatureDropItemInfo FEATURE_DROP_LIST ()
    {
        return E02_FEATURE_DROP_LIST;
    }

    @Override
    protected PlantDropItemInfo PLANT_DROP_LIST ()
    {
        return E02_PLANT_DROP_LIST;
    }

    @Override
    protected HarvestDropItemInfo HARVEST_DROP_LIST ()
    {
        return E02_HARVEST_DROP_LIST;
    }

    @Override
    public boolean isUseHarvestDropItem ()
    {
        return true;
    }

    @Override
    public PuzzleInfo PUZZLE ()
    {
        return new PuzzleInfo();
    }

    @Override
    public int getRewardCheckpoint (int rewardId)
    {
        if (this.E02_REWARD_CHECKPOINT.containsKey(rewardId))
            return this.E02_REWARD_CHECKPOINT.get(rewardId);

        return -1;
    }

    @Override
    public int getRewardId (int checkpoint, int level)
    {
        NavigableMap<Integer, Event02Reward> checkpoint_reward = E02_REWARDS.get(checkpoint);
        if (checkpoint_reward == null)
            return -1;

        Entry<Integer, Event02Reward> entry = checkpoint_reward.ceilingEntry(level);
        if (entry == null)
            return -1;

        Event02Reward template = entry.getValue();
        if (template != null)
            return template.ID();

        return -1;
    }

    @Override
    public MapItem getRewards (int checkpoint, int level)
    {
        NavigableMap<Integer, Event02Reward> checkpoint_reward = E02_REWARDS.get(checkpoint);
        if (checkpoint_reward == null)
            return null;

        Entry<Integer, Event02Reward> entry = checkpoint_reward.ceilingEntry(level);
        if (entry == null)
            return null;

        Event02Reward template = entry.getValue();
        if (template != null)
            return template.generate();

        return new MapItem();
    }

    public Event02RewardPack getPackRewardInfo (int group, int level, int rewardId)
    {
        TreeMap<Integer, Event02RewardPack> groupRewardPack = E02_REWARDS_PACK.get(group);
        if (groupRewardPack == null)
            return null;
        Entry<Integer, Event02RewardPack> entry = groupRewardPack.ceilingEntry(level);
        if (entry == null)
            return null;
        Event02RewardPack event02RewardPack = entry.getValue();
        if (event02RewardPack != null && event02RewardPack.REWARD_ID() == rewardId)
            return event02RewardPack;
        else
            return null;
    }

    public Event02RewardPack getPackRewardInfo (int rewardId)
    {
        for (Map.Entry<Integer, TreeMap<Integer, Event02RewardPack>> entry : E02_REWARDS_PACK.entrySet())
        {
            for (Map.Entry<Integer, Event02RewardPack> reward : entry.getValue().entrySet())
            {
                if (reward.getValue().REWARD_ID() == rewardId)
                    return reward.getValue();
            }
        }

        return null;
    }
}