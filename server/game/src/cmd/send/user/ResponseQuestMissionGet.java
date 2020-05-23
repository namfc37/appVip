package cmd.send.user;

import cmd.Message;
import model.object.QuestMission;

public class ResponseQuestMissionGet extends Message
{
    public ResponseQuestMissionGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseQuestMissionGet packData (QuestMission questMission)
    {
        put(KEY_QUEST_MISSION, questMission);
        return this;
    }
}
