package service.udp;

import cmd.ErrorConst;
import user.UserControl;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgNotifyLocalPayment extends AbstractMessage
{
    private int     userId;
    private boolean enable;

    public MsgNotifyLocalPayment (int userId, boolean enable)
    {
        super(CMD_NOTIFY_LOCAL_PAYMENT);
        this.userId = userId;
        this.enable = enable;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            userId,
                            enable
                           );
    }

    @Override
    public void handle ()
    {
        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
            return;
        userControl.notifyLocalPayment(userId, ErrorConst.SUCCESS, enable);
    }
}
