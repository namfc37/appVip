package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAchievementFinish extends Command
{
    public int id;

    public RequestAchievementFinish (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readInt(KEY_UID);
    }
}
