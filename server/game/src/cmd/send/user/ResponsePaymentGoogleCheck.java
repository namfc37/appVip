package cmd.send.user;

import cmd.Message;
import model.Payment;

public class ResponsePaymentGoogleCheck extends Message
{
    public ResponsePaymentGoogleCheck (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentGoogleCheck packData (Payment payment)
    {
        put(KEY_PAYMENT, payment);

        return this;
    }
}
