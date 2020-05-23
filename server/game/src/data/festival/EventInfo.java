package data.festival;

import data.CmdDefine;
import data.CmdName;
import model.UserGame;
import util.Time;
import util.collection.MapItem;

public abstract class EventInfo
{
    protected EventInfo ()
    {
    }

    public abstract String TYPE ();

    public abstract String ID ();

    public abstract String POINT ();

    public abstract String PLANT ();

    public abstract String START_TIME ();

    public abstract String END_TIME ();

    public abstract int UNIX_START_TIME ();

    public abstract int UNIX_END_TIME ();

    public abstract PuzzleInfo PUZZLE ();


    public abstract int getRewardId (int checkpoint, int level);

    public abstract int getRewardCheckpoint (int rewardId);

    public abstract MapItem getRewards (int checkpoint, int level);

    protected abstract FeatureDropItemInfo FEATURE_DROP_LIST ();

    protected abstract PlantDropItemInfo PLANT_DROP_LIST ();

    protected abstract HarvestDropItemInfo HARVEST_DROP_LIST ();

    public boolean isHarvestDropItemContains (String action)
    {
        if (HARVEST_DROP_LIST() != null && HARVEST_DROP_LIST().contains(action))
            return true;
        return false;
    }

    public abstract boolean isUseHarvestDropItem ();

    public void init ()
    {
        FEATURE_DROP_LIST().init();
        PLANT_DROP_LIST().init(ID(), UNIX_START_TIME(), UNIX_END_TIME());
        PUZZLE().init();
    }

    public boolean isActive ()
    {
        int currentTime = Time.getUnixTime();
        return this.isActive(currentTime);
    }

    public boolean isActive (int time)
    {
        return UNIX_START_TIME() < time && time < UNIX_END_TIME();
    }

    public String getDropRuleId (String feature, String option)
    {
        return FEATURE_DROP_LIST().ruleId(feature, option);
    }

    public MapItem generateDropItem (String feature, String option, UserGame userGame, int unixStartTime, MapItem received)
    {
        MapItem receive = new MapItem();

        String plantId = PLANT();
        String plantCmd = CmdName.get(CmdDefine.PLANT_HARVEST);

        if (feature.equalsIgnoreCase(plantCmd) && option.equalsIgnoreCase(plantId))
        {
            PlantDropItemInfo info = PLANT_DROP_LIST();
            receive.increase(info.generate(userGame.getUserId(), unixStartTime));
        }
        else
        {
            FeatureDropItemInfo info = FEATURE_DROP_LIST();
            receive.increase(info.generate(feature, option, received));
        }

        return receive;
    }

    public MapItem generateHarvestDropItem (String feature, String option, MapItem received)
    {
        MapItem receive = new MapItem();

        if (!isHarvestDropItemContains(feature) || !isUseHarvestDropItem())
            return receive;

        String plantId = PLANT();

        if (!option.equalsIgnoreCase(plantId))
        {
            HarvestDropItemInfo info = HARVEST_DROP_LIST();
            MapItem s = info.generate(feature, option, received);
            receive.increase(s);
        }

        return receive;
    }
}
