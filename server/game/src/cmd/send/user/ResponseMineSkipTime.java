package cmd.send.user;

import cmd.Message;

public class ResponseMineSkipTime extends Message
{
    public ResponseMineSkipTime (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMineSkipTime packData (int status, int finishTime, long remainCoin)
    {
        put(KEY_STATUS, status); //trạng thái mỏ hiện tại
        put(KEY_FINISH_TIME, finishTime); //thời điểm hoàn thành mỏ
        put(KEY_COIN, remainCoin); //số coin hiện tại

        return this;
    }
}