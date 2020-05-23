package service.admin;

import extension.EnvConfig;
import org.apache.log4j.PropertyConfigurator;
import util.io.SSLContextLoader;
import util.metric.MetricLog;

public class Admin
{
    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            EnvConfig.start();
            addShutdownHook();

            if (EnvConfig.service() != EnvConfig.Service.ADMIN)
                throw new RuntimeException("Can not run Admin.main() when service is " + EnvConfig.service());

            EnvConfig.markRunning();
        }
        catch (Exception e)
        {
            MetricLog.console(e);
            MetricLog.exception(e);
            System.exit(1);
        }
    }

    private static void addShutdownHook ()
    {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try
            {
                EnvConfig.markStopping();
                EnvConfig.stop();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }));
    }
}
