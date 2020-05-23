package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentSeaVerify extends Command
{
    public String otp;

    public RequestPaymentSeaVerify (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        otp = readString(KEY_OTP);
    }
}
