package user;

import bitzero.engine.sessions.ISession;
import bitzero.server.entities.User;
import bitzero.server.extensions.data.DataCmd;
import bitzero.util.ExtensionUtility;
import bitzero.util.common.business.Debug;
import bitzero.util.config.bean.ConstantMercury;
import bitzero.util.socialcontroller.bean.UserInfo;
import cmd.BaseMessage;
import cmd.BinaryMessage;
import cmd.ErrorConst;
import cmd.Message;
import cmd.receive.authen.RequestLogin;
import cmd.send.user.ResponseKickUser;
import cmd.send.user.ResponseMailNotify;
import cmd.send.user.ResponseNotifyLocalPayment;
import data.*;
import extension.EnvConfig;
import extension.GameExtension;
import model.*;
import model.key.InfoKeyUser;
import model.mail.MailBox;
import model.object.*;
import payment.billing.Billing;
import payment.billing.Card;
import payment.billing.PurchaseInfo;
import payment.local.CheckLocalPayment;
import service.ClientRequestHandler;
import service.DisconnectionReason;
import service.UdpHandler;
import service.UserHandler;
import service.guild.GuildInfo;
import service.guild.cache.CacheGuildClient;
import service.old.OldServer;
import service.old.UserConverter;
import util.*;
import util.collection.MapItem;
import util.io.ShareLoopGroup;
import util.memcached.BucketManager;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Decoder;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BooleanSupplier;

public class UserControl
{
    public final UserInfo userInfo;
    public final User     user;
    public final int      userId;

    public final static int FLAG_SAVE_NOTHING = 0;
    public final static int FLAG_SAVE_INFO    = 1;
    public final static int FLAG_SAVE_GAME    = 1 << 1;

    public final AtomicInteger                                saveFlags    = new AtomicInteger(FLAG_SAVE_NOTHING);
    public final ConcurrentSkipListMap<Integer, QueueCommand> queueCommand = new ConcurrentSkipListMap<>();
    public final AtomicInteger                                queueUid     = new AtomicInteger();
    public final AtomicBoolean                                isRunning    = new AtomicBoolean();

    public final UserBrief   brief;
    public       UserGame    game;
    public       PrivateShop privateShop;
    public       AirShip     airShip;
    private      MailBox     mailBox; //dùng hàm loadAndUpdateMailBox để edit, dùng hàm getMailBox để read only
    private      FriendList  friendList; //dùng hàm loadFriendList để edit, dùng hàm getFriendList để read only
    public       boolean     isFirstPsNb = true; //sau khi login user có thể lấy newsBoard
    public       boolean     isFirstAsNb = true; //sau khi login user có thể lấy newsBoard
    public       String      simOperator;
    public       String      socialType;
    public       String      packageName;
    public       String      clientVersion;
    public       String      address;
    public       Boolean     checkLocalPayment;
    public       String      country;
    private      UserGuild   guild;
    
//  use to write log
    public transient int platformID;

    private ScheduledFuture futureUpdateFriend;

    public UserControl (UserInfo userInfo, User user, UserBrief brief)
    {
        this.userInfo = userInfo;
        this.user = user;
        this.userId = user.getId();
        this.brief = brief;

        brief.timeLogin = Time.getUnixTime();
    }

    public abstract static class QueueCommand
    {
        public short                cmd;
        public DataCmd              data;
        public Object               obj;
        public ClientRequestHandler handler;
        public Decoder              decoder;
        public int                  uid;

        protected QueueCommand (ClientRequestHandler handler, short cmd)
        {
            this.handler = handler;
            this.cmd = cmd;
        }

        public abstract void handle (String transactionId, UserControl userControl) throws Exception;
    }

    public static class QueueSystemCommand extends QueueCommand
    {
        public QueueSystemCommand (ClientRequestHandler handler, short cmd)
        {
            super(handler, cmd);
        }

        public QueueSystemCommand (ClientRequestHandler handler, short cmd, Object obj)
        {
            super(handler, cmd);
            this.obj = obj;
        }

        public void handle (String transactionId, UserControl userControl) throws Exception
        {
            handler.handleSystemCommand(transactionId, userControl, this);
        }
    }

    public static class QueueUserCommand extends QueueCommand
    {
        public QueueUserCommand (ClientRequestHandler handler, DataCmd data, boolean useDecoder)
        {
            super(handler, data.getId());

            this.data = data;
            if (useDecoder)
            {
                decoder = new Decoder(data.getRawData());
                uid = decoder.readInt(KeyDefine.KEY_PACKET_UID);
            }
        }

        public void handle (String transactionId, UserControl userControl) throws Exception
        {
            handler.handleUserCommand(transactionId, userControl, this);
        }
    }

    public void handleUserCommand (ClientRequestHandler handler, DataCmd dataCmd)
    {
        handleCommand(new QueueUserCommand(handler, dataCmd, true));
    }

    public void handleSystemCommand (short cmd)
    {
        handleCommand(new QueueSystemCommand(UserHandler.instance, cmd));
    }

    public void handleSystemCommand (short cmd, Object obj)
    {
        handleCommand(new QueueSystemCommand(UserHandler.instance, cmd, obj));
    }

    public void handleCommand (QueueCommand command)
    {
        if (command.uid <= 0)
            command.uid = queueUid.incrementAndGet();

        while (queueCommand.putIfAbsent(command.uid, command) != null)
        {
            //Debug.info("UID", "Add fail", command.uid, "CMD", command.cmd);
            command.uid += queueUid.addAndGet(MiscInfo.PACKET_UID_SERVER_STEP());
        }
        queueUid.set(command.uid);
        //Debug.info("UID", "Add success", command.uid, "CMD", command.cmd, "queueUid", queueUid.get());

        if (isRunning.compareAndSet(false, true))
        {
            Map.Entry<Integer, QueueCommand> entry;
            QueueCommand queueCmd;
            while ((entry = queueCommand.pollFirstEntry()) != null)
            {
                queueCmd = entry.getValue();
                String transactionId = transactionId(user.getId());
                try
                {
                    queueCmd.handle(transactionId, this);
                }
                catch (Exception e)
                {
                    MetricLog.exception(e, user.getId(), queueCmd.cmd);
                }
            }
            isRunning.set(false);
        }
    }

    public void markFlagSaveGame ()
    {
        saveFlags.orAndGet(FLAG_SAVE_GAME);
    }

    public void saveData (int flags)
    {
        saveFlags.orAndGet(flags);
        saveData();
    }

    public void saveData ()
    {
        //update score trước khi save
        if (isChanged(FLAG_SAVE_GAME))
        {
            RankingPR rankingPR = game.getRankingPR();
            if (rankingPR != null)
                rankingPR.updateScore();
        }

        save(FLAG_SAVE_INFO, () -> UserBrief.set(userId, brief));
        save(FLAG_SAVE_GAME, () -> UserGame.set(brief.getBucketId(), userId, game));
    }

    private boolean isChanged (int flag)
    {
        return (saveFlags.get() & flag) != 0;
    }

    private synchronized void save (int flag, BooleanSupplier supplier)
    {
        if (!isChanged(flag))
            return;

        try
        {
            boolean saveSuccess = supplier.getAsBoolean();
            if (saveSuccess)
                saveFlags.andAndGet(~flag);
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
    }

    public long getCoin ()
    {
        return game.coin;
    }

    public byte purchase (String transactionId, int price, PurchaseInfo pInfo)
    {
        return purchase(transactionId, price, pInfo, "");
    }

    public byte purchase (String transactionId, int price, PurchaseInfo pInfo, String description)
    {
        if (price <= 0)
            return ErrorConst.INVALID_NUM;

        if (game.coin < price)
            return ErrorConst.NOT_ENOUGH_COIN;

        if (ConstantMercury.ENABLE_PAYMENT)
        {
            long cashRemain = Billing.purchase(userInfo, price, pInfo, transactionId, description, game.getLevel(), socialType, platformID);
            if (cashRemain < 0)
                return ErrorConst.PURCHASE_FAIL;
            game.coin = cashRemain;

            if (pInfo.cmd != CmdDefine.PAYMENT_PROCESS)
            {
                game.addSpentCoin(price);
                game.getConsumeEvent().addConsumed(ItemId.COIN, price);
            }

        }
        else
        {
            game.coin -= price;

            if (pInfo.cmd != CmdDefine.PAYMENT_PROCESS)
            {
                game.addSpentCoin(price);
                game.getConsumeEvent().addConsumed(ItemId.COIN, price);
            }
        }

        return ErrorConst.SUCCESS;
    }

    public byte addCoinPromo (short cmd, String transactionId, int promo)
    {
        return addCoinPromo(cmd, transactionId, "", promo, false, "", "");
    }

    public byte addCoinPromo (short cmd, String appTrans, String payTrans, int promo, boolean isPayment, String type, String description)
    {
        if (promo <= 0)
            return ErrorConst.INVALID_NUM;

        if (ConstantMercury.ENABLE_PAYMENT)
        {
            long remain;
            if (isPayment)
                remain = Billing.promoPayment(userInfo, promo, appTrans, payTrans, type, description, game.getLevel(), socialType, platformID);
            else
                remain = Billing.promoInGame(userInfo, promo, appTrans, CmdName.get(cmd), description, game.getLevel(), socialType, platformID);
            if (remain < 0)
                return ErrorConst.PROMO_FAIL;
            game.coin = remain;
        }
        else
        {
            game.coin += promo;
        }
        return ErrorConst.SUCCESS;
    }

    public byte addCashIAP (Card card)
    {
        if (ConstantMercury.ENABLE_PAYMENT)
        {
            long remain = Billing.addCashIAP(card);
            if (remain < 0)
                return ErrorConst.PROMO_FAIL;
            game.coin = remain;
        }
        else
        {
            game.coin += card.coinConvert;
        }
        return ErrorConst.SUCCESS;
    }

    public boolean inquiryBalance ()
    {
        if (ConstantMercury.ENABLE_PAYMENT)
        {
            long remain = Billing.inquiryBalance(userInfo);
            if (remain < 0)
                return false;
            game.coin = remain;
        }
        return true;
    }

    public boolean inquiryBalanceDB ()
    {
        if (ConstantMercury.ENABLE_PAYMENT)
        {
            long remain = Billing.inquiryBalanceDB(userId);
            if (remain < 0)
                return false;
            game.coin = remain;
        }
        return true;
    }

    public void processBilling ()
    {
        CasValue<BillingProcessing> c = BillingProcessing.gets(userId);
        if (c == null || c.object == null)
            return;
        if (BillingProcessing.cas(userId, c.cas))
            c.object.process(this);
    }

    public static void login (ISession session, RequestLogin request, UserInfo userInfo, User user)
    {
        byte result;
        int userId = Integer.parseInt(userInfo.getUserId());
        UserBan userBan;
        UserBrief userBrief = null;
        UserGame game = null;
        boolean isRegister = false;
        int code = Integer.parseInt(request.clientVersion);

        if (user == null)
        {
            result = ErrorConst.NULL_USER;
        }
        else if (EnvConfig.isServer() && code < EnvConfig.minClientCode())
        {
            result = ErrorConst.FORCE_UPDATE;
        }
        else if ((userBan = UserBan.get(userId)) != null)
        {
            result = ErrorConst.BANNED;
        }
        else if (UserOnline.add(userId, Time.getUnixTime()))
        {
            userBrief = UserBrief.get(userId);
            if (userBrief == null)
            {
                userBrief = UserBrief.create(userId, userInfo.getUsername(), 0);
                if (!CoinCash.add(userId, 0))
                    result = ErrorConst.ADD_COIN_FAIL;
                else if (!CoinPromo.add(userId, 0))
                    result = ErrorConst.ADD_COIN_FAIL;
                else if (!UserBrief.add(userId, userBrief))
                    result = ErrorConst.REGISTER_FAIL;
                else if (!register(userInfo, user, userBrief, request))
                {
                    result = ErrorConst.EXCEPTION;
                    UserBrief.delete(userId);
                    CoinCash.delete(userId);
                    CoinPromo.delete(userId);
                }
                else
                {
                    isRegister = true;
                    result = ErrorConst.SUCCESS;
                }
            }
            else if (userBrief.minClientCode > EnvConfig.minClientCode())
            {
                result = ErrorConst.CONNECT_OLD_SERVER;
            }
            else
            {
                result = loadUserData(userInfo, user, userBrief, request.country);
            }

            if (result != ErrorConst.SUCCESS)
                UserOnline.delete(userId);
        }
        else
        {
            UserOnline online = UserOnline.get(userId);
            result = ErrorConst.ONLINE;

            if (online != null)
            {
                if (Address.PRIVATE_HOST.equals(online.getPrivateHost()) && EnvConfig.getUdp().getPort() == online.getPortUdp())
                    UserOnline.delete(userId);
                else
                    UdpHandler.kickUser(online.getPrivateHost(), online.getPortUdp(), userId, ErrorConst.ONLINE);
            }
        }

        short level = 0;
        long exp = 0;
        long coin = 0;
        long gold = 0;
        int reputation = 0;
        boolean isResetDaily = false;

        UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);
        if (userControl != null)
        {
            userBrief = userControl.brief;
            game = userControl.game;
            userBrief.deviceId = request.deviceId;
            userBrief.clientCode = request.clientVersion;
            userBrief.minClientCode = EnvConfig.minClientCode();
            isResetDaily = game.isResetDaily;

            if (isResetDaily)
            {
                MailBox mailBox = userControl.mailBox;
                boolean isChanged = false;

                Festival festival = userControl.game.getFestival();
                Fishing fishing = userControl.game.getFishing();
                if (festival != null)
                {
                    MapItem loginGifts = festival.collectEP(game, CmdDefine.USER_LOGIN);
                    loginGifts.increase(fishing.collectEP(game, CmdDefine.USER_LOGIN));
                    if (loginGifts != null && !loginGifts.isEmpty())
                    {
                        mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.EVENT_LOGIN_NEWDAY_TITLE(), MiscInfo.EVENT_LOGIN_NEWDAY_CONTENT(), loginGifts);
                        isChanged = true;
                    }
                }

                if (isChanged)
                    MailBox.set(userControl.brief.getBucketId(), userId, mailBox);

                UserGuild guild = userControl.guild;
                if (guild != null)
                {
                    guild.resetDaily();
                    UserGuild.set(userControl.brief.getBucketId(), userId, guild);

                    ShareLoopGroup.submit(() -> {
                        GuildInfo gInfo = guild.getInfo();
                        if (gInfo != null)
                            CacheGuildClient.updateGuildInfo(gInfo);
                    });
                }
            }

            level = game.getLevel();
            exp = game.getExp();
            coin = userControl.getCoin();
            gold = game.getGold();
            reputation = game.getReputation();

            game.displayName = userInfo.getDisplayname();
            if (game.displayName.contains("@"))
                game.displayName = userInfo.getUsername();
            game.avatar = userInfo.getHeadurl();
            userControl.simOperator = request.simOperator;
            userControl.socialType = request.socialType;
            userControl.packageName = request.packageName;
            userControl.clientVersion = request.clientVersion;
            userControl.address = session.getAddress();
            userControl.country = request.country;

            userControl.processBilling();


            if (isRegister)
            {
                CheckLocalPayment.sendLog(userBrief.getUserId(),
                                          userBrief.getUsername(),
                                          userControl.simOperator,
                                          userControl.packageName,
                                          userControl.clientVersion,
                                          game.getLevel(),
                                          "",
                                          userControl.address,
                                          userBrief.deviceId,
                                          false,
                                          0,
                                          userControl.socialType);
            }
        }

        MetricLog.login(userInfo.getUserId(),
                        userInfo.getUsername(),
                        request.socialType,
                        request.clientVersion,
                        request.osName,
                        request.osVersion,
                        request.deviceId,
                        request.deviceName,
                        request.connectionType,
                        level,
                        exp,
                        coin,
                        session.getHashId(),
                        result,
                        session.getAddress(),
                        isRegister || isResetDaily,
                        gold,
                        Address.PRIVATE_HOST,
                        EnvConfig.group(),
                        reputation,
                        request.simOperator,
                        request.country,
                        request.numSim,
                        request.statusLocalShop,
                        request.packageName,
                        request.phone
                       );

        if (result == ErrorConst.SUCCESS)
        {
            ExtensionUtility.instance().sendLoginOK(user);
            userControl.scheduleUpdateFriend();
            userControl.platformID = MetricLog.toPlatformID (request.osName);
        }
        else
        {
            ExtensionUtility.instance().sendLoginResponse(user, result);
            if (result == ErrorConst.ONLINE)
                user.disconnect(DisconnectionReason.KICK);
            else
                kick(user, result);
        }
    }

    private void scheduleUpdateFriend ()
    {
        futureUpdateFriend = ShareLoopGroup.scheduleAtFixedRate(() -> {
            try
            {
                UdpHandler.sendFriendLogin(brief.getBucketId(), game.toFriendInfo());
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }, 0, MiscInfo.FRIEND_SUGGEST_TIME_WAIT(), TimeUnit.SECONDS, false);
    }

    private static byte convertOldData (UserInfo userInfo, User user, int userId, String sOldUserId, String oldSession, String facebookId)
    {
        try
        {
            UserConverter converter;
            int oldUserId = Common.stringToInt(sOldUserId, 0);
            if (oldUserId > 0)
            {
                if (MapOldUserId.get(oldUserId) > 0)
                    return ErrorConst.CONVERTED;

                converter = OldServer.getUserById(oldUserId, oldSession);
                if (converter == null)
                    return ErrorConst.INVALID_SESSION;

                return convertOldData(userInfo, user, userId, converter);
            }

            if (facebookId != null && facebookId.length() > 0)
            {
                if (MapFacebookId.get(facebookId) > 0)
                    return ErrorConst.CONVERTED;

                converter = OldServer.getUserByFacebookId(facebookId);
                if (converter == null)
                    return ErrorConst.INVALID_FACEBOOK_ID;

                return convertOldData(userInfo, user, userId, converter);
            }

            return ErrorConst.NOT_OLD_USER;
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
            return ErrorConst.EXCEPTION;
        }
    }

    public static void logout (User user)
    {
        if (user == null)
            return;

        synchronized (user)
        {
            UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);
            if (userControl == null)
                return;
            user.removeProperty(Constant.PROPERTY_USER_CONTROL);
            userControl.queueCommand.clear();

            ISession session = user.getSession();
            int userId = user.getId();
            short level = 0;
            long exp = 0;
            long coin = -1;
            long gold = -1;
            int onlineSecond = 0;
            int pigBankPoint = 0;
            UserGame game = userControl.game;
            UserBrief brief = userControl.brief;
            MapItem consumeInfo = null;

            //WARNING: đặt xử lý logic vô trong try catch để tránh ảnh hưởng tính năng logout
            try
            {
                level = game.getLevel();
                exp = game.getExp();
                coin = userControl.getCoin();
                gold = game.getGold();
                
                brief.level = level;
                brief.displayName = game.displayName;
                brief.avatar = game.avatar;
                brief.timeLogout = Time.getUnixTime();

                onlineSecond = brief.timeLogout - brief.timeLogin;
                game.lastLogin = brief.timeLogin;
                game.onlineSecond += onlineSecond;

                PigBank pigBank = game.getPigBank();
                if (pigBank != null)
                    pigBankPoint = pigBank.getDiamond();
                if (userControl.futureUpdateFriend != null)
                    userControl.futureUpdateFriend.cancel(false);
                ConsumeEvent consumeEvent = game.getConsumeEvent();
                if (consumeEvent != null)
                {
                    consumeInfo = consumeEvent.getConsumeInfo();
                }

                game.updateAppraisalRecord();
                game.getPOSMInfoData().saves();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }

            userControl.saveData(FLAG_SAVE_INFO | FLAG_SAVE_GAME);
            UserOnline.delete(userId);

            CheckLocalPayment.sendLog(brief.getUserId(),
                                      brief.getUsername(),
                                      userControl.simOperator,
                                      userControl.packageName,
                                      userControl.clientVersion,
                                      game.getLevel(),
                                      "",
                                      session.getAddress(),
                                      brief.deviceId,
                                      game.getPayment().isActiveLocalPayment(),
                                      game.onlineSecond,
                                      userControl.socialType);

            MetricLog.logout(
	            userControl.country,
	            userId,
	            brief.getUsername(),
	            userControl.socialType,
	            level,
	            exp,
	            coin,
	            gold,
	            session.getHashId(),
	            onlineSecond,
	            0,
	            pigBankPoint,
	            MetricLog.toString(consumeInfo)
        	);
        }
    }

    public static void kick (String username, byte code)
    {
        kick(ExtensionUtility.globalUserManager.getUserByName(username), code);
    }

    public static void kick (int userId, byte code)
    {
        kick(ExtensionUtility.globalUserManager.getUserById(userId), code);
    }

    public static void kick (User user, byte code)
    {
        if (user != null)
        {
            Message msg = new ResponseKickUser(code).packData();
            send(user, msg);
            user.disconnect(DisconnectionReason.KICK);
        }
    }

    private static byte convertOldData (UserInfo userInfo, User user, int userId, UserConverter converter)
    {
        try
        {
            UserGame game = converter.getUserGame().toObject();
            if (game == null)
                return ErrorConst.NULL_USER_GAME;

            PrivateShop prShop = converter.getPrivateShop().toObject();
            if (prShop == null)
                return ErrorConst.NULL_PRIVATE_SHOP;

            int coinCash = (int) converter.getCoinReal();
            int coinPromo = (int) converter.getCoinBonus();
            if (coinCash < 0 || coinPromo < 0)
                return ErrorConst.INVALID_COIN;

            UserBrief userBrief = UserBrief.create(userId, userInfo.getUsername(), (int) converter.userId());
            if (!UserBrief.add(userId, userBrief))
                return ErrorConst.CONVERT_FAIL;

            UserControl userControl = new UserControl(userInfo, user, userBrief);
            CoinCash.add(userId, 0);
            CoinPromo.add(userId, 0);

            int olUserId = (int) converter.userId();
            Billing.promoConvertData(userInfo, coinCash + coinPromo, "Convert_" + olUserId, "", "", game.getLevel(), userControl.socialType, userControl.platformID);

            userControl.game = game;
            game.userControl = userControl;
            game.coin = coinCash + coinPromo;
            game.init(userBrief.getBucketId(), userId, "");

            userControl.privateShop = prShop;
            userControl.airShip = AirShip.create(userId);

            UserGame.set(userBrief.getBucketId(), userId, userControl.game);
            PrivateShop.set(userBrief.getBucketId(), userId, userControl.privateShop);
            AirShip.set(userBrief.getBucketId(), userId, userControl.airShip);
            MapUserName.set(userBrief.getUsername(), userId);


            MapOldUserId.set(olUserId, userId);

            String facebookId = converter.getFacebookId();
            if (facebookId != null)
                MapFacebookId.set(facebookId, userId);

            userControl.markFlagSaveGame();
            user.setProperty(Constant.PROPERTY_USER_CONTROL, userControl);

            NumConvert.increment();
            NumUser.increment();

            MetricLog.convertOldData(userId,
                                     userInfo.getUsername(),
                                     olUserId,
                                     facebookId,
                                     coinCash,
                                     coinPromo,
                                     game.getLevel(),
                                     game.getExp(),
                                     game.getGold(),
                                     game.getReputation()
                                    );

            return ErrorConst.SUCCESS;
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
            return ErrorConst.EXCEPTION;
        }
    }

    private static boolean register (UserInfo userInfo, User user, UserBrief brief, RequestLogin request)
    {
        int userId = brief.getUserId();
        String trans = UserControl.transactionId(userId);
        long removeOldCoin = 0;

        boolean isSuccess = false;

        try
        {
            UserControl userControl = new UserControl(userInfo, user, brief);

            removeOldCoin = Billing.inquiryBalance(userInfo);
            if (removeOldCoin > 0)
            {
                Billing.purchase(brief, removeOldCoin, PurchaseInfo.deleteOldUser(), trans, "", userControl.socialType, userControl.platformID);
            }

            UserGame.create(brief.getBucketId(), userId, userControl, request.country);
            userControl.privateShop = PrivateShop.create(userId);
            userControl.airShip = AirShip.create(userId);
            userControl.mailBox = MailBox.create(userId);
            userControl.mailBox.update(userControl);
            userControl.friendList = FriendList.create(userId);

            UserGame.set(brief.getBucketId(), userId, userControl.game);
            PrivateShop.set(brief.getBucketId(), userId, userControl.privateShop);
            AirShip.set(brief.getBucketId(), userId, userControl.airShip);
            MailBox.set(brief.getBucketId(), userId, userControl.mailBox);
            MapUserName.set(brief.getUsername(), userId);
            FriendList.set(brief.getBucketId(), userId, userControl.friendList);

            if (!EnvConfig.getUser().useLoginPortal())
                MapDeviceId.set(request.deviceId, userId);

            userControl.markFlagSaveGame();
            user.setProperty(Constant.PROPERTY_USER_CONTROL, userControl);

            isSuccess = true;
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }

        if (isSuccess)
        {
            MetricLog.register(
                    request.country,
                    userId,
                    brief.getUsername(),
                    request.socialType,
                    request.clientVersion,
                    request.osName,
                    request.osVersion,
                    request.deviceId,
                    request.deviceName,
                    request.connectionType,
                    "",
                    "",
                    ErrorConst.SUCCESS,
                    trans,
                    removeOldCoin);

            NumRegister.increment();
            NumUser.increment();
        }
        return isSuccess;
    }

    private static byte loadUserData (UserInfo userInfo, User user, UserBrief brief, String country)
    {
        int userId = brief.getUserId();

        try
        {
            ArrayList<String> keys = new ArrayList<>();
            keys.add(InfoKeyUser.GAME.keyName(userId));
            keys.add(InfoKeyUser.PRIVATE_SHOP.keyName(userId));
            keys.add(InfoKeyUser.AIR_SHIP.keyName(userId));
            keys.add(InfoKeyUser.MAIL_BOX.keyName(userId));
            keys.add(InfoKeyUser.GUILD.keyName(userId));
            keys.add(InfoKeyUser.INTERACTIVE.keyName(userId));

            Map<String, Object> mapData = BucketManager.get(brief.getBucketId()).getMulti(keys);

            UserGame game = UserGame.get(brief.getBucketId(), userId, mapData, country);
            if (game == null)
                return ErrorConst.NULL_USER_GAME;

            PrivateShop privateShop = PrivateShop.get(userId, mapData);
            if (privateShop == null)
                return ErrorConst.NULL_PRIVATE_SHOP;

            AirShip airShip = AirShip.get(userId, mapData);
            boolean createAirShip = false;
            if (airShip == null)
            {
                airShip = AirShip.create(userId);
                createAirShip = true;
            }
            if (airShip.update(game) || createAirShip)
                AirShip.set(brief.getBucketId(), userId, airShip);

            MailBox mailBox = MailBox.get(userId, mapData);
            boolean createMailBox = false;
            if (mailBox == null)
            {
                mailBox = MailBox.create(userId);
                createMailBox = true;
            }
            
            UserGuild guild = UserGuild.get(userId, mapData);
            if (guild == null)
            {
                guild = UserGuild.create(userId);
                UserGuild.set(brief.getBucketId(), userId, guild);
            }

            Interactive interactive = Interactive.get(userId, mapData);

            UserControl userControl = new UserControl(userInfo, user, brief);
            userControl.game = game;
            userControl.privateShop = privateShop;
            userControl.airShip = airShip;
            userControl.mailBox = mailBox;
            userControl.guild = guild;
            userControl.setInteractive(interactive);

            if (mailBox.update(userControl) || createMailBox)
                MailBox.set(brief.getBucketId(), userId, mailBox);
            
            if (!userControl.inquiryBalanceDB())
                return ErrorConst.INQUIRY_BALANCE_FAIL;

            if (privateShop.autoBuyItem(game.getLevel()))
                PrivateShop.set(brief.getBucketId(), userId, privateShop);

            userControl.game.userControl = userControl;
            game.update();

            userControl.markFlagSaveGame();
            user.setProperty(Constant.PROPERTY_USER_CONTROL, userControl);

            return ErrorConst.SUCCESS;
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
            return ErrorConst.EXCEPTION;
        }
    }

    public static void send (User user, BaseMessage msg)
    {
        GameExtension.gameExt.send(msg, user);
    }

    public void send (BaseMessage msg)
    {
        send(user, msg);
    }

    public void send (Message msg)
    {
        send(user, msg.toBaseMessage());
    }

    public static void send (User user, Message msg)
    {
        send(user, msg.toBaseMessage());
    }

    public void send (BinaryMessage msg)
    {
        send(user, msg.toBaseMessage());
    }

    public static void send (User user, BinaryMessage msg)
    {
        send(user, msg.toBaseMessage());
    }

    public static UserControl get (int userId)
    {
        User user = ExtensionUtility.globalUserManager.getUserById(userId);
        if (user == null)
            return null;

        UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);
        if (userControl == null)
            return null;

        return userControl;
    }

    public PrivateShop loadPrivateShop ()
    {
        privateShop = PrivateShop.get(brief.getBucketId(), userId);
        return privateShop;
    }

    public boolean savePrivateShop ()
    {
        privateShop.autoBuyItem(game.getLevel());
        return PrivateShop.set(brief.getBucketId(), userId, privateShop);
    }

    public AirShip loadAndUpdateAirShip ()
    {
        airShip = AirShip.get(brief.getBucketId(), userId);
        airShip.update(game);

        return airShip;
    }

    public MailBox getMailBox ()
    {
        return mailBox;
    }

    public synchronized MailBox loadAndUpdateMailBox ()
    {
        mailBox = MailBox.get(brief.getBucketId(), userId);
        if (mailBox == null)
            mailBox = MailBox.create(userId);
        else
            mailBox.update(this);

        return mailBox;
    }

    public UserGuild getUserGuild ()
    {
        if (guild == null)
            guild = loadUserGuild();

        return guild;
    }

    public void setUserGuild (GuildInfo guildInfo)
    {
        if (guild == null)
            guild = UserGuild.create(userId, guildInfo);
        else
            guild.set(guildInfo);

        UserGuild.set(brief.getBucketId(), userId, guild);
    }

    public synchronized UserGuild loadUserGuild ()
    {
        guild = UserGuild.get(brief.getBucketId(), userId);
        if (guild == null)
            guild = UserGuild.create(userId);
        else if (guild.update())
            UserGuild.set(brief.getBucketId(), userId, guild);

        return guild;
    }

    public void setInteractive (Interactive o)
    {
        game.interactive = o;
    }

    public Interactive loadInteractive ()
    {
        setInteractive(Interactive.get(brief.getBucketId(), userId));
        return game.interactive;
    }

    public static String transactionId (int userId)
    {
        return Integer.toString(userId) + "_" + System.currentTimeMillis();
    }

    public FriendList getFriendList ()
    {
        if (friendList == null)
            loadFriendList();
        return friendList;
    }

    public synchronized FriendList loadFriendList ()
    {
        if (MiscInfo.FRIEND_ACTIVE())
            friendList = FriendList.get(brief.getBucketId(), userId);
        if (friendList == null)
            friendList = FriendList.create(userId);

        return friendList;
    }

    public void notifyMail (boolean isRefresh)
    {
        if (isRefresh)
            loadAndUpdateMailBox();
        Message msg = new ResponseMailNotify(CmdDefine.MAIL_NOTIFY, ErrorConst.SUCCESS).packData(mailBox);
        send(msg);
    }

    public void notifyLocalPayment (int userId, byte result, boolean enable)
    {
        final short cmd = CmdDefine.NOTIFY_LOCAL_PAYMENT;

        if (result == ErrorConst.SUCCESS)
        {
            if (game == null)
                result = ErrorConst.NULL_USER_GAME;
            else
            {
                Payment payment = game.getPayment();
                checkLocalPayment = enable;
                if (enable && payment.isActiveLocalPayment() == false)
                {
                    payment.setActiveLocalPayment(true);
                    markFlagSaveGame();
                }

                Message msg = new ResponseNotifyLocalPayment(cmd, result).packData(enable);
                send(msg);
            }
        }

        MetricLog.actionUser(this.country,
                             cmd,
                             this.platformID,
                             this.brief.getUserId(),
                             this.brief.getUsername(),
                             this.socialType,
                             this.game.getLevel(),
                             "",
                             null,
                             null,
                             ErrorConst.SUCCESS,
                             this.getCoin(),
                             0,
                             this.game.getGold(),
                             0,
                             enable
                            );
    }
}
