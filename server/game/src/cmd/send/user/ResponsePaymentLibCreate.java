package cmd.send.user;

import cmd.BinaryMessage;
import com.google.gson.JsonObject;

public class ResponsePaymentLibCreate extends BinaryMessage
{
    public ResponsePaymentLibCreate (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentLibCreate packData (String data)
    {
        putString(data);
        return this;
    }
}
