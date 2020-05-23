package service.chat;

import bitzero.engine.sessions.ISession;
import bitzero.server.entities.User;
import cmd.BaseMessage;
import cmd.Message;
import cmd.send.chat.ResponseChatOnline;
import data.CmdDefine;
import data.MiscInfo;
import extension.ChatExtension;
import model.ChatHistory;
import util.Constant;
import util.Time;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

public class Room
{
    private final ConcurrentHashMap<Integer, User> mapUser = new ConcurrentHashMap<>();

    private final int                                id;
    private final AtomicLong                         uidChat;
    private final ConcurrentLinkedQueue<BaseMessage> historyChat = new ConcurrentLinkedQueue<>();

    public Room (int id)
    {
        this.id = id;
        long time = Time.getUnixTime();
        uidChat = new AtomicLong(time * 1_000_000);

        loadHistory();
    }

    public int getId ()
    {
        return id;
    }

    void join (User user)
    {
        user.setProperty(Constant.PROPERTY_USER_GUILD_ROOM, this);
        mapUser.put(user.getId(), user);
    }

    //nếu không còn user trong room thì trẩ lại true
    boolean leave (User user)
    {
        user.removeProperty(Constant.PROPERTY_USER_GUILD_ROOM);
        mapUser.remove(user.getId(), user);
        return mapUser.isEmpty();
    }

    boolean isEmpty ()
    {
        return mapUser.isEmpty();
    }

    public void send (BaseMessage msg, Set<Integer> blacklist)
    {
        Collection<ISession> toSession = new ArrayList<>();
        for (User user : mapUser.values())
        {
            if (!user.isConnected())
                continue;
            if (blacklist != null && blacklist.contains(user.getId()))
                continue;
            //ChatExtension.gameExt.send(msg, user);
            toSession.add(user.getSession());
        }
        if (toSession.size() > 0)
            ChatExtension.gameExt.send(msg, toSession);

        if (msg.getCmd() == CmdDefine.CHAT_SEND_GUILD)
        {
            historyChat.add(msg);
            if (historyChat.size() > MiscInfo.GUILD_CHAT_LINE_LIMIT())
                historyChat.poll();
        }
    }

    public void send (Message msg, Set<Integer> blacklist)
    {
        send(msg.toBaseMessage(), blacklist);
    }

    public long nextUidChat ()
    {
        return uidChat.incrementAndGet();
    }

    public void sendHistory (User user)
    {
        for (BaseMessage msg : historyChat)
            ChatHandler.send(user, msg);
    }

    public void sendListOnline (User toUser)
    {
        List<Integer> online = new ArrayList<>();
        for (User user : mapUser.values())
        {
            if (!user.isConnected())
                continue;
            if (user.getId() == toUser.getId())
                continue;
            online.add(user.getId());
        }

        BaseMessage msg = new ResponseChatOnline().packData(online);
        ChatHandler.send(toUser, msg);
    }

    private void loadHistory ()
    {
        ChatHistory.get(id, historyChat);
    }

    void saveHistory ()
    {
        ChatHistory.set(id, historyChat);
    }
}
