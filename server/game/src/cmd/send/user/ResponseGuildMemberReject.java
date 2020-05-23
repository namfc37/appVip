package cmd.send.user;

import java.util.Collection;
import java.util.List;

import cmd.BaseMessage;
import cmd.Message;
import util.Time;

public class ResponseGuildMemberReject extends Message
{
    public ResponseGuildMemberReject (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int memberId, Collection<Integer> rejectIds)
    {
    	put (KEY_USER_ID, memberId);
    	putInts (KEY_DATA, rejectIds);
    	
        return toBaseMessage();
    }
}
