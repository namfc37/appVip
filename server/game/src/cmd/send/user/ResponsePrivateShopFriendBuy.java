package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopFriendBuy;
import model.PrivateShop;
import util.collection.MapItem;

public class ResponsePrivateShopFriendBuy extends Message
{
    public ResponsePrivateShopFriendBuy (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopFriendBuy packData (RequestPrivateShopFriendBuy request, PrivateShop friendShop, long gold, MapItem updateItems)
    {
        put(KEY_FRIEND_ID, request.friendId);
        put(KEY_FRIEND_SHOP, friendShop);
        put(KEY_GOLD, gold);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
