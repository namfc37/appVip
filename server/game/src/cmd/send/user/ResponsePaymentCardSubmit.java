package cmd.send.user;

import cmd.Message;

public class ResponsePaymentCardSubmit extends Message
{
    public ResponsePaymentCardSubmit (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentCardSubmit packData (int channel, String item)
    {
        put(KEY_CHANNEL, channel);
        put(KEY_ITEM_ID, item);

        return this;
    }
}
