package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestAirshipFriendPack;
import model.AirShip;
import util.collection.MapItem;

public class ResponseAirshipFriendPack extends Message
{
    public ResponseAirshipFriendPack (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipFriendPack packData (RequestAirshipFriendPack request, AirShip airShip, short level, long exp, long gold, int reputation, MapItem updateItems)
    {
        put(KEY_FRIEND_ID, request.friendId);
        put(KEY_FRIEND_AIRSHIP, airShip);
        put(KEY_SLOT_ID, request.idSlot);

        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
