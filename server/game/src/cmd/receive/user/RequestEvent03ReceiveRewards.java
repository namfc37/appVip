package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestEvent03ReceiveRewards extends Command
{
    public int checkpoint;

    public RequestEvent03ReceiveRewards (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        checkpoint = readInt(KEY_EVENT_REWARD_ID);
    }
}
