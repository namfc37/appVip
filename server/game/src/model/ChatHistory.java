package model;

import cmd.BaseMessage;
import data.MiscInfo;
import model.key.InfoKeyData;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

public class ChatHistory
{
    private int               id;
    private List<BaseMessage> history;

    private final static InfoKeyData INFO_KEY = InfoKeyData.CHAT_HISTORY;

    private ChatHistory ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    private ChatHistory (int id, ConcurrentLinkedQueue<BaseMessage> queue)
    {
        this.id = id;
        history = new ArrayList<>();
        for (BaseMessage m : queue)
        {
            if (history.size() < MiscInfo.GUILD_CHAT_LINE_LIMIT())
                history.add(m);
        }
    }

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (int id)
    {
        return INFO_KEY.keyName(id);
    }

    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return Json.toJson(this);
    }

    public static Object getRaw (int id)
    {
        return db().get(keyName(id));
    }

    public static ChatHistory decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                ChatHistory obj = Json.fromJson((String) raw, ChatHistory.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (int id, ConcurrentLinkedQueue<BaseMessage> queue)
    {
        ChatHistory data = new ChatHistory(id, queue);
        return db().set(keyName(id), data.encode(), expire());
    }

    public static boolean get (int id, ConcurrentLinkedQueue<BaseMessage> queue)
    {
        ChatHistory data = decode(getRaw(id));
        if (data == null)
            return false;

        for (BaseMessage m : data.history)
            queue.add(m);
        return true;
    }
}
