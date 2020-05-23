package data.festival;

import util.collection.MapItem;

import java.util.*;
import java.util.Map.Entry;

public class Event03Info extends EventInfo
{
    private String E03_TYPE;
    private String E03_ID;
    private String E03_POINT;
    private String E03_PLANT;
    private String E03_DROPITEM;
    private String E03_START_TIME;
    private String E03_END_TIME;

    private int E03_UNIX_START_TIME;
    private int E03_UNIX_END_TIME;

    private PlantDropItemInfo   E03_PLANT_DROP_LIST;
    private FeatureDropItemInfo E03_FEATURE_DROP_LIST;
    private PuzzleInfo          E03_PUZZLE;

    private Map<Integer, NavigableMap<Integer, Event03Reward>> E03_REWARDS;
    private Map<Integer, Integer>                              E03_REWARD_CHECKPOINT;

    @Override
    public String TYPE ()
    {
        return E03_TYPE;
    }

    @Override
    public String ID ()
    {
        return E03_ID;
    }

    @Override
    public String START_TIME ()
    {
        return E03_START_TIME;
    }

    @Override
    public String END_TIME ()
    {
        return E03_END_TIME;
    }

    @Override
    public int UNIX_START_TIME ()
    {
        return E03_UNIX_START_TIME;
    }

    @Override
    public int UNIX_END_TIME ()
    {
        return E03_UNIX_END_TIME;
    }

    @Override
    public void init ()
    {
        super.init();

        Set<Integer> checkpoints = this.E03_REWARDS.keySet();
        this.E03_REWARD_CHECKPOINT = new HashMap<Integer, Integer>();
        for (int checkpoint : checkpoints)
        {
            NavigableMap<Integer, Event03Reward> checkpoint_reward = this.E03_REWARDS.get(checkpoint);
            for (int groupLv : checkpoint_reward.keySet())
            {
                Event03Reward r = checkpoint_reward.get(groupLv);
                r.init();

                this.E03_REWARD_CHECKPOINT.put(r.ID(), checkpoint);
            }

            checkpoint_reward = Collections.unmodifiableNavigableMap(checkpoint_reward);
            this.E03_REWARDS.put(checkpoint, checkpoint_reward);
        }

        this.E03_REWARDS = Collections.unmodifiableMap(this.E03_REWARDS);
        this.E03_REWARD_CHECKPOINT = Collections.unmodifiableMap(this.E03_REWARD_CHECKPOINT);
    }

    @Override
    public String POINT ()
    {
        return E03_POINT;
    }

    @Override
    public String PLANT ()
    {
        return E03_PLANT;
    }

    @Override
    protected FeatureDropItemInfo FEATURE_DROP_LIST ()
    {
        return E03_FEATURE_DROP_LIST;
    }

    @Override
    protected PlantDropItemInfo PLANT_DROP_LIST ()
    {
        return E03_PLANT_DROP_LIST;
    }

    @Override
    protected HarvestDropItemInfo HARVEST_DROP_LIST ()
    {
        return null;
    }

    @Override
    public boolean isUseHarvestDropItem ()
    {
        return false;
    }

    @Override
    public PuzzleInfo PUZZLE ()
    {
        return E03_PUZZLE;
    }

    @Override
    public int getRewardCheckpoint (int rewardId)
    {
        if (this.E03_REWARD_CHECKPOINT.containsKey(rewardId))
            return this.E03_REWARD_CHECKPOINT.get(rewardId);

        return -1;
    }

    @Override
    public int getRewardId (int checkpoint, int level)
    {
        NavigableMap<Integer, Event03Reward> checkpoint_reward = E03_REWARDS.get(checkpoint);
        if (checkpoint_reward == null)
            return -1;

        Entry<Integer, Event03Reward> entry = checkpoint_reward.ceilingEntry(level);
        if (entry == null)
            return -1;

        Event03Reward template = entry.getValue();
        if (template != null)
            return template.ID();

        return -1;
    }

    @Override
    public MapItem getRewards (int checkpoint, int level)
    {
        NavigableMap<Integer, Event03Reward> checkpoint_reward = E03_REWARDS.get(checkpoint);
        if (checkpoint_reward == null)
            return null;

        Entry<Integer, Event03Reward> entry = checkpoint_reward.ceilingEntry(level);
        if (entry == null)
            return null;

        Event03Reward template = entry.getValue();
        if (template != null)
            return template.generate();

        return new MapItem();
    }
}