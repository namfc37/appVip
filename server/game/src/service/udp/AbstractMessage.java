package service.udp;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import util.Json;

import java.net.InetAddress;

/**
 * Created by CPU10399-local on 12/25/2015.
 */
public abstract class AbstractMessage
{
    final static int HASH_KEY = 234554393;
    final static int EXPIRE   = 1000;

    public final static int CMD_UNKNOWN               = 0;
    public final static int CMD_PRIVATE_SHOP_ADD      = 1;
    public final static int CMD_PRIVATE_SHOP_DELETE   = 2;
    public final static int CMD_AIRSHIP_ADD           = 3;
    public final static int CMD_AIRSHIP_DELETE        = 4;
    public final static int CMD_KICK_USER             = 5;
    public final static int CMD_WORKER_INFO           = 6;
    public final static int CMD_NOTIFY_MAIL           = 7;
    public final static int CMD_PRIVATE_SHOP_BUY      = 8;
    public final static int CMD_AIRSHIP_PACK          = 9;
    public final static int CMD_FRIEND_NOTIFY_ADD     = 10;
    public final static int CMD_FRIEND_NOTIFY_REMOVE  = 11;
    public final static int CMD_FRIEND_NOTIFY_REQUEST = 12;
    public final static int CMD_FRIEND_LOGIN          = 13;
    public final static int CMD_NOTIFY_REPAIR_MACHINE = 14;
    public final static int CMD_NOTIFY_LOCAL_PAYMENT  = 15;
    public final static int CMD_FRIEND_UPDATE_INFO    = 16;
    public final static int CMD_SEND_CHAT_USER        = 17;
    public final static int CMD_SEND_CHAT_GUILD       = 18;
    public final static int CMD_UPDATE_GUILD_INFO     = 19;
    public final static int CMD_UPDATE_GUILD_LEAGUE   = 20;
    public final static int CMD_DELETE_GUILD_INFO     = 21;
    public final static int NUM_CMD                   = 22;

    int cmd;
    int hash;

    public long time;

    transient InetAddress sender;

    int hash ()
    {
        //return Objects.hash(HASH_KEY, time, cmd);
        return 0;
    }
    public abstract void handle ();



    public static AbstractMessage decode (String raw, InetAddress sender) throws Exception
    {
        JsonElement e = Json.parse(raw);
        if (!e.isJsonObject())
            return null;
        JsonObject o = e.getAsJsonObject();
        int cmd = o.get("cmd").getAsInt();


        AbstractMessage msg = null;
        switch (cmd)
        {
            case CMD_PRIVATE_SHOP_ADD:
                msg = Json.fromJson(o, MsgPrivateShopAdd.class);
                break;
            case CMD_PRIVATE_SHOP_DELETE:
                msg = Json.fromJson(o, MsgPrivateShopDelete.class);
                break;
            case CMD_AIRSHIP_ADD:
                msg = Json.fromJson(o, MsgAirShipAdd.class);
                break;
            case CMD_AIRSHIP_DELETE:
                msg = Json.fromJson(o, MsgAirShipDelete.class);
                break;
            case CMD_KICK_USER:
                msg = Json.fromJson(o, MsgKickUser.class);
                break;
            case CMD_WORKER_INFO:
                msg = Json.fromJson(o, MsgWorkerInfo.class);
                break;
            case CMD_NOTIFY_MAIL:
                msg = Json.fromJson(o, MsgNotifyMail.class);
                break;
            case CMD_AIRSHIP_PACK:
                msg = Json.fromJson(o, MsgAirShipPack.class);
                break;
            case CMD_PRIVATE_SHOP_BUY:
                msg = Json.fromJson(o, MsgPrivateShopBuy.class);
                break;
            case CMD_FRIEND_NOTIFY_ADD:
                msg = Json.fromJson(o, MsgFriendNotifyAdd.class);
                break;
            case CMD_FRIEND_NOTIFY_REMOVE:
                msg = Json.fromJson(o, MsgFriendNotifyRemove.class);
                break;
            case CMD_FRIEND_NOTIFY_REQUEST:
                msg = Json.fromJson(o, MsgFriendNotifyRequest.class);
                break;
            case CMD_FRIEND_LOGIN:
                msg = Json.fromJson(o, MsgFriendLogin.class);
                break;
            case CMD_NOTIFY_REPAIR_MACHINE:
                msg = Json.fromJson(o, MsgNotifyRepairMachine.class);
                break;
            case CMD_NOTIFY_LOCAL_PAYMENT:
                msg = Json.fromJson(o, MsgNotifyLocalPayment.class);
                break;
            case CMD_FRIEND_UPDATE_INFO:
                msg = Json.fromJson(o, MsgFriendUpdateInfo.class);
                break;
            case CMD_SEND_CHAT_USER:
                msg = Json.fromJson(o, MsgSendChatUser.class);
                break;
            case CMD_SEND_CHAT_GUILD:
                msg = Json.fromJson(o, MsgSendChatGuild.class);
                break;
            case CMD_UPDATE_GUILD_INFO:
                msg = Json.fromJson(o, MsgUpdateGuildInfo.class);
                break;
            case CMD_UPDATE_GUILD_LEAGUE:
                msg = Json.fromJson(o, MsgUpdateGuildLeague.class);
                break;
            case CMD_DELETE_GUILD_INFO:
                msg = Json.fromJson(o, MsgDeleteGuildInfo.class);
                break;
        }

        if (msg != null && msg.verify())
        {
            msg.sender = sender;
            return msg;
        }
        return null;
    }

    AbstractMessage (int cmd)
    {
        this.cmd = cmd;
        time = System.currentTimeMillis();
    }

    public String encode ()
    {
        hash = hash();
        return Json.toJson(this);
    }

    public boolean verify ()
    {
        return (time + EXPIRE >= System.currentTimeMillis()) && (hash == hash());
    }

    public int getCmd ()
    {
        return cmd;
    }

    public long getTime ()
    {
        return time;
    }

    public int getHash ()
    {
        return hash;
    }

    public InetAddress getSender ()
    {
        return sender;
    }
}
