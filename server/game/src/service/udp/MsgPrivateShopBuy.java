package service.udp;

import data.CmdDefine;
import user.UserControl;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgPrivateShopBuy extends AbstractMessage
{
    private int userId;

    public MsgPrivateShopBuy (int userId)
    {
        super(CMD_PRIVATE_SHOP_BUY);
        this.userId = userId;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            userId
                           );
    }

    @Override
    public void handle ()
    {
        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
            return;
        userControl.handleSystemCommand(CmdDefine.PRIVATE_SHOP_GET);
    }
}
