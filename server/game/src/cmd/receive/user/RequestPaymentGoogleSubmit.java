package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentGoogleSubmit extends Command
{
    public String packageName;
    public String data;
    public String sign;
    public String offer;

    public RequestPaymentGoogleSubmit (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        packageName = readString(KEY_CHANNEL);
        data = readString(KEY_DATA);
        sign = readString(KEY_SIGN);
        offer = readString(KEY_OFFER);
    }
}
