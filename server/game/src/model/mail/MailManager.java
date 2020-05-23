package model.mail;

import bitzero.server.entities.User;
import bitzero.util.ExtensionUtility;
import data.ConstInfo;
import extension.EnvConfig;
import extension.GameExtension;
import model.key.InfoKeyFixed;
import net.spy.memcached.CASValue;
import user.UserControl;
import util.Constant;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.io.ShareLoopGroup;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;

import java.util.Iterator;
import java.util.List;
import java.util.TreeMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class MailManager
{
    public static final int INITIAL_DELAY = 0;
    public static final int DELAY         = 60;

    private static int             timeCheck;

    private int                    timeUpdate;
    private TreeMap<Integer, Mail> mails;

    private MailManager ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static MailManager create ()
    {
        MailManager o = new MailManager();
        o.mails = new TreeMap<>();

        return o;
    }

    public static void start ()
    {
        ShareLoopGroup.scheduleWithFixedDelay(() -> {
            loadAndUpdate();
        }, INITIAL_DELAY, DELAY, TimeUnit.SECONDS, true);
    }

    public static void stop ()
    {

    }

    private static void loadAndUpdate ()
    {
        try
        {
            CasValue<MailManager> cas = MailManager.gets();
            if (cas == null)
                return;
            MailManager manager = cas.object;
            GameExtension.mailManager = manager;
            if (manager.update())
                MailManager.cas(cas.cas, manager);

            if (timeCheck < manager.timeUpdate)
            {
                timeCheck = manager.timeUpdate;

                List<User> allUser = ExtensionUtility.globalUserManager.getAllUsers();
                if (allUser.isEmpty())
                    return;

                for (User user : allUser)
                {
                    if (user == null || user.isConnected() == false)
                        continue;
                    UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);
                    if (userControl == null)
                        continue;
                    MailBox mailBox = userControl.getMailBox();
                    if (mailBox != null && mailBox.update(userControl))
                        userControl.notifyMail(false);
                }
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private boolean update ()
    {
        boolean isChanged = false;
        int curTime = Time.getUnixTime();
        for (Iterator<Mail> it = mails.values().iterator(); it.hasNext(); )
        {
            Mail m = it.next();
            if (m.timeFinish < curTime)
            {
                it.remove();
                isChanged = true;
            }
        }
        return isChanged;
    }

    public boolean addTo (MailBox mailBox)
    {
        boolean isChanged = false;
        int curTime = Time.getUnixTime();

        for (Mail m : mails.values())
        {
            if (m.timeStart > curTime || mailBox.sysUid.contains(m.uid))
                continue;
            mailBox.addMailSystem(m.type, m.uid, m.title, m.content, m.items);
            mailBox.sysUid.add(m.uid);
            isChanged = true;
        }
        for (Iterator<Integer> it = mailBox.sysUid.iterator(); it.hasNext(); )
        {
            if (!mails.containsKey(it.next()))
            {
                it.remove();
                isChanged = true;
            }
        }
        return isChanged;
    }

    public String add (int type, int uid, String title, String content, int timeStart, int timeFinish, MapItem items)
    {
        if (title == null || title.isEmpty())
            return "Empty title";
        if (title == null || title.isEmpty())
            return "Empty content";
        int curTime = Time.getUnixTime();
        if (timeStart < curTime)
            return "Invalid timeStart";
        if (timeFinish <= timeStart)
            return "Invalid timeFinish";
        if (items != null && !ConstInfo.isValidMapItem(items))
            return "Invalid items";

        Mail mail = new Mail();
        mail.type = type;
        mail.title = title;
        mail.content = content;
        mail.timeStart = timeStart;
        mail.timeFinish = timeFinish;
        mail.items = items;

        if (uid > 0)
        {
            if (mails.get(uid) == null)
                return "Not exist mail which uid is " + uid;
            mail.uid = uid;
            mails.put(mail.uid, mail);
            return null;
        }

        uid = curTime;
        if (mails.get(uid) != null)
            return "Exist mail which uid is " + uid;
        mail.uid = uid;
        mails.put(mail.uid, mail);
        timeUpdate = curTime;
        return null;
    }

    public static class Mail
    {
        private int     type;
        private int     uid;
        private String  title;
        private String  content;
        private int     timeStart;
        private int     timeFinish;
        private MapItem items;

    }

    //-----------------------------------------------------------------------
    private final static InfoKeyFixed INFO_KEY = InfoKeyFixed.MAIL_MANAGER;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName ()
    {
        return INFO_KEY.keyName();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static MailManager decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                MailManager obj = Json.fromJson((String) raw, MailManager.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, Json.toJson(raw));
        }
        return null;
    }

    public static Object getRaw ()
    {
        return db().get(keyName());
    }

    public static boolean add ()
    {
        return db().add(keyName(), create().encode());
    }

    public static MailManager get ()
    {
        return decode(getRaw());
    }

    public static CasValue<MailManager> gets ()
    {
        CASValue<Object> raw = db().gets(keyName());
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(raw.getValue()));
    }

    public static boolean cas (long cas, MailManager object)
    {
        return db().cas(keyName(), cas, object.encode());
    }

    //-----------------------------------------------------------------------
}
