package data.festival;

import data.MiscDefine;
import extension.EnvConfig;
import model.DropLimitItem;
import util.collection.MapItem;

import java.util.HashMap;
import java.util.concurrent.ThreadLocalRandom;

public class PlantDropItemInfo
{
    private HashMap<String, Rule> drop;
    private String                eventId;

    public void init (String eventId, int timeOpen, int timeEnd)
    {
        this.eventId = eventId;
        for (String itemId : drop.keySet())
        {
            Rule rule = drop.get(itemId);
            if (!rule.IS_SERVER_LIMIT())
                continue;
            if (rule.IS_VIETNAM_ONLY() && !EnvConfig.isZone(MiscDefine.COUNTRY_VIETNAM))
                DropLimitItem.init(eventId, itemId, timeOpen, timeEnd, 0, 0);
            else
            DropLimitItem.init(eventId, itemId, timeOpen, timeEnd, rule.SERVER_LIMIT(), rule.LIMIT_PER_USER());
        }
    }

    public MapItem generate (int userId, int userEventStartTime)
    {
        MapItem receive = new MapItem();

        for (String itemId : drop.keySet())
        {
            int quantity = 0;

            Rule rule = drop.get(itemId);

            if (rule.IS_VIETNAM_ONLY() && !EnvConfig.isZone(MiscDefine.COUNTRY_VIETNAM))
                quantity = 0;
            else if (rule.IS_SERVER_LIMIT())
            {
                if (DropLimitItem.isDrop(eventId, userEventStartTime, itemId, userId))
                    quantity = 1;
            }
            else
                quantity = rule.generate();

            if (quantity > 0)
                receive.increase(itemId, quantity);
        }

        return receive;
    }

    public static class Rule
    {
        private float rate;
        private int   min;
        private int   max;
        private int   userLimit;
        private int   serverLimit;
        private boolean isVietNamOnly;

        public int SERVER_LIMIT ()
        {
            return serverLimit;
        }

        public int LIMIT_PER_USER ()
        {
            return userLimit;
        }

        public boolean IS_SERVER_LIMIT ()
        {
            return serverLimit > 0;
        }

        public boolean IS_VIETNAM_ONLY() { return isVietNamOnly;}

        public int generate ()
        {
            ThreadLocalRandom random = ThreadLocalRandom.current();
            if (rate < random.nextFloat())
                return 0;

            return random.nextInt(min, max + 1);
        }
    }
}
