package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildCreate extends Command
{
    public String name;
    public String avatar;
    public String desc;
    public int    type;
    public int    levelMin;
    public int    levelMax;
    public int    appraisal;

    public RequestGuildCreate (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        name = readString(KEY_NAME);
        avatar = readString(KEY_AVATAR);
        desc = readString(KEY_TXT);
        type = readByte(KEY_TYPE);

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