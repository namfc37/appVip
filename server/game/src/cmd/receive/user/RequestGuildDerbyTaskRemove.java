package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyTaskRemove extends Command
{
	public int taskId;

    public RequestGuildDerbyTaskRemove (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	taskId = readInt(KEY_SLOT_ID);
    }
}
