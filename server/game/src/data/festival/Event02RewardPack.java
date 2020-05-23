package data.festival;

import util.collection.MapItem;

import java.util.Collections;
import java.util.Map;

public class Event02RewardPack
{

    private int     REWARD_ID;
    private int     GROUP;
    private int     GROUP_LV;
    private MapItem REWARD_PACK;
    private MapItem REQUIRE_PACK;
    private MapItem BONUS;
    private int     EXCHANGE_LIMIT;


    public MapItem getReward ()
    {
        MapItem rewardPack = new MapItem();
        rewardPack.increase(REWARD_PACK);
        return rewardPack;
    }


    public MapItem getBonus ()
    {
        MapItem bonusReward = new MapItem();
        bonusReward.increase(BONUS);
        return bonusReward;
    }

    public MapItem getRequirePack ()
    {
        MapItem requirePack = new MapItem();
        requirePack.increase(REQUIRE_PACK);
        return requirePack;
    }

    public int GROUP () {
        return GROUP;
    }

    public int REWARD_ID ()
    {
        return REWARD_ID;
    }

    public int GROUP_LV ()
    {
        return GROUP_LV;
    }


    public int EXCHANGE_LIMIT ()
    {
        return EXCHANGE_LIMIT;
    }
}
