package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.cache.CacheGuildInfo;

import java.util.Collection;

public class ResponseGuildSuggest extends Message
{
    public ResponseGuildSuggest (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (Collection<CacheGuildInfo> guilds)
    {
        put(KEY_DATA, guilds);
        return toBaseMessage();
    }
}
