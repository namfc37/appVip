package cmd.send.user;

import cmd.Message;

public class ResponseQuestBookSave extends Message
{
    public ResponseQuestBookSave (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestBookSave packData (int questId, int current)
    {
        put(KEY_SLOT_ID, questId);
        put(KEY_SLOT_OBJECT, current);

        return this;
    }
}