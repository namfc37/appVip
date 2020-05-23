package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby.Task;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyTaskUpdateProcess extends Message
{
    public ResponseGuildDerbyTaskUpdateProcess (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (Task task)
    {
    	put (KEY_SLOT_OBJECT, task);
        return toBaseMessage();
    }
}
