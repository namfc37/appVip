package payment.local;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import com.google.gson.JsonObject;
import com.gsn.broker.Broker;
import extension.EnvConfig;
import model.UserOnline;
import service.UdpHandler;
import user.UserControl;
import util.Address;
import util.Json;
import util.Time;
import util.metric.MetricLog;
import util.pool.PoolStringBuilder;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CheckLocalPayment
{
    private final static CheckLocalPayment instance = new CheckLocalPayment();
    private static       ExecutorService   executor;

    private static final PoolStringBuilder pool      = new PoolStringBuilder(1024);
    public final static  char              SEPARATOR = '|';

    public static void start ()
    {
        try
        {
            MetricLog.info("CheckLocalPayment.start");
            executor = Executors.newSingleThreadExecutor();
            Broker.getInstance().setProcess(CheckLocalPayment.class, "processMethod");

            JsonObject config = Json.parseFromFile("./conf/configBroker.json").getAsJsonObject();
            final String KEY_MAP_INDEX = "mapIndex";
            if (config.has(KEY_MAP_INDEX))
            {
                JsonObject mapIp = config.get(KEY_MAP_INDEX).getAsJsonObject();
                if (mapIp.has(Address.PRIVATE_HOST))
                {
                    JsonObject mapGroup = mapIp.get(Address.PRIVATE_HOST).getAsJsonObject();
                    String group = Integer.toString(EnvConfig.group());
                    if (mapGroup.has(group))
                    {
                        int index = mapGroup.get(group).getAsInt();
                        MetricLog.info("CheckLocalPayment.setIndex", Address.PRIVATE_HOST, group, index);
                        Broker.getInstance().setIndex(index);
                    }
                }
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static void stop ()
    {
        if (executor != null)
        {
            MetricLog.info("CheckLocalPayment.stop");
            executor.shutdownNow();
            executor = null;
        }
    }

    public static CheckLocalPayment getInstance ()
    {
        return instance;
    }

    public void processMethod (String message)
    {
        Debug.info("CheckLocalPayment.processMethod", message);

        String[] contents = message.split("\\|");
        int userId = Integer.parseInt(contents[0]);
        boolean enable = Boolean.parseBoolean(contents[1]);

        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
        {
            if (enable)
            {
                UserOnline online = UserOnline.get(userId);
                if (online != null)
                {
                    UdpHandler.notifyLocalPayment(online.getPrivateHost(), online.getPortUdp(), userId, enable);
                    userControl.notifyLocalPayment(userId, ErrorConst.ONLINE, enable);
                }
            }
        }
        else
        {
            userControl.notifyLocalPayment(userId, ErrorConst.SUCCESS, enable);
        }
    }

    public static class TaskSendLog implements Runnable
    {
        private String msg;

        public TaskSendLog (String msg)
        {
            this.msg = msg;
        }

        @Override
        public void run ()
        {
            try
            {
                Debug.info("CheckLocalPayment.TaskSendLog", msg);
                Broker.getInstance().sendLog(msg);
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }
    }

    public static void sendLog (int userId,
                                String username,
                                String simOperator,
                                String appName,
                                String appVersion,
                                int level,
                                String installDate, // dd-mm-yyyy
                                String ip,
                                String deviceId,
                                boolean enableLocal,
                                int dailyPlayingTime,
                                String socialType)
    {
        if (executor == null)
            return;

        StringBuilder sb = pool.get()
                               .append(Time.getTimeMillis()).append(SEPARATOR)
                               .append(userId).append(SEPARATOR)
                               .append(username).append(SEPARATOR)
                               .append(simOperator).append(SEPARATOR)
                               .append(appName).append(SEPARATOR)
                               .append(appVersion).append(SEPARATOR)
                               .append(level).append(SEPARATOR)
                               .append(installDate).append(SEPARATOR)
                               .append(ip).append(SEPARATOR)
                               .append(deviceId).append(SEPARATOR)
                               .append(enableLocal).append(SEPARATOR)
                               .append(dailyPlayingTime).append(SEPARATOR)
                               .append(socialType).append(SEPARATOR);

        String msg = sb.toString();
        pool.add(sb);
        executor.submit(new TaskSendLog(msg));
    }

    public static class TaskSendCheck implements Runnable
    {
        private int    userId;
        private String address;

        public TaskSendCheck (int userId, String address)
        {
            this.userId = userId;
            this.address = address;
        }

        @Override
        public void run ()
        {
            try
            {
                Debug.info("CheckLocalPayment.TaskSendCheck", userId, address);
                Broker.getInstance().sendCheckPayment(Integer.toString(userId), address);
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }
    }

    public static void sendCheck (int userId, String address)
    {
        if (executor == null)
            return;

        executor.submit(new TaskSendCheck(userId, address));
    }


}
