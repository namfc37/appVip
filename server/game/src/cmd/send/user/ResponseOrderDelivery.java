package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestOrderDelivery;
import model.object.Order;
import model.object.OrderManager;

public class ResponseOrderDelivery extends Message
{
    public ResponseOrderDelivery (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOrderDelivery packData (RequestOrderDelivery request, Order oldOrder, Order newOrder, OrderManager orderManager)
    {
        put(KEY_SLOT_ID, request.id);
        put(KEY_SLOT_OBJECT, newOrder);
        put(KEY_OLD_ORDER, oldOrder);
        put(KEY_ORDER, orderManager);
        return this;
    }
}
