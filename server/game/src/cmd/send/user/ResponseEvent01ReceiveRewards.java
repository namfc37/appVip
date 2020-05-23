package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseEvent01ReceiveRewards extends Message
{
    public ResponseEvent01ReceiveRewards (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseEvent01ReceiveRewards packData (int mailId, MapItem reward)
    {
        put(MAIL_UID, mailId); //id mail chứa quà
        put(KEY_REWARD_ITEMS, reward); //danh sách quà
        return this;
    }
}
