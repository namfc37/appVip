package data;

import util.Time;

import java.util.HashMap;

public class ItemInfo
{
    public final static int OLD_TYPE_PLANT    = 1;
    public final static int OLD_TYPE_POT      = 0;
    public final static int OLD_TYPE_PEST     = 1;
    public final static int OLD_TYPE_PRODUCT  = 4;
    public final static int OLD_TYPE_MATERIAL = 8;
    public final static int OLD_TYPE_DECOR    = 7;

    private String  ID;
    private String  NAME;
    private int     UID;
    private int     TYPE;
    private int     SUB_TYPE;
    private int     DIAMOND_BUY; //giá mua item của lệnh buy item
    private int     GOLD_JACK; // < 0: không được bán cho Jack,  == 0: bán với giá GOLD_DEFAULT,  > 0: bán với giá GOLD_JACK
    private int     GOLD_DEFAULT; // <= 0: không được bán trong private shop, > 0 : cho bán trong private shop
    private int     GOLD_MIN;
    private int     GOLD_MAX;
    private int     SELL_FEE; //phí đặt bán trong private shop (tính bằng xu)
    private int     STOCK;
    private TomInfo TOM;
    private String  COMBO_ID;
    private int     LEVEL_UNLOCK;
    private int[][] USE_DURATION;
    private int     JACK_PS_GOLD;

    void addExpire (HashMap<String, int[][]> mapExpire)
    {
        if (USE_DURATION != null && Time.checkTimeOpen(USE_DURATION))
            mapExpire.put(ID(), USE_DURATION);
    }

    void buildCache ()
    {

    }

    public static int toOldUid (int oldType, int oldId)
    {
        return (oldType << 16) | oldId;
    }

    public String NAME ()
    {
        return NAME;
    }

    public String ID ()
    {
        return ID;
    }

    public int UID ()
    {
        return UID;
    }

    public int TYPE ()
    {
        return TYPE;
    }

    public int SUB_TYPE ()
    {
        return SUB_TYPE;
    }

    public int DIAMOND_BUY ()
    {
        return DIAMOND_BUY;
    }

    public int priceSellForJack ()
    {
        if (GOLD_JACK < 0)
            return -1;
        return (GOLD_JACK > 0) ? GOLD_JACK : GOLD_DEFAULT;
    }

    public boolean canSellForJack ()
    {
        return GOLD_JACK >= 0;
    }

    public boolean canPutInPrivateShop ()
    {
        return GOLD_DEFAULT > 0;
    }

    public int GOLD_DEFAULT ()
    {
        return GOLD_DEFAULT;
    }

    public int GOLD_MIN ()
    {
        return GOLD_MIN;
    }

    public int GOLD_MAX ()
    {
        return GOLD_MAX;
    }

    public int STOCK ()
    {
        return STOCK;
    }

    public int SELL_FEE ()
    {
        return SELL_FEE;
    }

    public boolean isProductInfo ()
    {
        return false;
    }

    public TomInfo getTomInfo ()
    {
        return TOM;
    }

    public String COMBO_ID ()
    {
        return COMBO_ID;
    }

    public int LEVEL_UNLOCK ()
    {
        return LEVEL_UNLOCK;
    }

    public int JACK_PS_GOLD ()
    {
        return JACK_PS_GOLD;
    }
}
