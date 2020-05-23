package service.udp;

import service.friend.FriendInfo;
import service.friend.FriendServer;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgFriendUpdateInfo extends AbstractMessage
{
    private int        userId;
    private FriendInfo info;

    public MsgFriendUpdateInfo (FriendInfo info)
    {
        super(CMD_FRIEND_UPDATE_INFO);
        this.userId = info.getId();
        this.info = info;
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
        FriendServer.userUpdate(info);
    }
}
