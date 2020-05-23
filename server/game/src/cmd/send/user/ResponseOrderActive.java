package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestOrderActive;
import model.object.Order;

public class ResponseOrderActive extends Message
{
    public ResponseOrderActive (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOrderActive packData (RequestOrderActive request, Order order, long coin)
    {
        put(KEY_SLOT_ID, request.id);
        put(KEY_SLOT_OBJECT, order);
        put(KEY_COIN, coin);

        return this;
    }
}
