package util.io;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.SelfSignedCertificate;
import util.metric.MetricLog;

import javax.net.ssl.KeyManagerFactory;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.Security;

public class SSLContextLoader
{
    public static SslContext forServer (String file, String password) throws Exception
    {
        try
        {
            KeyStore keyStore = KeyStore.getInstance("JKS");
            keyStore.load(Files.newInputStream(Paths.get(file)), password.toCharArray());

            String algorithm = Security.getProperty("ssl.KeyManagerFactory.algorithm");
            if (algorithm == null)
                algorithm = "SunX509";

            KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(algorithm);
            keyManagerFactory.init(keyStore, password.toCharArray());

            return SslContextBuilder.forServer(keyManagerFactory).build();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static SslContext forServer () throws Exception
    {
        return forServer(null);
    }

    public static SslContext forServer (String domain) throws Exception
    {
        SelfSignedCertificate ssc = domain == null ? new SelfSignedCertificate() : new SelfSignedCertificate(domain);
        return SslContextBuilder.forServer(ssc.certificate(), ssc.privateKey()).build();
    }
}
