package service.chat;

import bitzero.engine.sessions.ISession;
import bitzero.server.core.BZEventParam;
import bitzero.server.core.BZEventType;
import bitzero.server.core.IBZEvent;
import bitzero.server.entities.User;
import bitzero.server.extensions.BaseClientRequestHandler;
import bitzero.server.extensions.data.DataCmd;
import bitzero.util.ExtensionUtility;
import bitzero.util.socialcontroller.bean.UserInfo;
import cmd.BaseMessage;
import cmd.ErrorConst;
import cmd.receive.chat.RequestChatGuild;
import cmd.receive.chat.RequestChatPrivate;
import cmd.receive.chat.RequestLoginChat;
import cmd.send.chat.*;
import data.CmdDefine;
import data.ConstInfo;
import data.MiscDefine;
import data.MiscInfo;
import extension.ChatExtension;
import extension.EnvConfig;
import service.DisconnectionReason;
import util.Common;
import util.Constant;
import util.metric.MetricLog;

public class ChatHandler extends BaseClientRequestHandler
{
    public static final ChatHandler instance = new ChatHandler();

    @Override

    public void init ()
    {
        getParentExtension().addEventListener(BZEventType.USER_LOGOUT, this);
        getParentExtension().addEventListener(BZEventType.USER_DISCONNECT, this);
    }

    @Override
    public void handleServerEvent (IBZEvent event)
    {
        User user = (User) event.getParameter(BZEventParam.USER);
        try
        {
            if (event.getType() == BZEventType.USER_DISCONNECT)
                logout(user);
        }
        catch (Exception e)
        {
            MetricLog.exception(e, user.getId(), event.getType());
        }
    }

    @Override
    public void handleClientRequest (User user, DataCmd dataCmd)
    {
        short cmd = dataCmd.getId();
        try
        {
            switch (cmd)
            {
                case CmdDefine.CHAT_PING:
                    ping(cmd, user, dataCmd);
                    break;
                case CmdDefine.CHAT_SEND_PRIVATE:
                    chatPrivate(cmd, user, dataCmd);
                    break;
                case CmdDefine.CHAT_SEND_GUILD:
                    chatGuild(cmd, user, dataCmd);
                    break;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, user.getId(), cmd);
        }
    }

    public static void login (ISession session, RequestLoginChat request, UserInfo userInfo, User user)
    {
        byte result;
        //int userId = Integer.parseInt(userInfo.getUserId());
        int code = Common.stringToInt(request.clientVersion, 0);
        Room room = null;

        if (user == null)
        {
            result = ErrorConst.NULL_USER;
        }
        else if (EnvConfig.isServer() && code < EnvConfig.minClientCode())
        {
            result = ErrorConst.FORCE_UPDATE;
        }
        else
        {
            result = ErrorConst.SUCCESS;
            room = RoomManager.joinGuildRoom(request.guild, user);
        }

        if (result == ErrorConst.SUCCESS)
        {
            ExtensionUtility.instance().sendLoginOK(user);

            //notify online
            BaseMessage msg = new ResponseChatOnline().packData(user.getId());
            room.send(msg, null);

            //send chat history
            room.sendHistory(user);
            room.sendListOnline(user);
        }
        else
        {
            ExtensionUtility.instance().sendLoginResponse(user, result);
            BaseMessage msg = new ResponseKickChat(result).packData();
            send(user, msg);
            user.disconnect(DisconnectionReason.KICK);
        }

        MetricLog.loginChat(user.getId(),
                            request.clientVersion,
                            request.deviceId,
                            session.getHashId(),
                            result,
                            session.getAddress(),
                            request.country,
                            request.packageName,
                            request.guild);
    }

    public static void logout (User user)
    {
        if (!RoomManager.leave(user))
            return;

        ISession session = user.getSession();

        MetricLog.logoutChat(user.getId(),
                             session.getHashId(),
                             ErrorConst.SUCCESS
                            );
    }

    public static void kick (String username)
    {
        User user = ExtensionUtility.globalUserManager.getUserByName(username);
        if (user != null)
        {
            BaseMessage msg = new ResponseKickChat(ErrorConst.ONLINE).packData();
            send(user, msg);
            user.disconnect(DisconnectionReason.KICK);
        }
    }

    public static void send (User user, BaseMessage msg)
    {
        ChatExtension.gameExt.send(msg, user);
    }

    public static void send (User user, short cmd, byte error, byte[] data)
    {
        BaseMessage msg = new BaseMessage(cmd, error, data);
        ChatExtension.gameExt.send(msg, user);
    }

    private static void ping (short cmd, User user, DataCmd dataCmd)
    {
        BaseMessage msg = new ResponsePing(cmd).packData();
        send(user, msg);
    }

    private static void chatPrivate (short cmd, User user, DataCmd dataCmd)
    {
        RequestChatPrivate request = new RequestChatPrivate(dataCmd);
        byte result;


        User friend = ExtensionUtility.globalUserManager.getUserById(request.friendId);
        if (friend == null)
            result = ErrorConst.OFFLINE;
        else if (request.data == null || request.data.isEmpty() || request.data.length() >= MiscInfo.GUILD_CHAT_ITEM_LENGTH())
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            result = ErrorConst.SUCCESS;
            BaseMessage msg = new ResponseChatPrivate(cmd, result).packData(user.getId(), request.friendId, request.data);
            send(friend, msg);
        }

        if (result != ErrorConst.SUCCESS)
        {
            BaseMessage msg = new ResponseChatPrivate(cmd, result).packData(user.getId(), request.friendId, null);
            send(user, msg);
        }
    }

    private static void chatGuild (short cmd, User user, DataCmd dataCmd)
    {
        RequestChatGuild request = new RequestChatGuild(dataCmd);
        byte result;

        if (request.data == null || request.data.isEmpty() || request.data.length() >= MiscInfo.GUILD_CHAT_ITEM_LENGTH())
            result = ErrorConst.INVALID_LENGTH;
        else if (request.type == MiscDefine.GUILD_CHAT_TYPE_EMOJI && !ConstInfo.getGuildData().checkEmoji (request.data))
   		 	result = ErrorConst.INVALID_ITEM;
        else
        {
            Room guild = (Room) user.getProperty(Constant.PROPERTY_USER_GUILD_ROOM);
            if (guild == null)
                result = ErrorConst.FAIL;
            else
            {
                result = ErrorConst.SUCCESS;
                BaseMessage msg = new ResponseChatGuild(cmd, ErrorConst.SUCCESS).packData(user.getId(), request.type, request.data, guild.nextUidChat());
                guild.send(msg, null);
            }
        }

        if (result != ErrorConst.SUCCESS)
        {
            BaseMessage msg = new ResponseChatGuild(cmd, result).packData(user.getId());
            send(user, msg);
        }
    }

}
