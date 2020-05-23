package model.object;

import data.KeyDefine;
import data.MiscInfo;
import util.Time;
import util.serialize.Encoder;

public class PigBank extends Encoder.IObject implements KeyDefine
{
    private int diamond;
    private int timeGetReward;

    private PigBank ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public int getDiamond ()
    {
        return diamond;
    }

    public static PigBank create ()
    {
        PigBank s = new PigBank();
        return s;
    }


    public boolean isActive (int userLevel)
    {

        int currentTime = Time.getUnixTime();
        int timeStartDuration = MiscInfo.getTimeOpenPigDuration();
        int timeEndDuration = MiscInfo.getTimeEndPigDuration(timeStartDuration);
        boolean isGetReward = timeGetReward >= timeStartDuration && timeGetReward <= timeEndDuration;
        //Debug.info("is active pig bank",userLevel >= MiscInfo.PIG_UNLOCK_LEVEL() && currentTime >= MiscInfo.PIG_TIME_START() && currentTime <= MiscInfo.PIG_TIME_END());
        return !isGetReward && userLevel >= MiscInfo.PIG_UNLOCK_LEVEL() && currentTime >= timeStartDuration && currentTime <= timeEndDuration;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(PIG_CURRENT_DIAMOND, diamond);
        msg.put(PIG_TIME_GET_REWARD, timeGetReward);
    }

    public void reset ()
    {
        this.diamond = 0;
    }

    public void getReward ()
    {
        //TODO write getReward
        //  if (diamond < MiscInfo.PIG_MILESTONE_MIN());
    }

    public void addDiamond (int diamond)
    {
        this.diamond = Math.min(this.diamond + diamond, MiscInfo.PIG_MILESTONE_MAX());
        //  Debug.info("added diamond");
    }


    public int getTimeGetReward ()
    {
        return timeGetReward;
    }

    public void setTimeGetReward (int timeGetReward)
    {
        this.timeGetReward = timeGetReward;
    }
}
