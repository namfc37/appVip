package cmd.send.user;

import cmd.Message;
import model.object.ConsumeEvent;
import model.object.PigBank;
import util.collection.MapItem;

public class ResponseConsumeEventSpin extends Message
{
    public ResponseConsumeEventSpin(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseConsumeEventSpin packData (ConsumeEvent consumeEvent)
    {
        put(KEY_CONSUME_EVENT, consumeEvent);
        //put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        return this;
    }
}
