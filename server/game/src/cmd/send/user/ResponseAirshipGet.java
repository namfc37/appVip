package cmd.send.user;

import cmd.Message;
import model.AirShip;

public class ResponseAirshipGet extends Message
{
    public ResponseAirshipGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipGet packData (AirShip airShip)
    {
        put(KEY_AIRSHIP, airShip);

        return this;
    }
}
