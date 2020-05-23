package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseMineStart extends Message
{
    public ResponseMineStart (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMineStart packData (int status, int finishTime, MapItem remainItems)
    {
        put(KEY_STATUS, status); //trạng thái mỏ hiện tại
        put(KEY_FINISH_TIME, finishTime); //thời điểm hoàn thành mỏ
        put(KEY_UPDATE_ITEMS, remainItems); //cập nhật lại kho

        return this;
    }
}
