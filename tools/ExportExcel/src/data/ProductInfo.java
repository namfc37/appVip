package data;

import java.util.Map;

public class ProductInfo extends ItemInfo
{
    public String               MACHINE_ID;
    public Map<String, Integer> REQUIRE_ITEM;
    public int                  PRODUCTION_TIME;
    public int                  EXP_RECEIVE;
    public float                GOLD_BASIC;
    public float                EXP_BASIC;
    public String               GFX;
}
