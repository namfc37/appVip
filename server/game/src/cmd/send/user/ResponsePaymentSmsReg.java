package cmd.send.user;

import cmd.Message;

public class ResponsePaymentSmsReg extends Message
{
    public ResponsePaymentSmsReg (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentSmsReg packData (String channel, String item, String phone, String syntax)
    {
        put(KEY_CHANNEL, channel);
        put(KEY_ITEM_ID, item);
        put(KEY_PHONE, phone);
        put(KEY_DATA, syntax);

        return this;
    }
}
