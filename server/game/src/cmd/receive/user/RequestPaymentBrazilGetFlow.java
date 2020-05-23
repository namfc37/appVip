package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentBrazilGetFlow extends Command
{
    public int channel;

    public RequestPaymentBrazilGetFlow (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        channel = readInt(KEY_CHANNEL);
    }
}
