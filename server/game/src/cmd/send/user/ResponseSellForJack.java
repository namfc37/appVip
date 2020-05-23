package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestSellForJack;

public class ResponseSellForJack extends Message
{
    public ResponseSellForJack (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseSellForJack packData (RequestSellForJack request, long gold, int remainItem)
    {
        put(KEY_ITEM_ID, request.id);
        put(KEY_REMAIN_ITEM, remainItem);
        put(KEY_GOLD, gold);

        return this;
    }
}
