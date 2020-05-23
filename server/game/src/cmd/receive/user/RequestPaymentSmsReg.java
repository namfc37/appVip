package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentSmsReg extends Command
{
    public String channel;
    public String item;
    public String offer;

    public RequestPaymentSmsReg (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        channel = readString(KEY_CHANNEL);
        item = readString(KEY_ITEM_ID);
        offer = readString(KEY_OFFER);
    }
}
