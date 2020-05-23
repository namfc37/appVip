package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import model.object.UserGuild;
import service.guild.GuildDonate;

public class ResponseGuildMemberDonateStart extends Message
{
    public ResponseGuildMemberDonateStart (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (GuildDonate donate)
    {
        put(KEY_DATA, donate);
        return toBaseMessage();
    }

    public BaseMessage packData (UserGuild guild, GuildDonate donate)
    {
        put(KEY_GUILD, guild);
        put(KEY_DATA, donate);
        return toBaseMessage();
    }
}
