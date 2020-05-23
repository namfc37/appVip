package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import model.object.UserGuild;
import service.guild.GuildMemberInfo;
import util.Time;

public class ResponseGuildMemberJoin extends Message
{
    public ResponseGuildMemberJoin (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int role, UserGuild guild)
    {
    	put (KEY_STATUS, role);
    	put (KEY_GUILD, guild);
        return toBaseMessage();
    }

    public BaseMessage packData (int userId, int role, GuildMemberInfo info)
    {
    	put (KEY_USER_ID, userId);
    	put (KEY_STATUS, role);
    	put (KEY_DATA, info);
        return toBaseMessage();
    }
}
