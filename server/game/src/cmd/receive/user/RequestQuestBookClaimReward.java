package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestQuestBookClaimReward extends Command
{
    public int questId;

    public RequestQuestBookClaimReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        questId = readInt(KEY_SLOT_ID);
    }
}
