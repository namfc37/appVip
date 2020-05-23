package cmd.send.user;

import cmd.Message;
import model.AirShip;

public class ResponseAirshipFriendGet extends Message
{
    public ResponseAirshipFriendGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipFriendGet packData (int friendId, AirShip airShip)
    {
        put(KEY_FRIEND_ID, friendId);
        put(KEY_FRIEND_AIRSHIP, airShip);

        return this;
    }
}
