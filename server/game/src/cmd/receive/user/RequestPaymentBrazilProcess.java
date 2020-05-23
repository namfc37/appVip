package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentBrazilProcess extends Command
{
    public String otp;

    public RequestPaymentBrazilProcess (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        otp = readString(KEY_OTP);
    }
}
