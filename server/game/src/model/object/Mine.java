package model.object;

import cmd.ErrorConst;
import data.*;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

public class Mine extends Encoder.IObject implements KeyDefine
{
    private int     status;
    private int     lastUpdate;
    private int     finishTime;
    private MapItem requireItems;
    private MapItem receiveItems;

    private Mine ()
    {
    }

    public static Mine create ()
    {
        Mine mine = new Mine();
        mine.status = MiscDefine.MINE_STATUS_REST;
        mine.lastUpdate = -1;
        mine.finishTime = -1;
        mine.requireItems = null;
        mine.receiveItems = null;
        return mine;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(MINE_STATUS, status); //trạng thái mỏ hiện tại
        if (status != MiscDefine.MINE_STATUS_REST)
        {
            msg.put(MINE_FINISH, finishTime); //thời điểm hoàn thành mỏ
            msg.put(MINE_REQUIRE_ITEMS, requireItems);//danh sách items cần để bắt đầu đào
            msg.put(MINE_REWARD_ITEMS, receiveItems); //danh sách reward sẽ nhận
        }
    }

    public int getStatus ()
    {
        return this.status;
    }

    public int getFinishTime ()
    {
        return this.finishTime;
    }

    public int getRemainTime ()
    {
        if (status == MiscDefine.MINE_STATUS_WORKING)
        {
            int remain = finishTime - Time.getUnixTime();
            if (remain < 0)
                remain = 0;
            return remain;
        }

        return -1;
    }

    public MapItem getRequireItems ()
    {
        return this.requireItems;
    }

    public MapItem getReceiveItems ()
    {
        return this.receiveItems;
    }

    public boolean isFinish ()
    {
        if (status == MiscDefine.MINE_STATUS_WORKING)
            return finishTime > Time.getUnixTime();

        if (status == MiscDefine.MINE_STATUS_FINISH)
            return true;

        return false;
    }

    public boolean isWorking ()
    {
        return status == MiscDefine.MINE_STATUS_WORKING && finishTime > Time.getUnixTime();
    }

    public boolean canStart ()
    {
        if (status != MiscDefine.MINE_STATUS_REST)
            return false;

        if (requireItems == null || receiveItems == null)
            return false;

        return true;
    }

    public byte refresh (int userLevel)
    {
        if (status != MiscDefine.MINE_STATUS_REST)
            return ErrorConst.INVALID_STATUS;

        int currentTime = Time.getUnixTime();
        if (lastUpdate + MiscInfo.MINE_REFRESH_SECONDS() > currentTime)
            return ErrorConst.TIME_WAIT;

        MineInfo.MineHelper helper = ConstInfo.getMineInfo().generateMine(userLevel);
        if (helper == null)
            return ErrorConst.LIMIT_LEVEL;

        this.lastUpdate = currentTime;
        this.requireItems = helper.requireItems;
        this.receiveItems = new MapItem();
        this.receiveItems.increase(helper.receiveItems);

        //Gachapon
        int quantity = MiscInfo.GACHAPON_MINE_FINISH_TICKET();
        if (quantity > 0) this.receiveItems.increase(ItemId.VE_GACHA, quantity);

        return ErrorConst.SUCCESS;
    }

    public byte startWorking ()
    {
        if (!canStart())
            return ErrorConst.MINE_ERROR_CANNOT_START;

        status = MiscDefine.MINE_STATUS_WORKING;
        finishTime = Time.getUnixTime() + MiscInfo.MINE_DURATION_SECONDS();

        return ErrorConst.SUCCESS;
    }

    public byte cutoffTime ()
    {
        if (!isWorking())
            return -1;

        status = MiscDefine.MINE_STATUS_FINISH;
        finishTime = Time.getUnixTime() - 1;

        return ErrorConst.SUCCESS;
    }

    public boolean receiveRewards ()
    {
        if (status != MiscDefine.MINE_STATUS_FINISH)
            return false;

        status = MiscDefine.MINE_STATUS_REST;
        this.lastUpdate = -1;
        this.finishTime = -1;
        this.requireItems = null;
        this.receiveItems = null;

        return true;
    }


    public void checkFinish ()
    {
        if (status == MiscDefine.MINE_STATUS_WORKING && finishTime < Time.getUnixTime())
            status = MiscDefine.MINE_STATUS_FINISH;
    }

    public void addEventReward (MapItem reward)
    {
        this.receiveItems.increase(reward);
    }
}