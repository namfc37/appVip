package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAchievementSave extends Command
{
    public int[] ids;
    public int[] points;

    public RequestAchievementSave (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        ids = readIntArray(KEY_UID);
        points = readIntArray(KEY_NUM);
    }
}
