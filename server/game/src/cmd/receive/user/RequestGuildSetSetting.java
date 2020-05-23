package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildSetSetting extends Command
{
    public String short_desc;
    public String avatar;
    public int    type;
    public int    levelMin;
    public int    levelMax;
    public int    appraisal;

    public RequestGuildSetSetting (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        short_desc = readString(KEY_TXT);
        avatar = readString(KEY_AVATAR);
        type = readInt(KEY_TYPE);

//		member require level
        int[] level = readIntArray(KEY_LEVEL);
        if (level == null || level.length != 2)
        {
            levelMin = -1;
            levelMax = -1;
        }
        else
        {
            levelMin = level[0];
            levelMax = level[1];
        }

//		member require appraisal
        appraisal = readInt(KEY_APPRAISAL);
    }
}
