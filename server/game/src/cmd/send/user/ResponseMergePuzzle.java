package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseMergePuzzle extends Message
{
    public ResponseMergePuzzle (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMergePuzzle packData (int mailId, MapItem receiveItem, MapItem updateItems)
    {
        put(KEY_MAIL_BOX, mailId); //mail id chứa quà
        put(KEY_REWARD_ITEMS, receiveItem); //quà sẽ nhận
        put(KEY_UPDATE_ITEMS, updateItems); //cập nhật lại kho
        return this;
    }
}
