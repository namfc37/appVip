package cmd.send.user;

import cmd.Message;

public class ResponsePaymentGoogleSubmit extends Message
{
    public ResponsePaymentGoogleSubmit (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentGoogleSubmit packData (boolean retry)
    {
        put(KEY_FINISH, retry);
        return this;
    }
}
