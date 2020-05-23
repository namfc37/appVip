package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseMineInfo extends Message
{
    public ResponseMineInfo (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMineInfo packData (int status, MapItem requireItems, MapItem rewardItems, int finishTime)
    {
        put(KEY_STATUS, status); //trạng thái mỏ hiện tại
        put(KEY_FINISH_TIME, finishTime); //thời điểm hoàn thành mỏ
        put(KEY_REQUIRE_ITEMS, requireItems);//danh sách items cần để bắt đầu đào
        put(KEY_REWARD_ITEMS, rewardItems); //danh sách reward sẽ nhận

        return this;
    }
}