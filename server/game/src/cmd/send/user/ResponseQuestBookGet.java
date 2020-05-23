package cmd.send.user;

import cmd.Message;
import model.object.QuestBook;

public class ResponseQuestBookGet extends Message
{
    public ResponseQuestBookGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestBookGet packData (QuestBook questBook)
    {
        put(KEY_QUEST_BOOK, questBook);
        return this;
    }
}
