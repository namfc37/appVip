package service.udp;

import data.CmdDefine;
import user.UserControl;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgFriendNotifyRequest extends AbstractMessage
{
    private int userId;
    public  int friendId;

    public MsgFriendNotifyRequest (int userId, int friendId)
    {
        super(CMD_FRIEND_NOTIFY_REQUEST);
        this.userId = userId;
        this.friendId = friendId;
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
        userControl.handleSystemCommand(CmdDefine.FRIEND_NOTIFY_REQUEST, this);
    }
}
