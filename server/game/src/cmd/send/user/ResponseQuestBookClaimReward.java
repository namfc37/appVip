package cmd.send.user;

import cmd.Message;
import model.object.QuestBook;
import util.collection.MapItem;

public class ResponseQuestBookClaimReward extends Message
{
    public ResponseQuestBookClaimReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestBookClaimReward packData (QuestBook questBook, MapItem updateItem)
    {
        put(KEY_QUEST_BOOK, questBook);
        put(KEY_UPDATE_ITEMS, updateItem);

        return this;
    }
}