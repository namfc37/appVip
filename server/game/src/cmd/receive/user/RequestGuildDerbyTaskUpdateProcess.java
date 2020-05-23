package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyTaskUpdateProcess extends Command
{
	public int taskId;
	public int current;

	public RequestGuildDerbyTaskUpdateProcess (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	taskId = readInt(KEY_SLOT_ID);
    	current = readInt(KEY_SLOT_OBJECT);
    }
}
