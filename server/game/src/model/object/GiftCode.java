package model.object;

import data.GiftCodeInfo;
import util.Time;

import java.util.HashMap;

public class GiftCode
{
    private HashMap<String, Integer>                  multiples; //code, unix time
    private HashMap<String, HashMap<String, Integer>> singles; //group, <code, unix time>

    private GiftCode ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static GiftCode create ()
    {
        GiftCode o = new GiftCode();
        o.multiples = new HashMap<>();
        o.singles = new HashMap<>();
        return o;
    }

    public boolean canUseMultipleCode (String code)
    {
        return !multiples.containsKey(code);
    }

    public void addMultipleCode (String code)
    {
        multiples.put(code, Time.getUnixTime());
    }

    public boolean canUseSingleCode (GiftCodeInfo.Single info, String code)
    {
        HashMap<String, Integer> m = singles.get(info.getGroup());
        if (m == null)
            return true;
        if (m.size() >= info.getLimitPerUser())
            return false;
        return !m.containsKey(code);
    }

    public boolean isLimitSingleCode (GiftCodeInfo.Single info)
    {
        HashMap<String, Integer> m = singles.get(info.getGroup());
        int size = (m == null) ? 0 : m.size();
        return size >= info.getLimitPerUser();
    }

    public void addSingleCode (GiftCodeInfo.Single info, String code)
    {
        HashMap<String, Integer> m = singles.get(info.getGroup());
        if (m == null)
        {
            m = new HashMap<>();
            singles.put(info.getGroup(), m);
        }
        m.put(code, Time.getUnixTime());
    }
}
