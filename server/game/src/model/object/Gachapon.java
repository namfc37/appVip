package model.object;

import data.*;
import org.apache.kafka.common.utils.CollectionUtils;
import user.UserControl;
import util.collection.MapItem;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.concurrent.ThreadLocalRandom;

public class Gachapon extends Encoder.IObject implements KeyDefine
{
    private int     status;
    private int     turn;
    private MapItem rewards;


    public static Gachapon create ()
    {
        Gachapon o = new Gachapon();
        o.turn = 0;
        o.rewards = new MapItem();
        o.status = MiscDefine.GACHAPON_STATUS_CLOSE;
        return o;
    }

    @Override
    public void putData (Encoder msg)
    {

        msg.put(GACHAPON_TURN, turn);
        msg.put(GACHAPON_STATUS, status);
        msg.put(GACHAPON_REWARDS, rewards);
        // msg.put(VIP_CURRENT_ACTIVE_TIME_ACTIVE, timeActive);

    }

    public boolean canSpin ()
    {
        return this.status == MiscDefine.GACHAPON_STATUS_CLOSE;
    }

    public boolean canGetReward ()
    {
        return this.status == MiscDefine.GACHAPON_STATUS_OPEN;
    }

    public void setStatus (int status)
    {
        this.status = status;
    }

    public void addRewards (MapItem rewards)
    {
        this.rewards.increase(rewards);
    }

    public void clearRewards ()
    {
        this.rewards.clear();
    }

    public boolean receiveReward ()
    {
        if (status == MiscDefine.GACHAPON_STATUS_CLOSE)
            return false;
        status = MiscDefine.GACHAPON_STATUS_CLOSE;
        rewards.clear();
        return true;
    }

    public static GachaponInfo.RewardInfo generateRewards (ArrayList<GachaponInfo.RewardInfo> listRewards, int turn)
    {
        GachaponInfo.RewardInfo reward = null;
        ArrayList<GachaponInfo.RewardInfo> listFilteredRewards = new ArrayList<>();
        int totalRate = 0;
        for (GachaponInfo.RewardInfo rewardInfo : listRewards)
        {
            if (rewardInfo.TURN_NUMBER() <= turn && rewardInfo.RATE() > 0)
            {
                listFilteredRewards.add(rewardInfo);
                totalRate += rewardInfo.RATE();
            }
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        int rate = random.nextInt(totalRate);

        for (int i = 0, size = listFilteredRewards.size(); i < size; i++)
        {
            GachaponInfo.RewardInfo rewardInfo = listFilteredRewards.get(i);
            if (rewardInfo.RATE() <= 0)
                continue;
            rate -= rewardInfo.RATE();
            if (rate <= 0)
            {
                reward = rewardInfo;
                break;
            }
        }

        return reward;
    }


    public void resetDaily ()
    {
        this.turn = 0;
    }

    public MapItem getRewards ()
    {
        return rewards;
    }

    public int getTurn ()
    {
        return turn;
    }

    public void increaseTurn ()
    {
        turn += 1;
    }
}
