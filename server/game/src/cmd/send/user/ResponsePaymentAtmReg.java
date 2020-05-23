package cmd.send.user;

import cmd.Message;

public class ResponsePaymentAtmReg extends Message
{
    public ResponsePaymentAtmReg (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentAtmReg packData (String channel, String item, String url)
    {
        put(KEY_CHANNEL, channel);
        put(KEY_ITEM_ID, item);
        put(KEY_DATA, url);

        return this;
    }
}
