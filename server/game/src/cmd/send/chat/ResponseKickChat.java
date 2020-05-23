package cmd.send.chat;

import cmd.BaseMessage;
import cmd.Message;
import data.CmdDefine;

public class ResponseKickChat extends Message
{
    public ResponseKickChat (byte error)
    {
        super(CmdDefine.CHAT_KICK, error);
    }

    public BaseMessage packData ()
    {
        return toBaseMessage();
    }
}
