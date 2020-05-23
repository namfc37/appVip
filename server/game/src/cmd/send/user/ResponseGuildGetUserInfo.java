package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import model.object.UserGuild;

public class ResponseGuildGetUserInfo extends Message
{
    public ResponseGuildGetUserInfo (short cmd, byte error)
    {
        super(cmd, error);
    }
    
    public BaseMessage packData (UserGuild guild)
    {
        put(KEY_GUILD, guild);
        return toBaseMessage();
    }
}
