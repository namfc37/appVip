package cmd.send.user;

import cmd.Message;
import model.mail.MailBox;
import util.collection.MapItem;

public class ResponseMailGetReward extends Message
{
    public ResponseMailGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMailGetReward packData (MailBox mailBox, long coin, long gold, int reputation, MapItem updateItems)
    {
        put(KEY_MAIL_BOX, mailBox);
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
