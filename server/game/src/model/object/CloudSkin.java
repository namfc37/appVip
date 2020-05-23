package model.object;

import data.ConstInfo;
import data.KeyDefine;
import data.SkinInfo;
import util.Time;
import util.serialize.Encoder;

public class CloudSkin extends Encoder.IObject implements KeyDefine
{
    private String id;
    private int    startTime;
    private int    endTime;

    private CloudSkin ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static CloudSkin create ()
    {
        CloudSkin s = new CloudSkin();
        s.id = "";
        s.startTime = -1;
        s.endTime = -1;

        return s;
    }

    public int appraisal ()
    {
        if (id == null || id.isEmpty())
            return 0;

        SkinInfo info = ConstInfo.getSkinInfo(this.id);

        return info == null ? 0 : info.APPRAISAL();
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(SKIN_ID, id);
        msg.put(SKIN_START_TIME, startTime);
        msg.put(SKIN_END_TIME, endTime);
    }

    public void apply (SkinInfo skin)
    {
        this.id = skin.ID();
        this.startTime = Time.getUnixTime();
        this.endTime = this.startTime + skin.EFFECT_DURATION();
    }

    public void reset ()
    {
        this.id = "";
        this.startTime = -1;
        this.endTime = -1;
    }

    public int getStartTime ()
    {
        return startTime;
    }

    public int getEndTime ()
    {
        return endTime;
    }

    public String getSkinId ()
    {
        return id;
    }

    public boolean isExpire ()
    {
        if (id.isEmpty() || startTime == -1 || endTime == -1)
            return true;

        return Time.getUnixTime() > this.endTime;
    }
}
