package model.object;

import data.MiscDefine;
import util.collection.MapItem;

public class ConvertInfo
{
    private byte status;

    public Long    id;
    public String  name;
    public Short   level;
    public Long    exp;
    public String  facebookId;
    public String  facebookName;
    public String  lastPayTime;
    public Integer totalPaid;
    public Long    coinCash;
    public Long    coinBonus;
    public Long    coinTotalReal;
    public Long    coinTotalBonus;
    public MapItem reward;

    private ConvertInfo ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static ConvertInfo createEmpty ()
    {
        ConvertInfo info = new ConvertInfo();
        info.status = MiscDefine.CONVERT_INIT;

        return info;
    }

    public boolean canConvert ()
    {
        return status <= MiscDefine.CONVERT_INIT;
    }

    public void setStatus (byte status)
    {
        this.status = status;
    }
}
