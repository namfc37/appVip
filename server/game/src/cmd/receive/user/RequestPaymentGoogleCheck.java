package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentGoogleCheck extends Command
{
    public String item;
    public String offer;

    public RequestPaymentGoogleCheck (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        item = readString(KEY_ITEM_ID);
        offer = readString(KEY_OFFER);
    }
}
