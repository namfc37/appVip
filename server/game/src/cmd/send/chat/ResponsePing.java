package cmd.send.chat;

import cmd.BaseMessage;
import cmd.ErrorConst;
import cmd.Message;
import util.Time;

public class ResponsePing extends Message
{
    public ResponsePing (short cmd)
    {
        super(cmd, ErrorConst.SUCCESS);
    }

    public BaseMessage packData ()
    {
        //put(KEY_TIME_MILLIS, Time.getTimeMillis());

        return toBaseMessage();
    }
}
