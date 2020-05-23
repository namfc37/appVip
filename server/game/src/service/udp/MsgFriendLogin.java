package service.udp;

import service.friend.FriendInfo;
import service.friend.FriendServer;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgFriendLogin extends AbstractMessage
{
    private int        userId;
    private String     bucket;
    private FriendInfo info;

    public MsgFriendLogin (String bucket, FriendInfo info)
    {
        super(CMD_FRIEND_LOGIN);
        this.userId = info.getId();
        this.bucket = bucket;
        this.info = info;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            userId,
                            bucket
                           );
    }

    @Override
    public void handle ()
    {
        FriendServer.userLogin(bucket, info);
    }
}
