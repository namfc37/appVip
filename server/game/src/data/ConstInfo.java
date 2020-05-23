package data;


import bitzero.util.common.business.Debug;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import data.festival.Event01Info;
import data.festival.Event02Info;
import data.festival.Event03Info;
import data.festival.FestivalInfo;
import data.guild.GuildData;
import data.guild.GuildDerbyData;
import data.ranking.RankingBoardInfo;
import model.AccumulateStore;
import model.object.ConsumeEvent;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.collection.TypeAdapterMapItem;
import util.collection.UnmodifiableMapItem;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class ConstInfo
{
    public final static String KEY_TYPE = "TYPE";

    private static final String FOLDER = "./data/jsonConstants/";

    static ConstInfo instance;

    private HashMap<String, ItemInfo>                       mapItemInfo;
    private StockInfo[]                                     stock;
    private UserLevelInfo                                   userLevel;
    private FloorInfo[]                                     floors;
    private HashMap<String, MachineInfo>                    machines;
    private HashMap<String, TreeMap<Integer, SkipTimeInfo>> skipTimes;
    private HashMap<String, float[][]>                      itemDropRate;
    private IBShopInfo[]                                    ibShopInfo;
    private MiscInfo                                        miscInfo;
    private LuckySpinInfo                                   luckySpinInfo;
    private HashMap<String, ComboInfo>                      mapComboInfo;
    private BlacksmithInfo                                  blacksmithInfo;
    private DiceInfo                                        diceInfo;
    private DailyGiftInfo                                   dailyGiftInfo;
    private MineInfo                                        mineInfo;
    private HashMap<String, int[][]>                        mapTimeOpen;
    private Map<String, ChestInfo>                          mapChest;
    private FestivalInfo                                    festivalInfo;
    private JackGardenInfo                                  jackGardenInfo;
    private QuestBookInfo                                   questBookInfo;
    private RankingBoardInfo                                rankingBoardInfo;
    private VIPInfo                                         vipInfo;
    private FlippingCardsInfo                               flippingCardsInfo;
    private QuestMissionInfo                                questMissionInfo;
    private TruckInfo                                       truckInfo;
    private ConsumeEventInfo                                consumeEventInfo;
    private GuildData                                       guildData;
    private GuildDerbyData                                  guildDerbyData;
    private GachaponInfo                                    gachaponInfo;
    private FishingInfo                                     fishingInfo;
    private PaymentAccumulateInfo                           accumulateInfo;

    private HashMap<Integer, Integer>        mapTypeToStock;
    private HashMap<Integer, MachineInfo>    mapFloorToMachine;
    private HashMap<String, IBShopInfo.Item> mapIbShop;

    public static void load () throws Exception
    {
        ConstInfo ins = new ConstInfo();

        ins.loadStock(FOLDER, "stock.json");
        ins.loadItemInfo(FOLDER,
                         "common_item.json",
                         "decor.json",
                         "material.json",
                         "pest.json",
                         "plant.json",
                         "pot.json",
                         "product.json",
                         "gacha_chest.json",
                         "event_items.json",
                         "skin_item.json",
                         "fishing_items.json"
                        );
        ins.loadUserLevel(FOLDER, "user_level.json");
        ins.loadFloor(FOLDER, "floor.json");
        ins.loadMachine(FOLDER, "machine.json");
        ins.loadSkipTime(FOLDER, "diamon_skip_time.json");
        ins.loadItemDropRate(FOLDER, "item_drop_rate.json");
        ins.loadMiscInfo(FOLDER, "MiscInfo.json");
        ins.loadIBShop(FOLDER, "ibshop.json");
        ins.loadLuckySpin(FOLDER, "luckyspin.json");
        ins.loadCombo(FOLDER, "combo.json");
        ins.loadBlacksmith(FOLDER, "blacksmith.json");
        ins.loadDice(FOLDER, "dice.json");
        ins.loadDailyGift(FOLDER, "daily_gift.json");
        ins.loadMineInfo(FOLDER, "mine.json");
        ins.loadFestivalInfo(FOLDER, "event_01.json", "event_02.json", "event_03.json");
        ins.loadJackGardenInfo(FOLDER, "jacks_garden.json");
        ins.loadAchievementInfo(FOLDER, "achievement.json");
        ins.loadGiftCodeInfo(FOLDER, "gift_code.json");
        ins.loadQuestBookInfo(FOLDER, "quest_book.json");
        ins.loadQuestMissionInfo(FOLDER, "quest_mission.json");
        ins.loadVIPInfo(FOLDER, "vip.json");
        ins.loadTruckInfo(FOLDER, "truck.json");
        ins.loadConsumeEventInfo(FOLDER, "consume_event.json");
        ins.loadGuildData(FOLDER, "guild.json");
        ins.loadGuildDerbyData(FOLDER, "guild_derby.json");
        ins.loadGachaponInfo(FOLDER, "gachapon.json");

        final String HEADER_PAYMENT = "payment_";
        Files.list(Paths.get(FOLDER))
             .filter(Files::isRegularFile)
             .filter(path -> path.getFileName().toString().contains(HEADER_PAYMENT))
             .forEach(path -> {
                 try
                 {
                     String filename = path.getFileName().toString();
                     String country = filename.substring(HEADER_PAYMENT.length(), filename.indexOf(".json"));
                     ins.loadPaymentInfo(FOLDER, filename, country);
                 }
                 catch (Exception e)
                 {
                     e.printStackTrace();
                 }
             });

        //cache instance
        instance = ins;
        UserLevelInfo.instance = ins.userLevel;
        MiscInfo.instance = ins.miscInfo;

        instance.loadRankingBoardInfo(FOLDER, "ranking.json");
        instance.loadFlippingCardsInfo(FOLDER, "flipping_cards.json");
        instance.loadFishingInfo(FOLDER, "fishing.json");
        instance.loadPaymentAccumulateInfo(FOLDER, "payment_accumulate.json");
    }

    private void loadStock (String folder, String filename) throws Exception
    {
        stock = Json.fromFile(folder + filename, StockInfo[].class);

        //cache map type to stock id
        mapTypeToStock = new HashMap<>();
        for (StockInfo info : stock)
            for (int type : info.CONTAIN_TYPES)
                mapTypeToStock.put(type, info.ID());
    }

    private void loadUserLevel (String folder, String filename) throws Exception
    {
        userLevel = Json.fromFile(folder + filename, UserLevelInfo.class);

        //cache map REWARD_ITEM
        int numLevel = userLevel.LEVEL.length;
        int numItem;
        userLevel.REWARD_ITEM = new ArrayList<>(numLevel);
        userLevel.TREE_UNLOCK_PLANT = new TreeMap<>();
        userLevel.TREE_UNLOCK_PRODUCT = new TreeMap<>();
        userLevel.TREE_UNLOCK_PEST = new TreeMap<>();
        userLevel.TREE_UNLOCK_PEARL = new TreeMap<>();
        userLevel.TREE_UNLOCK_POT = new TreeMap<>();
        userLevel.TREE_UNLOCK_MINERAL = new TreeMap<>();
        userLevel.TREE_UNLOCK_MATERIAL = new TreeMap<>();
        userLevel.MAP_LEVEL_UNLOCK = new HashMap<>();

        userLevel.AIRSHIP_REWARD = new ArrayList<>(numLevel);
        userLevel.TREE_AIRSHIP_EASY_REQUEST = new ArrayList<>(numLevel);
        userLevel.TREE_AIRSHIP_MEDIUM_REQUEST = new ArrayList<>(numLevel);
        userLevel.TREE_AIRSHIP_HARD_REQUEST = new ArrayList<>(numLevel);

        ArrayList<String> plants = new ArrayList<>();
        ArrayList<String> products = new ArrayList<>();
        ArrayList<String> pests = new ArrayList<>();
        ArrayList<String> pearls = new ArrayList<>();
        ArrayList<String> minerals = new ArrayList<>();
        ArrayList<String> material = new ArrayList<>();
        ArrayList<String> pots = new ArrayList<>();

        for (int lv = 0; lv < numLevel; lv++)
        {
            userLevel.REWARD_ITEM.add(toMapItemNum(userLevel.REWARD_ITEM_NAME[lv], userLevel.REWARD_ITEM_NUM[lv]));
            userLevel.AIRSHIP_REWARD.add(toMapItemNum(userLevel.AIRSHIP_REWARD_NAME[lv], userLevel.AIRSHIP_REWARD_NUM[lv]));
            userLevel.TREE_AIRSHIP_EASY_REQUEST.add(toTreePercent(userLevel.AIRSHIP_EASY_REQUEST_NAME[lv], userLevel.AIRSHIP_EASY_REQUEST_PERCENT[lv]));
            userLevel.TREE_AIRSHIP_MEDIUM_REQUEST.add(toTreePercent(userLevel.AIRSHIP_MEDIUM_REQUEST_NAME[lv], userLevel.AIRSHIP_MEDIUM_REQUEST_PERCENT[lv]));
            userLevel.TREE_AIRSHIP_HARD_REQUEST.add(toTreePercent(userLevel.AIRSHIP_HARD_REQUEST_NAME[lv], userLevel.AIRSHIP_HARD_REQUEST_PERCENT[lv]));

            if (userLevel.SEED_UNLOCK[lv].length > 0)
            {
                for (String id : userLevel.SEED_UNLOCK[lv])
                {
                    plants.add(id);
                    userLevel.MAP_LEVEL_UNLOCK.put(id, lv);
                }
                userLevel.TREE_UNLOCK_PLANT.put(lv, Collections.unmodifiableList(new ArrayList<>(plants)));
            }

            if (userLevel.POT_UNLOCK[lv].length > 0)
            {
                for (String id : userLevel.POT_UNLOCK[lv])
                {
                    pots.add(id);
                    userLevel.MAP_LEVEL_UNLOCK.put(id, lv);
                }
                userLevel.TREE_UNLOCK_POT.put(lv, Collections.unmodifiableList(new ArrayList<>(pots)));
            }

            boolean hasPearl = false;
            boolean hasPest = false;
            boolean hasProduct = false;
            boolean hasMineral = false;
            boolean hasMaterial = false;

            for (String id : userLevel.PROD_UNLOCK[lv])
            {
                switch (mapItemInfo.get(id).TYPE())
                {
                    case ItemType.PEARL:
                        pearls.add(id);
                        hasPearl = true;
                        break;
                    case ItemType.PEST:
                        pests.add(id);
                        hasPest = true;
                        break;
                    case ItemType.PRODUCT:
                        products.add(id);
                        hasProduct = true;
                        break;
                    case ItemType.MINERAL:
                        minerals.add(id);
                        hasMineral = true;
                        break;
                    case ItemType.MATERIAL:
                        material.add(id);
                        hasMaterial = true;
                        break;
                    default:
                        Debug.warn("not support type", mapItemInfo.get(id).TYPE(), id);
                        break;
                }
                userLevel.MAP_LEVEL_UNLOCK.put(id, lv);
            }
            if (hasPearl)
                userLevel.TREE_UNLOCK_PEARL.put(lv, Collections.unmodifiableList(new ArrayList<>(pearls)));
            if (hasPest)
                userLevel.TREE_UNLOCK_PEST.put(lv, Collections.unmodifiableList(new ArrayList<>(pests)));
            if (hasProduct)
                userLevel.TREE_UNLOCK_PRODUCT.put(lv, Collections.unmodifiableList(new ArrayList<>(products)));
            if (hasMineral)
                userLevel.TREE_UNLOCK_MINERAL.put(lv, Collections.unmodifiableList(new ArrayList<>(minerals)));
            if (hasMaterial)
                userLevel.TREE_UNLOCK_MATERIAL.put(lv, Collections.unmodifiableList(new ArrayList<>(material)));
        }

//        Debug.trace("TREE_UNLOCK_PLANT", userLevel.TREE_UNLOCK_PLANT.size(),  Json.toJsonPretty(userLevel.TREE_UNLOCK_PLANT));
//        Debug.trace("TREE_UNLOCK_PRODUCT", userLevel.TREE_UNLOCK_PRODUCT.size(), Json.toJsonPretty(userLevel.TREE_UNLOCK_PRODUCT));
//        Debug.trace("TREE_UNLOCK_PEST", userLevel.TREE_UNLOCK_PEST.size(), Json.toJsonPretty(userLevel.TREE_UNLOCK_PEST));
//        Debug.trace("TREE_UNLOCK_PEARL", userLevel.TREE_UNLOCK_PEARL.size(), Json.toJsonPretty(userLevel.TREE_UNLOCK_PEARL));
//        Debug.trace("TREE_UNLOCK_POT", userLevel.TREE_UNLOCK_POT.size(), Json.toJsonPretty(userLevel.TREE_UNLOCK_POT));
//        Debug.trace("TREE_UNLOCK_MINERAL", userLevel.TREE_UNLOCK_MINERAL.size(), Json.toJsonPretty(userLevel.TREE_UNLOCK_MINERAL));
//        Debug.trace("TREE_UNLOCK_MATERIAL", userLevel.TREE_UNLOCK_MATERIAL.size(), Json.toJsonPretty(userLevel.TREE_UNLOCK_MATERIAL));
//        Debug.trace("MAP_LEVEL_UNLOCK", Json.toJsonPretty(userLevel.MAP_LEVEL_UNLOCK));
    }

    private static MapItem toMapItemNum (String[] listId, int[] listNum)
    {
        MapItem map = new MapItem(listId.length);
        for (int i = 0; i < listId.length; i++)
            map.put(listId[i], listNum[i]);
        return map.toUnmodifiableMapItem();
    }

    private static NavigableMap<Integer, String> toTreePercent (String[] listId, int[] listPercent)
    {
        TreeMap<Integer, String> tree = new TreeMap<>();
        int percent = 0;
        for (int i = 0; i < listId.length; i++)
        {
            tree.put(percent, listId[i]);
            percent += listPercent[i];
        }
        return Collections.unmodifiableNavigableMap(tree);
    }

    private void loadFloor (String folder, String filename) throws Exception
    {
        floors = Json.fromFile(folder + filename, FloorInfo[].class);

        for (FloorInfo info : floors)
            info.init();
    }

    private void loadMachine (String folder, String filename) throws Exception
    {
        machines = Json.fromFile(folder + filename, new TypeToken<HashMap<String, MachineInfo>>() {}.getType());
        mapFloorToMachine = new HashMap<>();

        for (MachineInfo m : machines.values())
            mapFloorToMachine.put(m.FLOOR(), m);
    }

    private void loadMiscInfo (String folder, String filename) throws Exception
    {
        miscInfo = Json.fromFile(folder + filename, MiscInfo.class);
    }

    private void loadIBShop (String folder, String filename) throws Exception
    {
        ibShopInfo = Json.fromFile(folder + filename, IBShopInfo[].class);
        mapIbShop = new HashMap<>();

        for (IBShopInfo info : ibShopInfo)
            for (IBShopInfo.Item item : info.ITEMS)
            {
                item.GIFT_WHEN_BUY = item.GIFT_WHEN_BUY.toUnmodifiableMapItem();

                String key = IBShopInfo.getId(item.ITEM_NAME, item.ITEM_QUANTITY, item.PRICE_TYPE);
                mapIbShop.put(key, item);
            }
    }

    private void loadLuckySpin (String folder, String filename) throws Exception
    {
        luckySpinInfo = Json.fromFile(folder + filename, LuckySpinInfo.class);
    }

    private void loadCombo (String folder, String filename) throws Exception
    {
        mapComboInfo = Json.fromFile(folder + filename, new TypeToken<HashMap<String, ComboInfo>>() {}.getType());

        for (ComboInfo c : mapComboInfo.values())
            c.init();
    }

    private void loadDice (String folder, String filename) throws Exception
    {
        diceInfo = Json.fromFile(folder + filename, DiceInfo.class);
    }

    private void loadDailyGift (String folder, String filename) throws Exception
    {
        dailyGiftInfo = Json.fromFile(folder + filename, DailyGiftInfo.class);
    }

    private void loadPaymentInfo (String folder, String filename, String country) throws Exception
    {
        Debug.info("loadPaymentInfo", folder, filename, country);
        PaymentInfo.map.put(country, Json.fromFile(folder + filename, PaymentInfo.class));
    }

    private void loadAchievementInfo (String folder, String filename) throws Exception
    {
        AchievementInfo.instance = Json.fromFile(folder + filename, AchievementInfo.class);
    }

    private void loadGiftCodeInfo (String folder, String filename) throws Exception
    {
        GiftCodeInfo.instance = Json.fromFile(folder + filename, GiftCodeInfo.class);
    }

    private void loadJackGardenInfo (String folder, String filename) throws Exception
    {
        jackGardenInfo = Json.fromFile(folder + filename, JackGardenInfo.class);
    }

    private void loadBlacksmith (String folder, String filename) throws Exception
    {
        blacksmithInfo = Json.fromFile(folder + filename, BlacksmithInfo.class);
        blacksmithInfo.init();
    }

    private void loadMineInfo (String folder, String filename) throws Exception
    {
        mineInfo = Json.fromFile(folder + filename, MineInfo.class);
        mineInfo.init();
    }

    private void loadItemInfo (String folder, String fileCommon, String... files) throws Exception
    {
        mapItemInfo = Json.fromFile(folder + fileCommon, new TypeToken<HashMap<String, ItemInfo>>() {}.getType());
        mapTimeOpen = new HashMap<>();
        mapChest = new HashMap<>();

        HashMap<Byte, Class<? extends ItemInfo>> mapType = new HashMap<>();
        mapType.put(ItemType.PLANT, PlantInfo.class);
        mapType.put(ItemType.PEST, PestInfo.class);
        mapType.put(ItemType.POT, PotInfo.class);
        mapType.put(ItemType.MATERIAL, MaterialInfo.class);
        mapType.put(ItemType.DECOR, DecorInfo.class);
        mapType.put(ItemType.PRODUCT, ProductInfo.class);
        mapType.put(ItemType.MINERAL, MaterialInfo.class);
        mapType.put(ItemType.MINIGAME, MinigameItemInfo.class);
        mapType.put(ItemType.PEARL, ProductInfo.class);
        mapType.put(ItemType.CHEST, ChestInfo.class);
        mapType.put(ItemType.EVENT, EventItemInfo.class);
        mapType.put(ItemType.SKIN, SkinInfo.class);
        mapType.put(ItemType.GACHAPON, GachaponItemInfo.class);

        mapType.put(ItemType.FISHING_ITEM, FishingItemInfo.class);
        mapType.put(ItemType.HOOK, HookInfo.class);
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(MapItem.class, new TypeAdapterMapItem(false))
                .registerTypeAdapter(UnmodifiableMapItem.class, new TypeAdapterMapItem(true))
                .registerTypeAdapter(ItemInfo.class, new TypeAdapter(mapType))
                .create();

        for (String file : files)
        {
            HashMap<String, ItemInfo> infos = gson.fromJson(Files.newBufferedReader(Paths.get(FOLDER + file), StandardCharsets.UTF_8),
                                                            new TypeToken<HashMap<String, ItemInfo>>() {}.getType());
            mapItemInfo.putAll(infos);

            for (Map.Entry<String, ItemInfo> e : infos.entrySet())
            {
                ItemInfo info = e.getValue();
                info.addExpire(mapTimeOpen);
                info.buildCache();

                if (info.TYPE() == ItemType.CHEST)
                    mapChest.put(info.ID(), (ChestInfo) info);
            }
        }

        mapChest = Collections.unmodifiableMap(mapChest);
    }

    private void loadSkipTime (String folder, String filename) throws Exception
    {
        skipTimes = Json.fromFile(folder + filename, new TypeToken<HashMap<String, TreeMap<Integer, SkipTimeInfo>>>() {}.getType());
    }

    private void loadItemDropRate (String folder, String filename) throws Exception
    {
        itemDropRate = Json.fromFile(folder + filename, new TypeToken<LinkedHashMap<String, float[][]>>() {}.getType());
    }

    private void loadFestivalInfo (String folder, String... filenames) throws Exception
    {
        festivalInfo = new FestivalInfo();
        festivalInfo.setEvent01(Json.fromFile(folder + filenames[0], Event01Info.class));
        festivalInfo.setEvent02(Json.fromFile(folder + filenames[1], Event02Info.class));
        festivalInfo.setEvent03(Json.fromFile(folder + filenames[2], Event03Info.class));
        festivalInfo.init(mapItemInfo);
    }

    private void loadQuestBookInfo (String folder, String filename) throws Exception
    {
        questBookInfo = Json.fromFile(folder + filename, QuestBookInfo.class);
        questBookInfo.init();
    }

    private void loadRankingBoardInfo (String folder, String filename) throws Exception
    {
        rankingBoardInfo = Json.fromFile(folder + filename, RankingBoardInfo.class);
        rankingBoardInfo.init();
    }

    private void loadVIPInfo (String folder, String filename) throws Exception
    {
        vipInfo = Json.fromFile(folder + filename, VIPInfo.class);
        vipInfo.init();
    }

    private void loadTruckInfo (String folder, String filename) throws Exception
    {
        truckInfo = Json.fromFile(folder + filename, TruckInfo.class);
        truckInfo.init();
    }


    private void loadConsumeEventInfo (String folder, String filename) throws Exception
    {
        consumeEventInfo = Json.fromFile(folder + filename, ConsumeEventInfo.class);
        consumeEventInfo.init();
    }

    private void loadFlippingCardsInfo (String folder, String filename) throws Exception
    {
        flippingCardsInfo = Json.fromFile(folder + filename, FlippingCardsInfo.class);
        flippingCardsInfo.init();
    }

    private void loadQuestMissionInfo (String folder, String filename) throws Exception
    {
        questMissionInfo = Json.fromFile(folder + filename, QuestMissionInfo.class);
        questMissionInfo.init();
    }    

    private void loadGuildData (String folder, String filename) throws Exception
    {
        guildData = Json.fromFile(folder + filename, GuildData.class);
        guildData.init();
    }

    private void loadGuildDerbyData (String folder, String filename) throws Exception
    {
        guildDerbyData = Json.fromFile(folder + filename, GuildDerbyData.class);
        guildDerbyData.init();
    }

    private void loadGachaponInfo (String folder, String filename) throws Exception
    {
        gachaponInfo = Json.fromFile(folder + filename, GachaponInfo.class);
        gachaponInfo.init();
    }

    private void loadFishingInfo (String folder, String filename) throws Exception
    {
        fishingInfo = Json.fromFile(folder + filename, FishingInfo.class);
        fishingInfo.init();
    }

    private void loadPaymentAccumulateInfo (String folder, String filename) throws Exception
    {
        accumulateInfo = Json.fromFile(folder + filename, PaymentAccumulateInfo.class);
        accumulateInfo.init();
        
        AccumulateStore.checkAndCreate ();
    }

    public class TypeAdapter implements JsonSerializer<ItemInfo>, JsonDeserializer<ItemInfo>
    {
        final HashMap<Byte, Class<? extends ItemInfo>> mapType;

        public TypeAdapter (HashMap<Byte, Class<? extends ItemInfo>> mapType)
        {
            this.mapType = mapType;
        }

        @Override
        public JsonElement serialize (ItemInfo src, Type typeOfSrc, JsonSerializationContext context)
        {
            return Json.toJsonTree(src);
        }

        @Override
        public ItemInfo deserialize (JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException
        {
            JsonObject jsonObject = json.getAsJsonObject();
            byte type = jsonObject.get(KEY_TYPE).getAsByte();
            return Json.fromJson(json, mapType.get(type));
        }
    }

    public static ItemInfo getItemInfo (String id)
    {
        if (id == null || id.isEmpty())
            return null;
        return instance.mapItemInfo.get(id);
    }

    public static ItemInfo getItemInfo (String id, int type)
    {
        ItemInfo info = getItemInfo(id);
        if (info == null || info.TYPE() != type)
            return null;
        return info;
    }

    public static ProductInfo getProductInfo (String id)
    {
        ItemInfo info = getItemInfo(id);
        if (info instanceof ProductInfo)
            return (ProductInfo) info;
        return null;
    }

    public static SkinInfo getSkinInfo (String id)
    {
        ItemInfo info = getItemInfo(id);
        if (info instanceof SkinInfo)
            return (SkinInfo) info;
        return null;
    }

    public static ItemInfo getItemInfo (String id, int type, int subType)
    {
        ItemInfo info = getItemInfo(id);
        if (info == null || info.TYPE() != type || info.SUB_TYPE() != subType)
            return null;
        return info;
    }

    public static StockInfo getStockInfo (int id)
    {
        if (id < 0 || id >= instance.stock.length)
            return null;
        return instance.stock[id];
    }

    public static int numStock ()
    {
        return instance.stock.length;
    }

    public static FloorInfo getFloorInfo (int id)
    {
        if (id < 0 || id >= instance.floors.length)
            return null;
        return instance.floors[id];
    }

    public static int maxFloor ()
    {
        return instance.floors.length;
    }

    public static SkipTimeInfo getSkipTimeInfo (int type, int duration)
    {
        String name = ItemType.NAME[type];
        TreeMap<Integer, SkipTimeInfo> skipTime = instance.skipTimes.get(name);
        return skipTime.floorEntry(Math.max(0, duration)).getValue();
    }

    public static float[] itemDropRate (int type, int userLevel)
    {
        return instance.itemDropRate.get(ItemType.NAME[type])[userLevel];
    }

    public static MachineInfo getMachineInfo (int idFloor)
    {
        return instance.mapFloorToMachine.get(idFloor);
    }

    public static IBShopInfo.Item getIBShopInfo (String itemId, int num, String priceType)
    {
        return getIBShopInfo(IBShopInfo.getId(itemId, num, priceType));
    }

    public static IBShopInfo.Item getIBShopInfo (String id)
    {
        return instance.mapIbShop.get(id);
    }

    public static int typeToStock (int type)
    {
        return instance.mapTypeToStock.get(type);
    }

    public static ItemInfo getOldItem (int oldType, int oldId)
    {
        return null;
    }

    public static LuckySpinInfo getLuckySpinInfo ()
    {
        return instance.luckySpinInfo;
    }

    public static ComboInfo getComboInfo (String id)
    {
        return instance.mapComboInfo.get(id);
    }

    public static String getComboId (Collection<String> ids)
    {
        String comboId = null;
        HashSet<String> set = new HashSet<>();
        for (String id : ids)
        {
            ItemInfo info = instance.mapItemInfo.get(id);
            if (info == null || info.COMBO_ID() == null)
                return null;
            if (comboId == null)
                comboId = info.COMBO_ID();
            else if (!comboId.equals(info.COMBO_ID()))
                return null;
            set.add(id);
        }

        ComboInfo comboInfo = instance.mapComboInfo.get(comboId);
        if (set.size() != comboInfo.SIZE())
            return null;
        return comboId;
    }

    public static BlacksmithInfo getBlacksmithInfo ()
    {
        return instance.blacksmithInfo;
    }

    public static boolean isValidMapItem (MapItem map)
    {
        if (map == null || map.isEmpty())
            return false;
        for (MapItem.Entry e : map)
        {
            if (!instance.mapItemInfo.containsKey(e.key()))
                return false;
            if (e.value() <= 0)
                return false;
        }
        return true;
    }

    public static DiceInfo getDiceInfo ()
    {
        return instance.diceInfo;
    }

    public static boolean isExpiredItem (String id, int lastLogin)
    {
        int[][] durations = instance.mapTimeOpen.get(id);
        if (durations == null)
            return false;
        int timeOpen = Time.getTimeOpenDuration(durations);
        if (timeOpen <= 0 || lastLogin < timeOpen)
            return true;
        return !Time.isInDuration(durations);
    }

    public static DailyGiftInfo getDailyGiftInfo ()
    {
        return instance.dailyGiftInfo;
    }

    public static MineInfo getMineInfo ()
    {
        return instance.mineInfo;
    }

    public static FestivalInfo getFestival ()
    {
        return instance.festivalInfo;
    }

    public static Map<String, ChestInfo> getMapChestInfo ()
    {
        return instance.mapChest;
    }

    public static ChestInfo getChestInfo (String id)
    {
        return instance.mapChest.get(id);
    }

    public static JackGardenInfo getJackGardenInfo ()
    {
        return instance.jackGardenInfo;
    }

    public static QuestBookInfo getQuestBookInfo ()
    {
        return instance.questBookInfo;
    }

    public static RankingBoardInfo getRankingBoardInfo ()
    {
        return instance.rankingBoardInfo;
    }

    public static FlippingCardsInfo getFlippingCardsInfo ()
    {
        return instance.flippingCardsInfo;
    }

    public static QuestMissionInfo getQuestMissionInfo ()
    {
        return instance.questMissionInfo;
    }

    public static Map<String, Long> priceSellByMap (JsonObject mapItem)
    {
        Map<String, Long> map = new HashMap<>();
        for (Map.Entry<String, JsonElement> entry : mapItem.entrySet())
        {
            map.put(entry.getKey(), priceSell(entry.getValue().getAsJsonObject()));
        }
        return map;
    }

    public static long priceSell (JsonObject mapItem)
    {
        long total = 0;
        Debug.info();
        for (Map.Entry<String, JsonElement> entry : mapItem.entrySet())
        {
            ItemInfo info = getItemInfo(entry.getKey());
            int num = entry.getValue().getAsInt();
            Debug.info("total", total, "item", entry.getKey(), "num", num, "price", info.priceSellForJack());

            total += info.priceSellForJack() * num;

        }
        return total;
    }

    public static VIPInfo getVIPInfo ()
    {
        return instance.vipInfo;
    }

    public static TruckInfo getTruckInfo ()
    {
        return instance.truckInfo;
    }

    public static FishingInfo getFishingInfo ()
    {
        return instance.fishingInfo;
    }

    public static ConsumeEventInfo getConsumeEventInfo ()
    {
        return instance.consumeEventInfo;
    }

    public static GuildData getGuildData ()
    {
        return instance.guildData;
    }

    public static GuildDerbyData getGuildDerbyData ()
    {
        return instance.guildDerbyData;
    }

    public static GachaponInfo getGachaponInfo ()
    {
        return instance.gachaponInfo;
    }

	public static PaymentAccumulateInfo getAccumulate()
	{
		return instance.accumulateInfo;
	}
}
