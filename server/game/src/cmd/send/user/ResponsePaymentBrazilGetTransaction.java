package cmd.send.user;

import cmd.Message;

public class ResponsePaymentBrazilGetTransaction extends Message
{
    public ResponsePaymentBrazilGetTransaction (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentBrazilGetTransaction packData (int type, int flow, String url)
    {
        put(KEY_TYPE, type);
        put(KEY_STATUS, flow);
        put(KEY_DATA, url);

        return this;
    }
}
