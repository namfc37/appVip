package model;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponseLevelUp;
import data.*;
import extension.EnvConfig;
import model.key.InfoKeyUser;
import model.mail.MailBox;
import model.mail.MailBox.Mail;
import model.object.*;
import net.spy.memcached.CASValue;
import payment.billing.Card;
import payment.billing.PurchaseInfo;
import payment.brazil.CreateTransaction;
import payment.local.CheckLocalPayment;
import payment.sea.SeaGetTransaction;
import service.UdpHandler;
import service.friend.FriendInfo;
import service.guild.GuildMemberInfo;
import user.UserControl;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.collection.MapItem.Entry;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class UserGame extends Encoder.IObject implements KeyDefine
{
    public transient  UserControl userControl;
    private transient int         userId;

    private String              country;
    public  String              displayName;
    public  String              avatar;
    private short               level;
    private long                exp;
    public  long                coin; //coin này dùng để đối chiếu với hệ thống của GSN
    private long                gold;
    private int                 reputation;
    private MapItem             stock; //itemId,num
    private short[]             stockLevel;
    private ArrayList<Floor>    floors;
    private Setting             setting;
    private OrderManager        order;
    private int                 timeResetDaily;
    private MapItem             ibShopCount; //use to check limit
    private int                 timeNbPrivateShop; //thời gian reset bảng tin private shop
    private int                 timeNbAirShip; //thời gian reset bảng tin air ship
    private int                 numAirShip; //số lần air ship trong ngày
    private Tom                 tom;
    private LuckySpin           luckySpin;
    private boolean             openBuildingGame;
    private boolean             openBuildingGuild;
    private boolean             openBuildingGuildDerby;
    private Dice                dice;
    private DailyGift           dailyGift;
    private Mine                mine;
    private Gacha               gacha;
    private Payment             payment;
    private Festival            festival;
    private FriendBug           friendBug;
    private JackShop            jackShop;
    private byte[]              jackMachine; //đánh dấu máy nào ở nhà Jack đã sửa rồi
    private Achievement         achievementB;
    private GiftCode            giftCode;
    private int                 friendReputation;
    private QuestBook           questBookA;
    private ConvertInfo         convertInfo;
    private Map<String, String> checkOffer;
    private boolean             isRating;
    private RankingPR           rankingPR;
    private PigBank             pigBank;
    private VIP                 vip;
    private FlippingCards       flippingCards;
    private QuestMission        mission;
    private Truck               truck;
    private ConsumeEvent        consumeEvent;
    private Gachapon            gachapon;
    private Fishing             fishing;
    private UserAccumulate      paymentAccumulate;
    private POSMUserInfoData        posmInfoData;

    private MapItem eventItemsFriendPack;

    public           String                    tutorial;
    public transient HashMap<Integer, Integer> tutorial_step;
    public           int tutorialFlow;
    public           boolean tutorialUpgradePot;

    public int                    lastLogin; //lưu thời gian login trước để làm mốc xử lý expire item
    public int                    onlineSecond; // thời gian chơi trong ngày (reset hằng ngày)
    public int                    countPlant;
    public CreateTransaction.Info brCreateTransaction;
    public SeaGetTransaction.Info seaTransaction;

    public transient  boolean      isResetDaily;
    private transient StockData[]  stockData;
    private transient ComboManager comboManager;
    public transient  Interactive  interactive;
    public transient  String       bucketId;

    private UserGame ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    private static UserGame createEmpty (String bucketId, int userId, String country)
    {
        UserGame game = new UserGame();
        game.init(bucketId, userId, country);
        return game;
    }

    public static void create (String bucketId, int userId, UserControl userControl, String country)
    {
        UserGame game = createEmpty(bucketId, userId, country);
        game.userControl = userControl;
        userControl.game = game;
        game.interactive = Interactive.create(userId);

        //init data for new user
        String transactionId = userId + "_register_" + System.currentTimeMillis();
        short cmd = CmdDefine.REGISTER;
        game.levelUp(cmd, transactionId);
        game.addFirstFloor(cmd, transactionId);
        game.order.update(game);

        game.update();
    }

    private void addFirstFloor (short cmd, String transactionId)
    {
        addFloor();

        String potId = ItemId.CHAU_DAT;
        String plantId = ItemId.CAY_HONG;
        byte[] iFloors = new byte[]{0, 0, 0, 0, 0, 0};
        byte[] iSlots = new byte[]{0, 1, 2, 3, 4, 5};

        removeItem(cmd, transactionId, potId, iSlots.length);
        putPot(potId, iFloors, iSlots);
        comboManager.update();
        plantFirstFloor(plantId, iFloors, iSlots);
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.GAME;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static UserGame decode (String bucketId, int userId, Object raw, String country)
    {
        try
        {
            if (raw != null)
            {
                UserGame obj = Json.fromJson((String) raw, UserGame.class);
                obj.init(bucketId, userId, country);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static boolean set (String bucketId, int userId, UserGame object)
    {
        return db(bucketId).set(keyName(userId), object.encode());
    }

    public static Object getRaw (String bucketId, int userId)
    {
        return db(bucketId).get(keyName(userId));
    }

    public static UserGame get (String bucketId, int userId, String country)
    {
        return decode(bucketId, userId, getRaw(bucketId, userId), country);
    }

    public static UserGame get (String bucketId, int userId, Map<String, Object> mapData, String country)
    {
        return decode(bucketId, userId, mapData.get(keyName(userId)), country);
    }

    public static CasValue<UserGame> gets (String bucketId, int userId, String country)
    {
        CASValue<Object> raw = db(bucketId).gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(bucketId, userId, raw.getValue(), country));
    }

    public static boolean cas (String bucketId, int userId, long cas, UserGame object)
    {
        return db(bucketId).cas(keyName(userId), cas, object.encode());
    }

    //-----------------------------------------------------------------------

    public void  init (String bucketId, int userId, String curCountry)
    {
        Debug.trace("UserGame.init", userId, "country", country, curCountry);
        this.userId = userId;
        this.bucketId = bucketId;
        if (curCountry != null && curCountry.length() > 0)
            country = curCountry;

        if (stock == null)
            stock = new MapItem();
        stock.setAutoTrim(true);
        if (stockLevel == null)
            stockLevel = new short[ConstInfo.numStock()];
        initStockData();

        if (floors == null)
            floors = new ArrayList<>();
        for (int i = 0; i < floors.size(); i++)
        {
            Floor f = floors.get(i);
            f.init(i, this);
        }

        comboManager = new ComboManager(this);
        if (setting == null)
            setting = Setting.create();
        if (order == null)
            order = OrderManager.create();
        if (luckySpin == null)
            luckySpin = LuckySpin.create();
        if (tom == null)
            tom = Tom.create();
        if (dailyGift == null)
            dailyGift = DailyGift.create(MiscInfo.DAILY_GIFT_USER_LEVEL());
        if (gacha == null)
            gacha = Gacha.create();
        if (mine == null)
            mine = Mine.create();
        if (dice == null)
            dice = Dice.create();
        if (ibShopCount == null)
            ibShopCount = new MapItem();
        if (payment == null)
            payment = Payment.create(userId, country);
        else
            payment.init(userId, country);
        if (friendBug == null)
            friendBug = FriendBug.create(level);
        else
            friendBug.init();
        if (jackShop == null)
            jackShop = JackShop.create();
        initJackMachine();
        if (achievementB == null)
            achievementB = Achievement.create();
        if (giftCode == null)
            giftCode = GiftCode.create();
        if (festival == null)
            festival = Festival.create();
        festival.init();
        if (questBookA == null)
            questBookA = QuestBook.create();
        if (checkOffer == null)
            checkOffer = new HashMap<>();
        if (rankingPR == null)
            rankingPR = RankingPR.create();
        if (pigBank == null)
            pigBank = PigBank.create();
        if (vip == null)
            vip = VIP.create();
        if (flippingCards == null)
            flippingCards = FlippingCards.create();
        if (mission == null)
            mission = QuestMission.create(this.level);

        if (truck == null)
            truck = Truck.create();
        if (consumeEvent == null)
            consumeEvent = ConsumeEvent.create();
        if (gachapon == null)
            gachapon = Gachapon.create();
        if (fishing == null)
        	fishing = Fishing.create(level);
        
        if (paymentAccumulate == null)
        	paymentAccumulate = UserAccumulate.create();

        if (posmInfoData == null)
            posmInfoData = POSMUserInfoData.create();
        posmInfoData.init(userId);

//      log tutorial only
        tutorial_step = new HashMap<>();
    }

    public void update ()
    {
        Debug.trace("UserGame.update", userId);
        resetDaily();

        handleExpire();

        for (int i = 0; i < floors.size(); i++)
        {
            Floor f = floors.get(i);
            f.update();
        }

        handlePOSMItemExpire();

        festival.update(this);
        posmInfoData.update();
        gacha.update(this);
        order.update(this);
        luckySpin.update(this);
        tom.update();
        payment.update("", this);
        questBookA.update(this);
        truck.update(this);
        consumeEvent.update();
        fishing.update(level);
        
        if (paymentAccumulate.update())
        	handleExpireAccumulateToken ();

        if (isResetDaily)
            questBookA.checkDailyReset(lastLogin);

        if (eventItemsFriendPack == null)
            initEventItemsFriendPack();

        rankingPR.update(this.userId, this.level);

        if (MiscInfo.FLIPPINGCARDS_ACTIVE() && this.getLevel() >= MiscInfo.FLIPPINGCARDS_USER_LEVEL())
        {
            updateFlippingCards(UserControl.transactionId(userId));
            flippingCards.setTicket(numStockItem(MiscInfo.FLIPPINGCARDS_TICKET()));
        }
    }

    public void resetDaily ()
    {
        int curTime = Time.getUnixTime();

        isResetDaily = false;
        if (curTime < timeResetDaily)
            return;
        isResetDaily = true;
        Debug.trace("UserGame.resetDaily", userId);

        timeResetDaily = Time.nextTimeResetDaily();
        onlineSecond = 0;
        friendReputation = 0;
        numAirShip = 0;

        order.reset();
        ibShopCount.clear();
        dice.resetDaily(this);
        luckySpin.resetDaily(this);
        dailyGift.resetDaily(level);
        payment.resetDaily();
        gacha.resetDaily();
        jackShop.resetDaily(level);
        resetJackMachine();
        payment.resetDailyOffer(userControl);
        questBookA.resetDailyFinish();
        vip.resetDaily(userControl);
        gachapon.resetDaily();
        fishing.resetDaily(level);
        rankingPR.updateGroupLvDailyLogin(userId, level);

        if (MiscInfo.FLIPPINGCARDS_ACTIVE() && this.getLevel() >= MiscInfo.FLIPPINGCARDS_USER_LEVEL())
            flippingCards.resetDaily();
    }

    public void gmResetDaily ()
    {
        timeResetDaily = Time.getUnixTime() - 1;
    }

    public void gmResetOffer ()
    {
        if (payment != null)
            payment.gmResetOffer(this);
    }

    public static List<String> getItemIdsExpired (String eventType)
    {
        List<String> itemIds = ConstInfo.getFestival().getEventtemIds();
        List<String> itemIdsExpired = new ArrayList<String>();
        if (itemIds == null) return new ArrayList<>();
        for (int i = 0, size = itemIds.size(); i < size; i++)
        {
            ItemInfo itemInfo = ConstInfo.getItemInfo(itemIds.get(i));
            String useIn = "";
            if (itemInfo.TYPE() == ItemType.PLANT)
            {
                PlantInfo plantInfo = (PlantInfo) itemInfo;
                useIn = plantInfo.EVENT_ID();
            }
            else if (itemInfo.TYPE() == ItemType.EVENT)
            {
                EventItemInfo eventItemInfo = (EventItemInfo) itemInfo;
                useIn = eventItemInfo.USE_IN();
            }

            if (useIn != null && useIn.equals(eventType) && itemInfo.SUB_TYPE() != ItemSubType.POSM)
                itemIdsExpired.add(itemIds.get(i));
        }
        return itemIdsExpired;
    }

    public void handlePOSMItemExpire()
    {
        List<String> itemIds = ConstInfo.getFestival().getEventtemIds();
        List<String> itemIdsExpired = new ArrayList<String>();
        MapItem removeItems = new MapItem();
        int curTime = Time.getUnixTime();
        for (int i = 0, size = itemIds.size(); i < size; i++)
        {
            ItemInfo itemInfo = ConstInfo.getItemInfo(itemIds.get(i));
            if (itemInfo.TYPE() == ItemType.EVENT && itemInfo.SUB_TYPE() == ItemSubType.POSM)
            {
                EventItemInfo eventItemInfo = (EventItemInfo) itemInfo;
                String useIn = eventItemInfo.USE_IN();
                int timeEndEvent = useIn.equals(ItemId.ACID) ? ConstInfo.getAccumulate().UNIX_TIME_END() : ConstInfo.getFestival().getAction(useIn).UNIX_END_TIME();
                if (curTime - timeEndEvent > MiscInfo.POSM_TIME_EXPIRED_ITEM())
                    itemIdsExpired.add(itemIds.get(i));
            }
        }

        for (String itemId : itemIdsExpired)
        {
            if (stock.contains(itemId))
                removeItems.put(itemId, stock.get(itemId));
        }

        if (removeItems.isEmpty())
            return;

        short cmd = CmdDefine.EXPIRE_EVENT_ITEM;
        String transactionId = UserControl.transactionId(userId);
        removeItem(cmd, transactionId, removeItems);
    }

    public void handleEventExpire (String eventType)
    {
        MapItem removeItems = new MapItem();

        List<String> itemIdsExpired = UserGame.getItemIdsExpired(eventType);

        if (itemIdsExpired.size() == 0)
            return;

        for (String itemId : itemIdsExpired)
        {
            if (stock.contains(itemId))
                removeItems.put(itemId, stock.get(itemId));

            if (eventItemsFriendPack != null && eventItemsFriendPack.contains(itemId))
                eventItemsFriendPack.remove(itemId);
        }

//      clear airship
        if (eventType.equals(ItemId.E3ID) && eventItemsFriendPack!=null )
        {
            for (MapItem.Entry itemFriendPack : eventItemsFriendPack) {
                ItemInfo itemFriendPackInfo = ConstInfo.getItemInfo(itemFriendPack.key());
                if (itemFriendPackInfo == null || itemFriendPackInfo.TYPE() == ItemType.FISHING_ITEM)
                    eventItemsFriendPack.remove(itemFriendPack.key());
            }
        }

        if (eventItemsFriendPack != null && eventItemsFriendPack.isEmpty())
            eventItemsFriendPack = null;

        if (removeItems.isEmpty())
            return;

        MapItem addItems = new MapItem();
        for (Entry entry : removeItems)
        {
            ItemInfo info = ConstInfo.getItemInfo(entry.key());
            if (info == null || info.TYPE() != ItemType.EVENT)
                continue;
            EventItemInfo eventItemInfo = (EventItemInfo) info;
            if (eventItemInfo.SUB_TYPE() != ItemSubType.PUZZLE
                    || eventItemInfo.GOLD_CONVERT() < 1)
                continue;

            int gold = eventItemInfo.GOLD_CONVERT() * entry.value();

            addItems.increase(ItemId.GOLD, gold);
        }

        short cmd = CmdDefine.EXPIRE_EVENT_ITEM;
        String transactionId = UserControl.transactionId(userId);
        removeItem(cmd, transactionId, removeItems);
//      addItem(cmd, transactionId, addItems);

        MailBox mailBox = userControl.loadAndUpdateMailBox();
        int mailId = -1;
        if (mailBox != null && addItems.size() > 0)
        {
            Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, "TXT_EVENT_EXPIRE_ITEM_TITLE", "TXT_EVENT_EXPIRE_ITEM_DESC", addItems);
            if (mail != null)
                mailId = mail.getUid();

            MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             ErrorConst.SUCCESS,
                             userControl.getCoin(),
                             0,
                             getGold(),
                             0,
                             mailId > -1 ? mailId : ""
                            );
    }
    
    private void handleExpireAccumulateToken ()
    {
        MapItem removeItems = null;
        MapItem addItems = null;
        int mailId = -1;

        if (!stock.contains(MiscInfo.ACCUMULATE_TOKEN_ID()))
        	return;

        int num = stock.get(MiscInfo.ACCUMULATE_TOKEN_ID());
    	if (num == 0)
    		return;
        	
        removeItems = new MapItem (MiscInfo.ACCUMULATE_TOKEN_ID(), num);
    	
        ItemInfo info = ConstInfo.getItemInfo(MiscInfo.ACCUMULATE_TOKEN_ID());
        if (info != null)
        {
            EventItemInfo eventItemInfo = (EventItemInfo) info;
            int gold = eventItemInfo.GOLD_CONVERT() * num;

            addItems = new MapItem (ItemId.GOLD, gold);
        }
        
        short cmd = CmdDefine.EXPIRE_ACCUMULATE_ITEM;
        String transactionId = UserControl.transactionId(userId);
        removeItem(cmd, transactionId, removeItems);

        MailBox mailBox = userControl.loadAndUpdateMailBox();
        if (mailBox != null && addItems != null)
        {
            Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.ACCUMULATE_MAIL_REMOVE_TOKEN_TITLE(), MiscInfo.ACCUMULATE_MAIL_REMOVE_TOKEN_DESC(), addItems);
            if (mail != null)
                mailId = mail.getUid();

            MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             ErrorConst.SUCCESS,
                             userControl.getCoin(),
                             0,
                             getGold(),
                             0,
                             mailId > -1 ? mailId : ""
                            );
    }

    private void handleExpire ()
    {
        MapItem removeItems = new MapItem();
        for (MapItem.Entry e : stock)
        {
            if (e.value() > 0 && ConstInfo.isExpiredItem(e.key(), lastLogin))
                removeItems.put(e.key(), e.value());
        }

        if (removeItems.isEmpty())
            return;

        short cmd = CmdDefine.EXPIRE_ITEM;
        String transactionId = UserControl.transactionId(userId);
        removeItem(cmd, transactionId, removeItems);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             ErrorConst.SUCCESS,
                             userControl.getCoin(),
                             0,
                             getGold(),
                             0
                            );
    }

    private void initStockData ()
    {
        stockData = new StockData[stockLevel.length];
        for (int i = stockData.length - 1; i >= 0; i--)
        {
            StockInfo info = ConstInfo.getStockInfo(i);
            StockData d = StockData.create();
            stockData[i] = d;

            if (info.CAPACITY_INIT() < 0)
                d.capacity = Integer.MAX_VALUE;
            else
                d.capacity = info.CAPACITY_INIT() + stockLevel[i] * info.CAPACITY_ADD();
        }

        //update used
        checkCapacity(stock, false);
        for (StockData data : stockData)
        {
            data.used = data.check;
            data.check = 0;
        }
    }

    public byte checkAndAddItem (short cmd, String transactionId, String id, int num)
    {
        byte result = checkCapacity(id, num);
        if (result != ErrorConst.SUCCESS)
            return result;

        return addItem(cmd, transactionId, id, num);
    }

    public byte checkAndAddItem (short cmd, String transactionId, MapItem items)
    {
        byte result = checkCapacity(items);
        if (result != ErrorConst.SUCCESS)
            return result;

        addItem(cmd, transactionId, items);
        return ErrorConst.SUCCESS;
    }

    public byte checkCapacity (String id, int num)
    {
        if (num <= 0)
            return ErrorConst.INVALID_NUM;

        switch (id)
        {
            case ItemId.COIN:
            case ItemId.GOLD:
            case ItemId.EXP:
            case ItemId.REPU:
                return ErrorConst.SUCCESS;
        }

        ItemInfo info = ConstInfo.getItemInfo(id);
        if (info == null)
            return ErrorConst.NULL_ITEM_INFO;
        if (info.STOCK() >= 0)
        {
            StockData data = stockData[info.STOCK()];
            if (data.used + num > data.capacity)
            {
                Debug.trace("items", id, num);
                Debug.trace("stockData", Json.toJson(stockData));
                return ErrorConst.OUT_OF_CAPACITY;
            }
        }

        return ErrorConst.SUCCESS;

    }

    public byte checkCapacity (MapItem items)
    {
        return checkCapacity(items, true);
    }

    private byte checkCapacity (MapItem items, boolean verify)
    {
        //reset check
        for (StockData data : stockData)
            data.check = 0;

        //count
        ItemInfo info;
        int num;
        String id;

        for (MapItem.Entry entry : items)
        {
            num = entry.value();
            if (num <= 0)
                return ErrorConst.INVALID_NUM;

            id = entry.key();
            switch (id)
            {
                case ItemId.COIN:
                case ItemId.GOLD:
                case ItemId.EXP:
                case ItemId.REPU:
                    continue;
            }

            info = ConstInfo.getItemInfo(id);
            if (info == null)
                return ErrorConst.NULL_ITEM_INFO;
            if (info.STOCK() < 0)
                continue;
            stockData[info.STOCK()].check += num;
        }

        //verify
        if (verify)
        {
            int total;
            for (StockData data : stockData)
            {
                if ((data.capacity > 0) && (data.check > 0))
                {
                    total = data.used + data.check;
                    if (total <= 0 || total > data.capacity)
                    {
                        Debug.trace("items", Json.toJson(items));
                        Debug.trace("data", Json.toJson(data));
                        Debug.trace("stockData", Json.toJson(stockData));
                        return ErrorConst.OUT_OF_CAPACITY;
                    }
                }
            }
        }

        return ErrorConst.SUCCESS;
    }

    public void addItem (short cmd, String transactionId, MapItem items)
    {
        addItem(cmd, transactionId, items, false);
    }

    public void addItem (short cmd, String transactionId, MapItem items, boolean writeLog)
    {
        if (items == null || items.isEmpty())
            return;
        byte result;
        int exp = 0;
        for (MapItem.Entry entry : items)
        {
            if (ItemId.EXP.equals(entry.key()))
            {
                exp = entry.value();
                continue;
            }

            result = addItem(cmd, transactionId, entry.key(), entry.value());
            if (result != ErrorConst.SUCCESS)
            {
                if (writeLog || EnvConfig.environment() != EnvConfig.Environment.SERVER_LIVE)
                    MetricLog.info("Add item fail", "cmd", cmd, "itemId", entry.key(), "itemNum", entry.value(), "result", result);
            }
        }
        if (exp > 0)
            addItem(cmd, transactionId, ItemId.EXP, exp);
    }

    public MapItem skipAndAddItem (short cmd, String transactionId, MapItem items)
    {
        if (items == null || items.isEmpty())
            return null;
        MapItem result = new MapItem(items.size());
        int exp = 0;
        for (MapItem.Entry entry : items)
        {
            if (ItemId.EXP.equals(entry.key()))
            {
                exp = entry.value();
                continue;
            }
            if (checkCapacity(entry.key(), entry.value()) == ErrorConst.SUCCESS && addItem(cmd, transactionId, entry.key(), entry.value()) == ErrorConst.SUCCESS)
                result.increase(entry.key(), entry.value());
        }
        if (exp > 0)
            addItem(cmd, transactionId, ItemId.EXP, exp);
        return result;
    }

    public byte addItem (short cmd, String transactionId, String id, int num)
    {
        if (num <= 0)
            return ErrorConst.INVALID_NUM;

        switch (id)
        {
            case ItemId.COIN:
                return userControl.addCoinPromo(cmd, transactionId, num);

            case ItemId.GOLD:
                gold += num;
                return ErrorConst.SUCCESS;

            case ItemId.EXP:
                increaseExp(cmd, transactionId, num);
                return ErrorConst.SUCCESS;

            case ItemId.REPU:
                reputation += num;
                return ErrorConst.SUCCESS;

            case ItemId.PIG_BANK_POINT:
                if (pigBank == null)
                    return ErrorConst.NULL_OBJECT;
                pigBank.addDiamond(num);
                return ErrorConst.SUCCESS;

            case ItemId.VE_TRO_CHOI_LAT_HINH:
                updateFlippingCards(transactionId);
                break;
        }

        return addStock(id, num);
    }

    private byte addStock (String id, int num)
    {
        if (num <= 0)
            return ErrorConst.INVALID_NUM;

        ItemInfo info = ConstInfo.getItemInfo(id);
        if (info == null)
        {
            MetricLog.info("Null item info", id, num);
            return ErrorConst.NULL_ITEM_INFO;
        }
        if (info.STOCK() < 0)
        {
            MetricLog.info("id", id, "num", num, Json.toJsonPretty(info));
            return ErrorConst.INVALID_STOCK;
        }

        stockData[info.STOCK()].used += num;
        stock.increase(id, num);

        if (info.TYPE() == ItemType.EVENT)
            updateEventRecord(id, stock.get(id));

        if (info.TYPE() == ItemType.EVENT && info.SUB_TYPE() == ItemSubType.POSM)
        {
            posmInfoData.addItemPosm(id, num);
        }

        return ErrorConst.SUCCESS;
    }

    private void increaseExp (short cmd, String transactionId, int num)
    {
        if (num <= 0)
            return;

        exp += num;
        long expInLevel;
        MapItem bonusInLevel = null;
        MapItem bonusTotal = new MapItem();
        int oldLevel = level;

        for (; ; )
        {
            expInLevel = UserLevelInfo.EXP(level);
            if (expInLevel <= 0)
                break;
            if (level >= UserLevelInfo.maxLevel())
            {
                exp = 0;
                break;
            }

            if (exp < expInLevel)
                break;

            exp -= expInLevel;
            bonusInLevel = levelUp(cmd, transactionId);
            bonusTotal.increase(bonusInLevel);
        }

        updateLevelRecord();
        if (level != oldLevel)
            checkPRLevel();

        if (bonusInLevel != null)
        {
            order.levelUp(this);
            if (userControl != null)
            {
                payment.update(transactionId, this);

                Message msg = new ResponseLevelUp().packData(this, coin, bonusInLevel, getMapItemNum(bonusTotal), order, payment);
                userControl.send(msg);

                UserBrief brief = userControl.brief;
                CheckLocalPayment.sendLog(brief.getUserId(),
                                          brief.getUsername(),
                                          userControl.simOperator,
                                          userControl.packageName,
                                          userControl.clientVersion,
                                          getLevel(),
                                          "",
                                          userControl.address,
                                          brief.deviceId,
                                          payment.isActiveLocalPayment(),
                                          onlineSecond + Time.getUnixTime() - brief.timeLogin,
                                          userControl.socialType);
                UdpHandler.sendFriendUpdate(toFriendInfo());
            }
        }
    }

    private MapItem levelUp (short cmd, String transactionId)
    {
        level++;
        MapItem bonus = UserLevelInfo.REWARD_ITEM(level);
        addItem(CmdDefine.LEVEL_UP, transactionId, bonus);

        MetricLog.levelUp(
                country,
                userId,
                userControl.brief.getUsername(),
                userControl.socialType,
                level - 1,
                level,
                exp,
                coin,
                gold,
                transactionId,
                bonus,
                cmd);
        
        return bonus;
    }

    public byte checkRequireItem (String id, int num)
    {
        if (num <= 0)
            return ErrorConst.INVALID_NUM;

        switch (id)
        {
            case ItemId.COIN:
                return ErrorConst.REMOVE_ITEM_COIN;

            case ItemId.GOLD:
                if (gold < num)
                    return ErrorConst.NOT_ENOUGH_GOLD;
                return ErrorConst.SUCCESS;

            case ItemId.REPU:
                if (reputation < num)
                    return ErrorConst.NOT_ENOUGH_ITEM;
                return ErrorConst.SUCCESS;
        }

        if (numStockItem(id) < num)
            return ErrorConst.NOT_ENOUGH_ITEM;
        return ErrorConst.SUCCESS;
    }

    public byte checkRequireItem (MapItem items)
    {
        if (items == null || items.isEmpty())
            return ErrorConst.EMPTY_MAP_ITEM;

        byte result;
        for (MapItem.Entry entry : items)
        {
            result = checkRequireItem(entry.key(), entry.value());
            if (result != ErrorConst.SUCCESS)
                return result;
        }

        return ErrorConst.SUCCESS;
    }

    public byte removeAndAddItem (short cmd, String transactionId, String removeItemsId, int removeItemsNum, String receiveItemId, int receiveItemNum)
    {
        byte result = checkRequireItem(removeItemsId, removeItemsNum);
        if (result != ErrorConst.SUCCESS)
            return result;

        result = checkCapacity(receiveItemId, receiveItemNum);
        if (result != ErrorConst.SUCCESS)
            return result;

        removeItem(cmd, transactionId, removeItemsId, removeItemsNum);
        addItem(cmd, transactionId, receiveItemId, receiveItemNum);

        return ErrorConst.SUCCESS;
    }

    public byte removeAndAddItem (short cmd, String transactionId, MapItem removeItems, MapItem receiveItems)
    {
        byte result = checkRequireItem(removeItems);
        if (result != ErrorConst.SUCCESS)
            return result;

        result = checkCapacity(receiveItems);
        if (result != ErrorConst.SUCCESS)
            return result;

        removeItem(cmd, transactionId, removeItems);
        addItem(cmd, transactionId, receiveItems);

        return ErrorConst.SUCCESS;
    }

    public byte removeItem (short cmd, String transactionId, MapItem items)
    {
        byte result = checkRequireItem(items);
        if (result != ErrorConst.SUCCESS)
            return result;

        for (MapItem.Entry entry : items)
            removeItem(cmd, transactionId, entry.key(), entry.value());

        return ErrorConst.SUCCESS;
    }

    public byte removeItem (short cmd, String transactionId, String id, int num)
    {
        if (num <= 0)
            return ErrorConst.INVALID_NUM;

        switch (id)
        {
            case ItemId.COIN:
                return ErrorConst.REMOVE_ITEM_COIN;

            case ItemId.GOLD:
                if (gold < num)
                    return ErrorConst.NOT_ENOUGH_GOLD;
                gold -= num;
                if (cmd != CmdDefine.PRIVATE_SHOP_FRIEND_BUY)
                    consumeEvent.addConsumed(id, num);
                return ErrorConst.SUCCESS;

            case ItemId.REPU:
                if (reputation < num)
                    return ErrorConst.NOT_ENOUGH_ITEM;
                reputation -= num;
                consumeEvent.addConsumed(id, num);
                return ErrorConst.SUCCESS;
        }

        int v = numStockItem(id);
        if (v < num)
            return ErrorConst.NOT_ENOUGH_ITEM;

        ItemInfo info = ConstInfo.getItemInfo(id);
        if (info == null)
            return ErrorConst.NULL_ITEM_INFO;
        if (info.STOCK() < 0)
            return ErrorConst.INVALID_STOCK;

        stock.decrease(id, num);
        stockData[info.STOCK()].used -= num;

        consumeEvent.addConsumed(id, num);
        return ErrorConst.SUCCESS;
    }

    public MapItem getMapItemNum (MapItem... items)
    {
        if (items == null || items.length == 0)
            return null;

        MapItem status = new MapItem();
        for (MapItem map : items)
        {
            if (map == null)
                continue;
            for (MapItem.Entry e : map)
                status.put(e.key(), numStockItem(e.key()));
        }

        return status;
    }

    public MapItem getMapItemNum (MapItem items)
    {
        if (items == null || items.isEmpty())
            return null;
        MapItem status = new MapItem();
        for (MapItem.Entry e : items)
            status.put(e.key(), numStockItem(e.key()));
        return status;
    }

    public MapItem getMapItemNum (Collection<String> items)
    {
        if (items == null || items.isEmpty())
            return null;
        MapItem status = new MapItem();
        for (String id : items)
            status.put(id, numStockItem(id));
        return status;
    }

    public MapItem getMapItemNum (String id)
    {
        if (id == null)
            return null;
        MapItem status = new MapItem();
        status.put(id, numStockItem(id));
        return status;
    }

    public MapItem getMissingItem (MapItem requireItem)
    {
        MapItem missing = new MapItem();
        String id;
        int num, cur;
        for (MapItem.Entry e : requireItem)
        {
            id = e.key();
            num = e.value();

            cur = numStockItem(id);
            if (cur < num)
                missing.put(id, num - cur);
        }
        return missing;
    }

    public byte buyItem (String transactionId, MapItem items, int checkPrice, int clientCoin)
    {
        short cmd = CmdDefine.BUY_ITEM;
        byte result = ErrorConst.EMPTY;
        MapItem removeItems = null;
        MapItem receivedItems = null;
        int coinChange = 0;

        if (items == null || items.isEmpty())
            result = ErrorConst.EMPTY_MAP_ITEM;
        else if (clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else
        {
            int price = 0;
            String id;
            int num;
            ItemInfo info;

            for (MapItem.Entry e : items)
            {
                id = e.key();
                num = e.value();
                info = ConstInfo.getItemInfo(id);

                if (info.DIAMOND_BUY() <= 0)
                {
                    result = ErrorConst.INVALID_BUY;
                    break;
                }
                price += num * info.DIAMOND_BUY();
            }

            if (result == ErrorConst.EMPTY)
            {
                if (price <= 0)
                    result = ErrorConst.INVALID_PRICE;
                else if (price > checkPrice)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else if (coin < price)
                    result = ErrorConst.NOT_ENOUGH_COIN;
                else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.buyItem(cmd, items), MetricLog.toString(items))) == ErrorConst.SUCCESS)
                {
                    addItem(cmd, transactionId, items);
                    removeItems = new MapItem (ItemId.COIN, price);
                    receivedItems = items;
                    coinChange = -price;
                }
            }
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             getLevel(),
                             transactionId,
                             removeItems,
                             receivedItems,
                             ErrorConst.SUCCESS,
                             userControl.getCoin(),
                             coinChange,
                             getGold(),
                             0
                            );

        return ErrorConst.SUCCESS;
    }

    public Floor addFloor ()
    {
        byte id = (byte) floors.size();
        Floor floor = Floor.create(id, this);
        floors.add(floor);

        return floor;
    }

    public Floor getFloor (int id)
    {
        if (id < 0 || id >= floors.size())
            return null;
        return floors.get(id);
    }

    public int numStockItem (String id)
    {
        return stock.get(id);
    }

    public void putPot (String id, byte[] iFloors, byte[] iSlots)
    {
        for (int i = iSlots.length - 1; i >= 0; i--)
        {
            Floor floor = getFloor(iFloors[i]);
            floor.getSlot(iSlots[i]).putPot(id);
        }
    }

    public Slot getSlot (byte iFloor, byte iSlot)
    {
        Floor floor = getFloor(iFloor);
        if (floor == null)
            return null;
        return floor.getSlot(iSlot);
    }

    private final static Slot[] EMPTY_SLOT = new Slot[0];

    public Slot[] getSlots (byte[] iFloors, byte[] iSlots)
    {
        int len = (iFloors == null || iSlots == null) ? 0 : Math.min(iFloors.length, iSlots.length);
        if (len == 0)
            return EMPTY_SLOT;

        Slot[] slots = new Slot[len];
        for (int i = len - 1; i >= 0; i--)
        {
            Floor floor = getFloor(iFloors[i]);
            if (floor == null)
                continue;
            slots[i] = floor.getSlot(iSlots[i]);
        }
        return slots;
    }

    private void plantFirstFloor (String idPlant, byte[] iFloors, byte[] iSlots)
    {
        int curTime = Time.getUnixTime();
        int len = Math.min(iFloors.length, iSlots.length);

        for (int i = len - 1; i >= 0; i--)
        {
            Floor floor = getFloor(iFloors[i]);
            if (floor == null)
                continue;
            Slot slot = floor.getSlot(iSlots[i]);
            if (slot == null)
                continue;
            slot.plant(idPlant, curTime, 0);
            slot.skipTime();
        }
    }

    public void addUpgradeItem (int type, MapItem items)
    {
        ArrayList<ItemNum> listUpgradeItem = new ArrayList<>(3);
        switch (type)
        {
            case ItemType.PLANT:
                listUpgradeItem.add(new ItemNum(ItemId.GACH, numStockItem(ItemId.GACH)));
                listUpgradeItem.add(new ItemNum(ItemId.SON_DO, numStockItem(ItemId.SON_DO)));
                listUpgradeItem.add(new ItemNum(ItemId.GO, numStockItem(ItemId.GO)));
                break;

            case ItemType.PRODUCT:
                listUpgradeItem.add(new ItemNum(ItemId.DA, numStockItem(ItemId.DA)));
                listUpgradeItem.add(new ItemNum(ItemId.SON_VANG, numStockItem(ItemId.SON_VANG)));
                listUpgradeItem.add(new ItemNum(ItemId.DINH, numStockItem(ItemId.DINH)));
                break;

            case ItemType.MACHINE:
                listUpgradeItem.add(new ItemNum(ItemId.NUOC_THAN, numStockItem(ItemId.NUOC_THAN)));
                listUpgradeItem.add(new ItemNum(ItemId.KEO_DAN_MAY, numStockItem(ItemId.KEO_DAN_MAY)));
                break;

            default:
                return;
        }

        listUpgradeItem.sort(Comparator.comparingInt(o -> o.num));
        float[] rates = ConstInfo.itemDropRate(type, level);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        float rate;

        for (int i = 0; i < rates.length; i++)
        {
            rate = random.nextFloat() * 100;
            if (rate < rates[i])
                items.put(listUpgradeItem.get(i).id, 1);
        }
    }

    public Machine getMachine (byte idFloor)
    {
        Floor floor = getFloor(idFloor);
        if (floor == null)
            return null;

        Machine machine = floor.getMachine();
        machine.update();

        return machine;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(GAME_LEVEL, level);
        msg.put(GAME_EXP, exp);
        msg.put(GAME_GOLD, gold);
        msg.put(GAME_REPUTATION, reputation);
        msg.put(GAME_STOCK_MAP, stock);
        msg.put(GAME_STOCK_LEVEL, stockLevel);
        msg.put(GAME_FLOORS, floors);
        msg.put(GAME_SOUND, setting.sound);
        msg.put(GAME_MUSIC, setting.music);
        msg.put(GAME_NOTIFY, setting.notify);
        msg.put(GAME_ORDER, order);
        msg.put(GAME_IBSHOP_COUNT, ibShopCount);
        msg.put(GAME_TIME_NB_PRIVATE_SHOP, timeNbPrivateShop);
        msg.put(GAME_TIME_NB_AIR_SHIP, timeNbAirShip);
        msg.put(GAME_TOM, tom);
        msg.put(GAME_LUCKY_SPIN, luckySpin);
        msg.put(GAME_DICE, dice);
        msg.put(GAME_DAILY_GIFT, dailyGift);
        msg.put(GAME_MINE, mine);
        msg.put(GAME_GACHA, gacha);
        msg.put(GAME_OPEN_BUILDING_GAME, openBuildingGame);
        msg.put(GAME_OPEN_BUILDING_GUILD, openBuildingGuild);
        msg.put(GAME_OPEN_BUILDING_GUILD_DERBY, openBuildingGuildDerby);
        msg.put(GAME_PAYMENT, payment);
        msg.put(GAME_FESTIVAL, festival);
        msg.put(GAME_TUTORIAL, tutorial);
        msg.put(GAME_NAME, displayName);
        msg.put(GAME_AVATAR, avatar);
        msg.put(GAME_ACHIEVEMENT, achievementB);
        msg.put(GAME_FRIEND_REPUTATION, friendReputation);
        msg.put(GAME_QUEST_BOOK, questBookA);
        msg.put(GAME_IS_CONVERT, convertInfo == null ? false : !convertInfo.canConvert());
        msg.put(GAME_IS_RATING, isRating);
        msg.put(GAME_BUCKET, bucketId);
        msg.put(GAME_RANKING_PR, rankingPR);
        msg.put(GAME_NEXT_TIME_RESET, timeResetDaily);
        msg.put(GAME_PIG_BANK, pigBank);
        msg.put(GAME_VIP, vip);
        msg.put(GAME_FLIPPINGCARDS, flippingCards);
        msg.put(GAME_QUEST_MISSION, mission);
        msg.put(GAME_TRUCK, truck);
        msg.put(GAME_CONSUME_EVENT, consumeEvent);
        msg.put(GAME_GACHAPON, gachapon);
        msg.put(GAME_FISHING, fishing);
        msg.put(GAME_IS_RESET_DAILY, isResetDaily);
        msg.put(GAME_POSM_INFO, posmInfoData);
//      msg.put(GAME_ACCUMULATE, paymentAccumulate);
    }

    public short getLevel ()
    {
        return level;
    }

    public void gmSetLevelExp (short level, long exp)
    {
        if (level <= 0)
        {
            level = 1;
            exp = 0;
        }
        else if (level >= UserLevelInfo.maxLevel())
        {
            level = UserLevelInfo.maxLevel();
            exp = 0;
        }
        else
        {
            if (exp < 0)
                exp = 0;
            else
                exp = Math.min(UserLevelInfo.EXP(level) - 1, exp);
        }

        this.level = level;
        this.exp = exp;
    }

    public long getExp ()
    {
        return exp;
    }

    public long getGold ()
    {
        return gold;
    }

    public int getReputation ()
    {
        return reputation;
    }

    public byte numFloor ()
    {
        return (byte) floors.size();
    }

    public short stockLevel (int type)
    {
        return stockLevel[type];
    }

    public void upgradeStock (int type)
    {
        stockLevel[type]++;

        StockInfo info = ConstInfo.getStockInfo(type);
        stockData[type].capacity += info.CAPACITY_ADD();
    }

    public static class BonusOrder
    {
        public int percentExp;
        public int percentGold;
    }

    public BonusOrder getBonusOrder ()
    {
        BonusOrder b = new BonusOrder();
        for (Floor floor : floors)
        {
            Machine machine = floor.getMachine();
            if (machine.getLevel() <= 0)
                continue;

            MachineInfo.Level info = machine.info.getLevel(machine.getLevel());
            if (info == null)
                continue;

            b.percentExp += info.EXP_ORDER;
            b.percentGold += info.GOLD_ORDER;
        }
        return b;
    }

    public OrderManager getOrderManager ()
    {
        return order;
    }

    public MapItem getIbShopCount ()
    {
        return ibShopCount;
    }

    public int getIbShopCount (String id)
    {
        return ibShopCount == null ? 0 : ibShopCount.get(id);
    }

    public void addIbShopCount (String id)
    {
        ibShopCount.increase(id, 1);
    }

    public boolean canResetNbPrivateShop ()
    {
        return timeNbPrivateShop + MiscInfo.NB_COUNTDOWN_TIME() < Time.getUnixTime();
    }

    public void setTimeNbPrivateShop ()
    {
        this.timeNbPrivateShop = Time.getUnixTime();
    }

    public boolean canResetNbAirship ()
    {
        return timeNbAirShip + MiscInfo.NB_COUNTDOWN_TIME() < Time.getUnixTime();
    }

    public void setTimeNbAirship ()
    {
        this.timeNbAirShip = Time.getUnixTime();
    }

    public static class Builder
    {
        private UserGame game;

        public Builder ()
        {
            game = createEmpty("", 0, "");
        }

        public Builder setLevel (short level)
        {
            game.level = level;
            return this;
        }

        public Builder setExp (long exp)
        {
            game.exp = exp;
            return this;
        }

        public Builder setGold (long gold)
        {
            game.gold = gold;
            return this;
        }

        public Builder setReputation (long reputation)
        {
            game.reputation = (int) reputation;
            return this;
        }

        public Builder setStockLevel (int id, short level)
        {
            game.stockLevel[id] = level;
            return this;
        }

        public Builder addStock (int oldType, int oldId, int num)
        {
            ItemInfo info = ConstInfo.getOldItem(oldType, oldId);
            if (info == null)
                Debug.warn("Unknown item", "oldType", oldType, "oldId", oldId);
            else
                game.stock.increase(info.ID(), num);

            return this;
        }

        public Floor.Builder addFloor ()
        {
            return new Floor.Builder(game.addFloor());
        }

        public UserGame toObject ()
        {
            return game;
        }
    }

    public static Builder newBuilder ()
    {
        return new Builder();
    }

    public int getUserId ()
    {
        return userId;
    }

    public int getNumAirShip ()
    {
        return numAirShip;
    }

    public void increaseNumAirShip ()
    {
        numAirShip++;
    }

    public Tom getTom ()
    {
        tom.update();
        return tom;
    }

    public LuckySpin getLuckySpin ()
    {
        return luckySpin;
    }

    public ComboManager getComboManager ()
    {
        if (comboManager.needUpdate())
            comboManager.update();

        return comboManager;
    }

    public void addSpentCoin (int value)
    {
        if (dice != null)
            dice.addSpentCoin(value);
    }

    public ConsumeEvent getConsumeEvent ()
    {
        return consumeEvent;
    }

    public boolean isOpenBuildingGame ()
    {
        return openBuildingGame;
    }

    public boolean isOpenBuildingGuild ()
    {
        return openBuildingGuild;
    }

    public boolean isOpenBuildingGuildDerby()
    {
        return openBuildingGuildDerby;
    }

    public void openBuildingGame ()
    {
        openBuildingGame = true;
    }

    public void openBuildingGuild ()
    {
        openBuildingGuild = true;
    }

    public void openBuildingGuildDerby()
    {
        openBuildingGuildDerby = true;
    }

    public Dice getDice ()
    {
        return dice;
    }

    public DailyGift getDailyGift ()
    {
        return dailyGift;
    }

    public Mine getMine ()
    {
        return mine;
    }

    public Gacha getGacha ()
    {
        return gacha;
    }

    public Payment getPayment ()
    {
        return payment;
    }

    public Festival getFestival ()
    {
        return festival;
    }

    public FriendBug getFriendBug ()
    {
        return friendBug;
    }

    public JackShop getJackShop ()
    {
        return jackShop;
    }

    private void initJackMachine ()
    {
        int size = ConstInfo.maxFloor();
        if (jackMachine == null || jackMachine.length < size)
            jackMachine = new byte[ConstInfo.maxFloor()];
    }

    public byte[] getJackMachine ()
    {
        return jackMachine;
    }

    private void resetJackMachine ()
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        for (int i = 0; i < jackMachine.length; i++)
            jackMachine[i] = (byte) (r.nextInt(100) < MiscInfo.RATE_X2_REPAIR_FRIEND_MACHINE() ? -2 : 0);
    }

    public FriendInfo toFriendInfo ()
    {
        String vipName;
        int vipExpire;
        if (vip == null)
        {
            vipName = MiscDefine.VIP_INACTIVE;
            vipExpire = 0;
        }
        else
        {
            vipName = vip.getCurrentActive();
            vipExpire = vip.getTimeExpire();
        }
        return new FriendInfo(userId, displayName, avatar, level, userControl.brief.getBucketId(), rankingPR, vipName, vipExpire);
    }

    public GuildMemberInfo toGuildMemberInfo ()
    {
        String vipName;
        int vipExpire;
        if (vip == null)
        {
            vipName = MiscDefine.VIP_INACTIVE;
            vipExpire = 0;
        }
        else
        {
            vipName = vip.getCurrentActive();
            vipExpire = vip.getTimeExpire();
        }

        return new GuildMemberInfo(userId, displayName, avatar, level, vipName, vipExpire);
    }

    public Achievement getAchievement ()
    {
        return achievementB;
    }

    public GiftCode getGiftCode ()
    {
        return giftCode;
    }

    public int getFriendReputation ()
    {
        return friendReputation;
    }

    public void addFriendReputation (int num)
    {
        friendReputation += num;
    }

    public QuestBook getQuestBook ()
    {
        return questBookA;
    }

    public RankingPR getRankingPR ()
    {
        if (rankingPR.NEED_UPDATE())
        {
            this.rankingPR.update(this.userId, this.getLevel());
            this.updateAppraisalRecord();
        }

        return rankingPR;
    }

    public FlippingCards getFlippingCards ()
    {
        return flippingCards;
    }

    public boolean updateFlippingCards (String transactionId)
    {
        if (flippingCards == null)
            return false;

        int newTicket = flippingCards.updateTicket(this);
        if (newTicket < 1)
            return false;

        this.addStock(MiscInfo.FLIPPINGCARDS_TICKET(), newTicket);
        
        MetricLog.actionUser(userControl.country,
                             CmdDefine.FLIPPINGCARDS_UPDATE,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             getLevel(),
                             transactionId,
                             null,
                             new MapItem (MiscInfo.FLIPPINGCARDS_TICKET(), newTicket),
                             ErrorConst.SUCCESS,
                             userControl.getCoin(),
                             0,
                             getGold(),
                             0
                            );
        
        return true;
    }

    public QuestMission getQuestMission ()
    {
        if (mission == null)
            mission = QuestMission.create(this.level);

        return mission;
    }

    public void initEventItemsFriendPack ()
    {
        if (eventItemsFriendPack == null)
            resetEventItemsFriendPack();
    }

    public MapItem getEventItemsFriendPack ()
    {
        return eventItemsFriendPack;
    }

    public void resetEventItemsFriendPack ()
    {
        eventItemsFriendPack = festival.collectEP(this, CmdDefine.AIRSHIP_FRIEND_PACK);
        eventItemsFriendPack.increase(fishing.collectEP(this, CmdDefine.AIRSHIP_FRIEND_PACK));
        Debug.trace("UserGame", "resetEventItemsFriendPack", "AIRSHIP_FRIEND_PACK", MetricLog.toString(eventItemsFriendPack));
    }

    public boolean canConvertOldUser ()
    {
        return convertInfo == null || convertInfo.canConvert();
    }

    public void setConvertInfo (ConvertInfo newInfo)
    {
        convertInfo = newInfo;
    }

    public String getCountry ()
    {
        return country;
    }

    public void addCheckOffer (String id, String offer)
    {
        checkOffer.put(id, offer);
    }

    public String getCheckOffer (String id)
    {
        return checkOffer.get(id);
    }

    public boolean isRating ()
    {
        return isRating;
    }

    public void setRating (boolean rating)
    {
        isRating = rating;
    }

    private void checkPRLevel ()
    {
        if (rankingPR == null)
            return;

        rankingPR.updateGroupLv(this.level);
    }

    public void updateLevelRecord ()
    {
        if (rankingPR == null)
            return;

        boolean success = rankingPR.updateLevel(this.level, this.exp);

        if (success)
            Debug.info("Ranking", MiscInfo.TOP_LEVEL(), this.userId, this.level, this.exp, rankingPR.LEVEL_POINT());
    }

    public void updateAppraisalRecord ()
    {
        if (rankingPR == null)
            return;

        int total = this.getAppraisal();
        boolean success = rankingPR.updateAppraisal(this.level, total);

        if (success)
            Debug.info("Ranking", MiscInfo.TOP_APPRAISAL(), this.userId, this.level, rankingPR.APPRAISAL_POINT());
    }

    public int getAppraisal ()
    {
        int total = 0;
        for (Floor f : floors)
        {
            int value = f.appraisal();
            total += value;
        }

        for (int id = 0; id < stockLevel.length; id++)
        {
            StockInfo info = ConstInfo.getStockInfo(id);
            if (info == null)
                continue;

            StockInfo.Level level = info.levelInfo(stockLevel[id]);
            if (level != null)
            {
                int value = level.APPRAISAL;
                //Debug.info("updateAppraisalRecord", "stock", id, stockLevel[id], value);
                total += value;
            }
        }

        for (MapItem.Entry e : stock)
        {
            ItemInfo item = ConstInfo.getItemInfo(e.key());
            if (item == null)
                continue;

            switch (item.TYPE())
            {
                case ItemType.POT:
                {
                    PotInfo potInfo = (PotInfo) item;
                    if (potInfo != null)
                    {
                        int value = potInfo.APPRAISAL() * e.value();
                        total += value;
                    }
                }
                break;
                case ItemType.DECOR:
                {
                    DecorInfo decorInfo = (DecorInfo) item;
                    if (decorInfo != null)
                    {
                        int value = decorInfo.APPRAISAL() * e.value();
                        total += value;
                    }
                }
                break;
            }
        }

        return total;
    }

    public boolean updateActionRecord (String topId, int addtion)
    {
        if (rankingPR == null)
            return false;

        boolean success = rankingPR.updateAction(topId, this.level, addtion);
        if (success)
            Debug.info("Ranking", MiscInfo.TOP_ACTION(), this.userId, this.level, rankingPR.ACTION_POINT());

        return success;
    }

    private void updateEventRecord (String itemId, int quantity)
    {
        if (rankingPR == null)
            return;

        boolean success = rankingPR.updateEvent(this.level, itemId, quantity);
        if (success)
            Debug.info("Ranking", MiscInfo.TOP_EVENT(), this.userId, this.level, rankingPR.EVENT_POINT());
    }

    public int gmRecallItemPot (String id, int numRecall)
    {
        int totalRemove = 0;
        for (Floor floor : floors)
        {
            if (numRecall <= 0)
                break;
            int remove = floor.gmRecallItemPot(id, numRecall);
            if (remove <= 0)
                continue;

            totalRemove += remove;
            numRecall -= remove;

        }
        return totalRemove;
    }

    public int getTimeResetDaily ()
    {
        return timeResetDaily;
    }

    public PigBank getPigBank ()
    {
        return pigBank;
    }

    public VIP getVIP ()
    {
        return vip;
    }

    public Truck getTruck ()
    {
        return truck;
    }

    public Gachapon getGachapon ()
    {
        return gachapon;
    }

    public Fishing getFishing ()
    {
        fishing.update(level);
        return fishing;
    }

	public UserAccumulate getAccumulate()
	{
		return paymentAccumulate;
	}

	public void paymentAccumulate(short cmd, String transactionId, Card card, MapItem receivedItems)
	{
		if (!ConstInfo.getAccumulate().isActive())
			return;
		
		if (paymentAccumulate == null)
			return;

        int token = paymentAccumulate.addCoins(card.coinConvert);
		
		paymentAccumulate.addMoney(card.gross);
		
		if (token > 0)
		{
			receivedItems.increase(MiscInfo.ACCUMULATE_TOKEN_ID(), token);
			this.addItem(cmd, transactionId, MiscInfo.ACCUMULATE_TOKEN_ID(), token);
		}
	}

    public POSMUserInfoData getPOSMInfoData()
    {
        return posmInfoData;
    }
}
