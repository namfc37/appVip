package service.udp;

import service.newsboard.NewsBoardItem;
import service.newsboard.NewsBoardServer;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgPrivateShopAdd extends AbstractMessage
{
    private NewsBoardItem item;

    public MsgPrivateShopAdd (NewsBoardItem item)
    {
        super(CMD_PRIVATE_SHOP_ADD);
        this.item = item;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            item.getUserId(),
                            item.getIdSlot()
                           );
    }

    @Override
    public void handle ()
    {
        if (NewsBoardServer.privateShop == null)
            return;

        NewsBoardServer.privateShop.add(item);
    }
}
