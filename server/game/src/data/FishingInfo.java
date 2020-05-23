package data;

import data.festival.FeatureDropItemInfo;
import data.festival.PlantDropItemInfo;
import model.UserGame;
import util.collection.MapItem;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class FishingInfo
{
    private TreeMap<Integer, FishRate>                         FISH_RATES;
    private Map<String, TreeMap<Integer, List<RewardDefault>>> FISHING_REWARD;

    private List<MinigameBar> FISHING_MINIGAME_BAR = new ArrayList<>();

    public TreeMap<Integer, int[]> FISHING_MINIGAME_BAR_RATE() {
        return FISHING_MINIGAME_BAR_RATE;
    }

    private TreeMap<Integer, int[]> FISHING_MINIGAME_BAR_RATE = new TreeMap<>();
    private Map<String, TreeMap<String, FishWeight>> FISH_WEIGHT = new HashMap<>();
    private Map<String, TreeMap<Integer, FishReward>> FISH_REWARD = new HashMap<>();

    public Map<String, TreeMap<String, FishWeight>> FISH_WEIGHT ()
    {
        return FISH_WEIGHT;
    }
    public Map<String, TreeMap<Integer, FishReward>> FISH_REWARD ()
    {
        return FISH_REWARD;
    }

    public Map<String, TreeMap<Integer, List<RewardDefault>>> FISHING_REWARD ()
    {
        return FISHING_REWARD;
    }

    private FeatureDropItemInfo FEATURE_DROP_LIST;

    private int minTimeFishing;

    public int getMinTimeFishing ()
    {
        return minTimeFishing;
    }

    protected FeatureDropItemInfo FEATURE_DROP_LIST ()
    {
        return FEATURE_DROP_LIST;
    }

    public String getDropRuleId (String feature, String option)
    {
        return FEATURE_DROP_LIST().ruleId(feature, option);
    }

    public void init ()
    {
        FISHING_REWARD = Collections.unmodifiableMap(this.FISHING_REWARD);
        FISH_WEIGHT = Collections.unmodifiableMap(this.FISH_WEIGHT);
        FISH_REWARD = Collections.unmodifiableMap(this.FISH_REWARD);
            FISHING_MINIGAME_BAR = Collections.unmodifiableList(this.FISHING_MINIGAME_BAR);

        if (FISHING_MINIGAME_BAR != null && FISHING_MINIGAME_BAR.size() > 0)
        {
            minTimeFishing = FISHING_MINIGAME_BAR.get(0).APPEAR_TIME;
            for (MinigameBar minigameBar : FISHING_MINIGAME_BAR)
                if (minTimeFishing > minigameBar.APPEAR_TIME)
                    minTimeFishing = minigameBar.APPEAR_TIME;
        }

    }

    public static class MinigameBar
    {
        private String TYPE;
        private int    AREA_MIN;
        private int    AREA_MAX;
        private int    APPEAR_TIME;
        private int    SLIDER_SPEED;

        public String TYPE ()
        {
            return TYPE;
        }

        public int AREA_MIN ()
        {
            return AREA_MIN;
        }

        public int AREA_MAX ()
        {
            return AREA_MAX;
        }
    }

    public static class FishWeight
    {
        private float MIN;
        private float MAX;

        public float MIN ()
        {
            return MIN;
        }

        public float MAX ()
        {
            return MAX;
        }
    }

    public static class FishReward
    {
        private int GOLD;
        private int EXP;

        public int GOLD ()
        {
            return GOLD;
        }

        public int EXP ()
        {
            return EXP;
        }
    }

    public static class FishRate
    {
        private int     FISH_NUM_MIN;
        private int     FISH_NUM_MAX;
        private MapItem FISH_RATE;
    }

    public static class RewardDefault
    {
        private MapItem reward;
        private int     rate;

        public MapItem reward ()
        {
            return reward;
        }

        public int rate ()
        {
            return rate;
        }
    }

    public FishWeight getFishWeight(String typeWeight, String fish)
    {
        return FISH_WEIGHT.get(typeWeight).get(fish);
    }
    public FishReward getFishReward(String fish, int level)
    {
        if (!FISH_REWARD.containsKey(fish))
            return null;
        return FISH_REWARD.get(fish).floorEntry(level).getValue();
    }

    public MapItem generateNewFishes (int turn)
    {
        MapItem fishes = new MapItem();
        FishRate fishRate = FISH_RATES.get(FISH_RATES.floorKey(turn));
        if (fishRate == null) return fishes;

        ThreadLocalRandom random = ThreadLocalRandom.current();

        float totalRate = 0;
        for (util.collection.MapItem.Entry entry : fishRate.FISH_RATE)
        {
            totalRate += entry.value();
        }

        int total = random.nextInt(fishRate.FISH_NUM_MIN, fishRate.FISH_NUM_MAX + 1);

        int currentFish = 0;
        for (util.collection.MapItem.Entry entry : fishRate.FISH_RATE)
        {
            int num = (int) Math.ceil(entry.value() * total / totalRate); // số cá tính theo tỉ lệ, làm tròn lên
            int numFish = Math.min(total - currentFish, num); // số cá thực tế không vượt quá tổng "total"
            currentFish += numFish;
            if (numFish > 0)
                fishes.increase(entry.key(), numFish);
        }
        return fishes;
    }

    public MinigameBar generateMinigameBar (int level)
    {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int totalRate = 0;
        int[] rates = FISHING_MINIGAME_BAR_RATE.get(FISHING_MINIGAME_BAR_RATE.floorKey(level));
        for (int i=0;i<rates.length;i++)
        {
            totalRate += rates[i];
        }

        int rate = random.nextInt(totalRate);

        int index = -1;
        for (int i=0; i<rates.length;i++)
        {
            index++;
            if (rates[i] <= 0)
                continue;
            rate -= rates[i];
            if (rate <= 0)
                break;
        }

        return FISHING_MINIGAME_BAR.get(index);
    }

    public MapItem generateDropItem (String feature, String option, MapItem received)
    {
        MapItem receive = new MapItem();

        FeatureDropItemInfo info = FEATURE_DROP_LIST();
        receive.increase(info.generate(feature, option, received));

        return receive;
    }
}
