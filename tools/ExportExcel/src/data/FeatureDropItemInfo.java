package data;

import java.util.HashMap;

public class FeatureDropItemInfo {
    public HashMap<String, Rule> rules;
    public String dropItemID;

    public FeatureDropItemInfo(String defaultDropItem) {
        this.dropItemID = defaultDropItem;
        this.rules = new HashMap<String, Rule>();
    }

    public boolean add(String featureId, String option, float rate, int quantity, int dailyLimit) {
        String ruleId = featureId;
        if (!option.isEmpty())
            ruleId += "_" + option;

        Rule dropRule = new Rule(rate, quantity, dailyLimit);
        rules.put(ruleId, dropRule);
        return true;
    }

    public boolean add(String featureId, String option, float rate, int quantity, int dailyLimit, String dropItemID) {
        String ruleId = featureId;
        if (!option.isEmpty())
            ruleId += "_" + option;

        Rule dropRule = new Rule(rate, quantity, dailyLimit,dropItemID);
        rules.put(ruleId, dropRule);
        return true;
    }

    public static class Rule {
        public float rate;
        public float quantity;
        public float dailyLimit;
        public String dropItemID;

        public Rule(float rate, int quantity, int dailyLimit) {
            this.rate = rate;
            this.quantity = quantity;
            this.dailyLimit = dailyLimit;
           // this.dropItemID = "";
        }

        public Rule(float rate, int quantity, int dailyLimit, String dropItemID) {
            this.rate = rate;
            this.quantity = quantity;
            this.dailyLimit = dailyLimit;
            this.dropItemID = dropItemID;
        }
    }
}
