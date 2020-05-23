package data;

import java.util.HashMap;

public class OfferInfo
{
    public String                   ID;
    public String                   TYPE;
    public Integer                  PRICE_COIN;
    public Integer                  PRICE_VND;
    public HashMap<String, Integer> REWARDS;
    public Integer                  COOLDOWN_MIN;
    public Integer                  COOLDOWN_MAX;
    public String                   COOLDOWN_ACTIVE;
    public Integer                  DURATION;
    public String                   DURATION_ACTIVE_PURCHASE;
    public String                   DURATION_ACTIVE_NO_PURCHASE;
    public Integer                  REPEAT_DAY;
    public String                   GFX;
}
