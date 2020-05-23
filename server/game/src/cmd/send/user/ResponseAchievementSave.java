package cmd.send.user;

import cmd.Message;

public class ResponseAchievementSave extends Message
{
    public ResponseAchievementSave (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseAchievementSave packData (int[] ids, int[] points)
    {
        put(KEY_UID, ids);
        put(KEY_NUM, points);

        return this;
    }
}
