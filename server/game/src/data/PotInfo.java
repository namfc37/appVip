package data;

import util.collection.MapItem;

import java.util.List;
import java.util.TreeMap;
import java.util.concurrent.ThreadLocalRandom;

public class PotInfo extends ItemInfo
{
    private int          EXP_INCREASE;
    private MapItem      REQUIRE_ITEM;
    private int          UPGRADE_RATIO;
    private int          BUG_APPEAR_RATIO;
    private int          APPRAISAL;
    private int          TIME_DECREASE_DEFAULT;
    private List<String> UPGRADE_NEXT_ID;
    private int          POT_RANKING_STAR;
    private int          GOLD_INCREASE;
    private int[]        SELECTION_RATE;
    private int          POT_LIBRARY_ORDER;
    private String       GFX;
    private String       SKIN;

    private int                      totalRate;
    private TreeMap<Integer, String> treeUpgradeId;

    @Override
    void buildCache ()
    {
        if (UPGRADE_NEXT_ID.size() > 1)
        {
            totalRate = 0;
            treeUpgradeId = new TreeMap<>();
            for (int i = 0; i < UPGRADE_NEXT_ID.size(); i++)
            {
                treeUpgradeId.put(totalRate, UPGRADE_NEXT_ID.get(i));
                totalRate += SELECTION_RATE[i];
            }
        }
    }

    public boolean canUpgrade ()
    {
        return UPGRADE_NEXT_ID.size() > 0;
    }

    public MapItem genRequireItem (String grass)
    {
        MapItem map = new MapItem();
        map.increase(REQUIRE_ITEM);
        if (grass.length() > 0)
            map.increase(grass, 1);
        return map;
    }

    public String upgrade (MaterialInfo grass, int bonusRate)
    {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int rate = UPGRADE_RATIO() + bonusRate;
        if (grass != null)
            rate += grass.LUCKY_PERCENT();

        if (rate >= 100 || random.nextInt(100) < rate)
        {
            if (UPGRADE_NEXT_ID.size() == 1)
                return UPGRADE_NEXT_ID.get(0);
            rate = random.nextInt(totalRate);
            return treeUpgradeId.floorEntry(rate).getValue();
        }
        return null;
    }

    public int EXP_INCREASE ()
    {
        return EXP_INCREASE;
    }

    public int UPGRADE_RATIO ()
    {
        return UPGRADE_RATIO;
    }

    public int BUG_APPEAR_RATIO ()
    {
        return BUG_APPEAR_RATIO;
    }

    public int APPRAISAL ()
    {
        return APPRAISAL;
    }

    public int TIME_DECREASE_DEFAULT ()
    {
        return TIME_DECREASE_DEFAULT;
    }

    public int POT_RANKING_STAR ()
    {
        return POT_RANKING_STAR;
    }

    public int GOLD_INCREASE ()
    {
        return GOLD_INCREASE;
    }

    public int POT_LIBRARY_ORDER ()
    {
        return POT_LIBRARY_ORDER;
    }
}
