package data;

import util.collection.MapItem;

import java.util.*;
import java.util.function.Predicate;

public class GachaponInfo
{
    public  ArrayList<RewardInfo>                   REWARDS_DEFAULT;
    private HashMap<Integer, ArrayList<RewardInfo>> REWARDS_SPECIAL;

    public void init ()
    {
        for (Integer key : REWARDS_SPECIAL.keySet())
        {
            for (RewardInfo r : this.REWARDS_SPECIAL.get(key))
                r.init();
        }
    }

    public HashMap<Integer, ArrayList<RewardInfo>> REWARDS_SPECIAL ()
    {
        return REWARDS_SPECIAL;
    }

    public ArrayList<RewardInfo> getListReward (int turn)
    {
        if (REWARDS_DEFAULT == null || REWARDS_SPECIAL == null)
            return null;
        if (REWARDS_SPECIAL.containsKey(turn))
            return REWARDS_SPECIAL.get(turn);
        else
            return REWARDS_DEFAULT;
    }

    public static class RewardInfo
    {
        private int     REWARD_ID;
        private MapItem REWARDS;
        private int     RATE;
        private int     TURN_NUMBER;
        private int     DISPLAY_COLOR;

        public int TURN_NUMBER ()
        {
            return TURN_NUMBER;
        }

        public MapItem REWARDS ()
        {
            return REWARDS;
        }

        public int RATE ()
        {
            return RATE;
        }

        public int REWARD_ID ()
        {
            return REWARD_ID;
        }

        public int DISPLAY_COLOR ()
        {
            return DISPLAY_COLOR;
        }

        public void init ()
        {
            this.REWARDS = this.REWARDS.toUnmodifiableMapItem();
        }
    }
}
