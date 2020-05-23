package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;

public class ResponseGuildSetPresident extends Message
{
    public ResponseGuildSetPresident (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int memberId, int newPresidentId)
    {
    	put(KEY_USER_ID, memberId);
    	put(KEY_VIP, newPresidentId);
        return toBaseMessage();
    }
}
