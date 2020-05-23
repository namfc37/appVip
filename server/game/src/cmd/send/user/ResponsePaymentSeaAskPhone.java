package cmd.send.user;

import cmd.Message;

import java.util.Set;

public class ResponsePaymentSeaAskPhone extends Message
{
    public ResponsePaymentSeaAskPhone (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentSeaAskPhone packData (Set<String> channels)
    {
        putStrings(KEY_CHANNEL, channels);

        return this;
    }
}
