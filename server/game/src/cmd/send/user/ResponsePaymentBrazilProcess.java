package cmd.send.user;

import cmd.Message;

public class ResponsePaymentBrazilProcess extends Message
{
    public ResponsePaymentBrazilProcess (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentBrazilProcess packData ()
    {

        return this;
    }
}
