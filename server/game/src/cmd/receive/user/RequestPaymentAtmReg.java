package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentAtmReg extends Command
{
    public String bankCode;
    public String item;
    public String offer;

    public RequestPaymentAtmReg (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        bankCode = readString(KEY_CHANNEL);
        item = readString(KEY_ITEM_ID);
        offer = readString(KEY_OFFER);
    }
}
