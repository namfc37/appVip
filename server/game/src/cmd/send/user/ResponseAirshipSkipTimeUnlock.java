package cmd.send.user;

import cmd.Message;
import model.AirShip;

public class ResponseAirshipSkipTimeUnlock extends Message
{
    public ResponseAirshipSkipTimeUnlock (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipSkipTimeUnlock packData (AirShip airShip, long coin)
    {
        put(KEY_AIRSHIP, airShip);
        put(KEY_COIN, coin);

        return this;
    }
}
