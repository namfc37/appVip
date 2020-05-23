package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestQuestBookSkip extends Command
{
    public int    questId;
    public int    clientCoin;
    public String priceType;
    public int    priceNum;

    public RequestQuestBookSkip (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        questId = readInt(KEY_SLOT_ID);
        priceType = readString(KEY_TYPE);
        priceNum = readInt(KEY_NUM);

        clientCoin = readInt(KEY_CLIENT_COIN);
    }
}
