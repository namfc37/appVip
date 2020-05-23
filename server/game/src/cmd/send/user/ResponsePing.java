package cmd.send.user;

import cmd.Message;
import util.Time;

public class ResponsePing extends Message
{
    public ResponsePing (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePing packData ()
    {
        put(KEY_TIME_MILLIS, Time.getTimeMillis());

        return this;
    }
}
