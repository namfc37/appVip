package model.object;

import data.ConstInfo;
import data.KeyDefine;
import data.MiscInfo;
import util.Time;
import util.collection.MapItem;
import util.collection.UnmodifiableMapItem;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class DailyGift extends Encoder.IObject implements KeyDefine
{

    private boolean       isNewUser;
    private int           timeStart;
    private int           max;
    private int           cur;
    private List<MapItem> rewards;
    private MapItem       circleRewards;
    private int           lastTimeResetDaily;

    private DailyGift ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static DailyGift create (int level)
    {
        DailyGift o = new DailyGift();
        o.initNewUserReward(level);
        return o;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(DAILY_GIFT_IS_NEW_USER, isNewUser);
        msg.put(DAILY_GIFT_TIME_START, timeStart);
        msg.put(DAILY_GIFT_TIME_END, MiscInfo.getTimeEndDailyGiftEventDuration(timeStart));
        msg.put(DAILY_GIFT_MAX, max);
        msg.put(DAILY_GIFT_CUR, cur);
        msg.putMapItem(DAILY_GIFT_REWARDS, rewards);
        msg.put(DAILY_GIFT_CIRCLE_REWARDS, circleRewards);
    }

    private void initNewUserReward (int level)
    {
        isNewUser = true;
        timeStart = Time.curTimeResetDaily();
        lastTimeResetDaily = Time.curTimeResetDaily();
        circleRewards = new MapItem();
        max = 1;
        cur = 0;
        initReward(level);
    }

    private void initEventReward (int level)
    {
        isNewUser = false;
        timeStart = Time.curTimeResetDaily();
        lastTimeResetDaily = Time.curTimeResetDaily();
        max = 1;
        cur = 0;
        if (circleRewards == null) circleRewards = new MapItem();
        initCircleReward(level);
        circleRewards.increase(rewards.get(max-1));
    }

    private void initCircleReward (int level)
    {
        UnmodifiableMapItem[] info = ConstInfo.getDailyGiftInfo().rewards(isNewUser, level);
        if (circleRewards == null) circleRewards = new MapItem();
        if (rewards == null)
        {
            rewards = Arrays.asList(info);
            rewards = new ArrayList<>();
            for (int i = 0, size = info.length; i < size; i++)
            {
                rewards.add(randomReward(info[i]));
            }
        }
        else
        {
            for (int i = cur; i < rewards.size(); i++)
                rewards.set(i, randomReward(info[i]));
            for (int i = rewards.size(); i < info.length; i++)
                rewards.add(randomReward(info[i]));
        }
    }

    private MapItem randomReward (MapItem mapItemSource)
    {
        MapItem mapItem = new MapItem();
        int random = ThreadLocalRandom.current().nextInt(0, mapItemSource.size());
        int index = 0;
        for (MapItem.Entry items : mapItemSource)
        {
            if (index == random)
            {
                mapItem.increase(items.key(), items.value());
                return mapItem;
            }
            index++;
        }
        return mapItem;
    }

    private void initReward (int level)
    {
        UnmodifiableMapItem[] info = ConstInfo.getDailyGiftInfo().rewards(isNewUser, level);
        if (circleRewards == null) circleRewards = new MapItem();
        if (rewards == null)
        {
            rewards = Arrays.asList(info);
        }
        else
        {
            for (int i = cur; i < rewards.size(); i++)
                rewards.set(i, info[i]);
            for (int i = rewards.size(); i < info.length; i++)
                rewards.add(info[i]);
        }
    }

    public void resetDaily (int level)
    {
        int curTimeResetDaily = Time.curTimeResetDaily();
        if (lastTimeResetDaily >= curTimeResetDaily)
            return;

        //lastDayResetDaily = Time.curDay();
        if (level < MiscInfo.DAILY_GIFT_USER_LEVEL())
        {
            timeStart = Time.curTimeResetDaily();
            return;
        }
        if (timeStart > 0)
        {
            if (isNewUser)
                max = Math.min(max + 1, rewards.size());
            else
            {
                if ((curTimeResetDaily != lastTimeResetDaily + Time.SECOND_IN_DAY) && max < rewards.size()) //nhận đủ 7 ngày, off 1 ngày -> gen vòng mới
                {
                    max = 1;
                    cur = 0;
                }
                else
                {
                    max = max + 1;
                }
                //cur+=1;
                if (max <= rewards.size())         // tránh cộng quà ngày 7 sau khi reset vòng mới
                circleRewards.increase(rewards.get(max-1));
                else
                {
                    cur = max;
                }
            }

            if (isFinish())
            {
                timeStart = 0;
                max = 0;
                cur = 0;
                rewards = null;
            }
            else if (isNewUser)
                initReward(level);
        }

        lastTimeResetDaily = curTimeResetDaily;

        if (timeStart == 0 && MiscInfo.DAILY_GIFT_CIRCLE_ACTIVE())
            initEventReward(level);
    }

    private boolean isFinish ()
    {
        if (rewards != null && cur >= rewards.size())
            return true;

        int curTime = Time.getUnixTime();
        if (isNewUser)
            return timeStart + MiscInfo.DAILY_GIFT_NEW_USER_DURATION() * Time.SECOND_IN_DAY <= curTime;

        //return MiscInfo.isFinishDailyGiftEventDuration(timeStart);
        return false;
    }

    public boolean hasReward ()
    {
        return timeStart > 0 && cur < max;
    }

    public MapItem getReward ()
    {
        if (isNewUser)
        return rewards.get(cur);
        else
        {
            MapItem reward = new MapItem();
            if (circleRewards != null) reward.increase(circleRewards);
            return reward;
        }
    }

    public void nextReward ()
    {
        if (isNewUser)
            cur++;
        else
            cur = max;
    }

    public int getCur ()
    {
        return cur;
    }

    public boolean isNewUser ()
    {
        return isNewUser;
    }

    public void clearCircleRewards()
    {
        if (circleRewards != null) circleRewards.clear();
    }
}
