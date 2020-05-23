package data;

import util.collection.MapItem;

import java.util.Collections;
import java.util.Map;

public class VIPInfo
{
    private Map<String, VIPItem> VIP_ITEMS;


    public void init ()
    {

        for (VIPItem r : this.VIP_ITEMS.values())
            r.init();
        VIP_ITEMS = Collections.unmodifiableMap(VIP_ITEMS);
    }

    public VIPItem getVIPItem (String id)
    {
        return VIP_ITEMS.get(id) != null ? VIP_ITEMS.get(id) : new VIPItem();

    }

    public static class VIPItem
    {
        private String  ID;
        private String  NAME;
        private int     DURATION;
        private int     CONVERT_GOLD_BONUS;
        private MapItem DAILY_LOGIN_REWARD;
        private int     UPGRADE_POT_RATE;
        private int     BLACKSMITH_RATE;
        private int     AIRSHIP_GOLD_BONUS;
        private int     BUG_RATE;

        public void init ()
        {
            this.DAILY_LOGIN_REWARD = this.DAILY_LOGIN_REWARD.toUnmodifiableMapItem();
        }

        public int BUG_RATE ()
        {
            return BUG_RATE;
        }

        public String ID ()
        {
            return ID;
        }

        public String NAME ()
        {
            return NAME;
        }

        public int DURATION ()
        {
            return DURATION;
        }

        public int CONVERT_GOLD_BONUS ()
        {
            return CONVERT_GOLD_BONUS;
        }

        public MapItem DAILY_LOGIN_REWARD ()
        {
            return DAILY_LOGIN_REWARD;
        }

        public int UPGRADE_POT_RATE ()
        {
            return UPGRADE_POT_RATE;
        }

        public int BLACKSMITH_RATE ()
        {
            return BLACKSMITH_RATE;
        }

        public void BLACKSMITH_RATE (int BLACKSMITH_RATE)
        {
            this.BLACKSMITH_RATE = BLACKSMITH_RATE;
        }

        public int AIRSHIP_GOLD_BONUS ()
        {
            return AIRSHIP_GOLD_BONUS;
        }

    }
}
