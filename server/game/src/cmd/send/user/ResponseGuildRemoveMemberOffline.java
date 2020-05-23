package cmd.send.user;

import java.util.List;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildInfo;

public class ResponseGuildRemoveMemberOffline extends Message
{
    public ResponseGuildRemoveMemberOffline (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (List<Integer> removeIds)
    {
		putInts(KEY_SLOT_ID, removeIds);
        return toBaseMessage();
    }
}
