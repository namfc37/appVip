package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestConsumeEventSpin extends Command
{
    public String id;

    public RequestConsumeEventSpin (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        this.id = readString(KEY_CONSUME_ID);
    }
}
