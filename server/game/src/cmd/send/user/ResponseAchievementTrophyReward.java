package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseAchievementTrophyReward extends Message
{
    public ResponseAchievementTrophyReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAchievementTrophyReward packData (int id, long coin, long gold, int reputation, MapItem updateItem)
    {
        put(KEY_UID, id);

        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
