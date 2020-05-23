package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyTaskCancel extends Command
{
	public int taskId;

    public RequestGuildDerbyTaskCancel (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	taskId = readInt(KEY_SLOT_ID);
    }
}
