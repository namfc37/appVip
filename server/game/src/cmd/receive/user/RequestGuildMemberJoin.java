package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberJoin extends Command
{
    public int guildId;

    public RequestGuildMemberJoin (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        guildId = readInt(KEY_GUILD);
    }
}
