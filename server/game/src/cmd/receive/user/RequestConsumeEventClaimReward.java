package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestConsumeEventClaimReward extends Command
{
    public String id;

    public RequestConsumeEventClaimReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        id = readString(KEY_CONSUME_ID);
    }
}
