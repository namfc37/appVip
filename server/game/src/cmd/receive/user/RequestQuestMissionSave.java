package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestQuestMissionSave extends Command
{
    public int missionId;
    public int missionCurrent;

    public RequestQuestMissionSave (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        missionId = readInt(KEY_SLOT_ID);
        missionCurrent = readInt(KEY_SLOT_OBJECT);
    }
}
