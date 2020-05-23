package cmd.send.user;

import cmd.Message;
import model.AirShip;

public class ResponseAirshipCancel extends Message
{
    public ResponseAirshipCancel (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipCancel packData (AirShip airShip)
    {
        put(KEY_AIRSHIP, airShip);

        return this;
    }
}
