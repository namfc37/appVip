package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseEvent02ReceiveRewards extends Message
{
    public ResponseEvent02ReceiveRewards (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseEvent02ReceiveRewards packData (int mailId, MapItem reward)
    {
        put(MAIL_UID, mailId); //id mail chứa quà
        put(KEY_REWARD_ITEMS, reward); //danh sách quà
        return this;
    }
}
