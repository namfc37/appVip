package cmd.send.user;

import cmd.Message;
import model.object.CloudSkin;
import util.collection.MapItem;

public class ResponseCloudSkinApply extends Message
{
    public ResponseCloudSkinApply (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseCloudSkinApply packData (int floorId, CloudSkin skin, MapItem remainItems)
    {
        put(KEY_FLOOR, floorId);
        put(KEY_FLOOR_SKIN, skin);
        put(KEY_UPDATE_ITEMS, remainItems); //cập nhật lại kho
        return this;
    }
}
