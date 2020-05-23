package service.udp;

import user.UserControl;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgKickUser extends AbstractMessage
{
    private int  userId;
    private byte code;

    public MsgKickUser (int userId, byte code)
    {
        super(CMD_KICK_USER);
        this.userId = userId;
        this.code = code;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            userId,
                            code
                           );
    }

    @Override
    public void handle ()
    {
        UserControl.kick(userId, code);
    }
}
