package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopFriendGet;
import model.PrivateShop;

public class ResponsePrivateShopFriendGet extends Message
{
    public ResponsePrivateShopFriendGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopFriendGet packData (RequestPrivateShopFriendGet request, PrivateShop friendShop)
    {
        put(KEY_FRIEND_ID, request.friendId);
        put(KEY_FRIEND_SHOP, friendShop);

        return this;
    }
}
