package cmd.send.user;

import cmd.Message;
import model.Payment;

public class ResponsePaymentGet extends Message
{
    public ResponsePaymentGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentGet packData (Payment payment)
    {
        put(KEY_PAYMENT, payment);

        return this;
    }
}
