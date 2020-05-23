package service.udp;

import service.newsboard.NewsBoardServer;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgPrivateShopDelete extends AbstractMessage
{
    private int userId;
    private int uid;

    public MsgPrivateShopDelete (int userId, int uid)
    {
        super(CMD_PRIVATE_SHOP_DELETE);
        this.userId = userId;
        this.uid = uid;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            userId,
                            uid
                           );
    }

    @Override
    public void handle ()
    {
        if (NewsBoardServer.privateShop == null)
            return;

        NewsBoardServer.privateShop.delete(userId, uid);
    }
}
