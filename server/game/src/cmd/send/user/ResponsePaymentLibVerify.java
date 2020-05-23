package cmd.send.user;

import cmd.BinaryMessage;

public class ResponsePaymentLibVerify extends BinaryMessage
{
    public ResponsePaymentLibVerify (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentLibVerify packData ()
    {
        return this;
    }

}
