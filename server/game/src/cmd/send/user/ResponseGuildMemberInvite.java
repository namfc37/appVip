package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import util.Time;

public class ResponseGuildMemberInvite extends Message
{
    public ResponseGuildMemberInvite (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData ()
    {
        return toBaseMessage();
    }
}
