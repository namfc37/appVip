package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDonate;
import util.collection.MapItem;

public class ResponseGuildMemberDonate extends Message
{
    public ResponseGuildMemberDonate (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int donateItemRemain, GuildDonate donate, MapItem updateItems)
    {
        put(KEY_DATA, donate);
        put(KEY_REMAIN_ITEM, donateItemRemain);
        put(KEY_UPDATE_ITEMS, updateItems);

        return toBaseMessage();
    }

    public BaseMessage packData (int donator, GuildDonate donate)
    {
        put(KEY_USER_ID, donator);
        put(KEY_DATA, donate);

        return toBaseMessage();
    }
}
