package data;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Hook extends ItemInfo
{
    public String FISH ;

    public Map<String, Integer> REQUIRE_DEFAULT = new HashMap<>();;
    public Map<String, Integer> REQUIRE_ITEM_RATE= new HashMap<>();
    public int                  REQUIRE_ITEM_NUM;
    public int PRODUCTION_TIME;
    public int GOLD_BASIC;
    public int EXP_BASIC;

    public String COLOR_MINIGAME_BAR;
    public String  GFX;
}
