package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;

public class ResponseGuildSendMail extends Message
{
    public ResponseGuildSendMail (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData ()
    {
        return toBaseMessage();
    }
}
