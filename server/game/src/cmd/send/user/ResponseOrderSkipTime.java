package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestOrderSkipTime;
import model.object.Order;

public class ResponseOrderSkipTime extends Message
{
    public ResponseOrderSkipTime (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOrderSkipTime packData (RequestOrderSkipTime request, Order order, long coin)
    {
        put(KEY_SLOT_ID, request.id);
        put(KEY_SLOT_OBJECT, order);
        put(KEY_COIN, coin);

        return this;
    }
}
