package service;

import cmd.BaseMessage;
import data.CmdDefine;
import extension.ChatExtension;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.socket.DatagramPacket;
import io.netty.util.CharsetUtil;
import model.UserOnline;
import service.friend.FriendInfo;
import service.friend.FriendServer;
import service.newsboard.NewsBoardItem;
import service.newsboard.NewsBoardServer;
import service.udp.*;
import user.UserControl;
import util.Address;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.util.Set;

public class UdpHandler extends SimpleChannelInboundHandler<DatagramPacket>
{
    @Override
    protected void channelRead0 (ChannelHandlerContext ctx, DatagramPacket packet) throws Exception
    {
        String rawMsg = packet.content().toString(CharsetUtil.UTF_8);
        final AbstractMessage msg = AbstractMessage.decode(rawMsg, packet.sender().getAddress());

        if (msg != null)
        {
            ShareLoopGroup.submit(() -> {
                try
                {
                    msg.handle();
                }
                catch (Exception e)
                {
                    MetricLog.exception(e);
                }
            });
        }
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        MetricLog.exception(cause);
    }

    public static void sendPrivateShopAdd (NewsBoardItem item)
    {
        if (NewsBoardServer.privateShop == null)
        {
            MsgPrivateShopAdd msg = new MsgPrivateShopAdd(item);
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
        }
        else
        {
            NewsBoardServer.privateShop.add(item);
        }
    }

    public static void sendPrivateShopDelete (int userId, int idSlot)
    {
        if (NewsBoardServer.privateShop == null)
        {
            MsgPrivateShopDelete msg = new MsgPrivateShopDelete(userId, idSlot);
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
        }
        else
        {
            NewsBoardServer.privateShop.delete(userId, idSlot);
        }
    }

    public static void sendPrivateShopBuy (int userId)
    {
        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
        {
            UserOnline online = UserOnline.get(userId);
            if (online == null)
                return;

            MsgPrivateShopBuy msg = new MsgPrivateShopBuy(userId);
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(Address.getInetSocketAddress(online.getPrivateHost(), online.getPortUdp()), raw);
        }
        else
        {
            userControl.handleSystemCommand(CmdDefine.PRIVATE_SHOP_GET);
        }
    }

    public static void sendAirshipPack (int userId)
    {
        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
        {
            UserOnline online = UserOnline.get(userId);
            if (online == null)
                return;

            MsgAirShipPack msg = new MsgAirShipPack(userId);
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(Address.getInetSocketAddress(online.getPrivateHost(), online.getPortUdp()), raw);
        }
        else
        {
            userControl.handleSystemCommand(CmdDefine.AIRSHIP_GET);
        }
    }

    public static void sendFriendAdd (int userId, int friendId)
    {
        UserControl userControl = UserControl.get(friendId);
        MsgFriendNotifyAdd msg = new MsgFriendNotifyAdd(friendId, userId);

        if (userControl == null)
        {
            UserOnline online = UserOnline.get(friendId);
            if (online == null)
                return;

            String raw = msg.encode();
            EnvConfig.udpAdmin.write(Address.getInetSocketAddress(online.getPrivateHost(), online.getPortUdp()), raw);
        }
        else
        {
            userControl.handleSystemCommand(CmdDefine.FRIEND_NOTIFY_ADD, msg);
        }
    }

    public static void sendFriendRemove (int userId, int friendId)
    {
        UserControl userControl = UserControl.get(friendId);
        MsgFriendNotifyRemove msg = new MsgFriendNotifyRemove(friendId, userId);

        if (userControl == null)
        {
            UserOnline online = UserOnline.get(friendId);
            if (online == null)
                return;

            String raw = msg.encode();
            EnvConfig.udpAdmin.write(Address.getInetSocketAddress(online.getPrivateHost(), online.getPortUdp()), raw);
        }
        else
        {
            userControl.handleSystemCommand(CmdDefine.FRIEND_NOTIFY_REMOVE, msg);
        }
    }

    public static void sendFriendRequest (int userId, int friendId)
    {
        UserControl userControl = UserControl.get(friendId);
        MsgFriendNotifyRequest msg = new MsgFriendNotifyRequest(friendId, userId);

        if (userControl == null)
        {
            UserOnline online = UserOnline.get(friendId);
            if (online == null)
                return;

            String raw = msg.encode();
            EnvConfig.udpAdmin.write(Address.getInetSocketAddress(online.getPrivateHost(), online.getPortUdp()), raw);
        }
        else
        {
            userControl.handleSystemCommand(CmdDefine.FRIEND_NOTIFY_REQUEST, msg);
        }
    }

    public static void sendFriendLogin (String bucket, FriendInfo info)
    {
        MsgFriendLogin msg = new MsgFriendLogin(bucket, info);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(FriendServer.address, raw);
        //Debug.info("sendFriendLogin", bucket, Json.toJson(info));
    }

    public static void sendFriendUpdate (FriendInfo info)
    {
        MsgFriendUpdateInfo msg = new MsgFriendUpdateInfo(info);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(FriendServer.address, raw);
    }

    public static void sendAirshipAdd (NewsBoardItem item)
    {
        if (NewsBoardServer.airship == null)
        {
            MsgAirShipAdd msg = new MsgAirShipAdd(item);
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
        }
        else
        {
            NewsBoardServer.airship.add(item);
        }
    }

    public static void sendAirshipDelete (int userId, int idSlot)
    {
        if (NewsBoardServer.airship == null)
        {
            MsgAirShipDelete msg = new MsgAirShipDelete(userId, idSlot);
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
        }
        else
        {
            NewsBoardServer.airship.delete(userId, idSlot);
        }
    }

    public static void kickUser (String host, int port, int userId, byte code)
    {
        MsgKickUser msg = new MsgKickUser(userId, code);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(Address.getInetSocketAddress(host, port), raw);
    }

    public static void notifyMail (String host, int port, int userId)
    {
        MsgNotifyMail msg = new MsgNotifyMail(userId);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(Address.getInetSocketAddress(host, port), raw);
    }

    public static void notifyRepairMachine (int friendId, byte floor)
    {
        UserControl userControl = UserControl.get(friendId);
        MsgNotifyRepairMachine msg = new MsgNotifyRepairMachine(friendId, floor);

        if (userControl == null)
        {
            UserOnline online = UserOnline.get(friendId);
            if (online == null)
                return;

            String raw = msg.encode();
            EnvConfig.udpAdmin.write(Address.getInetSocketAddress(online.getPrivateHost(), online.getPortUdp()), raw);
        }
        else
        {
            userControl.handleSystemCommand(CmdDefine.NOTIFY_REPAIR_MACHINE, msg);
        }
    }

    public static void notifyLocalPayment (String host, int port, int userId, boolean enable)
    {
        MsgNotifyLocalPayment msg = new MsgNotifyLocalPayment(userId, enable);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(Address.getInetSocketAddress(host, port), raw);
    }

    public static void sendChatUser (int toUser, BaseMessage baseMessage)
    {
        MsgSendChatUser msg = new MsgSendChatUser(toUser, baseMessage.getCmd(), baseMessage.getError(), baseMessage.createData());
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(ChatExtension.address, raw);
    }

    public static void sendChatGuild (int toGuild, BaseMessage baseMessage, Set<Integer> blacklist)
    {
        MsgSendChatGuild msg = new MsgSendChatGuild(toGuild, baseMessage.getCmd(), baseMessage.getError(), baseMessage.createData(), blacklist);
        String raw = msg.encode();

        EnvConfig.udpAdmin.write(ChatExtension.address, raw);
    }
}
