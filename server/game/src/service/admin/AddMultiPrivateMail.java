package service.admin;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import extension.EnvConfig;
import model.LockAction;
import model.UserBrief;
import model.mail.MailBox;
import org.apache.log4j.PropertyConfigurator;
import util.Address;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.memcached.CasValue;
import util.metric.MetricLog;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

public class AddMultiPrivateMail
{
    public static final String INPUT_FOLDER  = "./mail/add";
    public static final String OUTPUT_FOLDER = "./mail";

    private static int  numFile;
    private static long timeStart;

    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            addShutdownHook();

            EnvConfig.readConfig();
            EnvConfig.markStarting();

            EnvConfig.connectDatabase(false);
            ConstInfo.load();

            EnvConfig.markRunning();

            timeStart = System.currentTimeMillis();
            scanFile();
            long delta = System.currentTimeMillis() - timeStart;

            MetricLog.console("*** FINISHED ***");
            MetricLog.console("zone", EnvConfig.zone());
            MetricLog.console("numFile", numFile);

            long timeProcess = delta / 1000;
            MetricLog.console("timeProcess", timeProcess, "s");
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
                EnvConfig.markStopping();
                EnvConfig.disconnectDatabase();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
            EnvConfig.markTerminated();
        }));
    }

    private static void scanFile ()
    {
        try (Stream<Path> walk = Files.walk(Paths.get(INPUT_FOLDER)))
        {
            walk.filter(Files::isRegularFile)
                .forEach(path -> readFile(path));
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static void readFile (Path input)
    {
        numFile++;
        try
        {
            String filename = input.getFileName().toString();
            RequestInfo request = Json.fromFile(input, RequestInfo.class);

            MetricLog.console("Read file", filename,
                              "numFile", numFile,
                              "setUserId", request.setUserId == null ? 0 : request.setUserId.size(),
                              "listInfo", request.listInfo == null ? 0 : request.listInfo.size());

            Result result = handleRequest("tool", Address.PRIVATE_HOST, request);
            //Result result = new Result(request);

            if (result.errorMsg == null)
            {
                writeFile(filename, "success", result.success);
                writeFile(filename, "fail", result.fail);
            }
            else
            {
                MetricLog.console("Read file", filename, "error", result.errorMsg);
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Read file", input.getFileName());
        }
    }

    private static void writeFile (String name, String type, RequestInfo info)
    {
        String output = OUTPUT_FOLDER + "/" + name + "_" + type + Time.timeBackup();
        try
        {
            Files.write(Paths.get(output), Json.toJsonPretty(info).getBytes(StandardCharsets.UTF_8));
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Write file", output);
        }
    }

    public static class RequestInfo
    {
        public String         idLock;
        public String         reason;
        public MailInfo       mailInfo;
        public Set<Integer>   setUserId;
        public List<MailInfo> listInfo;

        public RequestInfo ()
        {
        }

        public RequestInfo (RequestInfo base)
        {
            idLock = base.idLock;
            reason = base.reason;
            mailInfo = base.mailInfo;
            setUserId = new HashSet<>();
            listInfo = new ArrayList<>();
        }
    }

    public static class MailInfo
    {
        public int     userId;
        public Integer type;
        public String  title;
        public String  content;
        public MapItem items;
    }

    public static class Result
    {
        public String      errorMsg;
        public RequestInfo success;
        public RequestInfo fail;

        public Result (RequestInfo request)
        {
            success = new RequestInfo(request);
            fail = new RequestInfo(request);
        }

        public Result setErrorMsg (String msg)
        {
            errorMsg = msg;
            return this;
        }
    }

    public static Result handleRequest (String admin, String address, RequestInfo request)
    {
        Result result = new Result(request);

        if (request.idLock == null || request.idLock.isEmpty())
            return result.setErrorMsg("Empty idLock");

        if (!LockAction.lock(request.idLock, Json.toJsonPretty(request)))
            return result.setErrorMsg("Lock FAIL: " + request.idLock);

        int numUserSet = 0;
        int numSetSuccess = 0;
        int numUserList = 0;
        int numListSuccess = 0;

        if (request.setUserId != null && request.setUserId.size() > 0)
        {
            if (request.mailInfo == null)
                return result.setErrorMsg("Empty mailInfo");

            for (int userId : request.setUserId)
            {
                numUserSet++;
                if (addMail("tool", Address.PRIVATE_HOST, userId, request.reason, request.mailInfo, null))
                {
                    numSetSuccess++;
                    result.success.setUserId.add(userId);
                }
                else
                {
                    result.fail.setUserId.add(userId);
                }
            }
        }

        if (request.listInfo != null && request.listInfo.size() > 0)
        {
            for (MailInfo info : request.listInfo)
            {
                numUserList++;
                if (info == null)
                    continue;
                if (addMail(admin, address, info.userId, request.reason, request.mailInfo, info))
                {
                    numListSuccess++;
                    result.success.listInfo.add(info);
                }
                else
                {
                    result.fail.listInfo.add(info);
                }
            }
        }

        MetricLog.info("AddMultiPrivateMail", "handleRequest",
                       "idLock", request.idLock,
                       "setSuccess", numSetSuccess + "/" + numUserSet,
                       "listSuccess", numListSuccess + "/" + numUserList);
        return result;
    }

    public static boolean addMail (String admin, String address, int userId, String reason, MailInfo base, MailInfo override)
    {
        if (userId <= 0)
        {
            MetricLog.info("addMail", userId, "userId <= 0");
            return false;
        }

        MailInfo info = new MailInfo();

        if (base != null && base.type != null)
            info.type = base.type;
        if (override != null && override.type != null)
            info.type = override.type;
        if (info.type == null)
        {
            MetricLog.info("addMail", userId, "Missing type");
            return false;
        }

        if (base != null && base.title != null)
            info.title = base.title;
        if (override != null && override.title != null)
            info.title = override.title;
        if (info.title == null)
        {
            MetricLog.info("addMail", userId, "Missing title");
            return false;
        }

        if (base != null && base.content != null)
            info.content = base.content;
        if (override != null && override.content != null)
            info.content = override.content;
        if (info.content == null)
        {
            MetricLog.info("addMail", userId, "Missing content");
            return false;
        }

        if (base != null && base.items != null)
            info.items = base.items;
        if (override != null && override.items != null)
            info.items = override.items;
        if (info.items != null && !ConstInfo.isValidMapItem(info.items))
        {
            MetricLog.info("addMail", userId, "Invalid items");
            return false;
        }

        UserBrief userBrief = UserBrief.get(userId);
        if (userBrief == null)
        {
            MetricLog.info("addMail", userId, "userBrief == null");
            return false;
        }

        CasValue<MailBox> cas = MailBox.gets(userBrief.getBucketId(), userId);
        if (cas == null)
        {
            MetricLog.info("addMail", userId, "Gets fail");
            return false;
        }

        MailBox mailBox = cas.object;
        MailBox.Mail mail = mailBox.addMailPrivate(info.type, info.title, info.content, info.items);

        if (!MailBox.cas(userBrief.getBucketId(), userId, cas.cas, mailBox))
        {
            MetricLog.info("addMail", userId, "CAS fail");
            return false;
        }

        MetricLog.gm("AddMultiPrivateMail",
                     admin,
                     address,
                     reason,
                     userId,
                     0,
                     info.type,
                     mail.getUid(),
                     info.title,
                     MetricLog.replaceNewLine(info.content, "<br>"),
                     MetricLog.toString(info.items)
                    );

        return true;
    }


}
