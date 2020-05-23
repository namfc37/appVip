package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFlippingCardsCheckpointReward extends Command
{
    public int checkpoint;

    public RequestFlippingCardsCheckpointReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        checkpoint = readInt(KEY_SLOT_ID);
    }
}