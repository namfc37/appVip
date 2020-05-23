package cmd.send.user;

import cmd.Message;

public class ResponsePaymentSeaVerify extends Message
{
    public ResponsePaymentSeaVerify (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentSeaVerify packData ()
    {
        return this;
    }
}
