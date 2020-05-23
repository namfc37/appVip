package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import util.Time;

public class ResponseGuildMemberLeave extends Message
{
    public ResponseGuildMemberLeave (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int userId)
    {
    	put (KEY_USER_ID, userId);
        return toBaseMessage();
    }
}
