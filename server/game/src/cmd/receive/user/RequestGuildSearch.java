package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildSearch extends Command
{
    public int    guildId;
    public String guildName;

    public RequestGuildSearch (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        guildId = readInt(KEY_GUILD);
        guildName = readString(KEY_NAME);
    }
}
