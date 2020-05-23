package service.admin;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
import com.google.common.primitives.Ints;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import data.*;
import data.ranking.RankingBoard;
import data.ranking.RankingManager;
import extension.EnvConfig;
import io.netty.buffer.Unpooled;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.util.CharsetUtil;
import model.*;
import model.key.AbstractInfoKey;
import model.key.InfoKeyData;
import model.key.InfoKeyUser;
import model.mail.MailBox;
import model.mail.MailManager;
import model.object.QuestBook;
import model.object.QuestMission;
import model.object.VIP;
import model.system.BalanceInfo;
import payment.billing.Billing;
import payment.billing.PurchaseInfo;
import service.UdpHandler;
import service.balance.BalanceServer;
import util.Address;
import util.Database;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.giftcode.GenerateGiftCode;
import util.io.http.HttpUtils;
import util.memcached.AbstractDbKeyValue;
import util.memcached.BucketManager;
import util.memcached.CasValue;
import util.metric.MetricLog;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class AdminHandler
{
    private static final String KEY    = "(@dm1nS#cr3tKey!)";
    private static final long   EXPIRE = 5 * Time.MILLISECOND_IN_MINUTE;

    public static final HashFunction hashFunction = Hashing.sha256();

    static void writeAndClose (HttpServerHandler httpHandler, String error)
    {
        writeAndClose(httpHandler, error, null);
    }

    static void writeAndClose (HttpServerHandler httpHandler, String error, JsonElement data)
    {
        JsonObject r = new JsonObject();
        r.addProperty("result", error == null ? "success" : error);
        r.addProperty("time", Time.getUnixTime());
        if (data != null)
            r.add("data", data);

        String response = r.toString();
        //Debug.trace(response);
        httpHandler.writeHttpResponseAndClose(HttpResponseStatus.OK, Unpooled.copiedBuffer(response, CharsetUtil.UTF_8), "text/plain; charset=UTF-8");
    }

    static void handle (HttpServerHandler httpHandler)
    {
        try
        {
            if (httpHandler.content == null)
            {
                writeAndClose(httpHandler, "Null content");
                return;
            }
            Debug.info("AdminHandler", httpHandler.path, httpHandler.content);
            JsonElement eContent = Json.parse(httpHandler.content);

            if (!eContent.isJsonObject())
            {
                writeAndClose(httpHandler, "Invalid content");
                return;
            }
            JsonObject content = eContent.getAsJsonObject();

            String admin = getString(content, "admin");
            if (admin == null)
            {
                writeAndClose(httpHandler, "Missing param admin");
                return;
            }

            long time = getLong(content, "time");
            if (time <= 0)
            {
                writeAndClose(httpHandler, "Missing param time");
                return;
            }

            if (time + EXPIRE < Time.getTimeMillis())
            {
                writeAndClose(httpHandler, "Expired request");
                return;
            }

            String hash = getString(content, "hash");
            if (hash == null)
            {
                writeAndClose(httpHandler, "Missing param hash");
                return;
            }

            JsonElement eData = content.get("data");
            if (eData == null || eData.isJsonPrimitive() == false)
            {
                writeAndClose(httpHandler, "Missing param data");
                return;
            }
            String sData = eData.getAsString();
            JsonObject data = Json.parse(sData).getAsJsonObject();

            StringBuilder sb = new StringBuilder()
                    .append(KEY)
                    .append(admin)
                    .append(time)
                    .append(sData);

            String calcHash = hashFunction.hashString(sb.toString(), StandardCharsets.UTF_8).toString();
//            Debug.info(sb);
//            Debug.info(hash);
//            Debug.info(calcHash);

            if (!calcHash.equalsIgnoreCase(hash))
            {
                writeAndClose(httpHandler, "Wrong hash");
                return;
            }

            InfoKeyData key = InfoKeyData.ADMIN_TRANSACTION;

            if (!key.db().add(key.keyName(time), httpHandler.content, key.expire()))
            {
                writeAndClose(httpHandler, "Duplicate command");
                return;
            }

            switch (httpHandler.path)
            {
                case "/banUser":
                    banUser(httpHandler, admin, data);
                    break;
                case "/unbanUser":
                    unbanUser(httpHandler, admin, data);
                    break;
                case "/addSystemMail":
                    addSystemMail(httpHandler, admin, data);
                    break;
                case "/addPrivateMail":
                    addPrivateMail(httpHandler, admin, data);
                    break;
                case "/addMultiPrivateMail":
                    addMultiPrivateMail(httpHandler, admin, data);
                    break;
                case "/getMailManager":
                    getMailManager(httpHandler, admin, data);
                    break;
                case "/setUserGame":
                    setUserGame(httpHandler, admin, data);
                    break;
                case "/setUserAirship":
                    setUserAirship(httpHandler, admin, data);
                    break;
                case "/updateUserCoin":
                    updateUserCoin(httpHandler, admin, data);
                    break;
                case "/mapDeviceId":
                    mapDeviceId(httpHandler, admin, data);
                    break;
                case "/getUserData":
                    getUserData(httpHandler, admin, data);
                    break;
                case "/deleteUserData":
                    deleteUserData(httpHandler, admin, data);
                    break;
                case "/setActiveGroup":
                    setActiveGroup(httpHandler, admin, data);
                    break;
                case "/setMaintenance":
                    setMaintenance(httpHandler, admin, data);
                    break;
                case "/resetMaintenance":
                    resetMaintenance(httpHandler, admin, data);
                    break;
                case "/addGiftCode":
                    addGiftCode(httpHandler, admin, data);
                    break;
                case "/genGiftCode":
                    genGiftCode(httpHandler, admin, data);
                    break;
                case "/getKeyRanking":
                    getKeyRanking(httpHandler, admin, data);
                    break;
                case "/getTopRanking":
                    getTopRanking(httpHandler, admin, data);
                    break;
                case "/addTopReward":
                    addTopReward(httpHandler, admin, data);
                    break;
                case "/recallItem":
                    recallItem(httpHandler, admin, data);
                    break;
                case "/getKey":
                    getKey(httpHandler, admin, data);
                    break;
                default:
                    writeAndClose(httpHandler, "Not support request");
            }
        }
        catch (Exception e)
        {
            writeAndClose(httpHandler, "Exception: " + e.getMessage());
            MetricLog.exception(e);
        }
    }

    private static JsonObject getObject (JsonObject data, String key)
    {
        JsonElement e = data.get(key);
        if (e == null)
            return null;
        if (!e.isJsonObject())
            return null;
        return e.getAsJsonObject();
    }

    private static String getString (JsonObject data, String key)
    {
        JsonElement e = data.get(key);
        if (e == null || !e.isJsonPrimitive())
            return null;
        JsonPrimitive p = e.getAsJsonPrimitive();
        if (!p.isString())
            return null;
        String s = p.getAsString().trim();
        if (s.isEmpty())
            return null;
        return s;
    }

    private static int getInt (JsonObject data, String key)
    {
        JsonElement e = data.get(key);
        if (e == null || !e.isJsonPrimitive())
            return -1;
        JsonPrimitive p = e.getAsJsonPrimitive();
        String s = p.getAsString();
        if (s.isEmpty())
            return -1;
        return Integer.parseInt(s);
    }

    private static long getLong (JsonObject data, String key)
    {
        JsonElement e = data.get(key);
        if (e == null || !e.isJsonPrimitive())
            return -1;
        JsonPrimitive p = e.getAsJsonPrimitive();
        String s = p.getAsString();
        if (s.isEmpty())
            return -1;
        return Long.parseLong(s);
    }

    private static boolean getBoolean (JsonObject data, String key)
    {
        JsonElement e = data.get(key);
        if (e == null || !e.isJsonPrimitive())
            return false;
        JsonPrimitive p = e.getAsJsonPrimitive();
        return p.getAsBoolean();
    }

    private final static MapItem INVALID_ITEM = new MapItem(0).toUnmodifiableMapItem();

    private static MapItem getItems (JsonObject data, String key)
    {
        JsonElement e = data.get(key);
        if (e == null || !e.isJsonObject())
            return null;
        JsonObject o = e.getAsJsonObject();
        if (o.size() == 0)
            return null;
        MapItem map = new MapItem();
        for (Map.Entry<String, JsonElement> entry : o.entrySet())
        {
            ItemInfo info = ConstInfo.getItemInfo(entry.getKey());
            if (info == null)
                return INVALID_ITEM;
            JsonPrimitive p = entry.getValue().getAsJsonPrimitive();
            String s = p.getAsString();
            if (s.isEmpty())
                return INVALID_ITEM;
            int num = Integer.parseInt(s);
            if (num <= 0)
                return INVALID_ITEM;
            map.put(entry.getKey(), num);
        }

        return map;
    }

    private static void banUser (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        int duration = getInt(data, "duration");
        if (duration <= 0)
        {
            writeAndClose(httpHandler, "Missing param duration");
            return;
        }

        UserBan.set(userId, admin, reason, Time.getUnixTime() + duration);

        UserOnline online = UserOnline.get(userId);
        if (online != null)
            UdpHandler.kickUser(online.getPrivateHost(), online.getPortUdp(), userId, ErrorConst.BANNED);

        JsonObject response = new JsonObject();
        response.addProperty("userId", userId);
        response.addProperty("reason", reason);
        response.addProperty("duration", duration);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("banUser",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0,
                     duration);
    }

    private static void unbanUser (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        if (!UserBan.delete(userId))
            writeAndClose(httpHandler, "Delete ban fail");

        JsonObject response = new JsonObject();
        response.addProperty("userId", userId);
        response.addProperty("reason", reason);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("unbanUser",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0);
    }

    private static void addSystemMail (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int type = getInt(data, "type");
        if (type < 0)
        {
            writeAndClose(httpHandler, "Missing param type");
            return;
        }

        int uid = getInt(data, "uid");
        if (uid < 0)
        {
            writeAndClose(httpHandler, "Missing param uid");
            return;
        }

        String title = getString(data, "title");
        if (title == null)
        {
            writeAndClose(httpHandler, "Missing param title");
            return;
        }

        String content = getString(data, "content");
        if (content == null)
        {
            writeAndClose(httpHandler, "Missing param content");
            return;
        }

        int timeStart = getInt(data, "timeStart");
        if (timeStart <= 0)
        {
            writeAndClose(httpHandler, "Missing param timeStart");
            return;
        }

        int timeFinish = getInt(data, "timeFinish");
        if (timeFinish <= 0)
        {
            writeAndClose(httpHandler, "Missing param timeFinish");
            return;
        }

        MapItem items = getItems(data, "items");
        if (items == INVALID_ITEM)
        {
            writeAndClose(httpHandler, "Invalid items");
            return;
        }

        CasValue<MailManager> cas = MailManager.gets();
        if (cas == null)
        {
            writeAndClose(httpHandler, "Gets fail");
            return;
        }
        MailManager m = cas.object;
        String result = m.add(type, uid, title, content, timeStart, timeFinish, items);
        if (result != null)
        {
            writeAndClose(httpHandler, result);
            return;
        }

        if (!MailManager.cas(cas.cas, m))
        {
            writeAndClose(httpHandler, "CAS fail");
            return;
        }

        JsonObject response = new JsonObject();
        response.addProperty("type", type);
        response.addProperty("uid", uid);
        response.addProperty("title", title);
        response.addProperty("content", content);
        response.addProperty("timeStart", timeStart);
        response.addProperty("timeFinish", timeFinish);
        response.add("items", Json.toJsonTree(items));

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("addSystemMail",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     0,
                     0,
                     type,
                     uid,
                     title,
                     MetricLog.replaceNewLine(content, "<br>"),
                     MetricLog.toString(items),
                     timeStart,
                     timeFinish
                    );
    }

    private static void addPrivateMail (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        int type = getInt(data, "type");
        if (type < 0)
        {
            writeAndClose(httpHandler, "Missing param type");
            return;
        }

        String title = getString(data, "title");
        if (title == null)
        {
            writeAndClose(httpHandler, "Missing param title");
            return;
        }

        String content = getString(data, "content");
        if (content == null)
        {
            writeAndClose(httpHandler, "Missing param content");
            return;
        }

        MapItem items = getItems(data, "items");
        if (items == INVALID_ITEM)
        {
            writeAndClose(httpHandler, "Invalid items");
            return;
        }

        UserBrief userBrief = UserBrief.get(userId);
        if (userBrief == null)
        {
            writeAndClose(httpHandler, "User is not found");
            return;
        }

        CasValue<MailBox> cas = MailBox.gets(userBrief.getBucketId(), userId);
        if (cas == null)
        {
            writeAndClose(httpHandler, "Gets fail");
            return;
        }
        MailBox mailBox = cas.object;
        MailBox.Mail mail = mailBox.addMailPrivate(type, title, content, items);

        if (!MailBox.cas(userBrief.getBucketId(), userId, cas.cas, mailBox))
        {
            writeAndClose(httpHandler, "CAS fail");
            return;
        }

        UserOnline online = UserOnline.get(userId);
        if (online != null)
            UdpHandler.notifyMail(online.getPrivateHost(), online.getPortUdp(), userId);

        JsonObject response = new JsonObject();
        response.addProperty("userId", userId);
        response.addProperty("reason", reason);
        response.addProperty("type", type);
        response.addProperty("title", title);
        response.addProperty("content", content);
        response.add("items", Json.toJsonTree(items));

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("addPrivateMail",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0,
                     type,
                     mail.getUid(),
                     title,
                     MetricLog.replaceNewLine(content, "<br>"),
                     MetricLog.toString(items)
                    );
    }

    private static void addMultiPrivateMail (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        String info = getString(data, "info");
        if (info == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param info");
            return;
        }

        AddMultiPrivateMail.RequestInfo request = Json.fromJson(info, AddMultiPrivateMail.RequestInfo.class);
        AddMultiPrivateMail.Result result = AddMultiPrivateMail.handleRequest(admin, httpHandler.remoteAddress, request);

        if (result.errorMsg == null)
        {
            Set<Integer> setUserId = new HashSet<>();
            if (result.success.setUserId != null)
                setUserId.addAll(result.success.setUserId);
            if (result.success.listInfo != null)
            {
                for (AddMultiPrivateMail.MailInfo m : result.success.listInfo)
                    setUserId.add(m.userId);
            }
            for (int userId : setUserId)
            {
                UserOnline online = UserOnline.get(userId);
                if (online != null)
                    UdpHandler.notifyMail(online.getPrivateHost(), online.getPortUdp(), userId);
            }
        }

        JsonObject response = new JsonObject();
        response.addProperty("reason", reason);
        response.add("report", Json.toJsonTree(result));

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("AddMultiPrivateMail",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     0,
                     0,
                     0,
                     0,
                     "",
                     "",
                     "",
                     result.errorMsg
                    );
    }

    private static void getMailManager (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        MailManager m = MailManager.get();
        if (m == null)
        {
            writeAndClose(httpHandler, "Get fail");
            return;
        }

        writeAndClose(httpHandler, null, Json.toJsonTree(m));

        Debug.info("getMailManager");
    }

    private static void setUserGame (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        UserBrief brief = UserBrief.get(userId);
        if (brief == null)
        {
            writeAndClose(httpHandler, "Invalid userId");
            return;
        }

        UserOnline online = UserOnline.get(userId);
        if (online != null)
        {
            writeAndClose(httpHandler, "User is online");
            return;
        }

        CasValue<UserGame> cas = UserGame.gets(brief.getBucketId(), userId, null);
        if (cas == null)
        {
            writeAndClose(httpHandler, "Gets fail");
            return;
        }
        UserGame game = cas.object;
        String checkResult;

        int level = getInt(data, "level");
        if (level > 0)
        {
            game.gmSetLevelExp((short) level, 0);
        }

        long exp = getLong(data, "exp");
        if (exp > 0)
        {
            long maxExp = UserLevelInfo.EXP(game.getLevel());
            exp = Math.min(maxExp - 1, exp);

            game.gmSetLevelExp(game.getLevel(), exp);
        }

        boolean resetDaily = getBoolean(data, "resetDaily");
        if (resetDaily)
            game.gmResetDaily();

        boolean resetOffer = getBoolean(data, "resetOffer");
        if (resetOffer)
            game.gmResetOffer();

        boolean resetConvertInfo = getBoolean(data, "resetConvertInfo");
        if (resetConvertInfo)
            game.setConvertInfo(null);

        MapItem addItems = getItems(data, "addItems");
        if (addItems != null)
        {
            if (addItems == INVALID_ITEM)
            {
                writeAndClose(httpHandler, "Invalid addItems");
                return;
            }

            checkResult = checkItems(addItems);
            if (checkResult != null)
            {
                writeAndClose(httpHandler, checkResult);
                return;
            }
            game.addItem((short) -1, "setUserGame", addItems);
        }

        MapItem removeItems = getItems(data, "removeItems");
        if (removeItems != null)
        {
            if (removeItems == INVALID_ITEM)
            {
                writeAndClose(httpHandler, "Invalid removeItems");
                return;
            }

            checkResult = checkItems(removeItems);
            if (checkResult != null)
            {
                writeAndClose(httpHandler, checkResult);
                return;
            }
            byte result = game.removeItem((short) -1, "setUserGame", removeItems);
            if (result != ErrorConst.SUCCESS)
            {
                writeAndClose(httpHandler, "Remove Item fail");
                return;
            }
        }

        int activeLocal = getInt(data, "activeLocal");
        if (activeLocal == 0)
            game.getPayment().setActiveLocalPayment(false);
        else if (activeLocal > 0)
            game.getPayment().setActiveLocalPayment(true);

        int useTestPayment = getInt(data, "useTestPayment");
        if (useTestPayment == 0)
            game.getPayment().setUseTestPayment(false);
        else if (useTestPayment > 0)
            game.getPayment().setUseTestPayment(true);

        QuestBook qb = game.getQuestBook();
        String addQuest = getString(data, "addQuest");
        String addQuestResult = null;
        if (qb != null && addQuest != null)
            addQuestResult = qb.gmAdd(game, addQuest);

        String removeQuest = getString(data, "removeQuest");
        String removeQuestResult = null;
        if (qb != null && removeQuest != null)
            removeQuestResult = qb.gmRemove(removeQuest);

        String editQuest = getString(data, "editQuest");
        String editQuestResult = null;
        if (qb != null && editQuest != null)
            editQuestResult = qb.gmChange(editQuest);

        QuestMission qm = game.getQuestMission();
        int missionId = getInt(data, "missionId");
        boolean missionResult = false;
        if (qm != null && missionId > 0)
            missionResult = qm.gmChange(missionId);

        String vip = getString(data, "vip");
        if (vip != null)
        {
            VIP oVip = game.getVIP();
            if (oVip == null || oVip.setCurrentActive(vip) == false)
                vip = null;
        }


        if (!UserGame.cas(brief.getBucketId(), userId, cas.cas, game))
        {
            writeAndClose(httpHandler, "CAS fail");
            return;
        }

        JsonObject response = new JsonObject();
        response.addProperty("userId", userId);
        response.addProperty("reason", reason);
        response.addProperty("level", level);
        response.addProperty("exp", exp);
        response.addProperty("resetDaily", resetDaily);
        response.addProperty("resetOffer", resetOffer);
        response.addProperty("resetConvertInfo", resetConvertInfo);
        response.addProperty("activeLocal", activeLocal);
        response.addProperty("useTestPayment", useTestPayment);
        response.addProperty("vip", vip);
        response.add("addItems", Json.toJsonTree(addItems));
        response.add("removeItems", Json.toJsonTree(removeItems));

        if (addQuestResult != null)
            response.addProperty("addQuest", addQuestResult);

        if (removeQuestResult != null)
            response.addProperty("removeQuest", removeQuestResult);

        if (editQuestResult != null)
            response.addProperty("editQuest", editQuestResult);

        if (missionResult)
            response.addProperty("missionId", missionId);
        else
            missionId = -1;

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("setUserGame",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0,
                     level,
                     exp,
                     MetricLog.toString(addItems),
                     MetricLog.toString(removeItems),
                     resetDaily,
                     resetOffer,
                     resetConvertInfo,
                     addQuest,
                     removeQuest,
                     editQuest,
                     activeLocal,
                     vip,
                     missionId > 0 ? missionId : ""
                    );
    }

    private static String checkItems (MapItem items)
    {
        if (items == null)
            return "Null items";
        if (items.contains(ItemId.COIN))
            return "Contains COIN in removeItems";
        if (items.contains(ItemId.EXP))
            return "Contains COIN in removeItems";
        for (MapItem.Entry e : items)
        {
            if (e.value() <= 0)
                return "Invalid num item: " + e.value();
            ItemInfo info = ConstInfo.getItemInfo(e.key());
            if (info == null)
                return "Null item info: " + e.key();
            if (info.ID() != ItemId.GOLD && info.ID() != ItemId.REPU && info.STOCK() < 0)
                return "Invalid item: " + e.key();
        }
        return null;
    }

    private static void updateUserCoin (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        UserBrief brief = UserBrief.get(userId);
        if (brief == null)
        {
            writeAndClose(httpHandler, "Invalid userId");
            return;
        }

        UserOnline online = UserOnline.get(userId);
        if (online != null)
        {
            writeAndClose(httpHandler, "User is online");
            return;
        }

        int coin = getInt(data, "coin");
        if (coin == 0)
        {
            writeAndClose(httpHandler, "Missing param coin");
            return;
        }

        long before = Billing.inquiryBalance(brief);
        if (before < 0)
        {
            writeAndClose(httpHandler, "Inquiry balance fail");
            return;
        }

        String transaction = admin + "_" + System.currentTimeMillis();
        long after;

        if (coin > 0)
        {
            after = Billing.promoCompensation(brief, Math.abs(coin), transaction, "updateUserCoin", reason, "", -1);
            if (after < 0)
            {
                writeAndClose(httpHandler, "Add coin fail");
                return;
            }
        }
        else
        {
            after = Billing.purchase(brief, Math.abs(coin), PurchaseInfo.gmAction("updateUserCoin"), transaction, reason, "", -1);
            if (after < 0)
            {
                writeAndClose(httpHandler, "Remove coin fail");
                return;
            }
        }

        JsonObject response = new JsonObject();
        response.addProperty("before", before);
        response.addProperty("coin", coin);
        response.addProperty("after", after);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("updateUserCoin",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0,
                     before,
                     coin,
                     after
                    );
    }

    private static void mapDeviceId (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        int toUserId = getInt(data, "toUserId");
        if (toUserId < 0)
        {
            writeAndClose(httpHandler, "Missing param toUserId");
            return;
        }

        UserBrief userBrief = UserBrief.get(userId);
        if (userBrief == null)
        {
            writeAndClose(httpHandler, "User is not found");
            return;
        }

        if (toUserId > 0)
            MapDeviceId.set(userBrief.deviceId, toUserId);
        else
            MapDeviceId.delete(userBrief.deviceId);

        JsonObject response = new JsonObject();
        response.addProperty("userId", userId);
        response.addProperty("toUserId", toUserId);
        response.addProperty("deviceId", userBrief.deviceId);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("mapDeviceId",
                     admin,
                     httpHandler.remoteAddress,
                     "",
                     userId,
                     0,
                     toUserId,
                     userBrief.deviceId
                    );
    }

    private static byte[] zipUserData (UserBrief userBrief)
    {
        byte[] data = null;
        try
        {
            int userId = userBrief.getUserId();
            AbstractDbKeyValue dbUser = BucketManager.get(userBrief.getBucketId());
            ByteArrayOutputStream bao = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(bao);
            ZipEntry ze;
            String bucket, folder = "";

            for (Map.Entry<AbstractInfoKey.BUCKET, List<InfoKeyUser>> entry : InfoKeyUser.mapBucket.entrySet())
            {
                List<String> keys = new ArrayList<>();
                Map<String, Object> mapValue;
                for (InfoKeyUser info : entry.getValue())
                    keys.add(info.keyName(userId));
                switch (entry.getKey())
                {
                    case CACHE:
                        bucket = Database.CACHE;
                        mapValue = Database.cache().getMulti(keys);
                        break;
                    case INDEX:
                        bucket = Database.INDEX;
                        mapValue = Database.index().getMulti(keys);
                        break;
                    default:
                        bucket = userBrief.getBucketId();
                        mapValue = dbUser.getMulti(keys);
                }

                folder = bucket + File.separatorChar;
                ze = new ZipEntry(folder);
                zos.putNextEntry(ze);

                for (InfoKeyUser info : entry.getValue())
                {
                    Object raw = mapValue.get(info.keyName(userId));
                    if (raw == null)
                        continue;
                    String str = String.valueOf(raw);

                    ze = new ZipEntry(folder + info.keyName(userId));
                    zos.putNextEntry(ze);
                    zos.write(str.getBytes(StandardCharsets.UTF_8));
                    zos.closeEntry();

                    ze = new ZipEntry(folder + info.keyName(userId) + ".string");
                    zos.putNextEntry(ze);
                    zos.write("".getBytes(StandardCharsets.UTF_8));
                    zos.closeEntry();
                }

                zos.closeEntry();
            }
            zos.close();
            data = bao.toByteArray();
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userBrief.getUserId());
        }
        return data;
    }

    private static JsonObject jsonUserData (UserBrief userBrief)
    {
        JsonObject response = new JsonObject();
        int userId = userBrief.getUserId();
        AbstractDbKeyValue dbUser = BucketManager.get(userBrief.getBucketId());

        for (Map.Entry<AbstractInfoKey.BUCKET, List<InfoKeyUser>> entry : InfoKeyUser.mapBucket.entrySet())
        {
            List<String> keys = new ArrayList<>();
            Map<String, Object> mapValue;
            for (InfoKeyUser info : entry.getValue())
                keys.add(info.keyName(userId));
            switch (entry.getKey())
            {
                case CACHE:
                    mapValue = Database.cache().getMulti(keys);
                    break;
                case INDEX:
                    mapValue = Database.index().getMulti(keys);
                    break;
                default:
                    mapValue = dbUser.getMulti(keys);
            }

            for (InfoKeyUser info : entry.getValue())
            {
                {
                    String keyname = info.keyName(userId);
                    Object raw = mapValue.get(keyname);
                    if (raw == null)
                    {

                        response.add(info.getSuffix(), null);
                        continue;
                    }
                    String str = String.valueOf(raw);

                    if (str.isEmpty())
                    {
                        response.addProperty(info.getSuffix(), "");
                        continue;
                    }
                    if (keyname.equals(InfoKeyUser.BILLING_PROCESSING.keyName(userId)))
                    {
                        JsonArray a = new JsonArray();
                        for (String line : str.split("\n"))
                        {
                            line = line.trim();
                            if (line.isEmpty())
                                continue;
                            a.add(Json.parse(line));
                        }
                        response.add(info.getSuffix(), a);
                        continue;
                    }
                    if (str.charAt(0) == '[' || str.charAt(0) == '{')
                    {
                        JsonElement e = Json.parse(str);
                        response.add(info.getSuffix(), e);
                        continue;
                    }
                    response.addProperty(info.getSuffix(), str);
                }
            }
        }
        return response;
    }

    private static void getUserData (HttpServerHandler httpHandler, String admin, JsonObject data) throws Exception
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        boolean useFile = getBoolean(data, "useFile");

        UserBrief userBrief = UserBrief.get(userId);
        if (userBrief == null)
        {
            writeAndClose(httpHandler, "User is not found");
            return;
        }

        if (useFile)
            HttpUtils.writeBinAndClose(httpHandler.ctx, zipUserData(userBrief));
        else
            writeAndClose(httpHandler, null, jsonUserData(userBrief));
    }

    private static void deleteUserData (HttpServerHandler httpHandler, String admin, JsonObject data) throws Exception
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        UserBrief userBrief = UserBrief.get(userId);
        if (userBrief == null)
        {
            writeAndClose(httpHandler, "User is not found");
            return;
        }

        byte[] zip = zipUserData(userBrief);
        String sPath = "./backup/user/";
        int count = 0;
        String sUserId = Integer.toString(userId);
        for (char c : sUserId.toCharArray())
        {
            sPath += c;
            count++;
            if (count == 3)
            {
                count = 0;
                sPath += '/';
            }
        }
        Path path = Paths.get(sPath);
        if (!Files.exists(path))
            Files.createDirectories(Paths.get(sPath));
        if (!sPath.endsWith("/"))
            sPath += '/';
        sPath += sUserId + "_" + Time.timeBackup() + ".zip";
        Files.write(Paths.get(sPath), zip);

        String keyName;
        JsonObject response = new JsonObject();
        Map<String, Boolean> results = new HashMap<>();
        AbstractDbKeyValue db = BucketManager.get(userBrief.getBucketId());

        InfoKeyData infoKeyData = InfoKeyData.MAP_DEVICE_ID;
        keyName = infoKeyData.keyName(userBrief.deviceId);
        results.put(keyName, infoKeyData.db().delete(keyName));

        infoKeyData = InfoKeyData.MAP_USER_NAME;
        keyName = infoKeyData.keyName(userBrief.getUsername());
        results.put(keyName, infoKeyData.db().delete(keyName));

        for (Map.Entry<AbstractInfoKey.BUCKET, List<InfoKeyUser>> entry : InfoKeyUser.mapBucket.entrySet())
        {
            for (InfoKeyUser info : entry.getValue())
            {
                keyName = info.keyName(userId);
                switch (entry.getKey())
                {
                    case CACHE:
                        results.put(keyName, Database.cache().delete(keyName));
                        break;
                    case INDEX:
                        results.put(keyName, Database.index().delete(keyName));
                        break;
                    default:
                        results.put(keyName, db.delete(keyName));
                }
            }
        }

        NumUser.decrement();

        MetricLog.gm("deleteUserData",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0,
                     Json.toJson(results)
                    );

        writeAndClose(httpHandler, null, response);
    }

    private static void setUserAirship (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int userId = getInt(data, "userId");
        if (userId <= 0)
        {
            writeAndClose(httpHandler, "Missing param userId");
            return;
        }

        UserBrief brief = UserBrief.get(userId);
        if (brief == null)
        {
            writeAndClose(httpHandler, "Invalid userId");
            return;
        }

        UserOnline online = UserOnline.get(userId);
        if (online != null)
        {
            writeAndClose(httpHandler, "User is online");
            return;
        }

        CasValue<AirShip> cas = AirShip.gets(brief.getBucketId(), userId);
        if (cas == null)
        {
            writeAndClose(httpHandler, "Gets fail");
            return;
        }
        AirShip airShip = cas.object;

        int numRequest = getInt(data, "numRequest");
        if (numRequest >= 0)
        {
            airShip.gmSetNumRequest(numRequest);
        }

        int timeWait = getInt(data, "timeWait");
        if (timeWait > 0)
        {
            airShip.gmSetTimeFinish(Time.getUnixTime() + timeWait);
        }

        if (!AirShip.cas(brief.getBucketId(), userId, cas.cas, airShip))
        {
            writeAndClose(httpHandler, "CAS fail");
            return;
        }

        JsonObject response = new JsonObject();
        response.addProperty("userId", userId);
        response.addProperty("reason", reason);
        response.addProperty("numRequest", numRequest);
        response.addProperty("timeWait", timeWait);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("setUserGame",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     userId,
                     0,
                     numRequest,
                     timeWait
                    );
    }

    private static void setActiveGroup (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.BALANCE && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String service = getString(data, "service");
        if (service == null)
        {
            writeAndClose(httpHandler, "Missing param service");
            return;
        }

        int group = getInt(data, "group");
        if (group < 0)
        {
            writeAndClose(httpHandler, "Missing param group");
            return;
        }

        int code = getInt(data, "code");
        if (code < 0)
        {
            writeAndClose(httpHandler, "Missing param code");
            return;
        }

        String result = BalanceServer.setActive(service, group, code);

        JsonObject response = new JsonObject();
        response.addProperty("service", service);
        response.addProperty("group", group);
        response.addProperty("code", code);

        writeAndClose(httpHandler, result, response);

        MetricLog.gm("setActiveGroup",
                     admin,
                     httpHandler.remoteAddress,
                     "",
                     0,
                     result == null ? 0 : -1,
                     service,
                     group,
                     code,
                     result
                    );
    }

    private static void setMaintenance (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.BALANCE && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        BalanceInfo info = BalanceServer.getInfo();
        if (info == null)
        {
            writeAndClose(httpHandler, "It's NOT balance server");
            return;
        }

        String msg = getString(data, "msg");
        if (msg == null)
        {
            writeAndClose(httpHandler, "Missing msg service");
            return;
        }

        int curTime = Time.getUnixTime();
        int timeStart = getInt(data, "timeStart");
        if (timeStart < curTime)
            timeStart = curTime;

        int timeFinish = getInt(data, "timeFinish");
        if (timeFinish == 0)
            timeFinish = Integer.MAX_VALUE;
        else if (timeFinish <= timeStart)
        {
            writeAndClose(httpHandler, "Invalid timeFinish");
            return;
        }

        info.setMaintenance(timeStart, timeFinish, msg);
        BalanceInfo.set(info);

        JsonObject response = new JsonObject();
        response.addProperty("timeStart", timeStart);
        response.addProperty("timeFinish", timeFinish);
        response.addProperty("msg", msg);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("setMaintenance",
                     admin,
                     httpHandler.remoteAddress,
                     "",
                     0,
                     0,
                     timeStart,
                     timeFinish,
                     msg
                    );
    }

    private static void resetMaintenance (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.BALANCE && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        BalanceInfo info = BalanceServer.getInfo();
        if (info == null)
        {
            writeAndClose(httpHandler, "It's NOT balance server");
            return;
        }

        if (!info.resetMaintenance())
        {
            writeAndClose(httpHandler, "Not in Maintenance");
            return;
        }
        BalanceInfo.set(info);

        JsonObject response = new JsonObject();

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("resetMaintenance",
                     admin,
                     httpHandler.remoteAddress,
                     "",
                     0,
                     0
                    );
    }

    private static void addGiftCode (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        String group = getString(data, "group");
        if (group == null)
        {
            writeAndClose(httpHandler, "Missing param group");
            return;
        }

        String title = getString(data, "title");
        if (title == null || title.isEmpty())
        {
            writeAndClose(httpHandler, "Missing param title");
            return;
        }

        GiftCodeInfo.Single info = GiftCodeInfo.getSingle(group);
        if (info == null)
        {
            writeAndClose(httpHandler, "Invalid group");
            return;
        }

        if (!info.isActive())
        {
            writeAndClose(httpHandler, "Group is inactive");
            return;
        }

        String users = getString(data, "users");
        if (users == null)
        {
            writeAndClose(httpHandler, "Missing param users");
            return;
        }

        HashSet<String> check = new HashSet<>();
        JsonArray success = new JsonArray();
        JsonArray fail = new JsonArray();
        MailBox.Mail mail = null;

        for (String sUserId : users.split("\\s+|,|;"))
        {

            if (sUserId.isEmpty())
                continue;
            if (!check.add(sUserId))
                continue;

            int userId = parseInt(sUserId, 0);
            if (userId <= 0)
            {
                fail.add(sUserId + ": Invalid user ID");
                continue;
            }

            String code = null;

            try
            {
                UserBrief userBrief = UserBrief.get(userId);
                if (userBrief == null)
                {
                    fail.add(sUserId + ": User does not exist");
                    continue;
                }
                CasValue<MailBox> cas = MailBox.gets(userBrief.getBucketId(), userId);
                if (cas == null)
                {
                    fail.add(sUserId + ": Get mailBox fail");
                    continue;
                }
                code = GenerateGiftCode.genCode(info.getGroup());
                if (code == null)
                {
                    fail.add(sUserId + ": Gen code fail");
                    continue;
                }

                MailBox mailBox = cas.object;
                mail = mailBox.addMailPrivate(MiscDefine.MAIL_GIFTCODE, title, code, null);

                if (MailBox.cas(userBrief.getBucketId(), userId, cas.cas, mailBox))
                {
                    success.add(sUserId);
                }
                else
                {
                    fail.add(sUserId + ": Save data fail");
                    continue;
                }

                UserOnline online = UserOnline.get(userId);
                if (online != null)
                    UdpHandler.notifyMail(online.getPrivateHost(), online.getPortUdp(), userId);
            }
            catch (Exception e)
            {
                fail.add(sUserId + ": Exception: " + e.getMessage());
                MetricLog.exception(e, sUserId);
            }

            MetricLog.gm("addGiftCode",
                         admin,
                         httpHandler.remoteAddress,
                         reason,
                         userId,
                         0,
                         group,
                         title,
                         code,
                         mail == null ? -1 : mail.getUid()
                        );
        }

        JsonObject response = new JsonObject();
        response.add("listSuccess", success);
        response.add("listFail", fail);

        writeAndClose(httpHandler, null, response);
    }

    private static void genGiftCode (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        int num = getInt(data, "num");
        if (num <= 0)
        {
            writeAndClose(httpHandler, "Missing param num");
            return;
        }

        if (num > 100)
        {
            writeAndClose(httpHandler, "num > 100");
            return;
        }

        String group = getString(data, "group");
        if (group == null)
        {
            writeAndClose(httpHandler, "Missing param group");
            return;
        }

        GiftCodeInfo.Single info = GiftCodeInfo.getSingle(group);
        if (info == null)
        {
            writeAndClose(httpHandler, "Invalid group");
            return;
        }

        if (!info.isActive())
        {
            writeAndClose(httpHandler, "Group is inactive");
            return;
        }

        HashSet<String> codes = GenerateGiftCode.genCode(info.getGroup(), num);
        JsonArray array = new JsonArray(codes.size());
        StringBuilder sb = new StringBuilder(codes.size() * GenerateGiftCode.CODE_LEN);
        for (String code : codes)
        {
            array.add(code);
            sb.append(code).append(',');
        }

        JsonObject response = new JsonObject();
        response.add("codes", array);

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("genGiftCode",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     "",
                     0,
                     group,
                     num,
                     sb.toString()
                    );
    }

    private static int parseInt (String v, int defaultValue)
    {
        try
        {
            return Integer.parseInt(v);
        }
        catch (Exception e)
        {
        }
        return defaultValue;
    }

    private static void getTopRanking (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String key = getString(data, "key");
        if (key == null)
        {
            writeAndClose(httpHandler, "Missing param key");
            return;
        }

        List<RankingBoard.Item> cache = RankingManager.getTopDaily(key);
        List<RankingBoard.Item> redis = RankingManager.getRedisTop(key);

        JsonObject response = new JsonObject();
        response.addProperty("key", key);
        response.add("cache", Json.toJsonTree(cache));
        response.add("redis", Json.toJsonTree(redis));

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("getTopRanking",
                     admin,
                     httpHandler.remoteAddress,
                     "",
                     "",
                     0,
                     key
                    );
    }

    private static void addTopReward (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String key = getString(data, "key");
        if (key == null)
        {
            writeAndClose(httpHandler, "Missing param key");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        List<RankingManager.ResultAddReward> info = RankingManager.addReward(key);

        JsonObject response = new JsonObject();
        response.addProperty("key", key);
        response.add("info", Json.toJsonTree(info));

        writeAndClose(httpHandler, null, response);

        MetricLog.gm("addRewardRanking",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     "",
                     0,
                     key
                    );
    }

    private static void getKeyRanking (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        List<String> keys = new ArrayList<>(ConstInfo.getRankingBoardInfo().TOP_IDS());
        Collections.sort(keys);
        JsonArray keyAll = new JsonArray();
        for (String key : keys)
            keyAll.add(key);

        keys = new ArrayList<>(ConstInfo.getRankingBoardInfo().TOP_REWARD_IDS());
        Collections.sort(keys);
        JsonArray keyReward = new JsonArray();
        for (String key : keys)
            keyReward.add(key);

        JsonObject response = new JsonObject();
        response.add("all", keyAll);
        response.add("reward", keyReward);

        writeAndClose(httpHandler, null, response);
    }

    private static void recallItem (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }

        String reason = getString(data, "reason");
        if (reason == null && EnvConfig.environment() == EnvConfig.Environment.SERVER_LIVE)
        {
            writeAndClose(httpHandler, "Missing param reason");
            return;
        }

        String title = getString(data, "title");
        if (title == null)
        {
            writeAndClose(httpHandler, "Missing param title");
            return;
        }

        String content = getString(data, "content");
        if (content == null)
        {
            writeAndClose(httpHandler, "Missing param content");
            return;
        }

        String info = getString(data, "info");
        if (info == null)
        {
            writeAndClose(httpHandler, "Missing param info");
            return;
        }
        JsonObject jInfo = Json.parse(info).getAsJsonObject();

        JsonObject response = new JsonObject();
        JsonArray invalidItem = new JsonArray();
        JsonArray invalidNum = new JsonArray();
        JsonArray invalidUserId = new JsonArray();

        //check info
        Map<Integer, MapItem> mInfo = new HashMap<>(); //userId, mapItem
        for (Map.Entry<String, JsonElement> eInfo : jInfo.entrySet())
        {
            Integer userId = Ints.tryParse(eInfo.getKey());
            if (userId == null)
            {
                invalidUserId.add(eInfo.getKey());
                continue;
            }
            JsonObject jItems = eInfo.getValue().getAsJsonObject();

            MapItem items = new MapItem();
            for (Map.Entry<String, JsonElement> eItem : jItems.entrySet())
            {
                String id = eItem.getKey();
                if (ConstInfo.getItemInfo(id) == null)
                {
                    invalidItem.add(id);
                    continue;
                }

                JsonElement jValue = eItem.getValue();
                if (!jValue.isJsonPrimitive())
                {
                    invalidNum.add(jValue);
                    continue;
                }

                int value = jValue.getAsJsonPrimitive().getAsInt();
                if (value <= 0)
                {
                    invalidNum.add(jValue);
                    continue;
                }
                items.increase(id, value);
            }

            mInfo.put(userId, items);
        }

        if (invalidUserId.size() > 0 || invalidItem.size() > 0 || invalidNum.size() > 0)
        {
            response.add("invalidUserId", invalidUserId);
            response.add("invalidItem", invalidItem);
            response.add("invalidNum", invalidNum);
            writeAndClose(httpHandler, "Quick check fail", response);
            return;
        }

        //Kiểm tra có tồn tại user ko
        Map<Integer, UserBrief> mapBrief = new HashMap<>();
        for (Integer userId : mInfo.keySet())
        {
            UserBrief brief = UserBrief.get(userId);
            if (brief == null)
                invalidUserId.add(userId);
            else
                mapBrief.put(userId, brief);
        }

        if (invalidUserId.size() > 0)
        {
            response.add("invalidUserId", invalidUserId);
            writeAndClose(httpHandler, "Check exist user fail", response);
            return;
        }

        String transactionId = "RECALL_ITEM_" + Time.getTimeMillis();
        final int TIME_BAN = 300;

        //Ban tất cả user
        JsonArray onlineUsers = new JsonArray();
        for (Integer userId : mInfo.keySet())
        {
            UserBan.set(userId, admin, "GM BAN", Time.getUnixTime() + TIME_BAN);

            UserOnline online = UserOnline.get(userId);
            if (online != null)
            {
                onlineUsers.add(userId);
                UdpHandler.kickUser(online.getPrivateHost(), online.getPortUdp(), userId, ErrorConst.BANNED);
            }
        }

        if (onlineUsers.size() > 0)
        {
            response.add("onlineUsers", onlineUsers);
            writeAndClose(httpHandler, "Users are online. Please try again!", response);
        }
        else
        {
            JsonArray nullGame = new JsonArray();
            JsonObject mapRemove = new JsonObject();
            JsonObject mapMissing = new JsonObject();
            for (Map.Entry<Integer, MapItem> eInfo : mInfo.entrySet())
            {
                int userId = eInfo.getKey();
                UserBrief brief = mapBrief.get(userId);
                UserGame game = UserGame.get(brief.getBucketId(), userId, null);
                if (game == null)
                    nullGame.add(userId);
                else
                {
                    JsonObject removeItem = new JsonObject();
                    JsonObject missingItem = new JsonObject();

                    for (MapItem.Entry eItem : eInfo.getValue())
                    {
                        String item = eItem.key();
                        ItemInfo itemInfo = ConstInfo.getItemInfo(item);
                        int numRecall = eItem.value();
                        int numRemove = 0;
                        int numMissing, numStock = 0;

                        if (itemInfo.TYPE() == ItemType.NONE)
                        {
                            switch (item)
                            {
                                case ItemId.GOLD:
                                    numStock = (int) game.getGold();
                                    break;

                                case ItemId.REPU:
                                    numStock = game.getReputation();
                                    break;
                            }
                        }
                        else
                        {
                            numStock = game.numStockItem(item);
                        }

                        if (numStock > 0)
                        {
                            if (numStock >= numRecall)
                            {
                                if (game.removeItem((short) 0, transactionId, item, numRecall) == ErrorConst.SUCCESS)
                                    numRemove += numRecall;
                            }
                            else
                            {
                                if (game.removeItem((short) 0, transactionId, item, numStock) == ErrorConst.SUCCESS)
                                    numRemove += numStock;
                                numMissing = numRecall - numRemove;

                                if (itemInfo.TYPE() == ItemType.POT)
                                    numRemove += game.gmRecallItemPot(item, numMissing);
                            }
                        }

                        if (numRemove > 0)
                            removeItem.addProperty(item, numRemove);
                        numMissing = numRecall - numRemove;
                        if (numMissing > 0)
                            missingItem.addProperty(item, numMissing);
                        //Debug.info(userId, "remove", item, "numRecall", numRecall, "numStock", numStock, "numRemove", numRemove, "numMissing", numMissing);
                    }

                    String sUserId = Integer.toString(userId);
                    if (removeItem.size() > 0)
                    {
                        mapRemove.add(sUserId, removeItem);

                        MailBox mailBox = MailBox.get(brief.getBucketId(), userId);
                        mailBox.addMailPrivate(MiscDefine.MAIL_SYSTEM, title, content, null);
                        MailBox.set(brief.getBucketId(), userId, mailBox);
                    }
                    if (missingItem.size() > 0)
                        mapMissing.add(sUserId, missingItem);

                    UserGame.set(brief.getBucketId(), userId, game);
                    UserBan.delete(userId);

                    //TODO: Log USER RECALL_ITEM
                    MetricLog.actionUser("RECALL_ITEM",
                                         userId,
                                         game.getLevel(),
                                         transactionId,
                                         MetricLog.toMapItem(removeItem),
                                         null,
                                         ErrorConst.SUCCESS,
                                         MetricLog.toString(missingItem)
                                        );
                }
            }

            response.add("nullGame", nullGame);
            response.add("mapMissing", mapMissing);
            response.add("mapRemove", mapRemove);
            writeAndClose(httpHandler, null, response);
        }

        //TODO: Log GM  RECALL_ITEM
        MetricLog.gm("recallItem",
                     admin,
                     httpHandler.remoteAddress,
                     reason,
                     "",
                     0,
                     mInfo.keySet()
                    );
    }

    private static void getKey (HttpServerHandler httpHandler, String admin, JsonObject data)
    {
        if (EnvConfig.service() != EnvConfig.Service.ADMIN && EnvConfig.environment() != EnvConfig.Environment.LOCAL)
        {
            writeAndClose(httpHandler, "Invalid command in service");
            return;
        }
        JsonObject response = new JsonObject();

        String bucket = getStringOrClose(httpHandler, data, "bucket", response);
        if (bucket == null)
            return;

        String key = getStringOrClose(httpHandler, data, "key", response);
        if (key == null)
            return;

        if (bucket.equalsIgnoreCase("redis"))
        {
            String type = getStringOrClose(httpHandler, data, "type", response);
            if (type == null)
                return;

            switch (type)
            {
                case "zrank":
                    String member = getStringOrClose(httpHandler, data, "member", response);
                    if (member == null)
                        return;

                    long rank = Database.ranking().zrank(key, member);
                    response.addProperty("rank", rank);
                    break;

                case "hget":
                    member = getStringOrClose(httpHandler, data, "member", response);
                    if (member == null)
                        return;

                    String value = Database.ranking().hget(key, member);
                    JsonElement jeValue = Json.parseSafe(value);
                    if (jeValue == null)
                        response.addProperty("value", value);
                    else
                        response.add("value", jeValue);
                    break;

                case "hmget":
                    String members = getStringOrClose(httpHandler, data, "member", response);
                    if (members == null)
                        return;

                    String[] fields = members.split(",");
                    List<String> values = Database.ranking().hmget(key, fields);
                    JsonObject jsonResult = new JsonObject();
                    for (int i = 0, len = fields.length; i < len; i++)
                    {
                        String field = fields[i];
                        value = values.get(i);
                        jeValue = Json.parseSafe(value);
                        if (jeValue == null)
                            jsonResult.addProperty(field, value);
                        else
                            jsonResult.add(field, jeValue);
                    }

                    response.add("value", jsonResult);
                    break;

                case "hgetAll":
                    Map<String, String> map = Database.ranking().hgetAll(key);
                    jsonResult = new JsonObject();
                    for (Map.Entry<String, String> entry : map.entrySet())
                    {
                        String field = entry.getKey();
                        value = entry.getValue();
                        jeValue = Json.parseSafe(value);
                        if (jeValue == null)
                            jsonResult.addProperty(field, value);
                        else
                            jsonResult.add(field, jeValue);
                    }
                    response.add("value", jsonResult);
                    break;

                case "get":
                    value = Database.ranking().get(key);
                    jeValue = Json.parseSafe(value);
                    if (jeValue == null)
                        response.addProperty("value", value);
                    else
                        response.add("value", jeValue);
                    break;
            }
        }
        else
        {
            AbstractDbKeyValue db = BucketManager.get(bucket);
            if (db == null)
            {
                writeAndClose(httpHandler, "Invalid bucket", response);
                return;
            }

            String value = (String) db.get(key);
            JsonElement jeValue = Json.parseSafe(value);
            if (jeValue == null)
                response.addProperty("value", value);
            else
                response.add("value", jeValue);
        }

        writeAndClose(httpHandler, null, response);
    }

    private static String getStringOrClose (HttpServerHandler httpHandler, JsonObject input, String key, JsonObject output)
    {
        String value = getString(input, key);
        output.addProperty(key, value);

        if (value == null || value.isEmpty())
        {
            writeAndClose(httpHandler, "Missing param " + key, output);
            return null;
        }

        return value;
    }
}
