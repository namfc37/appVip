package cmd.send.user;

import cmd.Message;

public class ResponseQuestMissionkSave extends Message
{
    public ResponseQuestMissionkSave (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestMissionkSave packData (int questId, int current)
    {
        put(KEY_SLOT_ID, questId);
        put(KEY_SLOT_OBJECT, current);

        return this;
    }
}