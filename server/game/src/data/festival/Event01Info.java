package data.festival;

import util.collection.MapItem;

import java.util.*;
import java.util.Map.Entry;

public class Event01Info extends EventInfo
{
    private String E01_TYPE;
    private String E01_ID;
    private String E01_POINT;
    private String E01_PLANT;
    private String E01_DROPITEM;
    private String E01_START_TIME;
    private String E01_END_TIME;

    private int E01_UNIX_START_TIME;
    private int E01_UNIX_END_TIME;

    private PlantDropItemInfo   E01_PLANT_DROP_LIST;
    private FeatureDropItemInfo E01_FEATURE_DROP_LIST;
    private PuzzleInfo          E01_PUZZLE;

    private Map<Integer, NavigableMap<Integer, Event01Reward>> E01_REWARDS;
    private Map<Integer, Integer>                              E01_REWARD_CHECKPOINT;

    @Override
    public String TYPE ()
    {
        return E01_TYPE;
    }

    @Override
    public String ID ()
    {
        return E01_ID;
    }

    @Override
    public String START_TIME ()
    {
        return E01_START_TIME;
    }

    @Override
    public String END_TIME ()
    {
        return E01_END_TIME;
    }

    @Override
    public int UNIX_START_TIME ()
    {
        return E01_UNIX_START_TIME;
    }

    @Override
    public int UNIX_END_TIME ()
    {
        return E01_UNIX_END_TIME;
    }

    @Override
    public void init ()
    {
        super.init();

        Set<Integer> checkpoints = this.E01_REWARDS.keySet();
        this.E01_REWARD_CHECKPOINT = new HashMap<Integer, Integer>();
        for (int checkpoint : checkpoints)
        {
            NavigableMap<Integer, Event01Reward> checkpoint_reward = this.E01_REWARDS.get(checkpoint);
            for (int groupLv : checkpoint_reward.keySet())
            {
                Event01Reward r = checkpoint_reward.get(groupLv);
                r.init();

                this.E01_REWARD_CHECKPOINT.put(r.ID(), checkpoint);
            }

            checkpoint_reward = Collections.unmodifiableNavigableMap(checkpoint_reward);
            this.E01_REWARDS.put(checkpoint, checkpoint_reward);
        }

        this.E01_REWARDS = Collections.unmodifiableMap(this.E01_REWARDS);
        this.E01_REWARD_CHECKPOINT = Collections.unmodifiableMap(this.E01_REWARD_CHECKPOINT);
    }

    @Override
    public String POINT ()
    {
        return E01_POINT;
    }

    @Override
    public String PLANT ()
    {
        return E01_PLANT;
    }

    @Override
    protected FeatureDropItemInfo FEATURE_DROP_LIST ()
    {
        return E01_FEATURE_DROP_LIST;
    }

    @Override
    protected PlantDropItemInfo PLANT_DROP_LIST ()
    {
        return E01_PLANT_DROP_LIST;
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
        return E01_PUZZLE;
    }

    @Override
    public int getRewardCheckpoint (int rewardId)
    {
        if (this.E01_REWARD_CHECKPOINT.containsKey(rewardId))
            return this.E01_REWARD_CHECKPOINT.get(rewardId);

        return -1;
    }

    @Override
    public int getRewardId (int checkpoint, int level)
    {
        NavigableMap<Integer, Event01Reward> checkpoint_reward = E01_REWARDS.get(checkpoint);
        if (checkpoint_reward == null)
            return -1;

        Entry<Integer, Event01Reward> entry = checkpoint_reward.ceilingEntry(level);
        if (entry == null)
            return -1;

        Event01Reward template = entry.getValue();
        if (template != null)
            return template.ID();

        return -1;
    }

    @Override
    public MapItem getRewards (int checkpoint, int level)
    {
        NavigableMap<Integer, Event01Reward> checkpoint_reward = E01_REWARDS.get(checkpoint);
        if (checkpoint_reward == null)
            return null;

        Entry<Integer, Event01Reward> entry = checkpoint_reward.ceilingEntry(level);
        if (entry == null)
            return null;

        Event01Reward template = entry.getValue();
        if (template != null)
            return template.generate();

        return new MapItem();
    }
}