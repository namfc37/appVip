package cmd.send.user;

import cmd.Message;
import data.CmdDefine;

public class ResponseKickUser extends Message
{
    public ResponseKickUser (byte error)
    {
        super(CmdDefine.KICK_USER, error);
    }

    public ResponseKickUser packData ()
    {
        return this;
    }
}
