package cmd.send.user;

import cmd.Message;

public class ResponsePaymentBrazilGetFlow extends Message
{
    public ResponsePaymentBrazilGetFlow (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentBrazilGetFlow packData (int type, int flow, String[] data)
    {
        put(KEY_TYPE, type);
        put(KEY_STATUS, flow);
        put(KEY_DATA, data);

        return this;
    }
}
