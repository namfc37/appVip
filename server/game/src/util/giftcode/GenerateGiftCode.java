package util.giftcode;

import bitzero.util.common.business.Debug;
import com.google.common.base.Charsets;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
import extension.EnvConfig;
import model.GiftCodeSingle;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.PropertyConfigurator;
import util.Address;
import util.metric.MetricLog;

import java.util.HashSet;
import java.util.concurrent.ThreadLocalRandom;

public class GenerateGiftCode
{
    private static boolean isRunning;

    public static final int CODE_LEN     = 9;
    public static final int HEADER_LEN   = 2;
    public static final int VALUE_LEN    = 5;
    public static final int CHECKSUM_LEN = CODE_LEN - HEADER_LEN - VALUE_LEN;

    private final static HashFunction       HASH  = Hashing.murmur3_32();
    private final static String             CHARS = "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
    private final static HashSet<Character> setChar;

    static
    {
        setChar = new HashSet<>();
        for (char c : CHARS.toCharArray())
            setChar.add(c);
    }

    public static HashSet<String> genCode (String header, int numCode)
    {
        if (numCode <= 0)
            throw new RuntimeException("Invalid numCode " + numCode);
        if (header == null || header.length() != HEADER_LEN)
            throw new RuntimeException("Invalid header " + header);
        header = header.toUpperCase();

        HashSet<String> result = new HashSet<>(numCode);
        for (int i = 0; i < numCode; i++)
        {
            String code = genCode(header);
            if (code == null)
                continue;
            result.add(code);
        }

        Debug.info("Generate gift code with header ", header, "NumCode", numCode, "Result", result.size());
        return result;
    }

    public static String genCode (String header)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        StringBuilder sb = new StringBuilder(VALUE_LEN);

        for (int numTry = 0; numTry < 10; numTry++)
        {
            for (int i = 0; i < VALUE_LEN; i++)
                sb.append(CHARS.charAt(r.nextInt(0, CHARS.length())));

            String value = sb.toString();
            String hash = hash(header, value);
            String code = header + value + hash;

            if (GiftCodeSingle.add(code))
                return code;
        }

        return null;
    }

    private static String hash (String header, String value)
    {
        String h = HASH.newHasher()
                       .putString(value, Charsets.US_ASCII)
                       .putString(header, Charsets.US_ASCII)
                       .hash()
                       .toString();

        if (h.length() < CHECKSUM_LEN)
            h = StringUtils.leftPad(h, CHECKSUM_LEN, '0');
        else if (h.length() > CHECKSUM_LEN)
            h = h.substring(0, CHECKSUM_LEN);
        return h.toUpperCase();
    }

    public static boolean checkCode (String code)
    {
        if (code == null || code.length() != CODE_LEN)
        {
            Debug.info("code", code, code.length());
            return false;
        }

        for (char c : code.toCharArray())
        {
            if (!setChar.contains(c))
                return false;
        }

        String header = code.substring(0, HEADER_LEN);
        String value = code.substring(HEADER_LEN, HEADER_LEN + VALUE_LEN);
        String hash = code.substring(HEADER_LEN + VALUE_LEN);
        String verify = hash(header, value);

        if (hash.equals(verify))
            return true;

        Debug.info("code", code);
        Debug.info("header", header);
        Debug.info("value", value);
        Debug.info("hash", hash);
        Debug.info("verify", verify);
        return false;
    }

    public static void test ()
    {
        int minSize = 10;
        int maxSize = 1000;
        int test = 100;
        ThreadLocalRandom r = ThreadLocalRandom.current();
        for (int t = 0; t < test; t++)
        {
            int size = r.nextInt(minSize, maxSize);
            StringBuilder sb = new StringBuilder(HEADER_LEN);
            for (int i = 0; i < HEADER_LEN; i++)
                sb.append(CHARS.charAt(r.nextInt(0, CHARS.length())));
            String header = sb.toString();

            HashSet<String> set = genCode(header, size);
            if (set.size() != size)
                throw new RuntimeException("Invalid Size " + set.size());
            for (String code : set)
            {
                if (!checkCode(code))
                    throw new RuntimeException("Invalid Code " + code);
            }
        }
    }

    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            EnvConfig.start();
            addShutdownHook();

            if (EnvConfig.environment() != EnvConfig.Environment.LOCAL)
                throw new RuntimeException("Can not run GenerateGiftCode.main() when service is " + EnvConfig.service());

            start();
            test();

            EnvConfig.markRunning();
        }
        catch (Exception e)
        {
            MetricLog.console(e);
            MetricLog.exception(e);
            System.exit(1);
        }
        System.exit(0);
    }

    private static void addShutdownHook ()
    {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try
            {
                stop();
                EnvConfig.stop();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }));
    }

    public static synchronized void start ()
    {
        if (isRunning)
            return;
        isRunning = true;

        MetricLog.info("GenerateGiftCode", "start", Address.PRIVATE_HOST);
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        EnvConfig.markStopping();
        MetricLog.info("GenerateGiftCode", "stop", Address.PRIVATE_HOST);

        isRunning = false;
    }
}
