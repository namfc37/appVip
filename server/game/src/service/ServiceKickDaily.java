package service;

import bitzero.server.entities.User;
import bitzero.util.ExtensionUtility;
import cmd.ErrorConst;
import model.UserBrief;
import model.UserGame;
import user.UserControl;
import util.Constant;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class ServiceKickDaily implements Runnable
{
    private static final int LIMIT_NUM_KICK = 30;   //giới hạn số user mỗi lần kick để tránh overhead database
    private static final int TIME_DELAY     = 60;   //thời gian giữa hai lần kick
    private static final int MIN_ONLINE     = 1200;  //thời gian online tối thiểu

    private static boolean isRunning;

    @Override
    public void run ()
    {
        int numKick = 0;
        try
        {
            List<User> allUser = ExtensionUtility.globalUserManager.getAllUsers();
            for (User user : allUser)
            {
                if (!isRunning)
                    break;
                if (numKick >= LIMIT_NUM_KICK)
                    break;

                UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);
                if (userControl == null)
                    continue;
                UserGame game = userControl.game;
                UserBrief brief = userControl.brief;
                if (game == null || brief == null)
                    continue;

                int curTime = Time.getUnixTime();
                int onlineSecond = Time.getUnixTime() - brief.timeLogin;
                if (onlineSecond < MIN_ONLINE || game.getTimeResetDaily() >= curTime)
                    continue;
                numKick++;
                user.disconnect(DisconnectionReason.KICK);
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        if (numKick > 0)
            MetricLog.actionSystem("KICK_DAILY",
                                   "",
                                   ErrorConst.SUCCESS,
                                   numKick);
    }

    public static synchronized void start ()
    {
        if (isRunning)
            return;

        ShareLoopGroup.scheduleWithFixedDelay(new ServiceKickDaily(), TIME_DELAY, TIME_DELAY, TimeUnit.SECONDS, true);
        isRunning = true;
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        isRunning = false;
    }
}
