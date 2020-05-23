package service.udp;

import service.newsboard.NewsBoardServer;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgAirShipDelete extends AbstractMessage
{
    private int userId;
    private int uid;

    public MsgAirShipDelete (int userId, int uid)
    {
        super(CMD_AIRSHIP_DELETE);
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
        if (NewsBoardServer.airship == null)
            return;

        NewsBoardServer.airship.delete(userId, uid);
    }
}
