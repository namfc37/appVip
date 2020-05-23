package cmd.send.user;

import cmd.Message;
import model.object.DailyGift;
import util.collection.MapItem;

public class ResponseDailyGiftGetReward extends Message
{
    public ResponseDailyGiftGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseDailyGiftGetReward packData (DailyGift dailyGift, short level, long exp, long gold, int reputation, MapItem updateItem, int mailId)
    {
        put(KEY_DAILY_GIFT, dailyGift);

        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        put(MAIL_UID, mailId);
        return this;
    }
}
