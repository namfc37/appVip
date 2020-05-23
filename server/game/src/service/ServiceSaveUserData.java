package service;

import bitzero.server.entities.User;
import bitzero.util.ExtensionUtility;
import extension.EnvConfig;
import user.UserControl;
import util.Constant;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class ServiceSaveUserData implements Runnable
{
    private static boolean isRunning;

    private static int timeNextSave;

    public static synchronized void start ()
    {
        if (isRunning)
            return;

        setTimeNextSave();
        ShareLoopGroup.scheduleWithFixedDelay(new ServiceSaveUserData(),
                                              EnvConfig.getUser().getPeriodSave(),
                                              EnvConfig.getUser().getPeriodSave(),
                                              TimeUnit.SECONDS,
                                              true);
        isRunning = true;
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        isRunning = false;

    }

    @Override
    public void run ()
    {
        try
        {
            setTimeNextSave();

            List<User> allUser = ExtensionUtility.globalUserManager.getAllUsers();
            if (allUser.isEmpty())
                return;

            for (User user : allUser)
            {
                if (!isRunning)
                    break;

                if (!user.isConnected())
                    continue;

                UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);
                if (userControl == null)
                    continue;

                userControl.saveData();
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static int getTimeNextSave ()
    {
        return timeNextSave;
    }

    public static void setTimeNextSave ()
    {
        timeNextSave = Time.getUnixTime() + EnvConfig.getUser().getPeriodSave();
    }
}
