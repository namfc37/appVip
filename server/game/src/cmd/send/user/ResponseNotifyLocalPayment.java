package cmd.send.user;

import cmd.Message;

public class ResponseNotifyLocalPayment extends Message
{
    public ResponseNotifyLocalPayment (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseNotifyLocalPayment packData (boolean value)
    {
        put(KEY_ACTIVE_LOCAL_PAYMENT, value);

        return this;
    }
}
