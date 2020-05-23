package cmd.send.user;

import cmd.Message;
import model.AirShip;

public class ResponseAirshipSkipTimeInactive extends Message
{
    public ResponseAirshipSkipTimeInactive (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipSkipTimeInactive packData (AirShip airShip, long coin)
    {
        put(KEY_AIRSHIP, airShip);
        put(KEY_COIN, coin);

        return this;
    }
}
