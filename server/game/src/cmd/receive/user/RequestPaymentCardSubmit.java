package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentCardSubmit extends Command
{
    public int    channel;
    public String serial;
    public String code;
    public String item;
    public String offer;

    public RequestPaymentCardSubmit (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        channel = readInt(KEY_CHANNEL);
        serial = readString(KEY_CARD_SERIAL);
        code = readString(KEY_CARD_CODE);
        item = readString(KEY_ITEM_ID);
        offer = readString(KEY_OFFER);
    }
}
