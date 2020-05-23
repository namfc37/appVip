package cmd.send.user;

import cmd.Message;
import model.object.QuestMission;
import util.collection.MapItem;

public class ResponseQuestMissionClaimReward extends Message
{
    public ResponseQuestMissionClaimReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestMissionClaimReward packData (QuestMission questMission, long coin, long gold, int reputation, MapItem updateItem)
    {
        put(KEY_QUEST_MISSION, questMission);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);

        return this;
    }
}