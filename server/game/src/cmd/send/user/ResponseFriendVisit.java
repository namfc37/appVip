package cmd.send.user;

import cmd.Message;
import model.AirShip;
import model.PrivateShop;
import model.UserGame;
import util.collection.MapItem;

public class ResponseFriendVisit extends Message
{
    public ResponseFriendVisit (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendVisit packData (UserGame game, PrivateShop privateShop, AirShip airShip, MapItem bugs, int guildId)
    {
        put(KEY_FRIEND_GAME, game);
        put(KEY_FRIEND_SHOP, privateShop);
        put(KEY_FRIEND_AIRSHIP, airShip);
        put(KEY_FRIEND_BUG, bugs);

        put(KEY_VIP, game.getVIP());
        put(KEY_GUILD, guildId);

        return this;
    }
}
