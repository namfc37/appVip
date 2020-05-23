
const LOADING_STATE_NONE = 0;
const LOADING_STATE_QUICK_LOGIN = 1;
const LOADING_STATE_CHOOSE_ACCOUNT = 2;
const LOADING_STATE_LOGIN = 3;
const LOADING_STATE_REGISTER = 4;
const LOADING_STATE_LOAD = 5;
const LOADING_STATE_BALANCE_FAIL = 6;
const LOADING_STATE_MAINTENANCE = 7;
const LOADING_STATE_FORCE_UPDATE = 8;

const Z_UI_LOADING = 0;
const Z_UI_LOGIN = 1;

const DISABLE_TOUCH_COLOR = cc.color(0, 0, 0, 128);

const LOADING_BACKGROUND_IMAGE = "common/images/hud_loading_bg_new_year.png";

var LoadingScene = cc.Scene.extend
({
	state: LOADING_STATE_NONE,
	progressBar: null,
	progressText: null,
	loadResources: true,
	
	onEnter:function()
	{
		this._super();
		
		if(cc.sys.isNative) //native
			ZPLogin.usePortal = cc.director.isUsePortal && cc.director.isUsePortal();
		else if(fr.NativePortal) //web portal
			ZPLogin.usePortal = fr.NativePortal.getSessionKey()?true:false;
		
		cc.log("usePortal", ZPLogin.usePortal);
		
		if(cc.sys.isNative)
			fr.platformWrapper.logGameStep("INIT_100_LOADING_SCENE", "START", "SUCC", 0, ZPLogin.usePortal ? "portal" : "single");
		
		if(this.loadResources)
		{
			// preload ui plist
			FWLoader.addSpriteFrames(UIMAIN0_PLIST);
			FWLoader.addSpriteFrames(UIMAIN1_PLIST);
			FWLoader.addSpriteFrames(UIMAIN2_PLIST);
			FWLoader.addSpriteFrames(UIMAIN3_PLIST);
			
			FWLoader.loadWidgetToPool(UI_ZLOADING, 1);
			FWLoader.loadWidgetToPool(UI_ZLOGIN, 1);
			FWLoader.loadWidgetToPool(UI_POPUP, 1);
		}
		
		var uiLoading = FWPool.getNode(UI_ZLOADING, false);
		this.userIdText = FWUtils.getChildByName(uiLoading, "userId");
		this.userIdText.setVisible(false);
		
		this.state = LOADING_STATE_NONE;
		this.setState(ZPLogin.quickLogin(this.onZPLoginResponse.bind(this)) === true ? LOADING_STATE_QUICK_LOGIN : LOADING_STATE_CHOOSE_ACCOUNT);
		
		var loadingBg = FWUtils.getChildByName(uiLoading, "bg");
		loadingBg.uiDef = {type:UITYPE_IMAGE, value:LOADING_BACKGROUND_IMAGE, isLocalTexture:true};
		FWUI.fillData_image(loadingBg, null, loadingBg.uiDef);
	},
	
	onExit:function()
	{
		var uiLoading = FWPool.getNode(UI_ZLOADING, false);
		var loadingBg = FWUtils.getChildByName(uiLoading, "bg");
		FWUI.unfillData_image(loadingBg);
		delete loadingBg.uiDef;
		
		this._super();
		this.unscheduleUpdate();
		FWUtils.onSceneExit();
	},
	
	addLoadingSteps:function()
	{
///////////////////////////////////////////////////////////////////////////////////////
// add loading steps here /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

		// must load this before initializing chat
		FWLoader.addLoading(function() {FWLoader.addSpriteFrames(GUILD_DUMMY_PLIST, null, true);});

		FWLoader.addLoading(function() {Game.init();});

		// login
		FWLoader.addLoading(function() {FWLoader.connectServer();});
		FWLoader.addLoading(function() {FWLoader.initUserDataHelper();});
		FWLoader.addLoading(function() {Payment.init(); CardPayment.init();});
		//FWLoader.addLoading(function() {FriendList.load();});
		
		// please put all resource loading code inside this if
		// and other (initialization, connection, login) code outside
		if(this.loadResources) 
		{
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_BACKGROUND, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CLOUDFLOOR, CloudFloors.getLastUnlockedFloorIdx() + 1);});//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CLOUDFLOOR, MAX_FLOORS);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CLOUDFLOOR_TOP, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POT_MENU, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PLANT_MENU, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ITEM_NO_BG, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ITEM_NO_BG2, 30, true);});//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ITEM_NO_BG2, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SKIP_TIME, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POPUP, 1);}); loaded on entering scene
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_FLYING_ICON, MAX_SLOTS_PER_FLOOR * 4);}); // default 2 visible floors x 2 collect fx
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UNLOCK_FLOOR, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UNLOCK_FLOOR_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HOME, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HOME_BUTTON, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ORDER, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ORDER_DETAIL, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ORDER_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ORDER_REQUEST_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ORDER_REWARD_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TIME, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_QUICK_BUY, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PRIVATE_SHOP, 1);}); // fix: private shop crashes when changing garden
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PRIVATE_SHOP_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PRIVATE_SHOP_ITEM_INFO, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PRIVATE_SHOP_SELECT_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CONFIRM_USE_DIAMOND, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_INFO, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_UNLOCK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_UNLOCK_INFO, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_PRODUCE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_UPGRADE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_SLOT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_STAR, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_NEWSBOARD, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_NEWSBOARD_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_MAIN, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_ITEM, 5);}); // jira#4733
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_IB_SHOP_TAB, 5);}); // jira#4733
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP_UNLOCK, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP_REPAIR, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP_REPAIR_SKIPTIME, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP_NEXTTIME, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_AIRSHIP_PACK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HINT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HINT_STAT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HINT_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HINT_ITEM_TITLE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HINT_ITEM_TITLE_SIMPLE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_HINT_TOAST, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_HINT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_HIRE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_HIRE_PACKAGE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_ITEM_SLOT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_ITEM_SLOT_PRICE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_SEARCH, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_SEARCH_DONE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_SLEEPY, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TOM_UNLOCK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POT_UPGRADE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POT_INFO, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POT_INFO_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PLANT_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_WHEEL_MAIN, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CLOUD_NUM, 2);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CLOUD_BUFF, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MAILBOX, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MAILBOX_RECEIVE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MAILBOX_RECEIVE_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MAILBOX_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MAILBOX_MESSAGE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EMPTY_STOCK_WARNING, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SMITHY_MAIN, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SMITHY_FORGE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SMITHY_POT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SMITHY_SELECTOR, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SMITHY_MATERIAL_POT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SMITHY_MATERIAL_PRODUCT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_REWARD, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_REWARD_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_REWARD_ITEM_SIMPLE, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_REWARD_COLLECT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_GAME_HOUSE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_GAME_HOUSE_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MINING, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MINING_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MINING_REQUIRE_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DAILY_GIFT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DAILY_GIFT_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DAILY_GIFT_REWARD, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CHEST, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CHEST_ITEM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_CHEST_OPEN, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DICE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DICE_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DECOR_PUT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DECOR_MENU, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_DECOR_INFO, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PAYMENT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PAYMENT_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PAYMENT_CHOOSE_CHANNEL, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EVENT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EVENT_MILESTONE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EVENT_MILESTONE_GIFT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EVENT_PUZZLE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EVENT_NEWS, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_EVENT_NEWS_ITEM, 1);});
			//opt not used FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_FIREFLY, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_QUIT_GAME, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_LEVEL_UP, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_LEVEL_UP_REWARD, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_LEVEL_UP_UNLOCK, 1);});			
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TUTORIAL, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_CONTAINER, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_SETTING, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_LIBRARY, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_LIBRARY_POT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_LIBRARY_INFO, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_LIBRARY_DECOR, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_LIBRARY_MACHINE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_UTIL_COMMUNITY, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POPUP_USER_INFO, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POPUP_WAITING, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POPUP_GIFTCODE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POPUP_GAME_QUIT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_POPUP_GAME_UPGRADE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_FRIEND_PANEL, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_FRIEND_ITEM, 1, true);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MACHINE_REPAIR, MAX_FLOORS);});
			// FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_STORAGE, 1);}); // jira#5452
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ITEM, 20);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_OFFER_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_FEATURE_PRESENT, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_SUCCESS_CHARGE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ACHIEVEMENT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_ACHIEVEMENT_ITEM, 25);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_QUEST_BOOK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_QUEST_BOOK_ITEM, 5);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_RANKING, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_RANKING_ITEM, 20);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_RANKING_ITEM, 20);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_RANKING_ITEM, 20);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PIGBANK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_MILESTONE_PIGBANK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_PAYMENT_ITEM_ATM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_VIP_ITEM, 1);});
			FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_VIP_INFO, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TRUCK, 1);});
			//FWLoader.addLoading(function() {FWLoader.loadWidgetToPool(UI_TRUCK_ITEM, 1);});


			// plants
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_SEED, MAX_SLOTS_PER_FLOOR * 2);}); // default 2 visible floors
			for(var plant in g_PLANT)
				FWLoader.addLoading("if(gv.userStorages.getItemAmount('" + plant + "') > 0) FWLoader.loadSpineToPool('" + Game.getPlantSpineByDefine(plant) + "', 6);");//opt FWLoader.addLoading("FWLoader.loadSpineToPool('" + Game.getPlantSpineByDefine(plant) + "', 6);");
			
			// pots
			var path;
			var loadList = [];
			for(var pot in g_POT)
			{
				path = Game.getPotSpineByDefine(pot);
				if(loadList.indexOf(path) < 0)
					loadList.push(path);
			}
			for(var i=0, len=loadList.length; i<len; i++)
				FWLoader.addLoading("if(gv.userStorages.getItemAmount('" + loadList[i] + "') > 0) FWLoader.loadSpineToPool('" + loadList[i] + "', 6);");//opt FWLoader.addLoading("FWLoader.loadSpineToPool('" + loadList[i] + "', 6);");
				
			// bugs
			//opt for(var bug in g_PEST)
			//opt 	FWLoader.addLoading("FWLoader.loadSpineToPool('" + Game.getBugSpineByDefine(bug) + "', 6);");
			
			// decors
			/*opt loadList = [];
			for(var decor in g_DECOR)
			{
				path = Game.getDecorSpineByDefine(decor);
				if(loadList.indexOf(path) < 0)
					loadList.push(path);
			}
			for(var i=0, len=loadList.length; i<len; i++)
				FWLoader.addLoading("FWLoader.loadSpineToPool('" + loadList[i] + "', 6);");*/
			
			// machines
			//opt for(var machine in g_MACHINE)
			//opt 	FWLoader.addLoading("FWLoader.loadSpineToPool('" + Game.getMachineSpineByDefine(machine) + "', 1);");
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_MACHINE_EGG, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_MACHINES_ICE_BROKEN, 1);});

			// effects
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_POT_SLOT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_UNLOCK, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_TILE_EXPLOSION, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_SMOKE_PARTICLE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_SUNRAY, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_FIREWORK, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_EFFECT_POT_SET, 1);});
			
			// misc
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BRUSH, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_OWL_TUTU, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_HUD_AIRSHIP_CARRET_ANIM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_PSHOP_SLOT_GOLD_ANIM, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_AIRSHIP, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BUILDING_STORAGE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BUILDING_ACHIEVEMENT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BUILDING_GAMES, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BUILDING_GUILD, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_PSHOP, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_FROG, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_FISH, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_INBOX, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_TREASURE, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BUILDING_LEADERBOARD, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_BLACKSMITH, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_FISHERMAN, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_WOLF_EVENT, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_TOMKID, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_BEE, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_CLOWN, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_CLOWN_BIG, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_CHEST, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_DICE_FLOWER, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_NPC_MINER, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_CLOUD_FLAG, 2);});
			
			FWLoader.addLoading(function() {Tutorial.init();});
			//opt FWLoader.addLoading(function() {if (!Tutorial.isFinished()) FWLoader.loadSpineToPool(SPINE_HUD_TUTORIAL_1, 1);});
			//opt FWLoader.addLoading(function() {if (!Tutorial.isFinished()) FWLoader.loadSpineToPool(SPINE_HUD_TUTORIAL_2, 1);});
			//opt FWLoader.addLoading(function() {if (!Tutorial.isFinished()) FWLoader.loadSpineToPool(SPINE_HAND_TUTORIAL, 1);});

			FWLoader.addLoading(function()
			{
				// warning texts
				for(var i=0; i<2; i++)//opt for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					var label = FWUtils.createUIText("", cc.p(0, 0), cc.size(0, 0));
					label.enableShadow(SHADOW_DEFAULT[0], SHADOW_DEFAULT[1]);
					FWPool.addNode(label, POOLKEY_WARNING_TEXTS);
				}
			});
			
			// event			
			FWLoader.addLoading(function() {GameEvent.init();});
			FWLoader.addLoading(function() {if (GameEvent.getActiveEvent()) FWLoader.loadSpineToPool(SPINE_NPC_EVENT, 1);});
			//opt FWLoader.addLoading(function() {if (GameEvent.getActiveEvent()) FWLoader.loadSpineToPool(SPINE_HUD_EVENT_BACKGROUND, 1);});
			FWLoader.addLoading(function() {if (GameEvent.getActiveEvent()) FWLoader.loadSpineToPool(SPINE_GIFT_BOX_EVENT, 1);});

			// misc
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_WIFI, 1);});
			//opt FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_LOADING_RUN, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_LOADING_GAME, 1);});

			// birds
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_BIRDS, 1);});

			// PigBank
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_PIGBANK, 1);});
			FWLoader.addLoading(function() {FWLoader.loadSpineToPool(SPINE_PIGBANK, 1);});


			// event2
			FWLoader.addLoading(function() {GameEventTemplate2.init();});

			// event 3
			FWLoader.addLoading(function() {GameEventTemplate3.init();});
		}
		// end of resource loading ////////////////////////////////////////////////////
		
		FWLoader.addLoading(function() {Guild.init();});
		FWLoader.addLoading(function() {Guild2.init();});

		// audio
		FWLoader.addLoading(function() {AudioManager.init();});
        FWLoader.addLoading(function() {AudioManager.music (MUSIC_BACKGROUND, true);});
        
		FWLoader.addLoading(function() {FriendList.load();FriendList.suggestionListRefreshTime = Game.getGameTimeInSeconds();});
		FWLoader.addLoading(function() {Payment.init2();});
		FWLoader.addLoading(function() {Achievement.init();});
		//FWLoader.addLoading(function() {QuestBook.init();});
		FWLoader.addLoading(function() {QuestMission.init();});
		FWLoader.addLoading(function() {NewsBoard.init();});
		FWLoader.addLoading(function() {Ranking.init();});
		FWLoader.addLoading(function() {PaymentLibHandle.init();});
		FWLoader.addLoading(function() {Donate.init();});
		
		// wait guild init fisrt, chat need guild id
		FWLoader.addLoading(function() {Chatbox.init();});
		FWLoader.addLoading(function() {FWLoader.connectChat();});

///////////////////////////////////////////////////////////////////////////////////////
// end of loading steps ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
		FWLoader.setLoadingFinishCallback(this.onLoadingFinished.bind(this));
	},
	
	setState:function(state)
	{
		if(state === LOADING_STATE_QUICK_LOGIN)
		{
			if(cc.sys.isNative)
				fr.platformWrapper.logGameStep("INIT_200_CHOOSE_ACCOUNT", "START", "SUCC", 0, "QUICK_LOGIN");
			
			var uiDef = 
			{
				logo:{visible:false},//logo:{visible:true},
				logo2:{visible:false},
				loadingProgress:{visible:false},
				loadingProgressText:{visible:false},
				hint:{visible:false},
				login:{visible:false},
			};
			var uiLoading = FWPool.getNode(UI_ZLOADING, false);
			uiLoading.setLocalZOrder(Z_UI_LOADING);
			FWUI.showWidgetWithData(uiLoading, null, uiDef, this);
		}
		else if(state === LOADING_STATE_CHOOSE_ACCOUNT)
		{
			if(cc.sys.isNative)
				fr.platformWrapper.logGameStep("INIT_200_CHOOSE_ACCOUNT", "START", "SUCC", 0, "UI_CHOOSE");
			
			var uiDef = 
			{
				logo:{visible:false},
				logo2:{visible:false},//logo2:{visible:true},
				loadingProgress:{visible:false},
				loadingProgressText:{visible:false},
				hint:{visible:false},
				loginHint:{type:UITYPE_TEXT, value:"TXT_LOADING_CHOOSE_ACCOUNT", visible:true},//hint:{type:UITYPE_TEXT, value:"TXT_LOADING_CHOOSE_ACCOUNT", style:TEXT_STYLE_LOADING, visible:true},
				login:{visible:true},
				btnFacebook:{onTouchEnded:this.onAccountChosen.bind(this)},
				btnGoogle:{onTouchEnded:this.onAccountChosen.bind(this)},
				btnZing:{onTouchEnded:this.onAccountChosen.bind(this)},
				btnPlayNow:{onTouchEnded:this.onAccountChosen.bind(this), visible:ZPLogin.hasQuickGuestLogin()},
				playNowText:{type:UITYPE_TEXT, value:"TXT_EVENT_PLAY_NOW", style:TEXT_STYLE_PLAY_NOW},
			};
			var uiLoading = FWPool.getNode(UI_ZLOADING, false);
			uiLoading.setLocalZOrder(Z_UI_LOADING);
			FWUI.showWidgetWithData(uiLoading, null, uiDef, this);
			
			var btnZing = FWUtils.getChildByName(uiLoading, "btnZing");
			var btnFacebook = FWUtils.getChildByName(uiLoading, "btnFacebook");
			var btnGoogle = FWUtils.getChildByName(uiLoading, "btnGoogle");
			var y = (ZPLogin.hasQuickGuestLogin() ? -30 : -100);
			if(ZPLogin.hasGuestLogin())
			{
				btnZing.setVisible(true);
				btnZing.setPosition(-150, y);
				btnFacebook.setPosition(0, y);
				btnGoogle.setPosition(150, y);
			}
			else
			{
				btnZing.setVisible(false);
				btnFacebook.setPosition(-75, y);
				btnGoogle.setPosition(75, y);
			}
		}
		else if(state === LOADING_STATE_LOAD)
		{
			if(cc.sys.isNative)
				fr.platformWrapper.logGameStep("INIT_400_LOAD_GAME", "START", "SUCC", 0, "");
			
			var uiDef = 
			{
				logo:{visible:false},//logo:{visible:true},
				logo2:{visible:false},
				loadingProgress:{visible:true},
				loadingProgressText:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_BLUE, value:"", visible:true},//loadingProgressText:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING, value:"", visible:true},
				hint:{type:UITYPE_TEXT, value:"TXT_LOADING_HINT" + _.random(0, 15), visible:true},//hint:{type:UITYPE_TEXT, value:"TXT_LOADING_HINT" + _.random(0, 15), style:TEXT_STYLE_HINT, visible:true},
				login:{visible:false},
			};
			var uiLoading = FWPool.getNode(UI_ZLOADING, false);
			FWUI.fillData(uiLoading, null, uiDef);

			this.progressBar = FWUI.getChildByName(uiLoading, "loadingProgress");
			this.progressText = FWUI.getChildByName(uiLoading, "loadingProgressText");
			
			this.addLoadingSteps();
			this.scheduleUpdate();
			this.update(0);
		}
		
		if(FWUI.isShowing(UI_ZLOGIN) && state !== LOADING_STATE_LOGIN && state !== LOADING_STATE_REGISTER)
			FWUI.hide(UI_ZLOGIN);
		
		this.state = state;
	},
	
	update:function(dt)
	{
		var percent = FWLoader.getLoadingPercent();
		this.progressBar.setPercent(percent);
		this.progressText.setString(FWUtils.fastFloor(percent) + "%");
		
		if(!this.userIdText.isVisible() && gv.userData && gv.userData.userId)
		{
			this.userIdText.setVisible(true);
			this.userIdText.setString("ID " + gv.userData.userId);
			FWUI.applyTextStyle(this.userIdText, TEXT_STYLE_TEXT_NORMAL);
		}
		
		FWUI.hasTouchedUI = false;
	},
	
	onLoadingFinished:function()
	{
		if(cc.sys.isNative)
			fr.platformWrapper.logGameStep("INIT_600_GAME_SCENE", "START", "SUCC", 0, "");
		if(!this.loadResources)
		{
			// added delay to make sure previous transition has been finished
			cc.director.getScheduler().scheduleCallbackForTarget(this, function()
			{
				Game.gameScene = new GameScene();
				FWUtils.setCurrentScene(Game.gameScene, 0);				
				//cc.log("getCachedTextureInfo A");
				//cc.log(cc.textureCache.getCachedTextureInfo());
			}, 0, 0, CHANGE_GARDEN_DELAY, false);
		}
		else
		{
			Game.gameScene = new GameScene();
if(!cc.sys.isNative)
			Game.gameScene.showTransition();
			FWUtils.setCurrentScene(Game.gameScene, 0);			
			//cc.log("getCachedTextureInfo B");
			//cc.log(cc.textureCache.getCachedTextureInfo());
		}		
		
		// TODO: remove
		/*// var uiLoading = FWPool.getNode(UI_ZLOADING, false);
		// uiLoading.runAction (cc.sequence (
		// 	cc.moveTo (0.75, cc.p(cc.winSize.width * 0.5, cc.winSize.height * 1.6)),
		// 	cc.callFunc (() => {
				Game.gameScene = new GameScene();
				FWUtils.setCurrentScene(Game.gameScene, 0);
		// 	})
		// ));
		
		// var loadingProgressText = FWUI.getChildByName(uiLoading, "loadingProgressText");
		// loadingProgressText.setVisible (false);

		//FWUtils.setCurrentScene(new TestScene());*/
	},

	onAccountChosen:function(sender)
	{
		var name = sender.getName();
		
		if(cc.sys.isNative)
			fr.platformWrapper.logGameStep("INIT_300_LOGIN_SOCIAL", "START", "SUCC", 0, name);
		
		if(name === "btnZing")
		{
			// login
			var uiDef = 
			{
				btnBack:{onTouchEnded:this.onBack.bind(this)},
				login:{visible:true},
				register:{visible:false},
				loginText:{type:UITYPE_TEXT, value:"TXT_LOADING_LOGIN_TITLE", style:TEXT_STYLE_LOADING},
				loginErrorMessage:{visible:false},
				loginNameText:{type:UITYPE_TEXT, value:"TXT_LOADING_USERNAME", style:TEXT_STYLE_LOADING},
				loginPassText:{type:UITYPE_TEXT, value:"TXT_LOADING_PASSWORD", style:TEXT_STYLE_LOADING},
				loginButtonText:{type:UITYPE_TEXT, value:"TXT_LOADING_LOGIN", style:TEXT_STYLE_TEXT_BUTTON},
				registerButtonText:{type:UITYPE_TEXT, value:"TXT_LOADING_REGISTER", style:TEXT_STYLE_TEXT_BUTTON},
				loginButton:{onTouchEnded:this.onLogin.bind(this)},
				registerButton:{onTouchEnded:this.onRegister.bind(this)},
				loginNameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},
				loginPassInput:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},
			};
			var uiLogin = FWPool.getNode(UI_ZLOGIN, false);
			uiLogin.setLocalZOrder(Z_UI_LOGIN);
			FWUI.showWidgetWithData(uiLogin, null, uiDef, this);
		}
		else if(name === "btnPlayNow")
		{
			FWUtils.disableAllTouches(true, DISABLE_TOUCH_COLOR);
			
			var quickName = ZPLogin.getQuickGuestkAccount();
			ZPLogin.registerZP(quickName, quickName, this.onZPLoginResponse.bind(this));
		}
		else if(name === "btnFacebook")
		{
			this.showError(null);
			FWUtils.disableAllTouches(true, DISABLE_TOUCH_COLOR);
			ZPLogin.loginFacebook(this.onZPLoginResponse.bind(this));
		}
		else if(name === "btnGoogle")
		{
			this.showError(null);
			FWUtils.disableAllTouches(true, DISABLE_TOUCH_COLOR);
			ZPLogin.loginGoogle(this.onZPLoginResponse.bind(this));
		}
		
		this.setState(LOADING_STATE_LOGIN);
	},
	
	onBack:function(sender)
	{
		this.setState(LOADING_STATE_CHOOSE_ACCOUNT);
	},
	
	onLogin:function(sender)
	{
		var uiLogin = FWPool.getNode(UI_ZLOGIN, false);
		var loginNameInput = FWUtils.getChildByName(uiLogin, "loginNameInput");
		var loginPassInput = FWUtils.getChildByName(uiLogin, "loginPassInput");
		var loginName = loginNameInput.getString().toLowerCase();
		var loginPass = loginPassInput.getString();
		if(!loginName || !loginPass)
		{
			this.showError("TXT_LOADING_ERROR_BLANK");
			return;
		}
		if (!ZPLogin.isValidUserName(loginName))
		{			
			this.showError("TXT_LOADING_ERROR_INVALID_ACC");
			return;
		}
		
		this.showError(null);
		FWUtils.disableAllTouches(true, DISABLE_TOUCH_COLOR);
		ZPLogin.loginZP(loginName, loginPass, this.onZPLoginResponse.bind(this));
	},
	
	onRegister:function(sender)
	{
		var uiDef = 
		{
			btnBack:{onTouchEnded:this.onBack.bind(this)},
			login:{visible:false},
			register:{visible:true},
			
			// jira#7206
			registerHint:{type:UITYPE_TEXT, value:"TXT_LOADING_REGISTER_HINT", visible:false},
			line:{visible:false},
			
			registerErrorMessage:{visible:false},
			registerNameText:{type:UITYPE_TEXT, value:"TXT_LOADING_USERNAME", style:TEXT_STYLE_LOADING},
			registerPassText:{type:UITYPE_TEXT, value:"TXT_LOADING_PASSWORD", style:TEXT_STYLE_LOADING},
			registerPassConfirmText:{type:UITYPE_TEXT, value:"TXT_LOADING_PASSWORD_CONFIRM", style:TEXT_STYLE_LOADING},
			registerButtonText2:{type:UITYPE_TEXT, value:"TXT_LOADING_REGISTER", style:TEXT_STYLE_TEXT_BUTTON},
			registerButton2:{onTouchEnded:this.onRegister2.bind(this)},
			registerNameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},
			registerPassInput:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},
			registerPassConfirmInput:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},
		};
		var uiLogin = FWPool.getNode(UI_ZLOGIN, false);
		uiLogin.setLocalZOrder(Z_UI_LOGIN);
		FWUI.showWidgetWithData(uiLogin, null, uiDef, this);
		
		this.setState(LOADING_STATE_REGISTER);
	},
	
	onRegister2:function(sender)
	{
		var uiLogin = FWPool.getNode(UI_ZLOGIN, false);
		var registerNameInput = FWUtils.getChildByName(uiLogin, "registerNameInput");
		var registerPassInput = FWUtils.getChildByName(uiLogin, "registerPassInput");
		var registerPassConfirmInput = FWUtils.getChildByName(uiLogin, "registerPassConfirmInput");
		var registerName = registerNameInput.getString().toLowerCase();
		var registerPass = registerPassInput.getString();
		var registerPassConfirm = registerPassConfirmInput.getString();
		if(!registerName || !registerPass || !registerPassConfirm)
		{
			this.showError("TXT_LOADING_ERROR_BLANK");
			return;
		}
		if(registerPass !== registerPassConfirm)
		{
			this.showError("TXT_LOADING_ERROR_PASS_NOT_MATCH");
			return;
		}
		if (!ZPLogin.isValidUserName(registerName))
		{			
			this.showError("TXT_LOADING_ERROR_INVALID_ACC");
			return;
		}
		
		this.showError(null);
		FWUtils.disableAllTouches(true, DISABLE_TOUCH_COLOR);
		ZPLogin.registerZP(registerName, registerPass, this.onZPLoginResponse.bind(this));//this.setState(LOADING_STATE_LOAD);
	},
	
	showError:function(message)
	{
		var uiLogin = FWPool.getNode(UI_ZLOGIN, false);
		var loginErrorMessage = FWUtils.getChildByName(uiLogin, "loginErrorMessage");
		var registerErrorMessage = FWUtils.getChildByName(uiLogin, "registerErrorMessage");
		var label = (this.state === LOADING_STATE_LOGIN ? loginErrorMessage : registerErrorMessage);

		if(message)
		{
			label.setVisible(true);
			label.setString(FWLocalization.text(message));
		}
		else
		{
			loginErrorMessage.setVisible(false);
			registerErrorMessage.setVisible(false);
		}
	},
	
	onZPLoginResponse:function(errorCode, msg)
	{
		if(cc.sys.isNative)
			fr.platformWrapper.logGameStep("INIT_300_LOGIN_SOCIAL", "END", "SUCC", 0, "error " + errorCode);
		FWUtils.disableAllTouches(false);
		
		if(errorCode === 0)
			this.setState(LOADING_STATE_LOAD);
		else if(errorCode === LOADING_STATE_MAINTENANCE)
		{
			if (!msg)
				msg = "TXT_MAINTENANCE_CONTENT";
			var displayInfo = {title:"TXT_MAINTENANCE_TITLE", content:msg, closeButton:false, avatar:NPC_AVATAR_PEOPEO, okText:"TXT_EXIT_GAME_YES"};
			Game.showPopup(displayInfo, Game.endGameScene, null);	
		}
		else if(errorCode === LOADING_STATE_BALANCE_FAIL)
		{
			var displayInfo = {title:"TXT_BALANCE_FAIL_TITLE", content:"TXT_BALANCE_FAIL_CONTENT", closeButton:false, avatar:NPC_AVATAR_PEOPEO, okText:"TXT_EXIT_GAME_YES"};
			Game.showPopup(displayInfo, Game.endGameScene, null);	
		}
		else if(errorCode === LOADING_STATE_FORCE_UPDATE)
		{			
			var displayInfo = {title:"TXT_POPUP_TITLE", content:"TXT_FORCE_UPDATE_CONTENT", closeButton:false, avatar:NPC_AVATAR_PEOPEO, okText:"TXT_EXIT_GAME_YES"};
			Game.showPopup(displayInfo, Game.endGameScene, null);	
		}
		else if(this.state === LOADING_STATE_QUICK_LOGIN)
			this.setState(LOADING_STATE_CHOOSE_ACCOUNT);
		else
			this.showError(ZPLogin.getErrorMessage(errorCode));
	},
});