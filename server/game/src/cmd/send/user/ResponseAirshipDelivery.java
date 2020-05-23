package cmd.send.user;

import cmd.Message;
import model.AirShip;
import util.collection.MapItem;

public class ResponseAirshipDelivery extends Message
{
    public ResponseAirshipDelivery (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipDelivery packData (AirShip airShip, short level, long exp, long gold, int reputation, MapItem updateItems)
    {
        put(KEY_AIRSHIP, airShip);

        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
