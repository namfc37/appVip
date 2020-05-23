package cmd.send.user;

import java.util.Collection;
import java.util.List;

import cmd.BaseMessage;
import cmd.Message;
import util.Time;

public class ResponseGuildMemberKick extends Message
{
    public ResponseGuildMemberKick (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int userId, Collection<Integer> removeIds)
    {
    	put (KEY_USER_ID, userId);
    	putInts (KEY_DATA, removeIds);
        return toBaseMessage();
    }
}
