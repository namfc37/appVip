package model.mail;

import cmd.ErrorConst;
import data.CmdDefine;
import data.KeyDefine;
import data.MiscDefine;
import data.MiscInfo;
import extension.EnvConfig;
import extension.GameExtension;
import model.key.InfoKeyUser;
import net.spy.memcached.CASValue;
import user.UserControl;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.*;

public class MailBox extends Encoder.IObject implements KeyDefine
{
    private transient int userId;

    private TreeMap<Integer, Mail> mails;
    HashSet<Integer> sysUid;

    private MailBox ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static MailBox create (int userId)
    {
        MailBox o = new MailBox();
        o.userId = userId;
        o.mails = new TreeMap<>();
        o.sysUid = new HashSet<>();

        return o;
    }

    private int nextUid ()
    {
        int uid = Time.getUnixTime();
        while (mails.containsKey(uid))
            uid++;
        return uid;
    }

    public Mail get (int uid)
    {
        return mails.get(uid);
    }

    public boolean update (UserControl userControl)
    {
        int curTime = Time.getUnixTime();
        for (Iterator<Mail> it = mails.values().iterator(); it.hasNext(); )
        {
            Mail m = it.next();
            boolean isLimit = mails.size() > MiscInfo.MAIL_LIMIT_STORE();
			int time = m.time;
            
            switch (m.type)
            {
            	case MiscDefine.MAIL_GUILD_ACCEPT_JOIN:
            	case MiscDefine.MAIL_GUILD_KICK:
            	case MiscDefine.MAIL_GUILD_NOTIFY:
            	case MiscDefine.MAIL_GUILD_DISBAND:
            	case MiscDefine.MAIL_GUILD_DONATE_FAIL:
            		time += MiscInfo.GUILD_INBOX_DURATION();
            	break;
            
            	default:
            		time += MiscInfo.MAIL_EXPIRE_DAY() * Time.SECOND_IN_DAY;
            	break;
            }
			
            boolean isExpire = time < curTime;
            
            if (isLimit || isExpire)
            {
                it.remove();
                MetricLog.actionUser(userControl.country,
                                     CmdDefine.MAIL_DELETE,
                                     userControl.platformID,
                                     userControl.brief.getUserId(),
                                     userControl.brief.getUsername(),
                                     userControl.socialType,
                                     userControl.game.getLevel(),
                                     "",
                                     null,
                                     null,
                                     ErrorConst.SUCCESS,
                                     userControl.getCoin(),
                                     0,
                                     userControl.game.getGold(),
                                     0,
                                     m.uid,
                                     isLimit ? "limit" : "expire", //type
                                     m.isRead,
                                     MetricLog.toString(m.items)
                                    );
            }
        }

        return GameExtension.mailManager.addTo(this);
    }

    public Mail addMailSystem (int type, int uid, String title, String content, MapItem items)
    {
        return addMail(type, uid, title, content, Time.getUnixTime(), items);
    }

    public Mail addMailPrivate (int type, String title, String content, MapItem items)
    {
        return addMail(type, nextUid(), title, content, Time.getUnixTime(), items);
    }

    public Mail addMailGuild (int type, int sender, String avatar, String title, String subTitle, String content, MapItem items)
    {
        return addMail(type, nextUid(), sender, avatar, title, subTitle, content, items, Time.getUnixTime());
    }

    public Mail addMailGuild (int type, int sender, String avatar, String title, String subTitle, String content)
    {
        return addMail(type, nextUid(), sender, avatar, title, subTitle, content, null, Time.getUnixTime());
    }

    private Mail addMail (int type, int uid, String title, String content, int time, MapItem items)
    {
        Mail m = new Mail();
        m.type = type;
        m.uid = uid;
        m.title = title;
        m.content = content;
        m.time = time;
        m.isRead = false;
        m.items = items;

        mails.put(m.uid, m);

        short cmd = CmdDefine.MAIL_ADD;
        String transactionId = UserControl.transactionId(userId);
        
        MetricLog.actionUser(cmd,
                             userId,
                             (short) -1,
                             transactionId,
                             null,
                             null,
                             ErrorConst.SUCCESS,
                             type,
                             uid,
                             title,
                             MetricLog.replaceNewLine(content, "<br>")
                            );
        
        MetricLog.items(items, "MAIL_ADD", transactionId);
        
        return m;
    }
    
    private Mail addMail (int type, int uid, int sender, String avatar, String title, String subTitle, String content, MapItem items, int time)
    {
        Mail m = new Mail();
        m.type = type;
        m.uid = uid;
        m.sender = sender;
        m.avatar = avatar;
        m.title = title;
        m.subTitle = subTitle;
        m.content = content;
        m.items = items == null ? null : items.toUnmodifiableMapItem();
        m.time = time;
        m.isRead = false;

        mails.put(m.uid, m);

        short cmd = CmdDefine.MAIL_ADD;
        String transactionId = UserControl.transactionId(userId);
        
        MetricLog.actionUser(cmd,
                             userId,
                             (short) -1,
                             transactionId,
                             null,
                             null,
                             ErrorConst.SUCCESS,
                             type,
                             uid,
                             title,
                             MetricLog.replaceNewLine(content, "<br>"),
                             sender
                            );
        
        MetricLog.items(items, "MAIL_ADD", transactionId);
        return m;
    }

    public boolean delete (int[] uids, String transactionId)
    {
        int oldSize = mails.size();
        for (int uid : uids)
        {
            Mail m = mails.remove(uid);

            if (m != null)
            {
                MetricLog.actionUser(CmdDefine.MAIL_DELETE,
                                     userId,
                                     (short) -1,
                                     transactionId,
                                     null,
                                     null,
                                     ErrorConst.SUCCESS,
                                     m.uid,
                                     "user", //type
                                     m.isRead,
                                     MetricLog.toString(m.items)
                                    );
            }
        }
        return oldSize != mails.size();
    }

    public boolean delete (int uid)
    {
        return mails.remove(uid) != null;
    }

    public boolean markRead (int[] uids)
    {
        boolean isChanged = false;
        for (int uid : uids)
        {
            Mail mail = mails.get(uid);
            if (mail != null && mail.isRead == false)
            {
                mail.isRead = true;
                isChanged = true;
            }
        }
        return isChanged;
    }
	
	public boolean containsMail(int mailId)
	{
        return mails.containsKey(mailId);
	}

    @Override
    public void putData (Encoder msg)
    {
        List<Mail> listMail = new ArrayList<>(MiscInfo.MAIL_LIMIT_RESPONSE());
        for (Map.Entry<Integer, Mail> entry : mails.descendingMap().entrySet())
        {
            Mail m = entry.getValue();
            listMail.add(m);

            if (listMail.size() == MiscInfo.MAIL_LIMIT_RESPONSE())
                break;
        }
        msg.put(MAIL_LIST_MAIL, listMail);
    }

    public static class Mail extends Encoder.IObject implements KeyDefine
    {
        private int     uid;
        private int     type;
        private String  title;
        private String  content;
        private int     time;
        private boolean isRead;
        private MapItem items;

        private Integer sender;
        private String avatar;
        private String subTitle;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(MAIL_UID, uid);
            msg.put(MAIL_TYPE, type);
            msg.put(MAIL_TITLE, title);
            msg.put(MAIL_CONTENT, content);
            msg.put(MAIL_TIME_CREATE, time);
            msg.put(MAIL_IS_READ, isRead);
            msg.put(MAIL_ITEMS, items);
            
            if (sender != null)
            {
                msg.put(MAIL_SENDER, sender.intValue());
                msg.put(MAIL_AVATAR, avatar);
                msg.put(MAIL_SUBTITLE, subTitle);
            }
        }

        public int getUid ()
        {
            return uid;
        }

        public int getType ()
        {
            return type;
        }

        public boolean isRead ()
        {
            return isRead;
        }

        public void setRead (boolean read)
        {
            isRead = read;
        }

        public MapItem getItems ()
        {
            return items;
        }
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.MAIL_BOX;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static MailBox decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                MailBox obj = Json.fromJson((String) raw, MailBox.class);
                obj.userId = userId;
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static Object getRaw (String bucketId, int userId)
    {
        return db(bucketId).get(keyName(userId));
    }

    public static boolean set (String bucketId, int userId, MailBox object)
    {
        return db(bucketId).set(keyName(userId), object.encode(), expire());
    }

    public static MailBox get (String bucketId, int userId)
    {
        return decode(userId, getRaw(bucketId, userId));
    }

    public static MailBox get (int userId, Map<String, Object> mapData)
    {
        return decode(userId, mapData.get(keyName(userId)));
    }

    public static CasValue<MailBox> gets (String bucketId, int userId)
    {
        CASValue<Object> raw = db(bucketId).gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(userId, raw.getValue()));
    }

    public static boolean cas (String bucketId, int userId, long cas, MailBox object)
    {
        return db(bucketId).cas(keyName(userId), cas, object.encode(), expire());
    }
    
    //-----------------------------------------------------------------------
}
