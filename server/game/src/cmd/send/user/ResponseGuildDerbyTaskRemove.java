package cmd.send.user;

import java.util.Collection;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby.Task;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyTaskRemove extends Message
{
    public ResponseGuildDerbyTaskRemove (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public BaseMessage packData(Task task, Collection<Task> taskNew)
	{
    	put (KEY_SLOT_OBJECT, task);	
    	put (KEY_ITEMS, taskNew);
		return toBaseMessage();
	}
}
