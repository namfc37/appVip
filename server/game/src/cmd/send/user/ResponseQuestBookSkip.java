package cmd.send.user;

import cmd.Message;

public class ResponseQuestBookSkip extends Message
{
    public ResponseQuestBookSkip (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestBookSkip packData (int questId, int current, long coin, long gold, long repu)
    {
        put(KEY_SLOT_ID, questId);
        put(KEY_SLOT_OBJECT, current);
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, repu);

        return this;
    }
}