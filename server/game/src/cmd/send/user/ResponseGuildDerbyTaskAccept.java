package cmd.send.user;

import java.util.Collection;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby.Member;
import service.guild.GuildDerby.Task;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyTaskAccept extends Message
{
    public ResponseGuildDerbyTaskAccept (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (Member member, Task task, long coinRemain, Collection<Task> taskNew)
    {
    	put (KEY_DATA, member);
    	put (KEY_SLOT_OBJECT, task);
    	put (KEY_ITEMS, taskNew);
    	put (KEY_COIN, coinRemain);
    	
        return toBaseMessage();
    }

	public BaseMessage packData (Member member, Task task, Collection<Task> taskNew)
	{
    	put (KEY_DATA, member);
    	put (KEY_SLOT_OBJECT, task);
    	put (KEY_ITEMS, taskNew);
    	
        return toBaseMessage();
	}
}
