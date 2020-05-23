package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGiftCodeGetReward extends Command
{
    public String id;

    public RequestGiftCodeGetReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readString(KEY_UID);
    }
}
