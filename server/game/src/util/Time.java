package util;

import data.MiscInfo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.concurrent.TimeUnit;

public class Time
{
    public final static int SECOND_IN_MINUTE = 60;
    public final static int SECOND_IN_HOUR   = 60 * SECOND_IN_MINUTE;
    public final static int SECOND_IN_DAY    = 24 * SECOND_IN_HOUR;
    public final static int SECOND_IN_30_DAY = 30 * SECOND_IN_DAY;
    public final static int SECOND_IN_7_DAY  = 7 * SECOND_IN_DAY;

    public final static long MILLISECOND_IN_MINUTE = 1000 * SECOND_IN_MINUTE;
    public final static long MILLISECOND_IN_HOUR   = 1000 * SECOND_IN_HOUR;
    public final static long MILLISECOND_IN_DAY    = 1000 * SECOND_IN_DAY;
    public final static long MILLISECOND_IN_7_DAY  = 1000 * SECOND_IN_7_DAY;
    public final static long MILLISECOND_IN_30_DAY = 1000 * SECOND_IN_30_DAY;

    public final static ZoneOffset zone = OffsetDateTime.now().getOffset();

    public final static DateTimeFormatter formatterBackup = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");


    public static int getUnixTime ()
    {
        return (int) (System.currentTimeMillis() / 1000);
    }

    public static long getTimeMillis ()
    {
        return System.currentTimeMillis();
    }

    public static int curTimeResetDaily ()
    {
        LocalDateTime local = LocalDateTime.now();
        if (local.getHour() < MiscInfo.HOUR_RESET_DAILY())
            local = local.minusDays(1);

        return (int) LocalDateTime.of(local.getYear(), local.getMonth(), local.getDayOfMonth(), MiscInfo.HOUR_RESET_DAILY(), 0, 0).toEpochSecond(zone);
    }

    public static int nextTimeResetDaily ()
    {
        return curTimeResetDaily() + SECOND_IN_DAY;
    }

    public static int adjustTime (int time)
    {
        int curTime = getUnixTime();
        int minTime = curTime - 60;

        return Math.min(curTime, Math.max(minTime, time));
    }

    public static boolean isInDuration (int[][] durations)
    {
        return isInDuration(durations, Time.getUnixTime());
    }

    public static boolean isInDuration (int[][] durations, int curTime)
    {
        if (durations == null || durations.length == 0)
            return false;
        return getTimeOpenDuration(durations, curTime) > 0;
    }

    public static int getTimeOpenDuration (int[][] durations)
    {
        return getTimeOpenDuration(durations, Time.getUnixTime());
    }

    public static int getTimeOpenDuration (int[][] durations, int curTime)
    {
        for (int[] time : durations)
        {
            if (time[0] <= curTime && curTime < time[1])
                return time[0];
        }
        return 0;
    }

    public static int getTimeEndDuration (int[][] durations, int timeStart)
    {
        for (int[] time : durations)
        {
            if (time[0] == timeStart)
                return time[1];
        }
        return 0;
    }

    public static boolean checkTimeOpen (int[][] durations)
    {
        return checkTimeOpen(durations, Time.getUnixTime());
    }

    public static boolean checkTimeOpen (int[][] durations, int curTime)
    {
        for (int[] time : durations)
        {
            if (time[0] >= curTime || time[1] > curTime)
                return true;
        }
        return false;
    }

    public static boolean isFinish (int[][] durations, int timeStart)
    {
        return isFinish(durations, timeStart, Time.getUnixTime());
    }

    public static boolean isFinish (int[][] durations, int timeStart, int curTime)
    {
        for (int[] time : durations)
        {
            if (time[0] == timeStart)
                return time[1] <= curTime;
        }
        return true;
    }

    public static String timeBackup ()
    {
        return LocalDateTime.now().format(formatterBackup);
    }

    public static int curDay ()
    {
        return (int) TimeUnit.MILLISECONDS.toDays(System.currentTimeMillis());
    }

    public static int getTimebyHours (int hour)
    {
        return (int) LocalDateTime.now().withHour(hour).withMinute(0).withSecond(0).toEpochSecond(Time.zone);
    }

    public static int getHourOfDay (int unixTime, int hour)
    {
    	Date date = new Date(unixTime * 1000l);
        LocalDateTime local = LocalDateTime.ofInstant(date.toInstant(), Time.zone);
        
        return (int) local.withHour(hour).withMinute(0).withSecond(0).toEpochSecond(Time.zone);
    }

    public static int curWeek ()
    {
        return (int) ChronoUnit.WEEKS.between(LocalDate.ofEpochDay(0), LocalDate.now());
    }

    public static String toString (int unixTime)
    {
        return LocalDateTime.ofEpochSecond(unixTime, 0, zone).toString();
    }
}
