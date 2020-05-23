package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestQuestBookSave extends Command
{
    public int questId;
    public int questCurrent;

    public RequestQuestBookSave (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        questId = readInt(KEY_SLOT_ID);
        questCurrent = readInt(KEY_SLOT_OBJECT);
    }
}
