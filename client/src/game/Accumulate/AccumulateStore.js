const ACCUMULATE_MILESTONE_W = 150;
var AccumulateStore =
{
	init:function()
	{
		cc.log ("AccumulateStore", "init");
	},

	initNPC:function()
	{
		cc.log ("AccumulateStore", "initNPC");
		if (this.npc)
			return;
		
		this.npc = new FWObject();
		this.npc.initWithSpine(SPINE_NPC_DRAGON);
		this.npc.setAnimation("animation", true);
		this.npc.setScale(-0.15, 0.15);
		this.npc.setParent(gv.background.base);
		this.npc.setLocalZOrder(9999);
		this.npc.setEventListener(null, AccumulateStore.onNPCTouched);
		this.npc.setNotifyBlockedTouch(true);
		this.npc.setVisible(AccumulateStore.isShowNPC ());
		this.npc.setPosition(-100, 500);

		var delay = 5;//seconds
		var sequence = cc.sequence
		(
			cc.delayTime(delay),
			cc.callFunc(function() {AccumulateStore.npc.setScale(-0.15, 0.15);}),
			cc.moveTo(20, cc.p(cc.winSize.width + 200, 500)),
			cc.delayTime(delay),
			cc.callFunc(function() {AccumulateStore.npc.setScale(0.15, 0.15);}),
			cc.moveTo(20, cc.p(-200, 500))
		);

		this.npc.node.runAction(cc.repeatForever(sequence));
	},

	isShowNPC:function()
	{
		if (Game.isFriendGarden())
			return false;

		return AccumulateStore.isActive ();
	},

	checkAndShowNPC:function()
	{
		if (this.npc && AccumulateStore.isShowNPC ())
			this.npc.setVisible(AccumulateStore.isShowNPC ());
	},
	
    onNPCTouched: function ()
    {
        if (AccumulateStore.isActive ())
		    AccumulateStore.loadAndShow();
    },

	isActive:function()
	{
		if (!g_MISCINFO.ACCUMULATE_ACTIVE)
			return false;

		if (!gv.userData.isEnoughLevel(g_MISCINFO.ACCUMULATE_USER_LEVEL))
			return false;

		var current = Game.getGameTimeInSeconds();
		return g_PAYMENT_ACCUMULATE.UNIX_TIME_START <= current && current <= g_PAYMENT_ACCUMULATE.UNIX_TIME_END;
	},

	loadAndShow:function ()
	{
		if(this.isLoading)
			return;

		this.isLoading = true;
		var pk = network.connector.client.getOutPacket(this.RequestAccumalteGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},

	init_data:function (userAccumulate, store)
	{
		cc.log (JSON.stringify (userAccumulate));
		cc.log (JSON.stringify (store));

		if (userAccumulate)
			this.init_user_data(userAccumulate);

		if (userAccumulate && store)
			this.init_shop_data(userAccumulate, store);
	},

	init_user_data:function (userAccumulate)
	{
		var checkpoints_claimed = {};
		for (var i = 0; i < userAccumulate [USER_ACCUMULATE_CHECKPOINTS].length; i += 2)
			checkpoints_claimed [userAccumulate [USER_ACCUMULATE_CHECKPOINTS] [i]] = userAccumulate [USER_ACCUMULATE_CHECKPOINTS] [i + 1];

		this.coin_gain = userAccumulate[USER_ACCUMULATE_COIN];
		this.token_remain = gv.userStorages.getItemAmount(g_MISCINFO.ACCUMULATE_TOKEN_ID);
		this.token_gain = userAccumulate[USER_ACCUMULATE_TOKEN_GAIN];

		var userLevel = gv.userData.getLevel();
		var checkpoints = [];
		var listPoints = [];
		var maxCheckpoint = 0;
		for (var checkpoint in g_PAYMENT_ACCUMULATE.MILESTONES)
		{
			maxCheckpoint = Math.max (checkpoint, maxCheckpoint);
			var levels = g_PAYMENT_ACCUMULATE.MILESTONES [checkpoint];
			var groupLv = -1;
			for (var lv in levels)
			{
				if (checkpoints_claimed [checkpoint] && checkpoints_claimed [checkpoint] == levels [lv].ID)
				{
					groupLv = lv;
					break;
				}

				if (lv > userLevel)
					break;

				groupLv = lv;
			}

			if (groupLv == -1)
				continue;

			var data = levels [groupLv];
			var obj = {
				id: data.ID,
				items: data.ITEMS,
				groupLv: groupLv,
				milestone: Number (checkpoint),
				canClaim: checkpoints_claimed [checkpoint] ? false : (this.coin_gain >= checkpoint),
				claimed: checkpoints_claimed [checkpoint] ? true : false
			};
			checkpoints.push (obj);

			listPoints.push (obj.milestone);
		}

		listPoints.sort (function (a, b) {
			return a - b;
		});

		var percent = 0;
		if (this.coin_gain >= maxCheckpoint)
			percent = 1;
		else for (var i = 0; i < listPoints.length; i++)
		{
			if (listPoints [i] < this.coin_gain)
				continue;

			var base = (i == 0) ? 0 : listPoints [i - 1];
			var scale = 1.0 * (this.coin_gain - base) / (listPoints [i] - base);
			percent = (i + scale) / listPoints.length;

			break;
		}

		this.progress = percent * 100;

		checkpoints.sort (function (a, b) {
			return a.id - b.id;
		});

		this.checkpoints = checkpoints;
		this.maxCheckpoint = maxCheckpoint;
	},

	init_shop_data:function (userAccumulate, store)
	{
		var storeItems = store [ACCUMULATE_STORE_ITEMS];
		if (!storeItems || storeItems.length == 0)
			return;

		var list = [];
		var userLevel = gv.userData.getLevel();
		for (var i in storeItems)
		{
			var storeData = storeItems [i];
			var id = storeData [ACCUMULATE_STORE_ITEM_ID];
			var package = g_PAYMENT_ACCUMULATE.SHOP[id];

			if (package.LEVELS[0] > userLevel || userLevel > package.LEVELS[1])
				continue;

			list.push (storeData);
		}
		
		this.packsData = list;
		this.history = userAccumulate [USER_ACCUMULATE_HISTORY];
	},
	
	show:function()
	{
		var remainTime = g_PAYMENT_ACCUMULATE.UNIX_TIME_END - Game.getGameTimeInSeconds();



		this.uiDef =
		{
			panel: {onTouchEnded:this.hide.bind(this)},
			btn_close: {onTouchEnded:this.hide.bind(this)},
			btn_info: {onTouchEnded:this.hide.bind(this)},

			lb_title: {type:UITYPE_TEXT, value:"TXT_ACCUMULATE_STORE_TITLE", style:TEXT_STYLE_TITLE_2},
			lb_num: {type:UITYPE_TEXT, value:this.token_remain + "/" + this.token_gain, style:TEXT_STYLE_NUMBER},
			lb_time: {type:UITYPE_TEXT, value:FWUtils.secondsToTimeString(remainTime), style:TEXT_STYLE_TEXT_SMALL},
			npc_hint_label: {type:UITYPE_TEXT, value:g_MISCINFO.ACCUMULATE_COIN_TO_TOKEN + " = 1", style:TEXT_STYLE_TEXT_DIALOG_BLACK},

			milestone_progress: {type:UITYPE_PROGRESS_BAR, value:this.progress, maxValue:100},
			milestone_hint: {visible:false},
			lb_milestone_claim: {type:UITYPE_TEXT, value:FWLocalization.text("TXT_MAILBOX_RECEIVE_ALL"), style:TEXT_STYLE_TEXT_NORMAL},

			icon_coin: {onTouchBegan:this.coin_hint_show.bind(this), onTouchEnded:this.coin_hint_hide.bind(this)},
			coin_hint: {visible:false},
			lb_coin_hint: {type:UITYPE_TEXT, value:this.coin_gain, style:TEXT_STYLE_NUMBER}, // useK:true},

			//tokens: {onTouchBegan:this.token_hint_show.bind(this), onTouchEnded:this.token_hint_hide.bind(this)},
			panelTouchHintPoint:{onTouchBegan:this.token_hint_show.bind(this), onTouchEnded:this.token_hint_hide.bind(this)},
			token_hint: {visible:false},
			token_hint_label: {type:UITYPE_TEXT, value:"TXT_ACCUMULATE_STORE_TOKEN_HINT", style:TEXT_STYLE_HINT_NOTE},
			milestone:{visible:false},
		};

		this.showMileStoneCoin(this.uiDef);

		// show
		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		FWUI.fillData(widget, null, this.uiDef);

		if(!FWUI.isWidgetShowing(widget))
		{
			FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_NONE);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide();}.bind(this);

			Game.gameScene.registerBackKey(this.hideFunc);
			Game.gameScene.registerEnterKey(function() {this.onEnterPressed();}.bind(this));//web
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
			
			this.lb_time = FWUtils.getChildByName(widget, "lb_time");
		}

		var store_widget = FWUtils.getChildByName(widget, "store");
		this.store_show (store_widget);

		if(this.packsData.length >8) store_widget.setScrollBarOpacity(0);
		//var checkpoints_widget = FWUtils.getChildByName(widget, "checkpoints");
		//this.milestone_show (checkpoints_widget);


	},

	store_show:function(parent_widget)
	{
		var row = 0;
		var col = 0;
		var ox = 40;//125 - 170 * 0.5;
		var oy = 225;//330 - 210 * 0.5;

		if(this.packs && this.packs.length>0)
		{
			for(var i=0;i< this.packs.length;i++)
			{
				this.packs[i].hide();
			}
		}
		this.packs = [];
		parent_widget.removeAllChildren();
		for (var id in this.packsData)
		{
			var data = this.packsData [id];
			var total_buy = this.history [data[ACCUMULATE_STORE_ITEM_ID]];

			cc.log ("store_show", data[ACCUMULATE_STORE_ITEM_ID], total_buy);
			
			//w: 170, h: 210
			var item = new AccumulateStoreItem (data, total_buy, function(_item) { AccumulateStore.onTouchStoreItem (_item); });
			item.widget.x = ox + col * 180;//(305 - 125);
			item.widget.y = oy - row * 215;//(330 - 115);

			col += 1;
			if (col >= this.packsData.length * 0.5)
			{
				col = 0;
				row += 1;
			}

			this.packs.push (item);
			parent_widget.addChild (item.widget);
		}

		var width = Math.floor(this.packsData.length * 0.5) * 180 + 2 * ox;
		parent_widget.setInnerContainerSize(cc.size(width, 450));
	},
	showMileStoneCoin:function(uiDef){
		var limitMilestones = 3;
		//var eventPoints = gv.userStorages.getItemAmount(this.currentEvent.POINT);

		//var obj = {
		//	id: data.ID,
		//	items: data.ITEMS,
		//	groupLv: groupLv,
		//	milestone: Number (checkpoint),
		//	canClaim: checkpoints_claimed [checkpoint] ? false : (this.coin_gain >= checkpoint),
		//	claimed: checkpoints_claimed [checkpoint] ? true : false
		//};
		var mileStoneDef = {
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.6, visible:"data.canReceiveRewards"},
			barBg:{visible:"!data.isLastMilestone",width:ACCUMULATE_MILESTONE_W},
			bar:{visible:"data.showBars", width:"data.barW"},
			checked:{visible:"data.claimed&& !data.isCoin"},
			imgIconEgg:{type:UITYPE_IMAGE,id:"hud/hud_gems_dragon.png" ,visible:"!data.isCoin",opacity: "data.claimed? 150:255",scale:"data.scaleIcon",onTouchEnded:this.milestone_onTouch.bind(this)},
			pointText:{type:UITYPE_TEXT, field:"milestone", style:TEXT_STYLE_TEXT_NORMAL, visible:"data.milestone > 0"},
			coinText:{type:UITYPE_TEXT, field:"coin", style:TEXT_STYLE_TEXT_NORMAL, visible:"data.isCoin"},
			icon:{visible:"!data.isCoin"},
			imgBgCoin:{visible:"data.isCoin"}
		};
		var arrMileStone = [];
		var itemCoin = {};
		itemCoin.isCoin = true;
		itemCoin.coin = this.coin_gain;
		//itemCoin.barW = ACCUMULATE_MILESTONE_W;
		itemCoin.showBars = true;
		itemCoin.milestone = 0;
		itemCoin.barW = Math.min((this.coin_gain - itemCoin.milestone) *  ACCUMULATE_MILESTONE_W / (this.checkpoints[0].milestone - itemCoin.milestone) + 10,ACCUMULATE_MILESTONE_W);
		arrMileStone.push(itemCoin);

		for (var i = 0; i < this.checkpoints.length; i++){
			var item = {};
			item.pointerPosX = 0;
			item.barW = 0;
			item.isCoin = false;
			item.claimed = this.checkpoints[i].claimed;
			item.canReceiveRewards = this.checkpoints[i].canClaim;
			item.milestone = this.checkpoints[i].milestone;
			item.isLastMilestone = (limitMilestones <= 0);
			item.index = i;
			item.items = this.checkpoints[i].items;
			item.scaleIcon = item.canReceiveRewards? 0.85:0.75;
			item.id = this.checkpoints[i].id;
			//item.canReceiveRewards = (this.coin_gain >= item.points && !item.isRewardsReceived);
			if(i === this.checkpoints.length - 1)
			{
				item.showBars = false;
				item.isLastMilestone = true;
				item.barW = 0;
			}
			else
			{
				if(this.coin_gain < item.milestone)
				{
					item.showBars = false;
				}
				else if(this.coin_gain < this.checkpoints[i + 1].milestone)
				{
					item.showBars = true;
					item.barW = (this.coin_gain - item.milestone) *  ACCUMULATE_MILESTONE_W / (this.checkpoints[i + 1].milestone - item.milestone) + 10;
					item.pointerPosX += item.barW - 10;
					this.pointerPos += item.pointerPosX;
				}
				else
				{
					item.showBars = true;
					item.barW = ACCUMULATE_MILESTONE_W;
					this.pointerPos += ACCUMULATE_MILESTONE_W;
				}
			}

			arrMileStone.push(item);
		}
		uiDef.itemListMileStone={type:UITYPE_2D_LIST, items:arrMileStone, itemUI:UI_ACCUMULATE_MILESTONE, itemDef:mileStoneDef, itemSize:cc.size(ACCUMULATE_MILESTONE_W, 170), singleLine:true};
	},
	milestone_show:function(parent_widget)
	{
		var zorder = 11;
		var ox = 26 - 543 * 0.5;
		
		parent_widget.removeAllChildren();
		this.checkpoints_widget = [];

		for (var i = 0; i < this.checkpoints.length; i++)
		{
			var data = this.checkpoints [i];
			var pos = cc.p (ox + 543 * ((i + 1) * 1.0 / this.checkpoints.length), 0);

			var spine = new FWObject();
			spine.initWithSprite("#hud/hud_gems_dragon.png");
			//spine.setAnimation(data.canClaim ? "gift_box_normal_active" : "gift_box_normal_idle", true);
			spine.setPosition(pos);
			spine.setScale(0.8, 0.8);
			spine.setParent(parent_widget, zorder + data.id);
			spine.setOpacity(data.claimed ? 128 : 255);
			spine.checkpoint_data = data;
			spine.setEventListener(null,this.milestone_onTouch.bind(this));

			if(data.claimed)
			{
				var checked = new FWObject();
				checked.initWithSprite("#hud/icon_checked.png");
				//spine.setAnimation(data.canClaim ? "gift_box_normal_active" : "gift_box_normal_idle", true);
				checked.setPosition(pos);
				checked.setScale(0.6, 0.6);
				checked.setParent(parent_widget, zorder + data.id +1);
			}
			this.checkpoints_widget.push (spine);
		}
	},
	
	hide:function()
	{
		FWUI.hide(UI_ACCUMULATE_STORE, UIFX_NONE);
        
		this.currentDonate = null;

		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		Game.gameScene.unregisterEnterKey();
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
	},

	leave:function ()
	{
	},

	reload:function ()
	{
	},

	update:function ()
	{
		var current = Game.getGameTimeInSeconds();
		var remainTime = g_PAYMENT_ACCUMULATE.UNIX_TIME_END - current;
		this.lb_time.setString(FWUtils.secondsToTimeString(remainTime));

		var needUpdate = false;
		for (var id in this.packs)
		{
			var status = this.packs [id].update (current);
			if (status == 2)
				needUpdate = true;
		}

		if (needUpdate)
			AccumulateStore.reload ();
	},

	coin_hint_show:function ()
	{
		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		var coin_hint = FWUtils.getChildByName(widget, "coin_hint");
		coin_hint.setVisible (true);
	},

	coin_hint_hide:function ()
	{
		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		var coin_hint = FWUtils.getChildByName(widget, "coin_hint");
		coin_hint.setVisible (false);
	},

	token_hint_show:function ()
	{
		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		var token_hint = FWUtils.getChildByName(widget, "token_hint");
		token_hint.setVisible (true);
	},

	token_hint_hide:function ()
	{
		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		var token_hint = FWUtils.getChildByName(widget, "token_hint");
		token_hint.setVisible (false);
	},

	milestone_onTouch:function(sender)
	{
		//cc.log("milestone_onTouch",JSON.stringify(sender));
		if (this.milestone_isShow == sender.uiData.milestone)
			this.milestone_hint_hide();
		else
			this.milestone_hint_show(sender);
	},

	// this is spine of giftbox
	milestone_hint_show:function (sender)
	{
		cc.log ("onTouchCheckpoint", JSON.stringify(sender.uiData));
		
		var data = sender.uiData;
		this.milestone_isShow = data.milestone;

		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		var milestone_hint = FWUtils.getChildByName(widget, "milestone_hint");
		var rewards = [];
		for(var key in data.items)
		{
			var itemBonus = {};
			itemBonus.itemId = key;
			itemBonus.amount = data.items[key];
			rewards.push(itemBonus);
		}

		var itemDef = {
            gfx: {type: UITYPE_ITEM, field: "itemId", scale: 0.8},
            amount: {type: UITYPE_TEXT, field: "amount", style: TEXT_STYLE_NUMBER, visible: true, useK: true, scale: 0.8},
		};

		var title = cc.formatStr(FWLocalization.text("TXT_ACCUMULATE_PURCHASE"), data.milestone);

		var uiDef =
		{
			milestone_hint: {visible:true, onTouchEnded:function(){ AccumulateStore.milestone_hint_hide() }},
			lb_milestone_hint_desc: {type:UITYPE_TEXT, value:title, style:TEXT_STYLE_NUMBER},
			milestone_hint_rewards: {type: UITYPE_2D_LIST, items: rewards, itemUI: UI_ITEM_NO_BG2, itemDef: itemDef, itemSize: cc.size(80, 75), itemsAlign: "center", singleLine: true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},

			btn_milestone_claim: {enabled:data.canReceiveRewards, onTouchEnded: this.milestone_claim.bind(this) }
		};

		FWUI.fillData(milestone_hint, data, uiDef);
		
		var panel_hint = FWUtils.getChildByName(widget, "panel_hint");
		var point = FWUtils.getWorldPosition(sender.getParent());
		panel_hint.setPosition (point.x + sender.getPosition().x, panel_hint.getPosition().y);
	},

	// this is spine of giftbox
	milestone_hint_hide:function ()
	{
		this.milestone_isShow = null;
		var widget = FWPool.getNode(UI_ACCUMULATE_STORE, false);
		var milestone_hint = FWUtils.getChildByName(widget, "milestone_hint");
		milestone_hint.setVisible (false);
	},

	// this is spine of giftbox
	milestone_claim:function (sender)
	{
		AccumulateStore.milestone_hint_hide ();
		var data = sender.uiData;
		if(!data) return;
		var pk = network.connector.client.getOutPacket(AccumulateStore.RequestAccumalteMilestoneReward);
		pk.pack(data.milestone);
		network.connector.client.sendPacket(pk);

		AccumulateStore.point = FWUtils.getWorldPosition(sender.getParent());
		//AccumulateStore.point.x += milestone_widget.getPosition().x;
		//AccumulateStore.point.y += milestone_widget.getPosition().y;
	},

	onTouchStoreItem:function (item)
	{
		cc.log ("onTouchStoreItem", JSON.stringify(item.data));

		var point = FWUtils.getWorldPosition(item.widget);
		point.x += 170 * 0.5;
		point.y += 210 * 0.5;

		var text = null;
		switch (item.data.status)
		{
			case ACCUMULATE_STORE_ITEM_SOLD_OUT:	text = FWLocalization.text("TXT_ACCUMULATE_STORE_ITEM_SOLD_OUT");	break;
			case ACCUMULATE_STORE_ITEM_WAITING:		text = FWLocalization.text("TXT_ACCUMULATE_STORE_ITEM_WAITING");	break;
			case ACCUMULATE_STORE_ITEM_RECEIVED:	text = FWLocalization.text("TXT_ACCUMULATE_STORE_ITEM_RECEIVED");	break;
			case ACCUMULATE_STORE_ITEM_LIMITED:		break;
			case ACCUMULATE_STORE_ITEM_UNLIMITED:	break;
		}

		// var enoughToken = AccumulateStore.token_remain >= item.data.price;
		// if (text == null && !enoughToken)
		// 	text = FWLocalization.text("TXT_ACCUMULATE_STORE_TOKEN_NOT_ENOUGH");

		if (text)
		{
			FWUtils.showWarningText(text, point, cc.WHITE);
			return;
		}
		
		AccumulateStore.exchange_show (item.data);
		AccumulateStore.point = point;
	},

	exchange_show:function(data)
	{
		var enoughToken = AccumulateStore.token_remain >= data.price;
		var onAction = null;
		var lb_action = "";

		if (enoughToken)
		{
			onAction = function () { AccumulateStore.exchange_onAction (data); };
			lb_action = "TXT_ACCUMULATE_CONFIRM_OK";
		}
		else
		{
			onAction = function () { AccumulateStore.exchange_onPurchase (data); };
			lb_action = "TXT_ACCUMULATE_CONFIRM_NOT_ENOUGH";
		}

		var rewards = [];
		for(var key in data.items)
		{
			var item = {};
			item.itemId = key;
			item.amount = data.items[key];
			rewards.push(item);
		}

		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
		};

		var uiDef =
		{
			lb_title:{type:UITYPE_TEXT, value:data.name, style:TEXT_STYLE_TITLE_1},
			lb_content:{type:UITYPE_TEXT, value:enoughToken? "TXT_ACCUMULATE_CONFIRM_DESC" :"TXT_ACCUMULATE_CONFIRM_DESC_NOT_ENOUGH", style:TEXT_STYLE_TEXT_BIG_GREEN},
			
			gfx:{type:UITYPE_ITEM, value:data.icon, scale: 1.2},
			lb_amount:{visible:false, type:UITYPE_TEXT, value:data.num, style:TEXT_STYLE_NUMBER},

			lb_price:{type:UITYPE_TEXT, value:data.price, style:TEXT_STYLE_NUMBER_SALE},
			
			btn_action:{onTouchEnded:onAction},
			lb_action:{type:UITYPE_TEXT, value:FWLocalization.text(lb_action), style:TEXT_STYLE_TEXT_BUTTON},
			itemList:{type:UITYPE_2D_LIST, items:rewards, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(120, 120), itemsAlign:"center", singleLine:true},
			btn_close:{onTouchEnded:this.exchange_hide.bind(this)},
		};
		
		var widget = FWUI.showWithData(UI_ACCUMULATE_STORE_CONFIRM, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON + 1);
		
		if(!this.hideExchangeFunc)
			this.hideExchangeFunc = function() {this.exchange_hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideExchangeFunc);
	},
	
	exchange_hide:function()
	{
		FWUI.hide(UI_ACCUMULATE_STORE_CONFIRM, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideExchangeFunc);
	},
	edit_InfoUser_show:function(itemInfo,userData,canEdit)
	{
		this.currentItemPOSMInfo = itemInfo;
		if(canEdit === undefined) canEdit = false;
		var dataUser = userData;
		if(!dataUser)
		{
			dataUser = {};
			dataUser.name ="";
			dataUser.phoneNumber = "";
			dataUser.address = "";
		}
		if(!dataUser.name || !dataUser.phoneNumber ||!dataUser.address) canEdit = true;

		var endTime = "";
		var title = "";
		if (this.currentItemPOSMInfo.USE_IN === "E1ID")
		{
			endTime = g_EVENT_01.UNIX_END_TIME;
			title = "TXT_EVENT_NAME";
		}
		else if (this.currentItemPOSMInfo.USE_IN ===  "E2ID"){
			endTime = g_EVENT_02.E02_UNIX_END_TIME;
			title = "TXT_EVENT2_NAME";
		}
		else if (this.currentItemPOSMInfo.USE_IN ===  "E3ID") {
			endTime = g_EVENT_03.E03_UNIX_END_TIME;
			title = "TXT_EVENT3_NAME";
		}
		else if (this.currentItemPOSMInfo.USE_IN ===  "ACID"){
			endTime = g_PAYMENT_ACCUMULATE.UNIX_TIME_END;
			title = "TXT_EVENT_ACCUMULATE_NAME";
		}


		if(Game.getGameTimeInSeconds()> endTime+g_MISCINFO.POSM_TIME_EXPIRED_ITEM) canEdit = false;
		//cc.log("Item:", JSON.stringify(itemInfo));
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:FWLocalization.text(title), style:TEXT_STYLE_TITLE_1},
			title_Item:{type:UITYPE_TEXT, value:"TXT_" + itemInfo.ID, style:TEXT_STYLE_TEXT_BIG_GREEN},
			userIdLabel:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:"ID: "+gv.mainUserData.userId +""},
			userNameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TITLE_2, value:dataUser.name, placeHolder: dataUser.name?undefined:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.WHITE,enabled:dataUser.name&&!canEdit?false:true},
			userPhoneNumberInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TITLE_2, value:dataUser.phoneNumber, placeHolder:dataUser.phoneNumber?undefined:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.WHITE,enabled:dataUser.phoneNumber&&!canEdit?false:true},
			userAddressInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TITLE_2, value:dataUser.address, placeHolder:dataUser.address?undefined:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.WHITE,enabled:dataUser.address&&!canEdit?false:true},
			userNameText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_NAME")+":"},
			userPhoneNumberText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_PHONENUMBER")+":"},
			userAddressText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_ADDRESS")+":"},
			lblTimeNote:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL_GREEN, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_TIMENOTE")+":"},
			lblNoteTitle:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL_GREEN, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_NOTE")},
			lblNoteTitle_Detail:{type:UITYPE_TEXT, style:TEXT_STYLE_NEWS, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_NOTE_DETAIL")},
			acceptText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_CONFIRM")},
			editText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_EDIT")},
			timerCountdown:{type:UITYPE_TIME_BAR, startTime:Game.getGameTimeInSeconds(), endTime:endTime+g_MISCINFO.POSM_TIME_EXPIRED_ITEM, countdown:true,isVisibleTimeBarBar: false,scaleTime : 0.9,onFinished: this.checkEndExpiredItem.bind(this)},
			acceptProfile:{onTouchEnded:this.edit_InfoUser_update.bind(this),position:!canEdit?cc.p(176,-275):cc.p(0,-275),visible:canEdit},
			editProfile:{visible:!canEdit,onTouchEnded:function() {AccumulateStore.edit_InfoUser_show(itemInfo,dataUser,true)},position:cc.p(0,-275)},
			btnBack:{onTouchEnded:this.edit_InfoUser_hide.bind(this)},
			userNameBg:{visible:canEdit},
			userPhoneNumberBg:{visible:canEdit},
			userAddressBg:{visible:canEdit},
		};

		var widget = FWPool.getNode(UI_ACCUMULATE_INFO_USER, false);
		// show
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON + 2);
			FWUtils.showDarkBg(null, Z_UI_COMMON+1, "darkBgAccumelateInfo");

			if(!this.hideInfoFunc)
				this.hideInfoFunc = function() {this.edit_InfoUser_hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideInfoFunc);
		}

	},
	edit_InfoUser_update:function(){

		var uiLogin = FWPool.getNode(UI_ACCUMULATE_INFO_USER, false);
		var userNameInput = FWUtils.getChildByName(uiLogin, "userNameInput");
		var userPhoneNumberInput = FWUtils.getChildByName(uiLogin, "userPhoneNumberInput");
		var userAddressInput = FWUtils.getChildByName(uiLogin, "userAddressInput");
		var userName = userNameInput.getString().toLowerCase();
		var userphoneNumber = userPhoneNumberInput.getString();
		var userAddress = userAddressInput.getString();
		if(!userName || !userphoneNumber || !userAddress)
		{
			this.showError("TXT_ACCUMULATE_ERROR_BLANK");
			return;
		}
		//if(registerPass !== registerPassConfirm)
		//{
		//	this.showError("TXT_LOADING_ERROR_PASS_NOT_MATCH");
		//	return;
		//}
		if (!AccumulateStore.isValidUserName(userName))
		{
			this.showError("TXT_ACCUMULATE_ERROR_INVALID_USERNAME");
			return;
		}
		if (!AccumulateStore.isValidPhoneNumber(userphoneNumber))
		{
			this.showError("TXT_ACCUMULATE_ERROR_INVALID_PHONE_NUMBER");
			return;
		}

		var dataUser = {};
		dataUser.name = userName;
		dataUser.phoneNumber =  userphoneNumber;
		dataUser.address = userAddress;
		this.showError(null,dataUser);


		//this.showError(null);
	},
	isValidUserName :function(userName){

		userName = FWUtils.clearAccent(userName);
		cc.log("isValidUserName",userName);
		var regex = /^[a-zA-Z ]+$/;
		return !userName || userName.match(regex);
	},
	isValidPhoneNumber:function(phoneNumber){
		cc.log("isValidPhoneNumber",phoneNumber);
		var regex = /^[0-9]*$/;
		return !phoneNumber || phoneNumber.match(regex);
	},
	edit_InfoUser_hide:function()
	{
		FWUtils.hideDarkBg(null, "darkBgAccumelateInfo");
		FWUI.hide(UI_ACCUMULATE_INFO_USER, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideInfoFunc);
	},
	showError:function(message,data)
	{
		//cc.log("aaaaaaa","showError",message);
		if(message)
		{
			var displayInfo = {title:FWLocalization.text("TXT_POPUP_TITLE"),content:FWLocalization.text(message), closeButton:true, okText:"TXT_OK"};
			Game.showPopup(displayInfo, function () {cc.log("Error");});
		}
		else
		{
			this.edit_InfoUser_hide();
			var requestFunc = function(){cc.log("showError","NotData")};
			if(data)
			{
				requestFunc = function(){
					AccumulateStore.hideConfirm();
					var pk = network.connector.client.getOutPacket(AccumulateStore.RequestPOSMSetUserInfo);
					pk.pack(data.name, data.phoneNumber, data.address, AccumulateStore.currentItemPOSMInfo.ID);
					network.connector.client.sendPacket(pk);
				}
			}

			var content = "";
			//content+= FWLocalization.text("TXT_ACCUMULATE_CONFIRM_SUCCESS") +" :\n";
			content+= FWLocalization.text("TXT_ACCUMULATE_USERINFO_NAME")+": " + data.name +"\n";
			content+= FWLocalization.text("TXT_ACCUMULATE_USERINFO_PHONENUMBER")+": " + data.phoneNumber +" \n";
			content+= FWLocalization.text("TXT_ACCUMULATE_USERINFO_ADDRESS")+": " + data.address +" \n";
			//var displayInfo = {title:FWLocalization.text("TXT_POPUP_TITLE"),content:FWLocalization.text("TXT_ACCUMULATE_CONFIRM_SUCCESS"), closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_FARMER};
			var uiDef = {
				title:{type:UITYPE_TEXT, value:FWLocalization.text("TXT_POPUP_TITLE"), style:TEXT_STYLE_TITLE_1, visible:true},
				content:{type:UITYPE_TEXT, value:content, style:TEXT_STYLE_TEXT_NORMAL_GREEN, visible:true},
				noText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_CONFIRM")},
				yesText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:FWLocalization.text("TXT_ACCUMULATE_USERINFO_EDIT")},
				noButton:{onTouchEnded:requestFunc},
				yesButton:{onTouchEnded:function(){this.hideConfirm(); this.edit_InfoUser_show(AccumulateStore.currentItemPOSMInfo,data,true);}.bind(this)},
			};

			var widget = FWPool.getNode(UI_ACCUMULATE_INFO_USER_CONFIRM, false);

			// show
			if(FWUI.isWidgetShowing(widget))
				FWUI.fillData(widget, null, uiDef);
			else
			{
				FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
				widget.setLocalZOrder(Z_UI_COMMON + 4);
				FWUtils.showDarkBg(null, Z_UI_COMMON+3, "darkBgAccumelateInfoConfirm");

				if(!this.hideInfoConfirmFunc)
					this.hideInfoConfirmFunc = function() {this.hideConfirm()}.bind(this);
				Game.gameScene.registerBackKey(this.hideInfoConfirmFunc);
			}



			//Game.showPopup(displayInfo, requestFunc);
		}
	},
	hideConfirm:function(){
		FWUtils.hideDarkBg(null, "darkBgAccumelateInfoConfirm");
		FWUI.hide(UI_ACCUMULATE_INFO_USER_CONFIRM, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideInfoConfirmFunc);
	},
	checkEndExpiredItem:function(){
		var widget = FWPool.getNode(UI_ACCUMULATE_INFO_USER, false);
		var editProfile = FWUtils.getChildByName(widget, "editProfile");
		editProfile.setVisible (false);
	},
	showSuccess:function(data)
	{
		var displayInfo = {title:FWLocalization.text("TXT_POPUP_TITLE"),content:FWLocalization.text("TXT_ACCUMULATE_SUCCESS"), closeButton:true, okText:"TXT_OK"};
		var successFunc = function(){
			cc.log("showSuccess","true");
			//AccumulateStore.edit_InfoUser_show(AccumulateStore.currentItemPOSMInfo,data,false);
			AccumulateStore.edit_InfoUser_hide();
		};
		Game.showPopup(displayInfo, successFunc,successFunc);
	},
	exchange_onAction:function(data)
	{
		cc.log ("AccumulateStore", "exchange_onAction", JSON.stringify (data));
		AccumulateStore.exchange_hide ();
		var pk = network.connector.client.getOutPacket(AccumulateStore.RequestAccumalteStore);
		pk.pack(data.id);
		network.connector.client.sendPacket(pk);
	},
	
	exchange_onPurchase:function(data)
	{
		cc.log ("AccumulateStore", "exchange_onPurchase", JSON.stringify (data));
		AccumulateStore.exchange_hide ();
		AccumulateStore.hide ();

		Payment.showTab(PAYMENT_TAB_COIN, function ()
		{
			AccumulateStore.loadAndShow ();
		});
	},
	request_InfoUser_show:function(itemInfo)
	{
		this.currentItemPOSMInfo = itemInfo;
		var pk = network.connector.client.getOutPacket(AccumulateStore.RequestPOSMGetUserInfo);
		pk.pack(AccumulateStore.currentItemPOSMInfo.ID);
		network.connector.client.sendPacket(pk);
	},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	RequestAccumalteGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ACCUMULATE_GET);},
		pack:function(ids)
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			
			// PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			// PacketHelper.putClientCoin(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseAccumalteGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			var userAccumulate = object[KEY_DATA];
			var store = object[KEY_ITEMS];
			var updateItems = object[KEY_UPDATE_ITEMS];

			AccumulateStore.isLoading = false;

			if(this.getError() !== 0)
			{
			}
			else
			{
				// Game.showPopup({title:"", content:"TXT_"}, true);
			}

			if (updateItems)
				gv.userStorages.updateItems(updateItems);

			if (userAccumulate || store)
			{
				AccumulateStore.init_data (userAccumulate, store);
				AccumulateStore.show ();
			}
		}
	}),

	RequestAccumalteMilestoneReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ACCUMULATE_MILESTONE_REWARD);},
		pack:function(checkpointID)
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, checkpointID);
			
			addPacketFooter(this);
		},
	}),

	ResponseAccumalteMilestoneReward:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			var userAccumulate = object[KEY_DATA];
			var checkpoint = object[KEY_SLOT_ID];
			var rewardID = object[KEY_ITEM_ID];
			
			if(this.getError() == 0)
			{
				var groupLv = g_PAYMENT_ACCUMULATE.MILESTONES [checkpoint];
				var rewards = {};

				if (groupLv) for (var lv in groupLv)
				{
					if (groupLv[lv].ID == rewardID)
					{
						rewards = groupLv[lv].ITEMS;
						break;
					}
				}

				var delay = 0;
				for (var itemId in rewards)
				{
					var itemNum = rewards [itemId];
					FWUtils.showFlyingItemIcon(itemId, itemNum, AccumulateStore.point, Game.gameScene.uiMainBtnMail, delay, false);
					delay += 0.15;
				}
			}
			
			if (userAccumulate)
				AccumulateStore.init_data (userAccumulate);
			
			AccumulateStore.show ();
		}
	}),

	RequestAccumalteStore:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ACCUMULATE_STORE);},
		pack:function(itemID)
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_ITEM_ID, itemID);
			
			addPacketFooter(this);
		},
	}),

	ResponseAccumalteStore:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			var userAccumulate = object[KEY_DATA];
			var store = object[KEY_ITEMS];
			var updateItems = object[KEY_UPDATE_ITEMS];
			var packID = object[KEY_ITEM_ID];
			
			if(this.getError() == 0)
			{
				var rewards = {};
				var package = g_PAYMENT_ACCUMULATE.SHOP [packID];
				
				rewards [package.ITEM] = package.NUM;
				for (var key in package.BONUS)
					rewards [key] = package.BONUS [key];
				
				var delay = 0;

				for (var itemId in rewards)
				{
					var itemNum = rewards [itemId];
					FWUtils.showFlyingItemIcon(itemId, itemNum, AccumulateStore.point, Game.gameScene.uiMainBtnMail, delay, false);
					delay += 0.15;
				}
			}
			
			if (updateItems)
				gv.userStorages.updateItems(updateItems);
			
			if (userAccumulate && store)
				AccumulateStore.init_data (userAccumulate, store);
			
			AccumulateStore.show ();
		}
	}),

	RequestPOSMSetUserInfo:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.POSM_SET_USER_INFO);},
		pack:function(name, phoneNumber, address, itemId)
		{
			FWUtils.disableAllTouches();

			addPacketHeader(this);

			PacketHelper.putString(this, POSM_USER_INFO_NAME, name);
			PacketHelper.putString(this, POSM_USER_INFO_PHONE_NUMBER, phoneNumber);
			PacketHelper.putString(this, POSM_USER_INFO_ADDRESS, address);
			PacketHelper.putString(this, POSM_USER_INFO_ITEM, itemId);

			// PacketHelper.putClientCoin(this);

			addPacketFooter(this);
		},
	}),

	ResponsePOSMSetUserInfo:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("POSM SET RESPONSE:" , JSON.stringify(object));
			FWUtils.disableAllTouches(false);
			if(this.getError() !== 0)
			{
				AccumulateStore.showError("Error :"+this.getError());
			}
			else
			{
				//AccumulateStore.showError("HOAN THANH : NAWTY");
				if(object[KEY_POSM_USER_DATA])
				{
					var data = {};
					data.name = object[KEY_POSM_USER_DATA][POSM_USER_INFO_NAME];
					data.phoneNumber = object[KEY_POSM_USER_DATA][POSM_USER_INFO_PHONE_NUMBER];
					data.address = object[KEY_POSM_USER_DATA][POSM_USER_INFO_ADDRESS];
					AccumulateStore.showSuccess(data);
				}

			}
		}
	}),

	RequestPOSMGetUserInfo:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.POSM_GET_USER_INFO);},
		pack:function(itemId)
		{
			FWUtils.disableAllTouches();

			addPacketHeader(this);

			PacketHelper.putString(this, POSM_USER_INFO_ITEM, itemId);

			// PacketHelper.putClientCoin(this);

			addPacketFooter(this);
		},
	}),

	ResponsePOSMGetUserInfo:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("POSM GET RESPONSE:" , JSON.stringify(object));
			FWUtils.disableAllTouches(false);
			if(this.getError() !== 0)
			{
				//AccumulateStore.showError("Error :"+this.getError());
				AccumulateStore.edit_InfoUser_show(AccumulateStore.currentItemPOSMInfo,null,false);
			}
			else
			{
				//AccumulateStore.showError("HOAN THANH : NAWTY");
				if(object[KEY_POSM_USER_DATA])
				{
					var data = {};
					data.name = object[KEY_POSM_USER_DATA][POSM_USER_INFO_NAME];
					data.phoneNumber = object[KEY_POSM_USER_DATA][POSM_USER_INFO_PHONE_NUMBER];
					data.address = object[KEY_POSM_USER_DATA][POSM_USER_INFO_ADDRESS];
					AccumulateStore.edit_InfoUser_show(AccumulateStore.currentItemPOSMInfo,data,false);
					//AccumulateStore.showSuccessGetData(data);
				}

			}
		}
	}),

};



network.packetMap[gv.CMD.ACCUMULATE_GET] = AccumulateStore.ResponseAccumalteGet;
network.packetMap[gv.CMD.ACCUMULATE_MILESTONE_REWARD] = AccumulateStore.ResponseAccumalteMilestoneReward;
network.packetMap[gv.CMD.ACCUMULATE_STORE] = AccumulateStore.ResponseAccumalteStore;
network.packetMap[gv.CMD.POSM_SET_USER_INFO] = AccumulateStore.ResponsePOSMSetUserInfo;
network.packetMap[gv.CMD.POSM_GET_USER_INFO] = AccumulateStore.ResponsePOSMGetUserInfo;