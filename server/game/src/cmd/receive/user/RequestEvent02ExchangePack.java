package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestEvent02ExchangePack extends Command
{
    public String eventId;
    public int    group;
    public int    rewardId;

    public RequestEvent02ExchangePack (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        eventId = readString(KEY_EVENT_ID);
        rewardId = readInt(KEY_EVENT_REWARD_ID);
        group = readInt(KEY_EVENT_GROUP);
    }
}
