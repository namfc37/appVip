package data;

import java.util.HashMap;
import java.util.LinkedHashMap;

public class VIPInfo
{
    public LinkedHashMap<String, VIPItem> VIP_ITEMS = new LinkedHashMap<>();

    public static class VIPItem {
        public String ID;
        public String NAME;
        public int DURATION;
        public int CONVERT_GOLD_BONUS;
        public HashMap<String, Integer> DAILY_LOGIN_REWARD;
        public int UPGRADE_POT_RATE;
        public int BLACKSMITH_RATE;
        public int AIRSHIP_GOLD_BONUS;
        public int BUG_RATE;
        public boolean IS_ACTIVE;
    }
}
