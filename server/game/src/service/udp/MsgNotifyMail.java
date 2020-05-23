package service.udp;

import user.UserControl;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgNotifyMail extends AbstractMessage
{
    private int userId;

    public MsgNotifyMail (int userId)
    {
        super(CMD_NOTIFY_MAIL);
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

        userControl.notifyMail(true);
    }
}
