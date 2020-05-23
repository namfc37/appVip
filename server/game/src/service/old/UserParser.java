package service.old;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

class UserParser extends Parser
{
    public static    int      TOTAL_FLOOR   = 10;
    protected static Class<?> FBJSON_CLASS  = FBJson.class;
    protected static Class<?> INTEGER_CLASS = Integer.class;
    protected static Class<?> LONG_CLASS    = Long.class;
    protected static Class<?> STRING_CLASS  = String.class;

    protected transient long     userId      = -1;
    protected transient String   userSession = "";
    protected transient String   prefix      = "";
    protected transient BucketId baseId      = null;

    protected transient boolean isReady     = false;
    protected transient boolean isLoadedAll = false;

    public UserParser (long userId) throws Exception
    {
        super();

        this.userId = userId;
        this.prefix = userId + "_";
        byte index = (byte) parse(BucketId.indexer, "" + userId, "parseByte", Byte.class);

        this.baseId = OldServer.indexTodatabase(index);
        if (baseId == null)
            return;

        this.userSession = (String) parse(baseId, prefix + KeyID.KEY_USER_SESSION_ID, "parseString", STRING_CLASS);
        if (this.userSession.equalsIgnoreCase("backup"))
            return;

        isReady = true;
    }

    public boolean isReady ()
    {
        return isReady;
    }

    public long userId ()
    {
        return userId;
    }

    public String userSession ()
    {
        return userSession;
    }

    protected void parseOldData () throws Exception
    {
        if (!isReady)
            return;

        FBJson userInfo = (FBJson) parse(baseId, prefix + KeyID.KEY_USER_INFOS, "parseUserInfo", FBJSON_CLASS);

//		String facebook_id = (String) userInfo.get("facebook_id");
//		parse (BucketId.general, "fb_" + facebook_id + "_u", "parseString", STRING_CLASS);
//		
//		String zalo_id = (String) userInfo.get("zalo_id");
//		parse (BucketId.general, "zalo_" + zalo_id + "_u", "parseLong", Long.class);
//		
//		String zing_id = (String) userInfo.get("zing_id");
//		parse (BucketId.general, "zing_" + zing_id + "_u", "parseLong", Long.class);

        String[] keys = {KeyID.KEY_MONEY_REAL, KeyID.KEY_MONEY_BONUS, KeyID.KEY_MONEY_REAL_TOTAL, KeyID.KEY_MONEY_BONUS_TOTAL};
        for (String key : keys)
            parse(BucketId.money, prefix + key, "parseMoney", STRING_CLASS);

//		parse (baseId, prefix + KeyID.KEY_PRIVATE_SHOP, "parsePrivateShopManager", FBJSON_CLASS);
//		parse (baseId, prefix + "npc", "parsePrivateShopManager", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_GIFT, "parseGiftManager", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_MERCHANT, "parseMerchantManager", FBJSON_CLASS);
//		
//		keys = new String[] {"fb", "zalo", "system"};		
//		for (String key : keys)
//			parse (baseId, prefix + KeyID.KEY_FRIENDS + "_" + key, "parseFriend", STRING_CLASS);

//		DatabaseID.STOCK_MAX = 3
//		for (int i = 0; i < 3; i++)
//			parse (baseId, prefix + KeyID.KEY_STOCKS + i, "parseStock", FBJSON_CLASS);
//	
//		for (int i = 0; i < TOTAL_FLOOR; i++)
//			parse (baseId, prefix + KeyID.KEY_FLOORS + i, "parseFloor", FBJSON_CLASS);

//		DatabaseID.STOCK_EVENT = 3
//		parse (baseId, prefix + KeyID.KEY_STOCKS + 3, "parseStock", FBJSON_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_PASSCODE_DATA, "parseUserPasscode", FBJSON_CLASS);

//		DatabaseID.MAX_FLOOR_EVENT
//		for (int i = 0; i < 1; i++)
//		{
//			parse (baseId, prefix + KeyID.KEY_EVENT_FORM2_INFO + i, "parseFloorEventInfo", FBJSON_CLASS);
//			parse (baseId, prefix + KeyID.KEY_FLOOR_EVENT + i, "parseFloor", FBJSON_CLASS);
//		}
//	
//		for (int i = 0; i < TOTAL_FLOOR; i++)
//			parse (baseId, prefix + KeyID.KEY_MACHINES + i, "parseMachine", FBJSON_CLASS);
//	
//		for (int i = 0; i < TOTAL_FLOOR; i++)
//			parse (baseId, prefix + KeyID.KEY_MACHINES_DURABILITY + i, "parseMachineDurability", FBJSON_CLASS);

//		Server.s_globalDB[DatabaseID.SHEET_MACHINE].length = 13
//		for (int i = 0; i < 13; i++)
//			parse (baseId, prefix + KeyID.KEY_NPC_MACHINES_DURABILITY + i, "parseMachineDurability", FBJSON_CLASS);
//	
//		parse (baseId, prefix + KeyID.KEY_OWL, "parseOwl", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_ORDER, "parseOrderManager", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_DAILY_GIFT, "parseDailyGift", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_MACHINES_REPAIR_LIMIT, "parseMachineRepairLimit", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_BUG_POOL, "parseBugPool", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_USER_BUG_APPEAR_RATIO, "parseBugRatio", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_AIRSHIP, "parseAirship", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_TOM_KID, "parseTomKid", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_FORTUNE_V2, "parseRotaFortunaeManagerV2", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_INVITE_FRIEND, "parseInviteFriend", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_PRIVATE_INFO, "parsePrivateInfo", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_COMBO, "parseComboManager", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_CLOSE_FRIEND, "parseCloseFriend", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_TREASURE, "parseTreasureTrunk", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_CYCLE_GIFT, "parseCycleGift", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_DAILY_QUEST, "parseDailyGift", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_USER_CLAN_INFO, "parseUserClan", FBJSON_CLASS);

//		DatabaseID.STOCK_MINERAL = 4
//		parse (baseId, prefix + KeyID.KEY_STOCKS + 4, "parseStock", FBJSON_CLASS);

//		parse (baseId, prefix + KeyID.KEY_MACHINES_SMITH, "parseBlackSmith", FBJSON_CLASS);

//		OfferManager.KEY_PAID_OFFER = "new_offer"
//		parse (baseId, prefix + "new_offer", "parseOfferManager", FBJSON_CLASS);

//		OfferManager.KEY_NEWBIE_OFFER_GIFT = "newbie_offer_gift"
//		parse (baseId, prefix + "newbie_offer_gift", "parseOfferGift", FBJSON_CLASS);

//		OfferManager.KEY_PAID_OFFER_GIFT = "new_offer_gift"
//		parse (baseId, prefix + "new_offer_gift", "parseOfferGift", FBJSON_CLASS);
//		
//		parse (baseId, prefix + KeyID.ONLINE, "parseString", STRING_CLASS);
//		parse (baseId, prefix + KeyID.BAN, "parseUserBan", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_NEW_TUTORIAL, "parseString", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_TUTORIAL_STEP, "parseInt", Integer.class);
//
//		parse (baseId, prefix + KeyID.KEY_FISHING_DATA, "parseUserFishing", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_MAIL_BOX, "parseMailBox", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_GIFT_CODE_ENTER, "parseGiftCodeEnter", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_NPC_SHOP, "parseNPCShop", FBJSON_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_ACHIEVEMENT_TROPHY, "parseAchievementTrophy", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_ADDING_USER_INFOS, "parseAddingUserInfo", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_AUTO_INFO, "parseAutoInfo", FBJSON_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_AIRSHIP_LOCKER, "parseInt", Integer.class);

        int _count_paid = (int) parse(baseId, prefix + KeyID.KEY_COUNT_PAID, "parseInt", Integer.class);
        for (int i = 0; i < _count_paid; i++)
            parse(baseId, prefix + KeyID.KEY_PAYMENT_LOG + "_" + i, "parseString", STRING_CLASS);

        parse(baseId, prefix + KeyID.KEY_LAST_PAY_TIME, "parseString", STRING_CLASS);
        parse(baseId, prefix + KeyID.KEY_TOTAL_PAID, "parseInt", Integer.class);

//		parse (baseId, prefix + KeyID.KEY_NPC_MACHINE_DAILY_RESET_TIME, "parseInt", Integer.class);
//
//		parse (baseId, prefix + KeyID.KEY_MINIGAME_INFO, "parseUserMinigame", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_MINER, "parseMiner", FBJSON_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_ADS_USER_INFO, "parseUserAdsInfo", FBJSON_CLASS);
//
//		parse (baseId, prefix + KeyID.KEY_USER_SKIN, "parseUserSkin", FBJSON_CLASS);

//		parse (DBDefine.general, _device_id + "_" + KeyID.KEY_USER_ID, "parseUserId", byte[].class);

//		parse (baseId, prefix + KeyID.KEY_USER_LAST_LOGIN, "parseInt", Integer.class);
//		
//		parse (baseId, prefix + KeyID.KEY_OFFER_SYSTEM, "parseOfferSystem", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_OFFER_PAY_BONUS_DAILY, "parseOfferPayBonusDaily", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_OLD_OFFER_VIP_BONUS, "parseInt", Integer.class);
//
//		parse (baseId, prefix + KeyID.KEY_PET_DATA, "parseUserPet", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_MISCV2, "parseUserMiscV2", FBJSON_CLASS);
//
//		parse (baseId, prefix + KeyID.KEY_USER_LIKED_COUNT, "parseString", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_USER_LIKED_LIST, "parseString", STRING_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_PS_VIEWER, "parsePrivateShopViewer", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_PS_LOCK_DATA, "parseString", STRING_CLASS);
//
//		parse (baseId, prefix + KeyID.KEY_INVEST, "parseInvestManager", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_GENDER_INFO, "parseGenderInfo", FBJSON_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_GARDEN_APPRAISAL, "parseLong", Long.class);
//		
//		parse (BucketId.temp, prefix + KeyID.KEY_DIRTPOT_FRIEND, "parseShort", Short.class);
//		parse (baseId, prefix + KeyID.KEY_CURRENT_MISSION_ID, "parseInt", Integer.class);
//		parse (baseId, prefix + KeyID.KEY_LOCK_TASK_RESTORE, "parseString", STRING_CLASS);
//		parse (baseId, prefix + KeyID.KEY_ANDROID_PAYLOAD, "parseString", STRING_CLASS);
//		
//		parse (baseId, prefix + KeyID.KEY_CUMKC_DATA, "parseEventCumKC", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_EVENT_SHARE_PIC, "parseEventSharePic", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_LUCKY_BOX_GIFT_DATA, "parseLuckyGiftBox", FBJSON_CLASS);
//		parse (baseId, prefix + KeyID.KEY_ROTA_FORTUNAE_PAID_COUNT, "parseInt", Integer.class);

        isLoadedAll = true;
    }

    public FBJson parseUserInfo (byte[] bin)
    {
        FBJson json = new FBJson(bin);
        return parseUserInfo(json);
    }

    public FBJson parseUserInfo (FBJson json)
    {
        json.set("id", KeyID.KEY_USER_ID, FBType.LONG);
//		json.set("device_id", KeyID.KEY_DEVICE_ID, FBType.STRING);
        json.set("facebook_id", KeyID.KEY_FACEBOOK_ID, FBType.STRING);
        json.set("name", KeyID.KEY_USER_NAME, FBType.STRING);
        json.set("exp", KeyID.KEY_USER_EXP, FBType.LONG);
        json.set("gold", KeyID.KEY_USER_GOLD, FBType.LONG);
        json.set("reputation", KeyID.KEY_USER_REPUTATION, FBType.LONG);
//		json.set("appraisal", KeyID.KEY_USER_APPRAISAL, FBType.LONG);
//		json.set("machineAppraisal", KeyID.KEY_USER_MACHINE_APPRAISAL, FBType.LONG);
//		json.set("floorAppraisal", KeyID.KEY_USER_FLOOR_APPRAISAL, FBType.LONG);
//		json.set("potAppraisal", KeyID.KEY_USER_POT_APPRAISAL, FBType.LONG);
//		json.set("decorAppraisal", KeyID.KEY_USER_DECOR_APPRAISAL, FBType.LONG);
//		json.set("stockAppraisal", KeyID.KEY_USER_STOCK_APPRAISAL, FBType.LONG);
//		json.set("last_login", KeyID.KEY_USER_LAST_LOGIN, FBType.INT);
//		json.set("current_login", KeyID.KEY_USER_CURRENT_LOGIN, FBType.INT);
//		json.set("last_server_id", "last_server_id", FBType.INT);
//		json.set("daily_playing_time", KeyID.KEY_PLAYING_TIME, FBType.INT);
//		json.set("_continuous_login_day", KeyID.KEY_USER_CONTINUOUS_LOGIN_DAY, FBType.BYTE, (byte) 1);
        json.set("level", KeyID.KEY_USER_LEVEL, FBType.SHORT, (short) 1);
//		json.set("floorNum", KeyID.KEY_USER_FLOOR, FBType.SHORT);
//		json.set("email", KeyID.KEY_EMAIL, FBType.STRING);
//		json.set("imei", KeyID.KEY_DEVICE_IMEI, FBType.STRING);
//		json.set("revenu_date_max", KeyID.KEY_USER_REVENU_DATE_MAX, FBType.LONG);
//		json.set("revenu_date", KeyID.KEY_USER_REVENU_DATE, FBType.LONG);
//		json.set("revenu_week_max", KeyID.KEY_USER_REVENU_WEEK_MAX, FBType.LONG);
//		json.set("revenu_week", KeyID.KEY_USER_REVENU_WEEK, FBType.LONG);
//		json.set("revenu_month_max", KeyID.KEY_USER_REVENU_MONTH_MAX, FBType.LONG);
//		json.set("revenu_month", KeyID.KEY_USER_REVENU_MONTH, FBType.LONG);
//		json.set("order_num_date_max", KeyID.KEY_USER_ORDER_NUM_DATE_MAX, FBType.SHORT);
//		json.set("order_num_date", KeyID.KEY_USER_ORDER_NUM_DATE, FBType.SHORT);
        json.set("zing_id", KeyID.KEY_ZING_ID, FBType.STRING);
        json.set("zing_name", KeyID.KEY_ZING_NAME, FBType.STRING);
//		json.set("zing_name", KeyID.KEY_ZING_DISPLAY_NAME, FBType.STRING);
//		json.set("zing_avatar", KeyID.KEY_ZING_AVATAR, FBType.STRING);
//		json.set("zing_birthday", KeyID.KEY_ZING_BIRTHDAY, FBType.STRING);
        json.set("zalo_id", KeyID.KEY_ZALO_ID, FBType.STRING);
        json.set("zalo_name", KeyID.KEY_ZALO_NAME, FBType.STRING);
//		json.set("zalo_display_name", KeyID.KEY_ZALO_DISPLAY_NAME, FBType.STRING);
//		json.set("zalo_avatar", KeyID.KEY_ZALO_AVATAR, FBType.STRING);
        json.set("facebook_name", KeyID.KEY_FACEBOOK_NAME, FBType.STRING);
//		json.set("facebook_gender", KeyID.KEY_FACEBOOK_GENDER, FBType.STRING);
//		json.set("facebook_long_lived_token", KeyID.KEY_FACEBOOK_LONG_LIVED_TOKEN, FBType.STRING);
//		json.set("facebook_issue_token_date", KeyID.KEY_FACEBOOK_TOKEN_ISSUE_DATE, FBType.LONG);
//		json.set("facebook_expire_token_date", KeyID.KEY_FACEBOOK_TOKEN_EXPIRE_DATE, FBType.LONG);
//		json.set("facebook_birthday", KeyID.KEY_FACEBOOK_BIRTHDAY, FBType.STRING);
//		json.set("facebook_like", KeyID.KEY_FACEBOOK_LIKE, FBType.BOOLEAN);
//		json.set("current_ip", KeyID.KEY_USER_IP, FBType.STRING);
//		json.set("usedAmulet", KeyID.KEY_USER_USED_AMULET, FBType.BOOLEAN);

//		Server.s_globalDB[DatabaseID.SHEET_SEED].length = 21
//		byte[] firstPlant = new byte[21];
//		for (int i = 0; i < firstPlant.length; i++) firstPlant[i] = 0;
//		json.set("firstPlant", KeyID.KEY_FIRST_PLANT, FBType.ARRAY_BYTE, firstPlant);
//		
//		json.set("registered_gcm_android", KeyID.KEY_REGISTERED_GCM_ANDROID, FBType.BOOLEAN);
//		json.set("registered_gcm_ios", KeyID.KEY_REGISTER_GCM_IOS, FBType.STRING);
//		json.set("device_os", KeyID.DEVICE_OS, FBType.STRING);
//		json.set("ref_code", KeyID.KEY_REFERENCE_CODE, FBType.STRING);
//		json.set("_ranking_accumulation", KeyID.KEY_RANKING_ACCUMULATION, FBType.LONG);
//		json.set("_last_time_update_accumulation", "last_time_update_accumulation", FBType.INT);
//		json.set("_eventLimitRepairMachine", "_eventLimitRepairMachine", FBType.INT);
//		json.set("_eventLimitCatchBug", "_eventLimitCatchBug", FBType.INT);
//		json.set("_eventLimitCatchBugFriend", "_eventLimitCatchBugFriend", FBType.INT);
//		json.set("_eventLimitCleanDirtPot", "_eventLimitCleanDirtPot", FBType.INT);
//		json.set("_eventLimitCleanDirtPotFriend", "_eventLimitCleanDirtPotFriend", FBType.INT);
//		json.set("_eventLimitCargoFriend", "_eventLimitCargoFriend", FBType.INT);
//		json.set("_eventLimitRepairMachine", "_eventLimitRepairMachine", FBType.INT);

//		if(Consts.USER_INVITE_ORDER_ARISHIP)
//		{
//			json.set("_dailyLimitCompleteCargoInviteFriend", "_dailyLimitCompleteCargoInviteFriend", FBType.SHORT);
//			json.set("_dailyLimitCompleteOrderInviteFriend", "_dailyLimitCompleteOrderInviteFriend", FBType.SHORT);
//		}
//
//		json.set("ref_code", KeyID.KEY_REFERENCE_CODE, FBType.STRING);
//		json.set("register_date", KeyID.KEY_REGISTER_DATE, FBType.STRING);
//		json.set("_level_up_gift_id", "_level_up_gift_id", FBType.INT);
//		json.set("_spent_kc_in_spendkcgift", KeyID.KEY_SPENDKC_SPENT_IN_USERINFO, FBType.INT, 0);
//		json.set("_totalConsumeDiamond", KeyID.KEY_TOTAL_CONSUME, FBType.INT, 0);
//		json.set("_last_paid_weekly", KeyID.KEY_PAID_WEEKLY_IN_USERINFO, FBType.INT, 0);
//		json.set("_newest_version", KeyID.KEY_VERSION, FBType.STRING);
//		json.set("_isNotifyNewFriend", KeyID.KEY_UINFO_NOTIFY_FRIEND, FBType.BOOLEAN, false);
//		json.set("cloud", KeyID.KEY_USER_CLOUD, FBType.INT, 0);
//		json.set("_isCastleUnlocked", KeyID.KEY_UNLOCK_CASTLE, FBType.BOOLEAN, false);
//		json.set("_gender", KeyID.KEY_GENDER, FBType.BYTE, (byte) 0);
//		json.set("vipLevel", KeyID.KEY_USER_VIP_LEVEL, FBType.BYTE, (byte) (byte) -1);
//		
//		byte vipLevel = (byte) json.get("vipLevel");
//		int limitBuffGoldInPShop = 0;
//		switch (vipLevel)
//		{
//			case 4:	limitBuffGoldInPShop = 300000;	break;
//			case 5:	limitBuffGoldInPShop = 500000;	break;
//			case 6:	limitBuffGoldInPShop = 700000;	break;
//			case 7:	limitBuffGoldInPShop = 1000000;	break;
//			case 8:	limitBuffGoldInPShop = 1500000;	break;
//			case 9:	limitBuffGoldInPShop = 2000000;	break;
//		}
//		json.set("limitBuffGoldInPShop", KeyID.KEY_USER_VIP_LEVEL, FBType.INT, limitBuffGoldInPShop);
//		
//		json.set("flagDailyReset", KeyID.KEY_FLAGS, FBType.LONG, (long) 0l);
//		json.set("_isWhiteUser", KeyID.KEY_WHITE_USER, FBType.BOOLEAN, false);

//		DatabaseID.SKIN_TYPE_STOCK = 0
//		DatabaseID.SKIN_TYPE_MAX = 10
//		for (short i = 0; i < 10; i++)
//		{
//			DatabaseID.SKIN_TYPE_MAX_NUM = 
//			json.set(KeyID.KEY_SKIN_ID + i, KeyID.KEY_SKIN_ID + i, FBType.SHORT, (short) i * 20);
//			json.set(KeyID.KEY_SKIN_EXPIRE + i, KeyID.KEY_SKIN_EXPIRE + i, FBType.LONG, (long) -1);
//		}

//		json.set("_dailyLimitDropItems", "_dailyLimitDropItems2", FBType.SHORT, (short) 0);
        return json;
    }

    public long parseMoney (String value)
    {
        return Long.parseLong(value);
    }

    public FBJson parseOfferManager (FBJson json)
    {
        int offerID = (int) json.set("offerID", KeyID.KEY_SPECIAL_OFFER_ID, FBType.INT);
        json.set("currentUseTime", KeyID.KEY_SPECIAL_OFFER_USE_TIME, FBType.INT);
        json.set("maxUseTime", KeyID.KEY_SPECIAL_OFFER_AVAILABLE_TIME, FBType.INT);
        json.set("duration", KeyID.KEY_SPECIAL_OFFER_DURATION, FBType.INT);
        json.set("receiveTime", "receiveTime", FBType.INT);
        json.set("expireTime", "expireTime", FBType.INT);
        json.set("webLink", KeyID.KEY_SPECIAL_OFFER_WEB_LINK, FBType.STRING);
        json.set("payType", "payType", FBType.STRING);
        json.set("minPay", "minPay", FBType.INT);
        json.set("maxPay", "maxPay", FBType.INT);
        json.set("identifier", "identifier", FBType.STRING);
        json.set("_stackVND", "stackvnd", FBType.INT, 0);
        json.set("lastOfferId", KeyID.KEY_LAST_OFFER_ID, FBType.INT, offerID);
        json.set("lastUDBNOfferId", KeyID.KEY_LAST_UDBN_OFFER_ID, FBType.INT, 9);
        json.set("title", "offer_title", FBType.STRING);
        json.set("desc", "offer_desc", FBType.STRING);
        json.set("_icon", KeyID.KEY_ICON, FBType.SHORT);
        json.set("receiveLoopOfferTime", "receive_loop", FBType.INT, 0);

        return json;
    }

    public FBJson parseOfferGift (FBJson json)
    {
        json.set("id", KeyID.KEY_SPECIAL_OFFER_ID, FBType.INT);
        json.set("content", KeyID.KEY_SPECIAL_OFFER_CONTENT, FBType.STRING);
        json.set("type", KeyID.KEY_SPECIAL_OFFER_TYPE, FBType.STRING);
        json.set("gateWay", KeyID.KEY_GATEWAY, FBType.BYTE, -1);

        return json;
    }

    public FBJson parsePrivateShopManager (FBJson json)
    {
//		FBJson json = new FBJson (bin);

        Short nslot = (Short) json.set("nslot", KeyID.KEY_PS_CURRENT_SLOT_NUMBER, FBType.SHORT, (short) 0);
        json.set("advertise_available_time", KeyID.KEY_PS_ADVERTISE_AVAILABLE_TIME, FBType.INT);

        for (int i = 0; i < nslot; i++)
        {
            FBJson slotData = (FBJson) json.set(KeyID.KEY_PS_SLOT + i, KeyID.KEY_PS_SLOT + i, FBType.FBJSON);
            slotData.set("slot_id", KeyID.KEY_PS_SLOT_ID, FBType.SHORT);
            slotData.set("is_locked", KeyID.KEY_PS_SLOT_STATUS, FBType.BOOLEAN);

            FBJson item_bin = (FBJson) slotData.set("item_bin", KeyID.KEY_PS_ITEM, FBType.FBJSON);
            Short itype = (Short) item_bin.set("itype", KeyID.KEY_PS_ITEM_TYPE, FBType.SHORT);

//			DatabaseID.IT_EVENT = 
            if (itype != 13)
            {
                item_bin.set("id", KeyID.KEY_PS_ITEM_ID, FBType.SHORT);
                item_bin.set("number", KeyID.KEY_PS_ITEM_NUMBER, FBType.SHORT);
                item_bin.set("money_type", KeyID.KEY_PS_ITEM_MONEY_TYPE, FBType.SHORT);
                item_bin.set("price", KeyID.KEY_PS_ITEM_PRICE, FBType.LONG);
                item_bin.set("start_date", KeyID.KEY_PS_ITEM_START_SELL_DATE, FBType.INT);
                item_bin.set("end_date", KeyID.KEY_PS_ITEM_END_SELL_DATE, FBType.INT);
                item_bin.set("status", KeyID.KEY_PS_ITEM_STATUS, FBType.SHORT);
                item_bin.set("cancel_price", KeyID.KEY_PS_ITEM_CANCEL_PRICE, FBType.SHORT);
                item_bin.set("hasAdvertise", KeyID.KEY_PS_ITEM_ADVERTISE, FBType.BOOLEAN);
                item_bin.set("end_advertise_time", KeyID.KEY_PS_ITEM_END_ADVERTISE_TIME, FBType.INT);
                item_bin.set("buyer_id", KeyID.KEY_PS_ITEM_BUYER_ID, FBType.STRING);
            }
        }
        return json;
    }

    public FBJson parseGiftManager (FBJson json)
    {
//		FBJson json = new FBJson (bin);

        int i = 0;
        while (json.binaryContainsKey(KeyID.KEY_GIFT_LIST + i))
        {
//			String temp = (String)
            json.set(KeyID.KEY_GIFT_LIST + i, KeyID.KEY_GIFT_LIST + i, FBType.STRING);
//			String[] gift_info = temp.split(";");

//			if (gift_info.length < 3)
//			{
//				i++;
//				continue;
//			}
//
//			GiftBox gb = new GiftBox(Integer.parseInt(gift_info[0]));
//			gb.SetName(gift_info[1]);
//			gb.SetDescription(gift_info[2]);
//			if (gift_info.length > 3)
//				gb.SetItemList(gift_info[3]);
//			else
//				gb.SetItemList("");
//			if (gift_info.length > 4)
//				gb.SetGiftCode(gift_info[4]);
//			else
//				gb.SetGiftCode("");

            i++;
        }

        return json;
    }

    public FBJson parseMerchantManager (FBJson json)
    {
//		FBJson json = new FBJson (bin);

        int i = 0;
        while (json.binaryContainsKey(KeyID.KEY_MERCHANT_LIST + i))
        {
//			String temp = (String) 
            json.set(KeyID.KEY_MERCHANT_LIST + i, KeyID.KEY_MERCHANT_LIST + i, FBType.STRING);
//			String[] merchant_info = temp.split(";");
//			
//			if (merchant_info.length != 9)
//				return json;

//			Merchant m = new Merchant(Integer.parseInt(merchant_info[0]));
//			m.SetState(Integer.parseInt(merchant_info[1]) == 1 ? true : false);
//			m.SetAppearTime(Integer.parseInt(merchant_info[2]));
//			m.SetRequestItem(Integer.parseInt(merchant_info[3]), Integer.parseInt(merchant_info[4]), Integer.parseInt(merchant_info[5]));
//			m.SetPrice(Integer.parseInt(merchant_info[6]), Integer.parseInt(merchant_info[7]), Integer.parseInt(merchant_info[8]));
//			if (m.GetRequestItemType() != -1 && m.GetRequestItemID() != -1 && m.GetRequestItemNum() != -1)
//				_merchants.add(m);

            i++;
        }

        return json;
    }

    public String[] parseFriend (String str)
    {
        if (str == null || str.isEmpty())
            return null;

        return str.split(";");
    }

    public FBJson parseUserClan (FBJson json) throws Exception
    {
        json.set("clanID", KeyID.KEY_CLAN_ID, FBType.INT);
        json.set("lastReceivedActivityID", KeyID.KEY_CLAN_ACTIVITY_ID, FBType.INT);
        json.set("level", KeyID.KEY_USER_LEVEL, FBType.INT);
        json.set("guildPoint", KeyID.KEY_USER_GUILD_POINT, FBType.LONG);
        json.set("gardenName", KeyID.KEY_GARDEN_NAME, FBType.STRING);
        json.set("timeJoinClan", KeyID.KEY_CLAN_JOIN_TIME, FBType.INT);

        FBJson clanRequest = (FBJson) json.set("timeJoinClan", KeyID.KEY_CLAN_REQUEST, FBType.FBJSON);
        {
            clanRequest.set("itemType", KeyID.KEY_ITEM_TYPE, FBType.INT);
            clanRequest.set("itemID", KeyID.KEY_ITEM_ID, FBType.INT);
            clanRequest.set("nextRequestTime", KeyID.KEY_CLAN_NEXT_REQUEST_TIME, FBType.INT);
            clanRequest.set("receivedNum", KeyID.KEY_CLAN_RECEIVED_ITEM, FBType.INT);
        }

        FBJson clanDonate = (FBJson) json.set("clanDonate", KeyID.KEY_CLAN_DONATE, FBType.FBJSON);
        {
            clanDonate.set("donatedValue", KeyID.KEY_CLAN_DONATE_POINT, FBType.INT);
            clanDonate.set("donatedValueWeekly", KeyID.KEY_CLAN_DONATE_POINT_WEEKLY, FBType.INT);
        }

        json.set("clanEventEndTime", KeyID.KEY_CLAN_EVENT_END, FBType.INT, -1);
        json.set("clanEventPoint", KeyID.KEY_CLAN_EVENT_POINT, FBType.INT, -1);

        json.set("clanEventEndTime", KeyID.KEY_DERBY_USER_ENDTIME, FBType.INT, -1);
        json.set("clanEventPoint", KeyID.KEY_DERBY_USER_POINT, FBType.INT, -1);

        int count = (int) json.set(KeyID.KEY_DERBY_TL_GIFTS_NUM, KeyID.KEY_DERBY_TL_GIFTS_NUM, FBType.INT, 0);
        for (int i = 0; i < count; i++)
        {
            json.set(KeyID.KEY_DERBY_TL_GIFTS_POINT + i, KeyID.KEY_DERBY_TL_GIFTS + i, FBType.LONG);
            json.set(KeyID.KEY_DERBY_TL_GIFTS + i, KeyID.KEY_DERBY_TL_GIFTS + i, FBType.STRING);
        }

//		DatabaseID.GIFT_STATE_NOTHING = 0
        json.set("derbyTLGiftsStatus", KeyID.KEY_DERBY_USER_GIFTS_STATUS, FBType.BYTE, (byte) 0);

        FBJson derbyQuest = (FBJson) json.set("derbyQuest", KeyID.KEY_DERBY_USER_QUEST_DETAIL, FBType.FBJSON);
        {
            derbyQuest.set("slotIdx", KeyID.KEY_SLOT_INDEX, FBType.SHORT);
            derbyQuest.set("id", KeyID.KEY_ID, FBType.SHORT);
            derbyQuest.set("type", KeyID.KEY_TYPE, FBType.SHORT);
            derbyQuest.set("point", KeyID.KEY_POINT, FBType.SHORT);
            derbyQuest.set("target", KeyID.KEY_TARGET, FBType.SHORT);
            derbyQuest.set("rewardPoint", KeyID.KEY_DERBY_QUEST_POINT, FBType.SHORT);
            derbyQuest.set("questLevel", KeyID.KEY_DERBY_QUEST_LEVEL, FBType.BYTE);
            derbyQuest.set("userLevel", KeyID.KEY_DERBY_QUEST_USER_LEVEL, FBType.SHORT);
            derbyQuest.set("duration", KeyID.KEY_DERBY_QUEST_DURATION, FBType.INT);
            derbyQuest.set("userAvatar", KeyID.KEY_USER_AVATAR, FBType.STRING);
            derbyQuest.set("status", KeyID.KEY_DERBY_QUEST_STATUS, FBType.BYTE);
            derbyQuest.set("userId", KeyID.KEY_USER_ID, FBType.LONG);
            derbyQuest.set("rate", KeyID.KEY_DERBY_QUEST_RATED, FBType.INT);
            derbyQuest.set("actived", KeyID.KEY_DERBY_QUEST_ACTIVED, FBType.BOOLEAN);
        }

        json.set("derbyQuestExpired", KeyID.KEY_DERBY_USER_QUEST_EXPIRED, FBType.INT, 0);
        json.set("numReceivedQuests", KeyID.KEY_DERBY_USER_QUEST_INDEX, FBType.SHORT);
        json.set("numAvailableQuests", KeyID.KEY_DERBY_USER + "_available_quest", FBType.SHORT);
        json.set("countDerbyRelaxLoaded", KeyID.KEY_DERBY_USER_FIRST_RELAX, FBType.INT);

        return json;
    }

    public FBJson parseStock (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("level", KeyID.KEY_STOCK_LEVEL, FBType.SHORT);
        json.set("capacity_max_ex", KeyID.KEY_STOCK_CAPACITY_MAX_EX, FBType.INT);
        json.set("capacity_max", KeyID.KEY_STOCK_CAPACITY_MAX, FBType.SHORT);
        int total_item = (int) json.set("total_item", KeyID.KEY_STOCK_TOTAL_ITEM, FBType.INT);
        json.set("_version", KeyID.KEY_VERSION, FBType.INT);

        for (int i = 0; i < total_item; i++)
        {
            json.set(KeyID.KEY_STOCK_ITEM_TYPE + i, KeyID.KEY_STOCK_ITEM_TYPE + i, FBType.INT);
            json.set(KeyID.KEY_STOCK_ITEM_ID + i, KeyID.KEY_STOCK_ITEM_ID + i, FBType.INT);
            json.set(KeyID.KEY_STOCK_ITEM_QUANTITY + i, KeyID.KEY_STOCK_ITEM_QUANTITY + i, FBType.INT);
            json.set(KeyID.KEY_STOCK_ITEM_EXPIRE + i, KeyID.KEY_STOCK_ITEM_EXPIRE + i, FBType.INT, -1);
        }

        return json;
    }

    public FBJson parseFloor (FBJson json)
    {
//		FBJson json = new FBJson(bin);
        json.set("id", KeyID.KEY_FLOOR_INDEX, FBType.SHORT);
        json.set("_version", KeyID.KEY_VERSION, FBType.INT);

//		if(Consts.USE_AUTO_PLANT)
        {
//			int helper = (int)
            json.set("helper", KeyID.KEY_FLOOR_HELPER_ID, FBType.INT, -1);
//			json.set("helperAsset", (helper > 0) ? GameUtil.GetAppraisal(helper) : 0);

            json.set("helperHireDate", KeyID.KEY_FLOOR_HELPER_HIRE_DATE, FBType.INT, -1);
            json.set("helperHireDuration", KeyID.KEY_FLOOR_HELPER_HIRE_DURATION, FBType.INT, 0);
        }

//		DatabaseID.MAX_SLOT_PER_FLOOR = 6
        for (int i = 0; i < 6; i++)
        {
            FBJson slot = (FBJson) json.set("slot_" + i, "slot_" + i, FBType.FBJSON);
            slot.set("index", i);

            FBJson pot = (FBJson) slot.set("pot", "pot", FBType.FBJSON);
            pot.set("id", KeyID.KEY_POT_ID, FBType.SHORT, (short) -1);

            FBJson plant = (FBJson) pot.set("plant", "plant", FBType.FBJSON);
            plant.set("id", KeyID.KEY_PLANT_ID, FBType.SHORT, (short) -1);
            plant.set("start_time", KeyID.KEY_PLANT_START_TIME, FBType.INT);
            plant.set("grow_time", KeyID.KEY_PLANT_GROW_TIME, FBType.INT, -1);
            plant.set("hasBug", KeyID.KEY_PLANT_HAS_BUG, FBType.BOOLEAN, false);
            plant.set("fertilizer_id", KeyID.KEY_PLANT_FERTILIZER_ID, FBType.INT, -1);
            plant.set("time_reduced_by_fertilizer", KeyID.KEY_PLANT_FERTILIZER_REDUCE_TIME, FBType.INT);
            plant.set("num_plant", KeyID.KEY_PLANT_NUM_ON_SLOT, FBType.SHORT, (short) 1);

            FBJson decor = (FBJson) slot.set("decor", "decor", FBType.FBJSON);
            decor.set("id", KeyID.KEY_DECOR_ID, FBType.INT, -1);
            decor.set("_dirt_point", KeyID.KEY_SLOT_DIRT_POINT, FBType.SHORT, (short) 100); //DirtPotConfig.DIRTPOT_MAX_NEW_POINT
        }

        return json;
    }

    public FBJson parseFloorEventInfo (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_index", KeyID.KEY_FLOOR_INDEX, FBType.INT);
        json.set("_eventID", KeyID.KEY_EVENT_ID, FBType.INT);

//		DatabaseID.MAX_SLOT_PER_FLOOR = 6
        for (int i = 0; i < 6; i++)
        {
            FBJson slotEvent = (FBJson) json.set(KeyID.KEY_SLOTS + i, KeyID.KEY_SLOTS + i, FBType.FBJSON);
            slotEvent.set("_index", KeyID.KEY_SLOT_INDEX, FBType.INT);
            slotEvent.set("_hired", KeyID.KEY_SLOT_HIRE_STATUS, FBType.BOOLEAN);
            slotEvent.set("_remainTime", KeyID.KEY_SLOT_REMAIN_TIME, FBType.INT);
            slotEvent.set("_numPlant", KeyID.KEY_SLOT_NUM_PLANT, FBType.INT);
        }

        return json;
    }

    public FBJson parseUserPasscode (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_passCode", KeyID.KEY_PASSCODE, FBType.INT, -1);

//		DatabaseID.PASSCODE_NON_EXIST = 
        json.set("_currentState", KeyID.KEY_PASSCODE_CURRENT_STATE, FBType.BYTE, (byte) 0);

//		UserPasscode.MAX_WRONG_INPUT_TIMES = 3
        json.set("_remainTimes", KeyID.KEY_PASSCODE_REMAIN_TIMES, FBType.BYTE, (byte) 3);
        json.set("_waitingTime", KeyID.KEY_PASSCODE_WAITING_TIME, FBType.INT, -1);

        return json;
    }

    public FBJson parseMachine (FBJson json)
    {
        json.set("id", KeyID.KEY_MACHINE_ID, FBType.BYTE);
        json.set("floor", KeyID.KEY_MACHINE_FLOOR, FBType.BYTE);
        json.set("level", KeyID.KEY_MACHINE_LEVEL, FBType.SHORT);
        json.set("active_time", KeyID.KEY_MACHINE_ACTIVE_TIME, FBType.INT);
        json.set("status", KeyID.KEY_MACHINE_STATUS, FBType.BYTE);
        json.set("start_time", KeyID.KEY_MACHINE_START_TIME, FBType.INT);
        byte slot_max = (byte) json.set("slot_max", KeyID.KEY_MACHINE_SLOT_MAX, FBType.BYTE);
        byte product_count = (byte) json.set("product_count", KeyID.KEY_MACHINE_PRODUCT_COUNT, FBType.BYTE);

//		this.product_completed_num = 0;
//		item_drop_list = new ArrayList<String>();

//		String drop_list = (String) 
        json.set("drop_list", KeyID.KEY_MACHINE_ITEM_DROP_LIST, FBType.STRING, "");
//		if (!drop_list.isEmpty())
//		{
//			if (drop_list.contains(":18:"))
//				drop_list = drop_list.replace(":18:", ":1:8:");
//			
//			String[] items = drop_list.split(":");
//			if (items.length % 3 == 0)
//				for (int d = 0; d < items.length; d += 3) // type:id:num
//					item_drop_list.add(items[d] + ":" + items[d + 1] + ":" + items[d + 2]);
//		}

//		stock = new ArrayList<byte[]>();

        for (int i = 0; i < slot_max; i++)
        {
//			DatabaseID.MACHINE_PAGE_MAX_SLOTS = 9
            int pageIdx = (int) (i / 9);
            FBJson slotMachine = (FBJson) json.set(KeyID.KEY_MACHINE_SLOT + i, KeyID.KEY_MACHINE_SLOT + i, FBType.FBJSON);
            slotMachine.set("product_id", KeyID.KEY_MACHINE_SLOT_PRODUCT_ID, FBType.SHORT);
            slotMachine.set("product_time", KeyID.KEY_MACHINE_SLOT_PRODUCT_TIME, FBType.INT);
        }

        for (int i = 0; i < product_count; i++)
        {
            FBJson prod_data = (FBJson) json.set(KeyID.KEY_MACHINE_PRODUCT + i, KeyID.KEY_MACHINE_PRODUCT + i, FBType.FBJSON);
            prod_data.set(KeyID.KEY_STOCK_PRODUCT_INDEX, KeyID.KEY_STOCK_PRODUCT_INDEX, FBType.BYTE);
            prod_data.set(KeyID.KEY_STOCK_PRODUCT_ID, KeyID.KEY_STOCK_PRODUCT_ID, FBType.BYTE);
            prod_data.set(KeyID.KEY_STOCK_PRODUCT_EXP, KeyID.KEY_STOCK_PRODUCT_EXP, FBType.LONG);
        }

//		for (MachinePage aPage : pages)
//		{
//			while (aPage != null)
//			{
//				int prod_id = aPage.popCompleteProduct();
//				if (prod_id >= 0)
//				{
//					addProductToStock(prod_id);
//					product_completed_num++;
//					need_save = true;
//				} else
//					break;
//			}
//		}
        return json;
    }

    public FBJson parseMachineDurability (FBJson json)
    {
        json.set("id", KeyID.KEY_MACHINE_ID, FBType.BYTE);
        json.set("floor", KeyID.KEY_MACHINE_FLOOR, FBType.BYTE);
        short durability_max = (short) json.set("durability_max", KeyID.KEY_MACHINE_DURABILITY_MAX, FBType.SHORT, (short) 0);//Machine.getMachineDurability(floor));
        json.set("durability_cur", KeyID.KEY_MACHINE_DURABILITY_CUR, FBType.SHORT, (short) durability_max);
        json.set("durability_repaired", KeyID.KEY_MACHINE_DURABILITY_REPAIRED, FBType.SHORT, (short) 0);

        FBJson userInfo = (FBJson) json.set("user", KeyID.KEY_USER_INFOS, FBType.FBJSON);
        userInfo = parseUserInfo(userInfo);

        return json;
    }

    public FBJson parseOwl (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("currentSkin", KeyID.KEY_OWL_CUR_SKIN, FBType.INT, 0);
        int numSkin = (int) json.set("numSkin", KeyID.KEY_OWL_NUM_SKIN, FBType.INT, 0);

        for (int i = 0; i < numSkin; i++)
        {
            FBJson aSkin = (FBJson) json.set(KeyID.KEY_OWL_SKIN + "_" + i, KeyID.KEY_OWL_SKIN + "_" + i, FBType.FBJSON);
            aSkin.set("skinId", KeyID.KEY_OWL_SKIN_ID, FBType.INT);
            aSkin.set("expireTime", KeyID.KEY_OWL_SKIN_EXPIRE, FBType.INT);
        }

        return json;
    }

    public FBJson parseOrderManager (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("order_daily_free_delivered_num", KeyID.KEY_ORDER_FREE_DELIVERED_NUM, FBType.BYTE);
        json.set("order_daily_paid_delivered_num", KeyID.KEY_ORDER_PAID_DELIVERED_NUM, FBType.BYTE);
        json.set("order_daily_free_max", KeyID.KEY_ORDER_DAILY_FREE_MAX, FBType.BYTE);
        json.set("order_daily_paid_max", KeyID.KEY_ORDER_DAILY_PAID_MAX, FBType.BYTE);
        json.set("total_delivered_num", KeyID.KEY_TOTAL_DELIVERED_NUM, FBType.BYTE);
        json.set("order_daily_letter_selected", KeyID.KEY_DAILY_ORDER_LETTER_SELECTED, FBType.BOOLEAN);
        json.set("order_daily_reset_time", KeyID.KEY_ORDER_DAILY_RESET_TIME, FBType.INT);

        byte order_count = (byte) json.set("order_count", KeyID.KEY_USER_ORDER_COUNT, FBType.BYTE);
        for (int i = 0; i < order_count; i++)
        {
            FBJson _order_normal = (FBJson) json.set(KeyID.KEY_USER_ORDER + i, KeyID.KEY_USER_ORDER + i, FBType.FBJSON);
            _order_normal = parseOrder(_order_normal);
        }

        boolean reward_package = (boolean) json.set("reward_package", KeyID.KEY_ORDER_REWARD, FBType.BOOLEAN);
        if (reward_package)
        {
            FBJson reward = (FBJson) json.set(KeyID.KEY_USER_ORDER_REWARD, KeyID.KEY_USER_ORDER_REWARD, FBType.FBJSON);
            reward = parseOrderReward(reward);
        }

        if (json.binaryContainsKey(KeyID.KEY_ORDER_EVENT))
        {
            FBJson _order_event = (FBJson) json.set(KeyID.KEY_ORDER_EVENT, KeyID.KEY_ORDER_EVENT, FBType.FBJSON);
            _order_event = parseOrder(_order_event);
        }

//		if(Consts.USER_ADS_ORDER_AIRSHIP)
        {
            json.set("daily_ads_num", KeyID.KEY_ORDER_DAILY_ADS, FBType.BYTE, (byte) 0);
            json.set("daily_ads_skip_num", KeyID.KEY_ORDER_DAILY_ADS_SKIP, FBType.BYTE, (byte) 0);
        }

        return json;
    }

    public FBJson parseOrder (FBJson json)
    {
        byte type = (byte) json.set("type", KeyID.KEY_ORDER_TYPE, FBType.BYTE);
        json.set("delivery_time", KeyID.KEY_ORDER_DELIVERY_TIME, FBType.INT);
        json.set("new_wait_time", KeyID.KEY_ORDER_NEW_WAIT_TIME, FBType.INT);

        json.set("reward_gold_ratio_from_pot", KeyID.KEY_ORDER_REWARD_GOLD_RATIO_FROM_POT, FBType.SHORT);
        json.set("reward_exp_ratio_from_pot", KeyID.KEY_ORDER_REWARD_EXP_RATIO_FROM_POT, FBType.SHORT);
        json.set("reward_gold_ratio_from_machine", KeyID.KEY_ORDER_REWARD_GOLD_RATIO_FROM_MACHINE, FBType.SHORT);
        json.set("reward_exp_ratio_from_machine", KeyID.KEY_ORDER_REWARD_EXP_RATIO_FROM_MACHINE, FBType.SHORT);
        json.set("reward_gold_ratio_from_event", KeyID.KEY_ORDER_REWARD_GOLD_RATIO_FROM_EVENT, FBType.SHORT);
        json.set("reward_exp_ratio_from_event", KeyID.KEY_ORDER_REWARD_EXP_RATIO_FROM_EVENT, FBType.SHORT);
        json.set("order2_event_reward_exp_ratio", KeyID.KEY_ORDER2_REWARD_EXP_RATIO, FBType.SHORT);

        json.set("reward_gold", KeyID.KEY_ORDER_REWARD_GOLD, FBType.LONG);
        json.set("reward_gold_bonus", KeyID.KEY_ORDER_REWARD_GOLD_BONUS, FBType.LONG);
        json.set("reward_exp", KeyID.KEY_ORDER_REWARD_EXP, FBType.LONG);
        json.set("reward_exp_bonus", KeyID.KEY_ORDER_REWARD_EXP_BONUS, FBType.LONG);
        short reward_item_count = (short) json.set("reward_item_count", KeyID.KEY_ORDER_ITEM_COUNT, FBType.SHORT);
        short product_count = (short) json.set("product_count", KeyID.KEY_ORDER_PRODUCT_COUNT, FBType.SHORT);
        json.set("npc", KeyID.KEY_ORDER_NPC, FBType.BYTE);

        for (int i = 0; i < reward_item_count; i++)
        {
            FBJson item_data = (FBJson) json.set(KeyID.KEY_ORDER_ITEM + i, KeyID.KEY_ORDER_ITEM + i, FBType.FBJSON);
            item_data.set(KeyID.KEY_PROD_TYPE, KeyID.KEY_PROD_TYPE, FBType.BYTE);
            item_data.set(KeyID.KEY_PROD_ID, KeyID.KEY_PROD_ID, FBType.SHORT);
            item_data.set(KeyID.KEY_PROD_NUM, KeyID.KEY_PROD_NUM, FBType.SHORT);
        }

        for (int i = 0; i < product_count; i++)
        {
            FBJson prod_data = (FBJson) json.set(KeyID.KEY_ORDER_PRODUCT + i, KeyID.KEY_ORDER_PRODUCT + i, FBType.FBJSON);
            prod_data.set(KeyID.KEY_PROD_TYPE, KeyID.KEY_PROD_TYPE, FBType.BYTE);
            prod_data.set(KeyID.KEY_PROD_ID, KeyID.KEY_PROD_ID, FBType.SHORT);
            prod_data.set(KeyID.KEY_PROD_NUM, KeyID.KEY_PROD_NUM, FBType.SHORT);
        }

//		DatabaseID.ORDER_DAILY = 1
        if (type == 1)
        {
            json.set("receive_daily_order", KeyID.KEY_ORDER_RECEIVE, FBType.BOOLEAN);
            json.set("receive_daily_order_diamond", KeyID.KEY_ORDER_RECEIVE_DIAMOND, FBType.INT);
            json.set("letter_select_index", KeyID.KEY_ORDER_LETTER_SELECT_INDEX, FBType.BYTE);
            json.set("letter_select_value", KeyID.KEY_ORDER_LETTER_SELECT_VALUE, FBType.BYTE);
            json.set("letter_reselect_diamond", KeyID.KEY_LETTER_RESELECT_DIAMOND, FBType.INT);

//			DatabaseID.ORDER_LETTER_COUNT = 
            for (int i = 0; i < 6; i++)
            {
                json.set(KeyID.KEY_ORDER_LETTERS_ENABLE + i, KeyID.KEY_ORDER_LETTERS_ENABLE + i, FBType.BOOLEAN);
                json.set(KeyID.KEY_ORDER_LETTERS_VALUE + i, KeyID.KEY_ORDER_LETTERS_VALUE + i, FBType.BYTE);
            }
        }

        json.set("skipping", KeyID.KEY_DROP_BONUS_ITEM, FBType.BOOLEAN);
        json.set("_dropBonusItem", KeyID.KEY_ORDER_SKIPPING, FBType.STRING);
        json.set("_dropOrder2Item", KeyID.KEY_DROP_ORDER2_ITEM, FBType.STRING, "");

        return json;
    }

    public FBJson parseOrderReward (FBJson json)
    {
        json.set("reward_gold", KeyID.KEY_ORDER_REWARD_GOLD, FBType.LONG);
        json.set("reward_gold_bonus", KeyID.KEY_ORDER_REWARD_GOLD_BONUS, FBType.LONG);
        json.set("reward_exp", KeyID.KEY_ORDER_REWARD_EXP, FBType.LONG);
        json.set("reward_exp_bonus", KeyID.KEY_ORDER_REWARD_EXP_BONUS, FBType.LONG);
        json.set("reward_diamond", KeyID.KEY_ORDER_REWARD_DIAMOND, FBType.INT);

        short reward_item_count = (short) json.set("reward_item_count", KeyID.KEY_ORDER_ITEM_COUNT, FBType.SHORT);
        for (int i = 0; i < reward_item_count; i++)
        {
            FBJson item_data = (FBJson) json.set(KeyID.KEY_ORDER_ITEM + i, KeyID.KEY_ORDER_ITEM + i, FBType.FBJSON);
            item_data.set(KeyID.KEY_PROD_TYPE, KeyID.KEY_PROD_TYPE, FBType.BYTE);
            item_data.set(KeyID.KEY_PROD_ID, KeyID.KEY_PROD_ID, FBType.SHORT);
            item_data.set(KeyID.KEY_PROD_NUM, KeyID.KEY_PROD_NUM, FBType.SHORT);
        }

        return json;
    }

    public FBJson parseCycleGift (FBJson json)
    {
//		FBJson json = new FBJson (bin);

        FBJson _loginGift = (FBJson) json.set(KeyID.KEY_CYCLE_LOGIN_GIFT, KeyID.KEY_CYCLE_LOGIN_GIFT, FBType.FBJSON);
        {
            _loginGift.set("_version", KeyID.KEY_CYCLE_VERSION, FBType.INT);

//			LoginGift.KEY_SLOT = KeyID.KEY_CYCLE_SLOT
            short _loginGift_numSlot = (short) _loginGift.set("numSlot", KeyID.KEY_CYCLE_SLOT + "_num", FBType.SHORT, (short) 0);
            for (int i = 0; i < _loginGift_numSlot; i++)
            {
                FBJson loginGiftSlot = (FBJson) _loginGift.set(KeyID.KEY_CYCLE_SLOT + "_" + i, KeyID.KEY_CYCLE_SLOT + "_" + i, FBType.FBJSON);
                loginGiftSlot.set("_stt", KeyID.KEY_CYCLE_GIFT_STT, FBType.SHORT);
                loginGiftSlot.set("_gType", KeyID.KEY_CYCLE_GIFT_TYPE, FBType.SHORT);
                loginGiftSlot.set("_gId", KeyID.KEY_CYCLE_GIFT_ID, FBType.INT);
                loginGiftSlot.set("_gNum", KeyID.KEY_CYCLE_GIFT_NUM, FBType.INT);
                loginGiftSlot.set("_priceBuy", -1);
            }

//			LoginGift.KEY_COUNT_ALL = KeyID.KEY_CYCLE_COUNT_ALL
            _loginGift.set("_countCycle", KeyID.KEY_CYCLE_COUNT_ALL, FBType.INT);

//			LoginGift.KEY_COUNT_MISS_SUNDAY = KeyID.KEY_CYCLE_COUNT_MISS_SUNDAY
            _loginGift.set("_countReceiveMissSunday", KeyID.KEY_CYCLE_COUNT_MISS_SUNDAY, FBType.INT);

//			LoginGift.KEY_PRICE = KeyID.KEY_CYCLE_PRICE
            _loginGift.set("_priceBuyMiss", KeyID.KEY_CYCLE_PRICE, FBType.INT);

//			LoginGift.KEY_COUNT_BUY_MISS = KeyID.KEY_CYCLE_COUNT_BUY_MISS
            _loginGift.set("_nBuyMiss", KeyID.KEY_CYCLE_COUNT_BUY_MISS, FBType.INT);

//			LoginGift.KEY_CURRENT_WEEK = KeyID.KEY_CYCLE_CURRENT_WEEK
            _loginGift.set("_crrWeek", KeyID.KEY_CYCLE_CURRENT_WEEK, FBType.INT);

//			LoginGiftConst.LOGIN_GIFT_MONTHLY_NUM = 4
            for (int i = 0; i < 4; i++)
            {
                FBJson loginGiftSlot = (FBJson) _loginGift.set(KeyID.KEY_GIFT + i, KeyID.KEY_GIFT + i, FBType.FBJSON);
                loginGiftSlot.set("_stt", KeyID.KEY_CYCLE_GIFT_STT, FBType.SHORT);
                loginGiftSlot.set("_gType", KeyID.KEY_CYCLE_GIFT_TYPE, FBType.SHORT);
                loginGiftSlot.set("_gId", KeyID.KEY_CYCLE_GIFT_ID, FBType.INT);
                loginGiftSlot.set("_gNum", KeyID.KEY_CYCLE_GIFT_NUM, FBType.INT);
                loginGiftSlot.set("_priceBuy", -1);
            }

            _loginGift.set("_curWeekMonthly", KeyID.KEY_COUNT_TURN, FBType.SHORT);
            _loginGift.set("_cheatCrrDate", "c_nextdate", FBType.INT);
        }

        FBJson _spendKCGift = (FBJson) json.set(KeyID.KEY_CYCLE_SPENDKC_GIFT, KeyID.KEY_CYCLE_SPENDKC_GIFT, FBType.FBJSON);
        {
            _spendKCGift.set("_version", KeyID.KEY_CYCLE_VERSION, FBType.INT);
            _spendKCGift.set("_resetTime", KeyID.KEY_SPENDKC_RS_TIME, FBType.INT);
            _spendKCGift.set("_crrSlot", KeyID.KEY_SPENDKC_CRR_SLOT, FBType.INT);
            _spendKCGift.set("_numSpin", KeyID.KEY_SPENDKC_NUM_SPIN, FBType.INT);
            _spendKCGift.set("_crrSpentKC", KeyID.KEY_SPENDKC_CRR_SPENT, FBType.INT);
            _spendKCGift.set("_prevDice", KeyID.KEY_SPENDKC_PREV_DICE, FBType.INT);
            _spendKCGift.set("_numTurn", KeyID.KEY_SPENDKC_NUM_TURN, FBType.INT);
            _spendKCGift.set("_nextBonus", KeyID.KEY_SPENDKC_NEXT_BONUS, FBType.INT);
            _spendKCGift.set("_prevKCPoint", KeyID.KEY_SPENDKC_PREV_POINT, FBType.INT);
            _spendKCGift.set("_nextKCPoint", KeyID.KEY_SPENDKC_NEXT_POINT, FBType.INT);
            _spendKCGift.set("_countRound", KeyID.KEY_SPENDKC_COUNT_ROUND, FBType.BYTE, (byte) 0);

            for (int i = 0; i < 20; i++) // SpendKCGift.NUM_SLOT = 20;
            {
                FBJson spendGiftSlot = (FBJson) _spendKCGift.set(KeyID.KEY_CYCLE_SLOT + "_" + i, KeyID.KEY_CYCLE_SLOT + "_" + i, FBType.FBJSON);
                spendGiftSlot.set("_stt", KeyID.KEY_CYCLE_GIFT_STT, FBType.INT);
                spendGiftSlot.set("_gType", KeyID.KEY_CYCLE_GIFT_TYPE, FBType.INT);
                spendGiftSlot.set("_gId", KeyID.KEY_CYCLE_GIFT_ID, FBType.INT);
                spendGiftSlot.set("_gNum", KeyID.KEY_CYCLE_GIFT_NUM, FBType.INT);
            }
        }

        FBJson _buyKCGift = (FBJson) json.set(KeyID.KEY_CYCLE_BUYKC_GIFT, KeyID.KEY_CYCLE_BUYKC_GIFT, FBType.FBJSON);
        {
            _buyKCGift.set("_version", KeyID.KEY_CYCLE_VERSION, FBType.INT);
            _buyKCGift.set("_resetTime", KeyID.KEY_SPENDKC_RS_TIME, FBType.INT);
            _buyKCGift.set("_crrValue", KeyID.KEY_SPENDKC_CRR_SPENT, FBType.INT);

            int _buyKCGift_numSlot = (int) _buyKCGift.set(KeyID.KEY_CYCLE_GIFT_NUM, KeyID.KEY_CYCLE_GIFT_NUM, FBType.INT, 0);
            for (int i = 0; i < _buyKCGift_numSlot; i++)
            {
                FBJson buyKCGiftSlot = (FBJson) _buyKCGift.set(KeyID.KEY_CYCLE_SLOT + "_" + i, KeyID.KEY_CYCLE_SLOT + "_" + i, FBType.FBJSON);
                buyKCGiftSlot.set("_stt", KeyID.KEY_CYCLE_GIFT_STT, FBType.INT);
                buyKCGiftSlot.set("_reqKC", KeyID.KEY_CYCLE_GIFT_PRICE, FBType.INT);
                int n = (int) buyKCGiftSlot.set(KeyID.KEY_CYCLE_GIFT_NUM, KeyID.KEY_CYCLE_GIFT_NUM, FBType.INT, 0);

                for (int j = 0; j < n; j++)
                {
                    FBJson buyKCGiftInfo = (FBJson) _buyKCGift.set(KeyID.KEY_CYCLE_SLOT + "_" + j, KeyID.KEY_CYCLE_SLOT + "_" + j, FBType.FBJSON);
                    buyKCGiftSlot.set("_type", KeyID.KEY_CYCLE_GIFT_TYPE, FBType.INT);
                    buyKCGiftSlot.set("_id", KeyID.KEY_CYCLE_GIFT_ID, FBType.INT);
                    buyKCGiftSlot.set("_num", KeyID.KEY_CYCLE_GIFT_NUM, FBType.INT);
                }
            }

            _buyKCGift.set("_lastMoney", KeyID.KEY_BUYKC_LAST_MONEY, FBType.LONG);
        }

        FBJson _luckyWheel = (FBJson) json.set(KeyID.KEY_CYCLE_LUCKYWHEEL, KeyID.KEY_CYCLE_LUCKYWHEEL, FBType.FBJSON);
        {
            _luckyWheel.set("_resetTime", KeyID.KEY_SPENDKC_RS_TIME, FBType.INT);
            _luckyWheel.set("_totalPaid", KeyID.KEY_TOTAL_PAID, FBType.INT);
            _luckyWheel.set("_totalConsume", KeyID.KEY_TOTAL_CONSUME, FBType.INT);
            _luckyWheel.set("_remainPoint", KeyID.KEY_REMAIN_POINT, FBType.INT);
            _luckyWheel.set("_totalSpin", KeyID.KEY_SPENDKC_NUM_SPIN, FBType.INT);
            _luckyWheel.set("_lastPaidMoney", KeyID.KEY_LAST_PAID, FBType.INT);
            _luckyWheel.set("_lastConsumeMoney", KeyID.KEY_LAST_COSUME, FBType.INT);

            short num = (short) _luckyWheel.set(KeyID.KEY_CYCLE_GIFT_NUM, KeyID.KEY_CYCLE_GIFT_NUM, FBType.SHORT);
            for (int i = 0; i < num; i++)
            {
                FBJson luckyWheelSlot = (FBJson) _luckyWheel.set(KeyID.KEY_CYCLE_SLOT + "_" + i, KeyID.KEY_CYCLE_SLOT + "_" + i, FBType.FBJSON);
                luckyWheelSlot.set("TYPE", KeyID.KEY_GROUP, FBType.SHORT);
                luckyWheelSlot.set("_rate", KeyID.KEY_RATE, FBType.SHORT);
                luckyWheelSlot.set("_dailyGot", KeyID.KEY_DAILY_GOT, FBType.SHORT);
                luckyWheelSlot.set("_totalGot", KeyID.KEY_ALL_GOT, FBType.SHORT);
                luckyWheelSlot.set("_gifts", KeyID.KEY_GIFTS, FBType.SHORT);
                luckyWheelSlot.set("_highLight", KeyID.KEY_HIGH_LIGHT, FBType.BOOLEAN);
            }

            _luckyWheel.set("_remainPaid", KeyID.KEY_REMAIN_PAID, FBType.INT);
            _luckyWheel.set("_remainConsume", KeyID.KEY_REMAIN_CONSUME, FBType.INT);
        }

        FBJson _cumulateWheel = (FBJson) json.set(KeyID.KEY_CYCLE_CUMULATE_WHEEL, KeyID.KEY_CYCLE_CUMULATE_WHEEL, FBType.FBJSON);
        {
            _cumulateWheel.set("_hasGift", KeyID.KEY_STATUS, FBType.BOOLEAN);
            _cumulateWheel.set("_curPoint", KeyID.KEY_POINT, FBType.INT);
            _cumulateWheel.set("_curTarget", KeyID.KEY_TARGET, FBType.INT);
            _cumulateWheel.set("_nSpin", KeyID.KEY_SPENDKC_NUM_SPIN, FBType.SHORT);
            _cumulateWheel.set("_countSpin", KeyID.KEY_SPENDKC_COUNT_SPIN, FBType.SHORT);
            _cumulateWheel.set("_received", KeyID.KEY_RECEIVED_GIFT, FBType.STRING);
            _cumulateWheel.set("_resetTime", KeyID.KEY_SPENDKC_RS_TIME, FBType.INT);
            _cumulateWheel.set("_spentMilestone", KeyID.KEY_LAST_COSUME, FBType.INT);
        }

        return json;
    }

    public FBJson parseDailyGift (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("received", KeyID.KEY_DAILY_GIFTS_RECEIVED, FBType.ARRAY_BYTE);
        json.set("gifts", KeyID.KEY_DAILY_GIFTS, FBType.ARRAY_STRING);
        json.set("time_range", KeyID.KEY_DAILY_GIFTS_TIME_RANGE, FBType.ARRAY_INT);
        json.set("time_range_s", KeyID.KEY_DAILY_GIFTS_TIME_RANGE_S, FBType.ARRAY_STRING);
        return json;
    }

    public FBJson parseMachineRepairLimit (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("reputation_max_per_date", KeyID.KEY_REPUTATION_MAX_PER_DATE, FBType.SHORT);
        json.set("reputation_collected_per_date", KeyID.KEY_REPUTATION_COLLECTED_PER_DATE, FBType.SHORT);
        json.set("daily_reset_time", KeyID.KEY_MACHINE_REPAIR_RESET_TIME, FBType.SHORT);
        return json;
    }

    public JsonArray parseBugPool (String str) throws Exception
    {
        JsonArray array = new JsonArray();
        if (str == null || str.isEmpty())
            return array;

        String aos[] = str.split(":");
        for (int i = 0; i < aos.length - 1; i += 2)
        {
            JsonObject bug = new JsonObject();
            bug.addProperty("type", aos[i]);
            bug.addProperty("id", aos[i + 1]);

            array.add(bug);
        }

        return array;
    }

    public JsonArray parseBugRatio (String str) throws Exception
    {
        JsonArray array = new JsonArray();
        if (str == null || str.isEmpty())
            return array;

        String[] aos = str.split(":");
        for (int i = 0; i < aos.length - 2; i += 3)
        {
            JsonObject bug = new JsonObject();
            bug.addProperty("type", aos[i]);
            bug.addProperty("id", aos[i + 1]);
            bug.addProperty("percent", aos[i + 2]);

            array.add(bug);
        }

        return array;
    }

    public FBJson parseAirship (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_id", KeyID.KEY_AIRSHIP_ID, FBType.INT);
//		int _unlock_time = (int)
        json.set("_unlock_time", KeyID.KEY_AIRSHIP_UNLOCK_TIME, FBType.INT);
//		json.set("_unlock_diamond", Misc.getDiamondEstimate(DatabaseID.DIAMOND_SKIP_TIME_MACHINE, _unlock_time));
        json.set("_gold", KeyID.KEY_AIRSHIP_GOLD, FBType.LONG);
        json.set("_gold_basic", KeyID.KEY_AIRSHIP_GOLD_BASIC, FBType.LONG);
        json.set("_exp", KeyID.KEY_AIRSHIP_EXP, FBType.LONG);
        json.set("_exp_basic", KeyID.KEY_AIRSHIP_EXP_BASIC, FBType.LONG);
        json.set("_point", KeyID.KEY_AIRSHIP_POINT, FBType.LONG);
        json.set("_reputation", KeyID.KEY_AIRSHIP_REPUTATION, FBType.LONG);

        int _cargo_count = (int) json.set("_cargo_count", KeyID.KEY_AIRSHIP_CARGO_COUNT, FBType.INT);
        for (int i = 0; i < _cargo_count; i++)
        {
            FBJson cargo = (FBJson) json.set(KeyID.KEY_AIRSHIP_CARGO + i, KeyID.KEY_AIRSHIP_CARGO + i, FBType.FBJSON);
            cargo.set("_id", KeyID.KEY_CARGO_ID, FBType.INT);
            cargo.set("_item_type", KeyID.KEY_CARGO_ITEM_TYPE, FBType.INT);
            cargo.set("_item_id", KeyID.KEY_CARGO_ITEM_ID, FBType.INT);
            cargo.set("_item_num", KeyID.KEY_CARGO_ITEM_NUM, FBType.INT);
            cargo.set("_exp", KeyID.KEY_CARGO_EXP, FBType.LONG);
            cargo.set("_gold", KeyID.KEY_CARGO_GOLD, FBType.LONG);
            cargo.set("_repuration", KeyID.KEY_CARGO_REPUTATION, FBType.LONG);
            cargo.set("_is_finished", KeyID.KEY_CARGO_IS_FINISHED, FBType.BOOLEAN);
            cargo.set("_ask_for_help", KeyID.KEY_CARGO_ASK_FOR_HELP, FBType.BOOLEAN);
            cargo.set("_friend_id", KeyID.KEY_CARGO_FRIEND_ID, FBType.LONG);
            cargo.set("_dropOrder2Item", KeyID.KEY_CARGO_ORDER2_ITEM, FBType.STRING);
        }

        json.set("_last_landing_time", KeyID.KEY_AIRSHIP_LAST_LANDING_TIME, FBType.INT);
        json.set("_next_landing_time", KeyID.KEY_AIRSHIP_NEXT_LANDING_TIME, FBType.INT);
        json.set("_depart_time", KeyID.KEY_AIRSHIP_NEXT_LANDING_TIME, FBType.INT);
        json.set("_last_gen_time", "airship_last_gen_time", FBType.INT);

        json.set("_status", KeyID.KEY_AIRSHIP_STATUS, FBType.INT);
        json.set("_current_airship_num", KeyID.KEY_AIRSHIP_CURRENT_NUM, FBType.INT);
        json.set("_is_reset_airship_num", "_is_reset_airship_num", FBType.BOOLEAN);

        json.set("_dropBonusItem", KeyID.KEY_DROP_BONUS_ITEM, FBType.STRING);
        json.set("_dropOrder2Item", KeyID.KEY_DROP_ORDER2_ITEM, FBType.STRING, "");

//		if (_status != DatabaseID.AIRSHIP_LOCKED || _id > 0)
//			_id = 0;

//		if(Consts.USER_INVITE_ORDER_ARISHIP)
        json.set("_remain_invite_friend_limit", KeyID.KEY_AIRSHIP_REMAIN_INVITE_FRIEND, FBType.INT);

//		if(Consts.USER_ADS_ORDER_AIRSHIP)
        {
            json.set("daily_ads_num", KeyID.KEY_AIRSHIP_DAILY_ADS, FBType.BYTE, (byte) 0);
            json.set("daily_ads_skip_num", KeyID.KEY_AIRSHIP_DAILY_ADS_SKIP, FBType.BYTE, (byte) 0);
            json.set("daily_ads_cargo_num", KeyID.KEY_AIRSHIP_DAILY_ADS_CARGO, FBType.BYTE, (byte) 0);
        }

        return json;
    }

    public FBJson parseTomKid (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_first_used", KeyID.KEY_TOM_KID_FIRST_USED, FBType.BOOLEAN);
        json.set("_last_hire_time", KeyID.KEY_TOM_KID_LAST_HIRE_TIME, FBType.INT);
        json.set("_expired_hire_time", KeyID.KEY_TOM_KID_EXPIRE_HIRE_TIME, FBType.INT);
        json.set("_last_working_time", KeyID.KEY_TOM_KID_LAST_WORKING_TIME, FBType.INT);
        json.set("_next_working_time", KeyID.KEY_TOM_KID_NEXT_WORKING_TIME, FBType.INT);
        json.set("lastPotOfferTime", KeyID.KEY_TOM_KID_LAST_POT_OFFER_TIME, FBType.INT);
        json.set("lastPotOfferDuration", KeyID.KEY_TOM_KID_POT_OFFER_DURATION, FBType.INT);
        json.set("offerPotId", KeyID.KEY_TOM_KID_POT_OFFER_POT_ID, FBType.INT);
        json.set("offerPotPrice", KeyID.KEY_TOM_KID_POT_OFFER_PRICE, FBType.INT);
        json.set("isPotRent", KeyID.KEY_TOM_KID_POT_OFFER_IS_RENT, FBType.BOOLEAN);
        json.set("lastPotRentTime", KeyID.KEY_TOM_KID_LAST_POT_RENT_TIME, FBType.INT);
        json.set("lastPotRentDuration", KeyID.KEY_TOM_KID_POT_RENT_DURATION, FBType.INT);

        for (int i = 0; i < 3; i++)
        {
            FBJson suggestItem = (FBJson) json.set(KeyID.KEY_TOM_KID_SUGGEST_ITEM + i, KeyID.KEY_TOM_KID_SUGGEST_ITEM + i, FBType.FBJSON);
            suggestItem.set("_id", KeyID.KEY_TOM_KID_SUGGEST_ITEM_ID, FBType.INT);
            suggestItem.set("_item_type", KeyID.KEY_TOM_KID_ITEM_TYPE, FBType.INT);
            suggestItem.set("_item_id", KeyID.KEY_TOM_KID_ITEM_ID, FBType.INT);
            suggestItem.set("_item_num", KeyID.KEY_TOM_KID_ITEM_NUM, FBType.INT);
            suggestItem.set("_gold", KeyID.KEY_TOM_KID_ITEM_GOLD_PRICE, FBType.LONG);
            suggestItem.set("_diamond", KeyID.KEY_TOM_KID_ITEM_DIAMOND_PRICE, FBType.LONG);
        }

        return json;
    }

    public FBJson parseRotaFortunaeManagerV2 (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_idle_time", KeyID.KEY_ROTA_FORTUNAE_END_TIME, FBType.INT);
        json.set("_inactive_wheel_count", KeyID.KEY_ROTA_FORTUNAE_TOTAL_STAR, FBType.INT);
        json.set("_num_balloon", KeyID.KEY_ROTA_FORTUNAE_BALLOON, FBType.INT);
        json.set("_last_gen_time", "_last_gen_time", FBType.INT);
        return json;
    }

    public FBJson parseInviteFriend (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_is_received_gift_0", KeyID.KEY_RECEIVED_GIFT_INVITE_FRIEND + 0, FBType.BOOLEAN);
        json.set("_is_received_gift_1", KeyID.KEY_RECEIVED_GIFT_INVITE_FRIEND + 1, FBType.BOOLEAN);
        json.set("_is_received_gift_2", KeyID.KEY_RECEIVED_GIFT_INVITE_FRIEND + 2, FBType.BOOLEAN);
        json.set("_is_received_gift_3", KeyID.KEY_RECEIVED_GIFT_INVITE_FRIEND + 3, FBType.BOOLEAN);
        json.set("_num_friend_invited", KeyID.KEY_NUM_FRIEND_INVITED, FBType.INT);
        return json;
    }

    public FBJson parsePrivateInfo (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_id", KeyID.KEY_USER_ID, FBType.LONG);
        json.set("_phone_list", KeyID.KEY_PHONE_NUMBER, FBType.STRING);
        return json;
    }

    public FBJson parseComboManager (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        String temp = (String) json.set(KeyID.KEY_COMBO, KeyID.KEY_COMBO, FBType.STRING);
        String[] sa = temp.split(";");
        for (String s : sa)
        {
            if (s == null || s.isEmpty())
                continue;

//			temp = (String)
            json.set(KeyID.KEY_COMBO + "_" + s, KeyID.KEY_COMBO + "_" + s, FBType.STRING, "");
//			String[] combosArray = temp.split(";");
//
//			if (combosArray.length < 1)
//				continue;
//
//			String combos = "";
//			for (int i = 0; i < combosArray.length; i++)
//			{
//				String c = combosArray[i].trim();
//				if (!Strings.isNullOrEmpty(c) && !c.startsWith(":"))
//				{
//					if (!c.contains(":"))
//					{
//						c += ":" + 0;
//					}
//					combos += c + ";";
//				}
//			}
//			
//			if (!Strings.isNullOrEmpty(combos))
//				_floors_combo.put(Integer.parseInt(s), combos.substring(0, combos.length() - 1));
        }
        return json;
    }

    public FBJson parseCloseFriend (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        int max = (int) json.set("max", KeyID.KEY_MAX, FBType.INT);
        for (int i = 0; i < max; i++)
            json.set(KeyID.KEY_FRIEND_INDEX + i, KeyID.KEY_FRIEND_INDEX + i, FBType.LONG);

        json.set("_close_friend_id", KeyID.KEY_CLOSE_FRIEND, FBType.LONG);
        json.set("_allow_add_close_friend", KeyID.KEY_ALLOW, FBType.BOOLEAN);
        return json;
    }

    public FBJson parseTreasureTrunk (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_num_bronze_key", KeyID.KEY_NUM_BRONZE_KEY, FBType.INT);
        json.set("_num_silver_key", KeyID.KEY_NUM_SILVER_KEY, FBType.INT);
        json.set("_num_gold_key", KeyID.KEY_NUM_GOLD_KEY, FBType.INT);

        json.set("_num_violet_key", KeyID.KEY_NUM_VIOLET_KEY, FBType.INT);
        json.set("_num_event_key", KeyID.KEY_NUM_VIOLET_KEY, FBType.INT, 0);
        json.set("eventChestEndDate", KeyID.KEY_EVENT_CHEST_END_DATE, FBType.INT, -1);

        json.set("eventChestReceiveGift", KeyID.KEY_EVENT_CHEST_RECEIVE_GIFT, FBType.STRING);
        json.set("eventChestReceiveGiftDaily", KeyID.KEY_EVENT_CHEST_RECEIVE_GIFT_DAILY, FBType.STRING);

        json.set("eventChestLastSentCoin", KeyID.KEY_LAST_COSUME, FBType.INT, -1);
        json.set("eventChestUnlockNum", KeyID.KEY_EVENT_CHEST_UNLOCK_NUM, FBType.INT, 0);

        int _num_bronze = (int) json.set("_num_bronze", KeyID.KEY_NUM_BRONZE, FBType.INT, 0);
        int _num_silver = (int) json.set("_num_silver", KeyID.KEY_NUM_SILVER, FBType.INT, 0);
        int _num_gold = (int) json.set("_num_gold", KeyID.KEY_NUM_GOLD, FBType.INT, 0);

//		Server.s_globalDB[DatabaseID.SHEET_CHEST].length = 7
        for (int i = 0; i < 7; i++)
        {
            int chestNum = (int) json.set(KeyID.KEY_NUM_CHEST + i, KeyID.KEY_NUM_CHEST + i, FBType.INT, 0);
            if (chestNum == 0)
            {
                switch (i)
                {
//				DatabaseID.CHEST_ID_BRONZE = 1;
//				DatabaseID.CHEST_ID_SILVER = 2;
//				DatabaseID.CHEST_ID_GOLD = 3;
                    case 1:
                        chestNum = _num_bronze;
                        break;
                    case 2:
                        chestNum = _num_silver;
                        break;
                    case 3:
                        chestNum = _num_gold;
                        break;
                }

                json.set(KeyID.KEY_NUM_CHEST, chestNum);
            }
        }

        json.set("_lastCountPaid", KeyID.KEY_LAST_PAID, FBType.INT, 0);
        int chestNum = (int) json.set(KeyID.KEY_NUM_CHEST_INFO, KeyID.KEY_NUM_CHEST_INFO, FBType.INT, 0);
        for (int i = 0; i < chestNum; i++)
        {
            FBJson chestInfo = (FBJson) json.set(KeyID.KEY_CHEST_INFO + i, KeyID.KEY_CHEST_INFO + i, FBType.FBJSON);
            chestInfo.set("_id", KeyID.KEY_ID, FBType.BYTE);
            chestInfo.set("_listRateGift", KeyID.KEY_GIFT, FBType.STRING);
            chestInfo.set("_freeCount", KeyID.KEY_COUNT_FREE, FBType.BYTE, (byte) 0);
        }
        return json;
    }

    public FBJson parseDailyQuestV2 (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        byte version = (byte) json.set(KeyID.KEY_CYCLE_VERSION, KeyID.KEY_CYCLE_VERSION, FBType.BYTE);
        if (version < 1)
            return json;

        int num = (int) json.set(KeyID.KEY_NUM, KeyID.KEY_NUM, FBType.SHORT);
        for (int i = 0; i < num; i++)
        {
            FBJson dailyQuestRecord = (FBJson) json.set(KeyID.KEY_QUEST + i, KeyID.KEY_QUEST + i, FBType.FBJSON);
            dailyQuestRecord.set("_id", KeyID.KEY_ID, FBType.SHORT);
            dailyQuestRecord.set("_type", KeyID.KEY_TYPE, FBType.SHORT);
            dailyQuestRecord.set("_point", KeyID.KEY_POINT, FBType.SHORT);
            dailyQuestRecord.set("_target", KeyID.KEY_TARGET, FBType.SHORT);
        }

        json.set("_received", KeyID.KEY_RECEIVED, FBType.STRING);
        json.set("_packID", KeyID.KEY_PACK_GIFT, FBType.SHORT);
        json.set("_firstPackID", KeyID.KEY_PACK_GIFT_FIRST, FBType.SHORT, (short) 1);

//		String temp = (String) 
        json.set(KeyID.KEY_HISTORY, KeyID.KEY_HISTORY, FBType.STRING, "");
//		String[] history = temp.split(";");	
//		for (String str : history)
//		{
//			if (str.length() > 1)
//			{
//				String[] s = str.split(":");
//				_history.put(Integer.parseInt(s[0]), Integer.parseInt(s[1]));
//			}
//		}

        json.set("_luckyGift", KeyID.KEY_LUCKY_GIFT, FBType.STRING);
        json.set("_luckyGiftID", KeyID.KEY_LUCKY_GIFT_ID, FBType.SHORT, (short) -1);

        return json;
    }

    public FBJson parseBlackSmith (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        json.set("_id", KeyID.KEY_ID, FBType.SHORT);

        if (!json.binaryContainsKey(KeyID.KEY_MACHINE))
            return json;

        FBJson machine = (FBJson) json.set(KeyID.KEY_MACHINE, KeyID.KEY_MACHINE, FBType.FBJSON);
        machine = parseMachine(machine);

        FBJson durability = (FBJson) json.set(KeyID.KEY_MACHINES_DUR, KeyID.KEY_MACHINES_DUR, FBType.FBJSON);
        durability = parseMachineDurability(durability);

        return json;
    }

    public FBJson parseMailBox (FBJson json)
    {
//		FBJson json = new FBJson (bin);
        int num_of_mail = (int) json.set(KeyID.KEY_MAIL_NUM, KeyID.KEY_MAIL_NUM, FBType.INT, 0);
        for (int i = 0; i < num_of_mail; i++)
        {
            FBJson mail = (FBJson) json.set(KeyID.KEY_MAIL + "_" + i, KeyID.KEY_MAIL + "_" + i, FBType.FBJSON);
            mail.set("_date", KeyID.KEY_MAIL_DATE, FBType.INT);
            mail.set("_sender", KeyID.KEY_MAIL_SENDER, FBType.LONG, (long) 0);
            mail.set("_title", KeyID.KEY_MAIL_TITLE, FBType.STRING);
            mail.set("_content", KeyID.KEY_MAIL_CONTENT, FBType.STRING);
            String _gift_list = (String) mail.set("_gift_list", KeyID.KEY_MAIL_GIFT_LIST, FBType.STRING);
            mail.set("_is_read", KeyID.KEY_MAIL_READ, FBType.BOOLEAN);

//			DatabaseID.MAIL_TYPE_MESSAGE = 0
            mail.set("_type", KeyID.KEY_MAIL_TYPE, FBType.BYTE, 0);
            mail.set("_code", KeyID.KEY_MAIL_CODE, FBType.STRING);
            mail.set("_level", KeyID.KEY_MAIL_LEVEL, FBType.BYTE);//, Misc.GetMailLevel(_gift_list));
        }

        return json;
    }

    public FBJson parseUserFishing (FBJson json)
    {
//		Server.s_XLSTinyFeatures.baitsConst.getMaxBaitId() = 4
        for (byte i = 0; i < 4; i++)
            json.set(KeyID.KEY_FISHING_BAIT_DATA + "_" + i, KeyID.KEY_FISHING_BAIT_DATA + "_" + i, FBType.INT);

//		Server.s_XLSTinyFeatures.fishsConst.getMaxFishId() = 9
        for (byte i = 0; i < 9; i++)
            json.set(KeyID.KEY_FISHING_FISH_DATA + "_" + i, KeyID.KEY_FISHING_FISH_DATA + "_" + i, FBType.FLOAT);

        json.set("currentFishId", KeyID.KEY_FISH_ID, FBType.BYTE);
        json.set("currentFishWeight", KeyID.KEY_FISH_WEIGHT, FBType.FLOAT);
        json.set("currentFishId", KeyID.KEY_IS_BAIT_FREE, FBType.BYTE);

        return json;
    }

    public JsonObject parseUserBan (String str) throws Exception
    {
        JsonObject ban = new JsonObject();
        if (str == null || str.isEmpty())
            return ban;

        String aos[] = str.split(":");

        ban.addProperty("startTime", aos[0]);
        ban.addProperty("duration", aos[1]);

        return ban;
    }

    public FBJson parseNPCShop (FBJson json)
    {
        json.set("_nextRefreshTime", KeyID.KEY_SPENDKC_RS_TIME, FBType.INT);

//		NPCShop.NUM_SLOT = 3
        for (int i = 0; i < 3; i++)
        {
            FBJson slot = (FBJson) json.set(KeyID.KEY_SLOTS + i, KeyID.KEY_SLOTS + i, FBType.FBJSON);
            slot.set("_status", KeyID.KEY_STATUS, FBType.BYTE);
            slot.set("_item", KeyID.KEY_GIFT, FBType.STRING);
            slot.set("_price", KeyID.KEY_PRICE_EXCHANGE, FBType.STRING);
        }

        json.set("_dailyRefresh", KeyID.KEY_DAILY_GOT, FBType.SHORT);
        json.set("_lastRefreshTime", KeyID.KEY_DAILY_REFRESH, FBType.INT);

        return json;
    }

    public FBJson parseGiftCodeEnter (FBJson json)
    {
        json.set("enter_num", KeyID.KEY_GIFT_CODE_ENTER_NUM, FBType.INT);

        int gift_type_total = (int) json.set("gift_type_total", KeyID.KEY_GIFT_TYPE_TOTAL, FBType.INT);
        for (int i = 0; i < gift_type_total; i++)
        {
            json.set(KeyID.KEY_GIFT_TYPE_ID + i, KeyID.KEY_GIFT_TYPE_ID + i, FBType.STRING);
            json.set(KeyID.KEY_GIFT_TYPE_USE_TIME + i, KeyID.KEY_GIFT_TYPE_USE_TIME + i, FBType.INT);
        }

        json.set("lastTimeInput", KeyID.KEY_GIFT_CODE_TIME, FBType.INT);
        return json;
    }

    public FBJson parseAchievementTrophy (FBJson json)
    {
        json.set("_totalPoint", KeyID.KEY_POINT, FBType.INT);
        String temp = (String) json.set(KeyID.KEY_GIFT, KeyID.KEY_GIFT, FBType.STRING);
        json.set(KeyID.KEY_GIFT, temp.split(":"));
        return json;
    }

    public FBJson parseAddingUserInfo (FBJson json)
    {
        json.set("userId", KeyID.KEY_USER_ID, FBType.LONG);
        json.set("updateDate", KeyID.KEY_UPDATE_DATE, FBType.INT);

        String temp = (String) json.set("figiftSender", KeyID.KEY_SENDER_LIST, FBType.STRING);
        json.set("figiftSender", temp.split(";"));

        json.set("randomGift", KeyID.KEY_RANDOM_GIFT, FBType.STRING);
        json.set("selectFIGiftIndex", KeyID.KEY_SELECT_INDEX, FBType.INT);

        return json;
    }

    public FBJson parseAutoInfo (FBJson json)
    {
        json.set("userId", KeyID.KEY_USER_ID, FBType.LONG);
        json.set("autoLevel", KeyID.KEY_AUTO_LEVEL, FBType.BYTE);

        return json;
    }

    public FBJson parseUserMinigame (FBJson json)
    {
        FBJson baucua = (FBJson) json.set(KeyID.KEY_MINIGAME_BAUCUA, KeyID.KEY_MINIGAME_BAUCUA, FBType.FBJSON);

        baucua.set("lastSaveTime", "lastSaveTime", FBType.INT, 0);
        short num = (short) baucua.set(KeyID.KEY_ITEM_NUM, KeyID.KEY_ITEM_NUM, FBType.SHORT, (short) 0);

        for (int i = 0; i < num; i++)
        {
            baucua.set(KeyID.KEY_BC_ITEM + "_" + i, KeyID.KEY_BC_ITEM + "_" + i, FBType.ARRAY_BYTE);
//			MngBauCuaItem bcItem = new MngBauCuaItem(item_bin);
        }

        baucua.set("setId", KeyID.KEY_BC_USER_SET_ID, FBType.INT);
        baucua.set("setEndTime", KeyID.KEY_BC_SET_ENDTIME, FBType.INT);
        baucua.set("setResult", KeyID.KEY_BC_SET_RESULT, FBType.STRING);

        for (int i = 0; i < 6; i++)
            baucua.set(KeyID.KEY_BC_USER_BETTED_ITEMS + "_" + i, KeyID.KEY_BC_USER_BETTED_ITEMS + "_" + i, FBType.STRING);

        baucua.set("winPoint", KeyID.KEY_BC_USER_WIN_POINT, FBType.INT);
        baucua.set("lastAdvGiftId", KeyID.KEY_BC_USER_ADVENTURE, FBType.INT);

        return json;
    }

    public FBJson parseMiner (FBJson json)
    {
        json.set("userId", KeyID.KEY_USER_ID, FBType.LONG);

        FBJson mine = (FBJson) json.set(KeyID.KEY_MINE, KeyID.KEY_MINE, FBType.FBJSON);
        {
            mine.set("level", KeyID.KEY_MINE_LEVEL, FBType.INT);
            byte width = (byte) mine.set("width", KeyID.KEY_MINE_WIDTH, FBType.BYTE);
            byte height = (byte) mine.set("height", KeyID.KEY_MINE_HEIGHT, FBType.BYTE);
            mine.set("gate", KeyID.KEY_MINE_GATE, FBType.BYTE);
            mine.set("nextGate", KeyID.KEY_MINE_NEXT_GATE, FBType.INT);
            mine.set("lastBreakingIndex", KeyID.KEY_MINE_LAST_BREAKING_INDEX, FBType.INT);
            mine.set("lastBreakingEndDate", KeyID.KEY_MINE_LAST_BREAKING_END_DATE, FBType.INT);
            mine.set("mouseIndex", KeyID.KEY_MINE_MOUSE_INDEX, FBType.INT);

            int sum = width * height;
            for (int i = 0; i < sum; i++)
            {
                FBJson tile = (FBJson) mine.set(KeyID.KEY_MINE_TILE_PREFIX + i, KeyID.KEY_MINE_TILE_PREFIX + i, FBType.FBJSON);
                tile.set("type", KeyID.KEY_MINE_TILE_TYPE, FBType.INT);
                tile.set("status", KeyID.KEY_MINE_TILE_STATUS, FBType.BYTE);
                tile.set("boxType", KeyID.KEY_MINE_BOX_TYPE, FBType.BYTE);
                tile.set("ore", KeyID.KEY_MINE_ORE, FBType.STRING, "");
            }
        }

        FBJson mineBox = (FBJson) json.set(KeyID.KEY_MINE_BOX, KeyID.KEY_MINE_BOX, FBType.FBJSON);
        {
            String[] keys = {
                    KeyID.KEY_MINE_BOX_01_COUNT, KeyID.KEY_MINE_BOX_01_GIFT_PREFIX
                    , KeyID.KEY_MINE_BOX_02_COUNT, KeyID.KEY_MINE_BOX_02_GIFT_PREFIX
                    , KeyID.KEY_MINE_BOX_03_COUNT, KeyID.KEY_MINE_BOX_03_GIFT_PREFIX
                    , KeyID.KEY_MINE_BOX_04_COUNT, KeyID.KEY_MINE_BOX_04_GIFT_PREFIX
            };

            for (int i = 0; i < keys.length; i += 2)
            {
                String count = keys[i];
                String gift = keys[i + 1];

                int temp = (int) mineBox.set(count, count, FBType.INT, (int) 0);
                for (int g = 0; g < temp; g++)
                    mineBox.set(gift + i, gift + i, FBType.STRING);
            }
        }

        FBJson mineTool = (FBJson) json.set(KeyID.KEY_MINE_TOOL, KeyID.KEY_MINE_TOOL, FBType.FBJSON);
        {
            mineTool.set("flareCount", KeyID.KEY_MINE_TOOL_FLARE_COUNT, FBType.INT);
            mineTool.set("horBomCount", KeyID.KEY_MINE_TOOL_HOR_BOM_COUNT, FBType.INT);
            mineTool.set("verBomCount", KeyID.KEY_MINE_TOOL_VER_BOM_COUNT, FBType.INT);
            mineTool.set("crossBomCount", KeyID.KEY_MINE_TOOL_CROSS_BOM_COUNT, FBType.INT);
            mineTool.set("tntBomCount", KeyID.KEY_MINE_TOOL_TNT_BOM_COUNT, FBType.INT);
        }

        return json;
    }

    public FBJson parseUserAdsInfo (FBJson json)
    {
        json.set("group_id", KeyID.KEY_USER_ADS_GROUP_ID, FBType.BYTE);
        json.set("num_viewed", KeyID.KEY_USER_NUM_ADS_VIEWED, FBType.BYTE);
        json.set("last_view_time", KeyID.KEY_USER_ADS_LAST_TIME, FBType.INT);
        json.set("special_index", "daily_special_index", FBType.BYTE);
        json.set("countDailyRequest", "countDailyRequest", FBType.INT);

        return json;
    }

    public FBJson parseUserSkin (FBJson json)
    {
//		DatabaseID.SKIN_TYPE_STOCK = 0
//		DatabaseID.SKIN_TYPE_MAX = 10
        for (int i = 0; i < 10; i++)
        {
            FBJson skin = (FBJson) json.set(KeyID.KEY_USER_SKIN + i, KeyID.KEY_USER_SKIN + i, FBType.FBJSON);

            short num = (short) skin.set(KeyID.KEY_SKIN_NUM + i, KeyID.KEY_SKIN_NUM + i, FBType.SHORT, (short) 0);
            for (short j = 0; j < num; j++)
            {
                skin.set(KeyID.KEY_SKIN_ID + i + "_" + j, KeyID.KEY_SKIN_ID + i + "_" + j, FBType.SHORT);
                skin.set(KeyID.KEY_SKIN_EXPIRE + i + "_" + j, KeyID.KEY_SKIN_EXPIRE + i + "_" + j, FBType.INT);
            }

        }
        return json;
    }

    public FBJson parseOfferSystem (FBJson json)
    {
        json.set("_type", KeyID.KEY_TYPE, FBType.BYTE);
        json.set("_endTime", KeyID.KEY_TYPE, FBType.INT);
        short num = (short) json.set(KeyID.KEY_NUM, KeyID.KEY_NUM, FBType.SHORT, (short) 0);

        for (int i = 0; i < num; i++)
        {
            FBJson offerCheckPoint = (FBJson) json.set(KeyID.KEY_CYCLE_SLOT + "_" + i, KeyID.KEY_CYCLE_SLOT + "_" + i, FBType.FBJSON);
            offerCheckPoint.set("_point", KeyID.KEY_POINT, FBType.INT);
            offerCheckPoint.set("_stt", KeyID.KEY_STATUS, FBType.BOOLEAN);
            offerCheckPoint.set("_paidType", KeyID.KEY_TYPE, FBType.BYTE);
            offerCheckPoint.set("_bonus", KeyID.KEY_BONUS, FBType.SHORT, (short) 0);
            offerCheckPoint.set("_gift", KeyID.KEY_GIFT, FBType.STRING, "");
            offerCheckPoint.set("_vnd", KeyID.KEY_VND, FBType.INT, (int) 0);
            offerCheckPoint.set("_desc", KeyID.KEY_DETAIL, FBType.STRING, "");
        }
        return json;
    }

    public JsonObject parseOfferPayBonusDaily (String str) throws Exception
    {
        JsonObject json = new JsonObject();
        if (str == null || str.isEmpty())
            return json;

        String aos[] = str.split(":");

        json.addProperty("end_time", aos[0]);
        json.addProperty("bonusDiamond", aos[1]);

        return json;
    }

    public FBJson parseUserPet (FBJson json)
    {
        json.set("_resetTime", KeyID.KEY_PET_RESET_TIME, FBType.INT);
        json.set("_currentPetId", KeyID.KEY_PET_CURRENT_GROUP_ID, FBType.BYTE);
        json.set("_currentQuestPackId", KeyID.KEY_PET_CURRENT_MISSION_PACK_ID, FBType.INT);
        json.set("_currentFoodQuestId", KeyID.KEY_PET_CURRENT_FOOD_MISSION_PACK_ID, FBType.INT);
        json.set("_petStatus", KeyID.KEY_PET_STATUS, FBType.BYTE);

//		XLSPet.MAX_CHILD = 3
        for (int i = 0; i < 3; i++)
            json.set(KeyID.KEY_PET_TYPE + "_" + i, KeyID.KEY_PET_TYPE + "_" + i, FBType.INT);

        short num = (short) json.set(KeyID.KEY_NUM, KeyID.KEY_NUM, FBType.SHORT, (short) 0);
        for (short i = 0; i < num; i++)
        {
            FBJson userPetQuestRecord = (FBJson) json.set(KeyID.KEY_QUEST + i, KeyID.KEY_QUEST + i, FBType.FBJSON);
            userPetQuestRecord.set("_id", KeyID.KEY_ID, FBType.SHORT);
            userPetQuestRecord.set("_type", KeyID.KEY_TYPE, FBType.SHORT);
            userPetQuestRecord.set("_point", KeyID.KEY_POINT, FBType.SHORT);
            userPetQuestRecord.set("_target", KeyID.KEY_TARGET, FBType.SHORT);
        }

        json.set("_lastPaidDiamond", KeyID.KEY_PET_LAST_PAID_DIAMOND, FBType.INT);
        json.set("_lastSpentDiamond", KeyID.KEY_PET_LAST_SPENT_DIAMOND, FBType.INT);
        json.set("_currentPetPoint", KeyID.KEY_PET_CURRENT_POINT, FBType.INT);

        int stackGiftNum = (int) json.set(KeyID.KEY_PET_STACK_GIFT_NUM, KeyID.KEY_PET_STACK_GIFT_NUM, FBType.INT, (int) 0);
        for (int i = 0; i < stackGiftNum; i++)
        {
            json.set(KeyID.KEY_PET_STACK_GIFTS + "_" + i, KeyID.KEY_PET_STACK_GIFTS + "_" + i, FBType.STRING);
            json.set(KeyID.KEY_PET_STACK_GIFT_STATUS + "_" + i, KeyID.KEY_PET_STACK_GIFT_STATUS + "_" + i, FBType.BYTE);
        }

        FBJson _foodQuest = (FBJson) json.set("_foodQuest", KeyID.KEY_PET_QUEST_FOOD, FBType.FBJSON);
        {
            _foodQuest.set("_id", KeyID.KEY_ID, FBType.SHORT);
            _foodQuest.set("_type", KeyID.KEY_TYPE, FBType.SHORT);
            _foodQuest.set("_point", KeyID.KEY_POINT, FBType.SHORT);
            _foodQuest.set("_target", KeyID.KEY_TARGET, FBType.SHORT);
        }

        json.set("_hungryTime", KeyID.KEY_PET_HUNGRY_TIME, FBType.INT, (int) 0);
        json.set("_foodPackIndex_1", KeyID.KEY_PET_FOOD_PACK_INDEX_1, FBType.INT, (int) 0);
        json.set("_foodPackIndex_2", KeyID.KEY_PET_FOOD_PACK_INDEX_2, FBType.INT, (int) 0);
        json.set("_foodPackIndex_3", KeyID.KEY_PET_FOOD_PACK_INDEX_3, FBType.INT, (int) 0);

        return json;
    }

    public FBJson parseUserMiscV2 (FBJson json)
    {
        json.set("isReceivedGiftInvited", "giftinvite", FBType.BOOLEAN);
        json.set("isGotGiftFacebook", "facebook", FBType.BOOLEAN);
        json.set("isGotGiftZalo", "zalo", FBType.BOOLEAN);
        json.set("isGotGiftZingMe", "zingme", FBType.BOOLEAN);
        json.set("versionGotGiftUpdate", "versiongift", FBType.STRING);

        json.set("versionGotGiftUpdate", "versiongift", FBType.STRING);

//		SystemGift.KEY_USER_MISC_GOT = "g20180412"
        json.set("_isGotCurrentSysGift", "g20180412", FBType.BOOLEAN);

//		SystemMailGift.KEY_USER_MISC_GOT = "mailgift20171201"
        json.set("_isGotSysMailGift", "mailgift20171201", FBType.BOOLEAN);

        json.set("flagfixdata", "flagfixdata", FBType.BYTE, (byte) 0);
        json.set("isLockWhiteUser", "whiteuser2", FBType.BOOLEAN);
        json.set("rgiftbirhtday", "rgiftbirhtday", FBType.STRING);
        json.set("birthday", "birthday", FBType.SHORT);

        json.set("flagFixLoadData", "flagFixLoadData", FBType.BYTE, (byte) 0);
        json.set("numRecallGiftReceived", "numRecallGiftReceived", FBType.BYTE, (byte) 0);
        json.set("levelRecall", "levelRecall", FBType.SHORT, (short) 0);

        json.set("latestRecallTime", "latestRecallTime", FBType.INT);

        json.set("numReceidDiamondTicket_78", "ticket_78", FBType.BYTE, (byte) 0);
        json.set("numReceidDiamondTicket_79", "ticket_79", FBType.BYTE, (byte) 0);
        json.set("numReceidDiamondTicket_80", "ticket_80", FBType.BYTE, (byte) 0);

        json.set("md5SystemMail", "sysmail", FBType.STRING, "");
        return json;
    }

    public FBJson parsePrivateShopViewer (FBJson json)
    {
        int i = 0;
        while (json.binaryContainsKey("viewer_did_" + i))
        {
            json.set("viewer_did_" + i, "viewer_did_" + i, FBType.STRING);
            json.set("viewer_ip_" + i, "viewer_ip_" + i, FBType.STRING);
            json.set("viewer_port_" + i, "viewer_port_" + i, FBType.INT);

            i++;
        }
        return json;
    }

    public FBJson parseInvestManager (FBJson json)
    {
        json.set("timeInvestIndex", KeyID.KEY_INDEX, FBType.INT, (int) 0);

        FBJson timeInvest = (FBJson) json.set(KeyID.KEY_TIME_INVEST, KeyID.KEY_TIME_INVEST, FBType.FBJSON);
        {
            timeInvest.set("type", KeyID.KEY_INVEST_TYPE, FBType.INT);
            timeInvest.set("saving", KeyID.KEY_INVEST_SAVING, FBType.INT);
            timeInvest.set("interest", KeyID.KEY_INVEST_INTEREST, FBType.INT);
            timeInvest.set("description", KeyID.KEY_INVEST_DESCRIPTION, FBType.STRING);
            timeInvest.set("title", KeyID.KEY_INVEST_TITLE, FBType.STRING);
            timeInvest.set("history", KeyID.KEY_INVEST_HISTORY, FBType.STRING);

            int count = (int) timeInvest.set("count", KeyID.KEY_INVEST_ITEM_COUNT, FBType.INT, (int) 0);
            for (int i = 0; i < count; i++)
            {
                FBJson investItem = (FBJson) json.set(KeyID.KEY_INVEST_ITEM + i, KeyID.KEY_INVEST_ITEM + i, FBType.FBJSON);
                investItem.set("type", KeyID.KEY_INVEST_TYPE, FBType.INT);
                investItem.set("index", KeyID.KEY_INVEST_ITEM_INDEX, FBType.INT);
                investItem.set("target", KeyID.KEY_INVEST_TARGET, FBType.INT);
                investItem.set("withdrawalAmount", KeyID.KEY_INVEST_WITHDRAWAL_AMOUNT, FBType.INT);
                investItem.set("interest", KeyID.KEY_INVEST_INTEREST, FBType.INT);
                investItem.set("gift", KeyID.KEY_INVEST_GIFT, FBType.STRING);
                investItem.set("status", KeyID.KEY_INVEST_STATUS, FBType.INT);
                investItem.set("unlockPrice", KeyID.KEY_INVEST_UNLOCK_PRICE, FBType.INT, (int) 0);
            }
        }

        json.set("allowHelpCount", KeyID.KEY_INVEST_SOW_EAT_HELP_COUNT, FBType.BYTE);

        return json;
    }

    public FBJson parseGenderInfo (FBJson json)
    {
        json.set("_lastTimeChangeGender", "lasttime", FBType.INT);
        json.set("_countChangeGender", "countchange", FBType.INT);

        return json;
    }

    public FBJson parseEventCumKC (FBJson json)
    {
        json.set("_resetTime", KeyID.KEY_CUMKC_RESET_TIME, FBType.INT);
        json.set("_currentPoint", KeyID.KEY_CUMKC_CURRENT_POINT, FBType.INT);
        json.set("_lastPaidDiamond", KeyID.KEY_CUMKC_LAST_PAID_DIAMOND, FBType.INT);
        json.set("_totalPaidDiamond", KeyID.KEY_CUMKC_TOTAL_PAID_DIAMOND, FBType.INT);
        json.set("_remainGiftByUser", KeyID.KEY_CUMKC_REMAIN_GIFT_BY_USER, FBType.STRING);
        return json;
    }

    public FBJson parseEventSharePic (FBJson json)
    {
        json.set("_resetTime", "rstime", FBType.INT);

        String temp = (String) json.set("history", "history", FBType.STRING, "");
        String[] shareId = temp.trim().split(":");
        json.set("history", shareId);

        temp = (String) json.set("listpic", "listpic", FBType.STRING, "");
        String[] picId = temp.trim().split(":");
        json.set("listpic", shareId);
        return json;
    }

    public FBJson parseLuckyGiftBox (FBJson json)
    {
        json.set("_resetTime", KeyID.KEY_LUCKY_BOX_GIFT_RESET_TIME, FBType.INT);

//		Server.s_XLSLuckyGiftBox.TOKEN_NUM = 3
        for (byte i = 0; i < 3; i++)
        {
            json.set(KeyID.KEY_LUCKY_BOX_CURRENT_SPIN + "_" + i, KeyID.KEY_LUCKY_BOX_CURRENT_SPIN + "_" + i, FBType.INT);
            json.set(KeyID.KEY_LUCKY_BOX_CURRENT_REFRESH + "_" + i, KeyID.KEY_LUCKY_BOX_CURRENT_REFRESH + "_" + i, FBType.INT);

//			Server.s_XLSLuckyGiftBox.SLOT_NUM = 12
            for (int j = 0; j < 12; j++)
            {
                json.set(KeyID.KEY_LUCKY_BOX_GIFT_GIFT + "_" + i + "_" + j, KeyID.KEY_LUCKY_BOX_GIFT_GIFT + "_" + i + "_" + j, FBType.STRING);
                json.set(KeyID.KEY_LUCKY_BOX_GIFT_TOKEN_GROUP + "_" + i + "_" + j, KeyID.KEY_LUCKY_BOX_GIFT_TOKEN_GROUP + "_" + i + "_" + j, FBType.INT);
                json.set(KeyID.KEY_LUCKY_BOX_GIFT_TOKEN_STATUS + "_" + i + "_" + j, KeyID.KEY_LUCKY_BOX_GIFT_TOKEN_STATUS + "_" + i + "_" + j, FBType.BYTE);
            }
        }
        return json;
    }
}