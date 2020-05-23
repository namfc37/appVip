package service.old;

import cmd.ErrorConst;
import data.ConstInfo;
import data.ItemId;
import data.ItemInfo;
import model.PrivateShop;
import model.UserGame;
import model.object.ConvertInfo;
import model.object.Floor;
import model.object.Machine;
import util.collection.MapItem;

import java.util.HashMap;

public class UserConverter extends UserParser
{
    public UserConverter (long userId) throws Exception
    {
        super(userId);
    }

    public byte check (ConvertInfo info) throws Exception
    {
        byte result;
        parseOldData();

        FBJson userInfo = (FBJson) this.get(prefix + KeyID.KEY_USER_INFOS);
        if (userInfo == null)
        {
            result = ErrorConst.NULL_OBJECT;
        }
        else
        {
            info.id = (Long) userInfo.get("id");
            info.name = (String) userInfo.get("name");

            info.level = (Short) userInfo.get("level");
            info.exp = (Long) userInfo.get("exp");

            info.facebookId = (String) userInfo.get("facebook_id");
            info.facebookName = (String) userInfo.get("facebook_name");

            info.lastPayTime = (String) this.get(prefix + KeyID.KEY_LAST_PAY_TIME);
            info.totalPaid = (Integer) this.get(prefix + KeyID.KEY_TOTAL_PAID);

            info.coinCash = (Long) this.get(prefix + KeyID.KEY_MONEY_REAL);
            info.coinBonus = (Long) this.get(prefix + KeyID.KEY_MONEY_BONUS);
            info.coinTotalReal = (Long) this.get(prefix + KeyID.KEY_MONEY_REAL_TOTAL);
            info.coinTotalBonus = (Long) this.get(prefix + KeyID.KEY_MONEY_BONUS_TOTAL);

            if (info.level == null)
            {
                result = ErrorConst.NULL_ITEM_INFO;
            }
            else
            {
                info.reward = generateSupport(info.level, info.totalPaid, info.coinCash);
                result = ErrorConst.PROCESSING;
            }
        }

        return result;
    }

    private static final float vndToCoin = 1.0f / 100;

    private MapItem generateSupport (Short level, Integer totalPaid, Long coinCash)
    {
        if (level < 50)
            return null;

        if (totalPaid == null)
            totalPaid = 0;

        if (coinCash == null)
            coinCash = 0l;

        int suportCoin = Math.round(0.1f * totalPaid * vndToCoin + coinCash);

        int supportExp = 0;
        if (level > 250) supportExp = 16208244;
        else if (level > 200) supportExp = 8863938;
        else if (level > 200) supportExp = 8863938;
        else if (level > 150) supportExp = 4089303;
        else if (level > 100) supportExp = 1607761;
        else if (level > 80) supportExp = 364544;
        else supportExp = 51709;

        MapItem reward = new MapItem();
        if (supportExp > 0)
            reward.increase(ItemId.EXP, supportExp);

        if (suportCoin > 0)
            reward.increase(ItemId.COIN, suportCoin);

        return reward;
    }

    public UserGame.Builder getUserGame () throws Exception
    {
        FBJson userInfoJson = (FBJson) get(prefix + KeyID.KEY_USER_INFOS);
        if (userInfoJson == null)
            userInfoJson = (FBJson) parse(baseId, prefix + KeyID.KEY_USER_INFOS, "parseUserInfo", FBJSON_CLASS);

        UserGame.Builder userBuilder = UserGame.newBuilder();
        userBuilder
                .setExp((long) userInfoJson.get("exp"))
                .setGold((long) userInfoJson.get("gold"))
                .setLevel((short) userInfoJson.get("level"))
                .setReputation((long) userInfoJson.get("reputation"))
        ;

        convertStocks(userBuilder);
        convertFloors(userBuilder);
        return userBuilder;
    }

    private void convertStocks (UserGame.Builder userBuilder) throws Exception
    {
        int[] listStock = {
                0    //plant
//		,	1	//
//		,	2	//
//		,	3	//event
//		,	4	//mineral		
        };

        for (int i = 0; i < listStock.length; i++)
        {
            int stockId = listStock[i];

            FBJson userStockJson = (FBJson) get(prefix + KeyID.KEY_STOCKS + stockId);
            if (userStockJson == null)
                userStockJson = (FBJson) parse(baseId, prefix + KeyID.KEY_STOCKS + stockId, "parseStock", FBJSON_CLASS);

            if (userStockJson == null)
                continue;

            userBuilder.setStockLevel(stockId, (short) userStockJson.get("level"));

            int total_item = (int) userStockJson.get("total_item");
            for (int j = 0; j < total_item; j++)
            {
                userBuilder.addStock(
                        (int) userStockJson.get(KeyID.KEY_STOCK_ITEM_TYPE + j)        //oldType
                        , (int) userStockJson.get(KeyID.KEY_STOCK_ITEM_ID + j)        //oldId
                        , (int) userStockJson.get(KeyID.KEY_STOCK_ITEM_QUANTITY + j)    //num
                                    );
            }
        }
    }

    private void convertFloors (UserGame.Builder userBuilder) throws Exception
    {
        HashMap<Integer, Machine.Builder> machineBuilders = new HashMap<Integer, Machine.Builder>();
        for (int floorId = 0; floorId < TOTAL_FLOOR; floorId++)
        {
            FBJson userFloorJson = (FBJson) get(prefix + KeyID.KEY_FLOORS + floorId);
            if (userFloorJson == null)
                userFloorJson = (FBJson) parse(baseId, prefix + KeyID.KEY_FLOORS + floorId, "parseFloor", FBJSON_CLASS);

            if (userFloorJson == null)
                continue;

            Floor.Builder floorBuilder = userBuilder.addFloor();
            for (int slotId = 0; slotId < 6; slotId++)
            {
                FBJson slot = (FBJson) userFloorJson.get("slot_" + slotId);
                if (slot == null)
                    continue;

                FBJson pot = (FBJson) slot.get("pot");
                FBJson plant = (FBJson) pot.get("plant");
                FBJson decor = (FBJson) slot.get("decor");

                floorBuilder.getSlot(slotId)
                            .setPot((short) pot.get("id"))
                            .setPlant((short) plant.get("id"))
                            .setPest((boolean) plant.get("hasBug"))
                            .setTimeStart((int) plant.get("start_time"))
                            .setDecor((int) decor.get("id"))
                ;
            }

            machineBuilders.put(floorId, floorBuilder.getMachine());
        }

        for (int i = 0; i < TOTAL_FLOOR; i++)
        {
            FBJson machineJson = (FBJson) get(prefix + KeyID.KEY_MACHINES + i);
            if (machineJson == null)
                machineJson = (FBJson) parse(baseId, prefix + KeyID.KEY_MACHINES + i, "parseMachine", FBJSON_CLASS);

            if (machineJson == null || !machineJson.containsKey("floor"))
                continue;

            int floorId = (byte) machineJson.get("floor");
            byte slot_max = (byte) machineJson.get("slot_max");
            byte product_count = (byte) machineJson.get("product_count");
//			String dropList = (String) machineJson.get ("drop_list");

            Machine.Builder machineBuilder = machineBuilders.get(floorId)
                                                            .setLevel((short) machineJson.get("level"))
                                                            .setNumSlot(slot_max)
//	        	.setTimeStartUnlock ()
//	        	.setWorkingTime (int workingTime)
//	        	.setTimeProduce (int timeProduce)
                    ;

            for (int slot = 0; slot < slot_max; slot++)
            {
                FBJson slotMachine = (FBJson) machineJson.get(KeyID.KEY_MACHINE_SLOT + slot);
                if (slotMachine != null)
                    machineBuilder.addStore((short) slotMachine.get("product_id"));
            }

            for (int product = 0; product < product_count; product++)
            {
                FBJson prod_data = (FBJson) machineJson.get(KeyID.KEY_MACHINE_PRODUCT + product);
                if (prod_data != null)
                    machineBuilder.addProduceItem((byte) prod_data.get(KeyID.KEY_STOCK_PRODUCT_ID));
            }
        }

        for (int i = 0; i < TOTAL_FLOOR; i++)
        {
            FBJson machineDurabilityJson = (FBJson) get(prefix + KeyID.KEY_MACHINES_DURABILITY + i);
            if (machineDurabilityJson == null)
                machineDurabilityJson = (FBJson) parse(baseId, prefix + KeyID.KEY_MACHINES_DURABILITY + i, "parseMachineDurability", FBJSON_CLASS);

            if (machineDurabilityJson == null || !machineDurabilityJson.binaryContainsKey("floor"))
                continue;

            int floorId = (byte) machineDurabilityJson.get("floor");
            machineBuilders.get(floorId)
                           .setDurability((short) machineDurabilityJson.get("durability_cur"))
            ;
        }
    }

    public PrivateShop.Builder getPrivateShop () throws Exception
    {
        FBJson privateShopJson = (FBJson) get(prefix + KeyID.KEY_PRIVATE_SHOP);
        if (privateShopJson == null)
            privateShopJson = (FBJson) parse(baseId, prefix + KeyID.KEY_PRIVATE_SHOP, "parsePrivateShopManager", FBJSON_CLASS);

        short nslot = (short) privateShopJson.get("nslot");

        PrivateShop.Builder privateShopBuilder = PrivateShop.newBuilder((int) userId());
        privateShopBuilder
//	        .setNumFriendSlot (byte numFriendSlot)
.setNumBuySlot((byte) nslot)
//			.setTimeAd (int timeAd)
        ;

        for (int slot = 0; slot < nslot; slot++)
        {
            FBJson slotData = (FBJson) privateShopJson.get(KeyID.KEY_PS_SLOT + slot);
            if (slotData == null || !slotData.containsKey("slot_id"))
                continue;

            FBJson item_bin = (FBJson) slotData.get("item_bin");
            if (item_bin == null || !item_bin.containsKey("itype"))
                continue;

            int slotId = (short) slotData.get("slot_id");
            short itype = (short) item_bin.get("itype");
            short id = (short) item_bin.get("id");
            ItemInfo item = ConstInfo.getOldItem(itype, id);
            if (item == null)
                continue;

            String buyer = (String) item_bin.get("buyer_id");
            if (buyer == "-1")
            {
                privateShopBuilder.put(
                        slotId
                        , item.ID()                                    //String itemId
                        , (short) item_bin.get("number")                //itemNum
                        , (short) item_bin.get("price")                //price
                        , (boolean) item_bin.get("hasAdvertise")        //useAd
                        , this.baseId.name()                            //userBucket
                                      );
            }
            else
            {
                long buyerId = Long.parseLong(buyer);
                UserConverter buyerData = OldServer.getUserById(buyerId);
                FBJson buyerInfoJson = (FBJson) buyerData.parse(buyerData.baseId, buyerData.prefix + KeyID.KEY_USER_INFOS, "parseUserInfo", FBJSON_CLASS);

                privateShopBuilder.put(
                        slotId
                        , item.ID()                                    //String itemId
                        , (short) item_bin.get("number")                //itemNum
                        , (short) item_bin.get("price")                //price
                        , (boolean) item_bin.get("hasAdvertise")        //useAd
                        , this.baseId.name()                            //userBucket
                        , buyerId                                        //buyerId
                        , (String) buyerInfoJson.get("name")            //buyerName
                        , (String) buyerInfoJson.get("facebook_id")    //buyerAvatar - use facebook_id
                                      );
            }
        }
        return privateShopBuilder;
    }

    public long getCoinReal () throws Exception
    {
        Long value = null;
        String key = prefix + KeyID.KEY_MONEY_REAL;
        if (containsKey(key))
            value = (Long) get(key);
        else
            value = (Long) parse(BucketId.money, key, "parseMoney", STRING_CLASS);

        if (value == null)
            return 0;

        return value;
    }

    public long getCoinBonus () throws Exception
    {
        Long value = null;
        String key = prefix + KeyID.KEY_MONEY_BONUS;
        if (containsKey(key))
            value = (Long) get(key);
        else
            value = (Long) parse(BucketId.money, key, "parseMoney", STRING_CLASS);

        if (value == null)
            return 0;

        return value;
    }

    public String getFacebookId () throws Exception
    {
        FBJson userInfoJson = (FBJson) get(prefix + KeyID.KEY_USER_INFOS);
        if (userInfoJson == null)
            userInfoJson = (FBJson) parse(baseId, prefix + KeyID.KEY_USER_INFOS, "parseUserInfo", FBJSON_CLASS);

        String facebookId = (String) userInfoJson.get("facebook_id");
        if (facebookId == null)
            return "";

        return facebookId;
    }
}