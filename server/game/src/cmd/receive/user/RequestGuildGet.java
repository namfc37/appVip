package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildGet extends Command
{
    public int guildId;

    public RequestGuildGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	guildId = readInt(KEY_GUILD);
    }
}
