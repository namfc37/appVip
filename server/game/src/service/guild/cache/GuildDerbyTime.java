package service.guild.cache;

import bitzero.util.common.business.Debug;
import data.MiscInfo;
import util.Time;
import util.metric.MetricLog;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

public class GuildDerbyTime
{
    public final static int DURATION = Time.SECOND_IN_7_DAY;

    public final static int BUG_200408_TIME_START = (int) LocalDateTime.of(2020, 4, 8, 10, 0).toEpochSecond(Time.zone);
    public final static int BUG_200408_TIME_END = (int) LocalDateTime.of(2020, 4, 14, 20, 0).toEpochSecond(Time.zone);
    public final static int BUG_200408_TIME_REWARD = (int) LocalDateTime.of(2020, 4, 24, 15, 0).toEpochSecond(Time.zone);

    private int startTime, endTime, rewardTime;

    public GuildDerbyTime ()
    {
        this(Time.getUnixTime());
    }

    public GuildDerbyTime (long time)
    {
        LocalDateTime curDateTime = LocalDateTime.ofEpochSecond(time, 0, Time.zone);
        DayOfWeek startDay = DayOfWeek.valueOf(MiscInfo.DERBY_WEEKLY_START_AT_DAY());
        LocalDateTime startDateTime = curDateTime.with(startDay).withHour(MiscInfo.DERBY_WEEKLY_START_AT_HOUR()).withMinute(0).withSecond(0);

        startTime = (int) startDateTime.toEpochSecond(Time.zone);
        endTime = startTime + MiscInfo.DERBY_DURATION();
        rewardTime = endTime + MiscInfo.DERBY_MEMBER_REWARD_COUNTDOWN();
        //Debug.info("init", time);
        //Debug.info("cur", startTime, endTime, rewardTime);

        //Kiểm tra xem có đang nằm trong event trước hay không
        if (time < startTime && time < rewardTime - DURATION)
        {
            startTime -= DURATION;
            endTime -= DURATION;
            rewardTime -= DURATION;
            //Debug.info("shift left", startTime, endTime, rewardTime);
        }

        if (time < BUG_200408_TIME_REWARD)
        {
            startTime = BUG_200408_TIME_START;
            endTime = BUG_200408_TIME_END;
            rewardTime = BUG_200408_TIME_REWARD;
            //Debug.info("bug", startTime, endTime, rewardTime);
        }
    }

    public int getStartTime ()
    {
        return startTime;
    }

    public int getEndTime ()
    {
        return endTime;
    }

    public int getRewardTime ()
    {
        return rewardTime;
    }

    public int delayToStart ()
    {
        return startTime - Time.getUnixTime();
    }

    public int delayToEnd ()
    {
        return endTime - Time.getUnixTime();
    }

    public int delayToReward ()
    {
        return rewardTime - Time.getUnixTime();
    }

    @Override
    public boolean equals(Object obj)
    {
        if (obj instanceof GuildDerbyTime)
        {
            GuildDerbyTime g = (GuildDerbyTime) obj;
            return g.startTime == this.startTime && g.endTime == this.endTime && g.rewardTime == this.rewardTime;
        }
        return false;
    }

    public static void test ()
    {
        long curTime = Time.getUnixTime();
        GuildDerbyTime curWeek = new GuildDerbyTime();
        GuildDerbyTime preWeek = new GuildDerbyTime(curTime - Time.SECOND_IN_7_DAY);
        GuildDerbyTime nextWeek = new GuildDerbyTime(curTime + Time.SECOND_IN_7_DAY);

        Debug.info("pre.startTime", new GuildDerbyTime(preWeek.startTime - 1).equals(preWeek));
        Debug.info("pre.rewardTime", new GuildDerbyTime(preWeek.rewardTime).equals(curWeek));

        Debug.info("cur.startTime", new GuildDerbyTime(curWeek.startTime).equals(curWeek));
        Debug.info("cur.endTime", new GuildDerbyTime(curWeek.endTime).equals(curWeek));
        Debug.info("cur.rewardTime", new GuildDerbyTime(curWeek.rewardTime - 1).equals(curWeek));

        Debug.info("next.rewardTime", new GuildDerbyTime(curWeek.rewardTime).equals(nextWeek));
        Debug.info("next.startTime", new GuildDerbyTime(nextWeek.startTime).equals(nextWeek));
    }

    public void logInfo (String tag)
    {
        MetricLog.info(tag,
                Time.toString(startTime), startTime,
                Time.toString(endTime), endTime,
                Time.toString(rewardTime), rewardTime
        );
    }
}
