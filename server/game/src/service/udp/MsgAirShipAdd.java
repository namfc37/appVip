package service.udp;

import service.newsboard.NewsBoardItem;
import service.newsboard.NewsBoardServer;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgAirShipAdd extends AbstractMessage
{
    private NewsBoardItem item;

    public MsgAirShipAdd (NewsBoardItem item)
    {
        super(CMD_AIRSHIP_ADD);
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
        if (NewsBoardServer.airship == null)
            return;

        NewsBoardServer.airship.add(item);
    }
}
