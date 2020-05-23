package cmd.send.user;

import cmd.Message;
import model.AirShip;
import util.collection.MapItem;

public class ResponseAirshipPack extends Message
{
    public ResponseAirshipPack (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipPack packData (int idSlot, AirShip airShip, short level, long exp, long gold, int reputation, MapItem updateItems)
    {
        put(KEY_SLOT_ID, idSlot);
        put(KEY_AIRSHIP, airShip);

        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
