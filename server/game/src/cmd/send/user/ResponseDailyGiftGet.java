package cmd.send.user;

import cmd.Message;
import model.AirShip;
import model.object.DailyGift;

public class ResponseDailyGiftGet extends Message
{
    public ResponseDailyGiftGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseDailyGiftGet packData (DailyGift dailyGift)
    {
        put(KEY_DAILY_GIFT, dailyGift);

        return this;
    }
}
