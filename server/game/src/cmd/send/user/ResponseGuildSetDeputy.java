package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import util.Time;

public class ResponseGuildSetDeputy extends Message
{
    public ResponseGuildSetDeputy (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int memberId, int role)
    {
    	put(KEY_USER_ID, memberId);
    	put(KEY_STATUS, role);
        return toBaseMessage();
    }
}
