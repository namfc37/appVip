package cmd.send.user;

import cmd.Message;
import service.newsboard.NewsBoardItem;

import java.util.Collection;

public class ResponsePrivateShopNewsBoard extends Message
{
    public ResponsePrivateShopNewsBoard (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopNewsBoard packData (long coin, Collection<NewsBoardItem> nbPrivateShop)
    {
        put(KEY_COIN, coin);
        put(KEY_NEWS_BOARD, nbPrivateShop);

        return this;
    }
}
