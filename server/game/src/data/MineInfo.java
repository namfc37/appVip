package data;

import util.collection.MapItem;

import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.ThreadLocalRandom;

//import bitzero.util.common.business.Debug;
//import util.metric.MetricLog;

public class MineInfo
{
    private NavigableMap<Integer, MineRequireInfo> REQUIRE_ITEMS;
    private Map<String, MineProductInfo>           PRODUCT_ITEMS;

    public void init ()
    {
        for (Integer level : this.REQUIRE_ITEMS.keySet())
            this.REQUIRE_ITEMS.get(level).init();

        this.REQUIRE_ITEMS = Collections.unmodifiableNavigableMap(this.REQUIRE_ITEMS);
        this.PRODUCT_ITEMS = Collections.unmodifiableMap(this.PRODUCT_ITEMS);
    }

//	public void check ()
//	{
//		int levels [] = {31, 50, 80, 100, 110, 120, 130};
//		int test = 10;
//		for (int lid = 0; lid < levels.length; lid++)
//		{
//			int level = levels [lid];
//			for (int t = 0; t < test; t++)
//			{
//				MineHelper helper = generateMine(level);
//				helper.debug();
//			}
//		}
//	}

    public MineHelper generateMine (int userLevel)
    {
        MineHelper helper = new MineHelper();

        Entry<Integer, MineRequireInfo> requireDetail = this.REQUIRE_ITEMS.floorEntry(userLevel);
        MineRequireInfo mineRequireInfo = requireDetail.getValue();
        if (mineRequireInfo == null)
            return null;

        helper.requireItems = mineRequireInfo.generate(userLevel);

        int gold = 0;
        int exp = 0;
        for (util.collection.MapItem.Entry entry : helper.requireItems)
        {
            ItemInfo info = ConstInfo.getItemInfo(entry.key());
            int num = entry.value();
            switch (info.TYPE())
            {
                case ItemType.PLANT:
                    PlantInfo plantInfo = (PlantInfo) info;
                    gold += num * plantInfo.GOLD_BASIC() * UserLevelInfo.NO_GOLD_COEFFICIENT_RATIO(userLevel);
                    exp += num * plantInfo.EXP_BASIC() * UserLevelInfo.NO_XP_COEFFICIENT_RATIO(userLevel);
                    break;
                case ItemType.PRODUCT:
                    ProductInfo productInfo = (ProductInfo) info;
                    gold += num * productInfo.GOLD_BASIC() * UserLevelInfo.NO_GOLD_COEFFICIENT_RATIO(userLevel);
                    exp += num * productInfo.EXP_BASIC() * UserLevelInfo.NO_XP_COEFFICIENT_RATIO(userLevel);
                    break;
            }
        }

        int requireNumber = helper.requireItems.size();
        if (requireNumber < 1)
            return null;

        ThreadLocalRandom random = ThreadLocalRandom.current();
        helper.receiveItems = new MapItem();

        for (String itemId : PRODUCT_ITEMS.keySet())
        {
            MineProductInfo productInfo = PRODUCT_ITEMS.get(itemId);
            if (random.nextInt(100) > productInfo.RATE)
                continue;

            int number = 0;
            switch (itemId)
            {
                case ItemId.GOLD:
                {
                    number = gold;
                    break;
                }
                case ItemId.EXP:
                {
                    number = exp;
                    break;
                }
                default:
                {
                    if (requireNumber < productInfo.NUMBER_TYPES_TO_REWARDS.length)
                        number = productInfo.NUMBER_TYPES_TO_REWARDS[requireNumber];
                    else
                        number = productInfo.NUMBER_TYPES_TO_REWARDS[productInfo.NUMBER_TYPES_TO_REWARDS.length - 1];
                    break;
                }
            }

            if (number != 0)
                helper.receiveItems.put(itemId, number);
        }

        helper.receiveItems = helper.receiveItems.toUnmodifiableMapItem();

        return helper;
    }

    public int getGemSkipTime (int remainSeconds)
    {
        SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.MINER, MiscInfo.MINE_DURATION_SECONDS());
        return skipTimeInfo.calcPrice(remainSeconds);
    }

    private static class MineRequireInfo
    {
        private int     USER_LEVEL                  = 0;
        private int     MIN_ITEM_TYPE               = 0;
        private int     MAX_ITEM_TYPE               = 0;
        private MapItem EASY_REQUIRE;
        private MapItem MEDIUM_REQUIRE;
        private MapItem HARD_REQUIRE;
        private int     MIN_NUM_REQUIRE_ITEM_EASY   = 0;
        private int     MAX_NUM_REQUIRE_ITEM_EASY   = 0;
        private int     MIN_NUM_REQUIRE_ITEM_MEDIUM = 0;
        private int     MAX_NUM_REQUIRE_ITEM_MEDIUM = 0;
        private int     MIN_NUM_REQUIRE_ITEM_HARD   = 0;
        private int     MAX_NUM_REQUIRE_ITEM_HARD   = 0;

        public void init ()
        {
            this.EASY_REQUIRE = this.EASY_REQUIRE.toUnmodifiableMapItem();
            this.MEDIUM_REQUIRE = this.MEDIUM_REQUIRE.toUnmodifiableMapItem();
            this.HARD_REQUIRE = this.HARD_REQUIRE.toUnmodifiableMapItem();
        }

        public MapItem generate (int userLevel)
        {
            MapItem require = new MapItem();
            ThreadLocalRandom random = ThreadLocalRandom.current();

            int itemTypes = random.nextInt(this.MIN_ITEM_TYPE, this.MAX_ITEM_TYPE + 1);
            int easyTypes = random.nextInt(MiscInfo.MINE_EASY_TYPES_REQUIRE_MIN(), MiscInfo.MINE_EASY_TYPES_REQUIRE_MAX() + 1);
            int mediumTypes = 0;
            int hardTypes = 0;

            if (easyTypes < itemTypes)
            {
                int temp = itemTypes - easyTypes;
                if (temp > MiscInfo.MINE_MEDIUM_TYPES_REQUIRE_MAX() + 1)
                    temp = MiscInfo.MINE_MEDIUM_TYPES_REQUIRE_MAX() + 1;

                mediumTypes = random.nextInt(MiscInfo.MINE_MEDIUM_TYPES_REQUIRE_MIN(), temp);
            }

            if (easyTypes + mediumTypes < itemTypes)
                hardTypes = itemTypes - easyTypes - mediumTypes;

            List<String> easyItemIds = randomItemIds(random, easyTypes, this.filter(EASY_REQUIRE, userLevel));
            require.increase(randomRequireItems(random, this.MIN_NUM_REQUIRE_ITEM_EASY, this.MAX_NUM_REQUIRE_ITEM_EASY, easyItemIds));

            List<String> mediumItemIds = randomItemIds(random, mediumTypes, this.filter(MEDIUM_REQUIRE, userLevel));
            require.increase(randomRequireItems(random, this.MIN_NUM_REQUIRE_ITEM_MEDIUM, this.MAX_NUM_REQUIRE_ITEM_MEDIUM, mediumItemIds));

            List<String> hardItemIds = randomItemIds(random, hardTypes, this.filter(HARD_REQUIRE, userLevel));
            require.increase(randomRequireItems(random, this.MIN_NUM_REQUIRE_ITEM_HARD, this.MAX_NUM_REQUIRE_ITEM_HARD, hardItemIds));

//			MapItem easyFilter = this.filter(EASY_REQUIRE, userLevel);
//			List<String> easyItemIds = randomItemIds (random, easyTypes, easyFilter);
//			MapItem easyItems = randomRequireItems (random, this.MIN_NUM_REQUIRE_ITEM_EASY, this.MAX_NUM_REQUIRE_ITEM_EASY, easyItemIds);
//			require.increase(easyItems);
//			
//			MapItem mediumFilter = this.filter(MEDIUM_REQUIRE, userLevel);
//			List<String> mediumItemIds = randomItemIds (random, mediumTypes, mediumFilter);
//			MapItem mediumItems = randomRequireItems (random, this.MIN_NUM_REQUIRE_ITEM_MEDIUM, this.MAX_NUM_REQUIRE_ITEM_MEDIUM, mediumItemIds);
//			require.increase(mediumItems);
//			
//			MapItem hardFilter = this.filter(HARD_REQUIRE, userLevel);
//			List<String> hardItemIds = randomItemIds (random, hardTypes, hardFilter);
//			MapItem hardItems = randomRequireItems (random, this.MIN_NUM_REQUIRE_ITEM_HARD, this.MAX_NUM_REQUIRE_ITEM_HARD, hardItemIds);
//			require.increase(hardItems);

//			helper.level = userLevel;
//			helper.total = itemTypes;
//			helper.easy = easyTypes;
//			helper.medium = mediumTypes;
//			helper.hard = hardTypes;
//			helper.easyItems = easyItems;
//			helper.mediumItems = mediumItems;
//			helper.hardItems = hardItems;
            return require.toUnmodifiableMapItem();
        }

        private MapItem filter (MapItem src, int userLevel)
        {
            MapItem item = new MapItem();

            for (util.collection.MapItem.Entry entry : src)
            {
                ItemInfo info = ConstInfo.getItemInfo(entry.key());
                boolean lock = false;
                switch (info.TYPE())
                {
                    case ItemType.PLANT:
                        PlantInfo plantInfo = (PlantInfo) info;
                        lock = userLevel < plantInfo.LEVEL_UNLOCK();
                        break;
                    case ItemType.PRODUCT:
                        ProductInfo productInfo = (ProductInfo) info;
                        lock = userLevel < productInfo.LEVEL_UNLOCK();
                        break;
                }

                if (lock)
                    continue;

                item.put(entry.key(), entry.value());
            }

            return item;
        }

        private MapItem randomRequireItems (ThreadLocalRandom random, int min, int max, List<String> itemIds)
        {
            if (itemIds == null || itemIds.isEmpty())
                return null;

            MapItem item = new MapItem();
            for (String itemId : itemIds)
                item.put(itemId, random.nextInt(min, max + 1));

            return item;
        }

        private List<String> randomItemIds (ThreadLocalRandom random, int numberItems, MapItem itemRates)
        {
            if (itemRates == null || itemRates.isEmpty())
                return null;

//			get number unique itemIds with rate 
            List<String> target = new ArrayList<String>();
            while (target.size() < numberItems)
                target.add(randomItemId(random, itemRates, target));

            return target;
        }

        private String randomItemId (ThreadLocalRandom random, MapItem itemRates, List<String> exceptItems)
        {
            TreeMap<Integer, String> target = new TreeMap<Integer, String>();
            int total = 0;

            for (util.collection.MapItem.Entry item : itemRates)
            {
                if (exceptItems.contains(item.key()))
                    continue;

                total += item.value();
                target.put(total, item.key());
            }

            if (total < 1)
                return "";

            int r = random.nextInt(total);
            Entry<Integer, String> entry = target.ceilingEntry(r);

            return entry.getValue();
        }
    }

    private static class MineProductInfo
    {
        private String ITEM_NAME = "";
        private int    RATE      = 0;
        private int[]  NUMBER_TYPES_TO_REWARDS;
    }

    public static class MineHelper
    {
        //		public int level = 0;
//		public int total = 0;
//		public int easy = 0;
//		public int medium = 0;
//		public int hard = 0;
//		public MapItem easyItems = null;
//		public MapItem mediumItems = null;
//		public MapItem hardItems = null;
        public MapItem requireItems;
        public MapItem receiveItems;

//		public void debug ()
//		{
//			Debug.info("MineHelper"
//			, level
//			, total
//			, easy, MetricLog.toString(easyItems)
//			, medium, MetricLog.toString(mediumItems)
//			, hard, MetricLog.toString(hardItems)
//			, MetricLog.toString(requireItems)
//			, MetricLog.toString(receiveItems)
//			);
//		}
    }
}