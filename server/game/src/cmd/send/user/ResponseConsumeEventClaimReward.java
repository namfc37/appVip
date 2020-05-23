package cmd.send.user;

import cmd.Message;
import model.object.ConsumeEvent;
import model.object.PigBank;
import util.collection.MapItem;

public class ResponseConsumeEventClaimReward extends Message
{
    public ResponseConsumeEventClaimReward(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseConsumeEventClaimReward packData (ConsumeEvent consumeEvent)
    {
        put(KEY_CONSUME_EVENT, consumeEvent);
        //put(KEY_REWARD_ITEMS, rewards); //update số lượng các item thay đổi
        return this;
    }
}
