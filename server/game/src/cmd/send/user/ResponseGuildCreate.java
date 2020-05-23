package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildCreate extends Message
{
    public ResponseGuildCreate (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (long coin, long gold, MapItem updateItem, GuildInfo guild)
    {
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_GUILD, guild);

        return toBaseMessage();
    }
}
