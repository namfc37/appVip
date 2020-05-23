package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestOrderCancel;
import model.object.Order;

public class ResponseOrderCancel extends Message
{
    public ResponseOrderCancel (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOrderCancel packData (RequestOrderCancel request, Order order)
    {
        put(KEY_SLOT_ID, request.id);
        put(KEY_SLOT_OBJECT, order);

        return this;
    }
}
