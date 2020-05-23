package cmd.send.user;

import cmd.Message;
import service.guild.GuildDonate;

public class ResponseGuildMemberDonateGet extends Message
{
    public ResponseGuildMemberDonateGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseGuildMemberDonateGet packData (GuildDonate donate)
    {
		put(KEY_DATA, donate);
        return this;
    }
}
