package cmd.send.user;

import cmd.Message;
import service.newsboard.NewsBoardItem;

import java.util.Collection;

public class ResponseAirshipNewsBoard extends Message
{
    public ResponseAirshipNewsBoard (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAirshipNewsBoard packData (long coin, Collection<NewsBoardItem> nbPrivateShop)
    {
        put(KEY_COIN, coin);
        put(KEY_NEWS_BOARD, nbPrivateShop);

        return this;
    }
}
