package cmd.send.user;

import cmd.Message;
import model.object.CloudSkin;

public class ResponseCloudSkinClear extends Message
{
    public ResponseCloudSkinClear (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseCloudSkinClear packData (int floorId, CloudSkin skin)
    {
        put(KEY_FLOOR, floorId);
        put(KEY_FLOOR_SKIN, skin);
        return this;
    }
}
