package cmd.send.user;

import cmd.Message;
import model.object.ConsumeEvent;

public class ResponseConsumeEventGet extends Message
{
    public ResponseConsumeEventGet(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseConsumeEventGet packData (ConsumeEvent consumeEvent)
    {
        put(KEY_CONSUME_EVENT, consumeEvent);
        return this;
    }
}
