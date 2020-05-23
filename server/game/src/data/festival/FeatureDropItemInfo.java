package data.festival;

import util.collection.MapItem;

import java.util.HashMap;
import java.util.concurrent.ThreadLocalRandom;

public class FeatureDropItemInfo
{
    private HashMap<String, Rule> rules;
    private String                dropItemID;

    public void init ()
    {
    }

    public String ruleId (String feature, String option)
    {
        String ruleId = feature + "_" + option;
        if (rules.containsKey(ruleId))
            return ruleId;

        if (rules.containsKey(feature))
            return feature;

        return null;
    }

    public MapItem generate (String feature, String option, MapItem received)
    {
        MapItem receive = new MapItem();
        String ruleId = ruleId(feature, option);
        if (ruleId == null)
            return receive;

        Rule rule = rules.get(ruleId);
        if (rule == null)
            return receive;

        int itemReceived = received == null ? 0 : received.get(dropItemID);
        int num = rule.generate(itemReceived);
        if (num > 0)
            receive.increase(rule.dropItemID==null ? dropItemID : rule.dropItemID, num);

        return receive;
    }

    private static class Rule
    {
        private float  rate;
        private int    quantity;
        private int    dailyLimit;
        private String dropItemID;

        public int generate (int received)
        {
            if (dailyLimit > 0 && dailyLimit <= received)
                return 0;

            ThreadLocalRandom random = ThreadLocalRandom.current();
            if (rate < random.nextFloat())
                return 0;

            if (dailyLimit > 0 && quantity + received > dailyLimit)
                return dailyLimit - received;

            return quantity;
        }
    }
}
