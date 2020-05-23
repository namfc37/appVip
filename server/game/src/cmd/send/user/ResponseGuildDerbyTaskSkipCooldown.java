package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby.Task;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyTaskSkipCooldown extends Message
{
    public ResponseGuildDerbyTaskSkipCooldown (short cmd, byte error)
    {
        super(cmd, error);
    }

	public BaseMessage packData(Task task, long coin)
	{
		put (KEY_SLOT_OBJECT, task);
		put (KEY_COIN, coin);
        return toBaseMessage();
	}

    public BaseMessage packData (Task task)
    {
		put (KEY_SLOT_OBJECT, task);
        return toBaseMessage();
    }
}
