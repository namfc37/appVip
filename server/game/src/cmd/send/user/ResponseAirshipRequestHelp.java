package cmd.send.user;

import cmd.Message;
import model.AirShip;

public class ResponseAirshipRequestHelp extends Message
{
    public ResponseAirshipRequestHelp (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipRequestHelp packData (int idSlot, AirShip airShip)
    {
        put(KEY_SLOT_ID, idSlot);
        put(KEY_AIRSHIP, airShip);

        return this;
    }
}
