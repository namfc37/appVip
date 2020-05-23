package service.chat;

import bitzero.server.entities.User;
import cmd.BaseMessage;
import cmd.send.chat.ResponseChatOffline;
import extension.ChatExtension;
import util.Constant;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class RoomManager
{
    private static final ConcurrentHashMap<Integer, Room> mapGuild = new ConcurrentHashMap<>();

    public static Room joinGuildRoom (int idGuild, User user)
    {
        Room guild = mapGuild.computeIfAbsent(idGuild, id -> new Room(id));
        guild.join(user);
        return guild;
    }

    public static boolean leave (User user)
    {
        Room room = (Room) user.getProperty(Constant.PROPERTY_USER_GUILD_ROOM);
        if (room != null)
        {
            if (room.leave(user)) //nếu không còn user trong room
            {
                mapGuild.remove(room.getId());
                room.saveHistory();
            }
            else if (ChatExtension.isRunning()) //nếu service còn chạy
            {
                //notify offline
                BaseMessage msg = new ResponseChatOffline().packData(user.getId());
                room.send(msg, null);
            }
            return true;
        }
        return false;
    }

    public static boolean sendGuild (User user, BaseMessage msg)
    {
        Room guild = (Room) user.getProperty(Constant.PROPERTY_USER_GUILD_ROOM);
        if (guild == null)
            return false;
        guild.send(msg, null);
        return true;
    }

    public static boolean sendGuild (int idGuild, BaseMessage msg, Set<Integer> blacklist)
    {
        Room guild = mapGuild.get(idGuild);
        if (guild == null)
            return false;
        guild.send(msg, blacklist);
        return true;
    }

    public static boolean sendGuild (int idGuild, short msgCmd, byte msgError, byte[] msgData, Set<Integer> blacklist)
    {
        BaseMessage msg = new BaseMessage(msgCmd, msgError, msgData);
        return sendGuild(idGuild, msg, blacklist);
    }
}
