package cmd.send.user;

import cmd.Message;
import model.AirShip;
import util.collection.MapItem;

public class ResponseAirshipUnlock extends Message
{
    public ResponseAirshipUnlock (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipUnlock packData (AirShip airShip, MapItem updateItems)
    {
        put(KEY_AIRSHIP, airShip);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
