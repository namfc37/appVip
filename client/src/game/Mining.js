
const MINING_STATE_FREE = 0;
const MINING_STATE_WORKING = 1;
const MINING_STATE_BOMB = 2;
const MINING_STATE_FINISHED = 3;
const MINING_COLS_COUNT = 6;
const MINING_ROWS_COUNT = 3;
const MINING_TILE_SIZE = 115;
const MINING_DIG_ORDER = [0, 2, 3, 4, 5, 7, 6, 8, 9, 10, 11, 13, 12, 14, 15, 16, 17];
const MINING_FAKE_DATA = false;

var Mining =
{
	state:MINING_STATE_FREE,
	miner:null,
	requireItems: null,
	rewardItems: null,
	tileList: null,
	tileWidgetList: null,
	startTime: 0,
	skipTimeData: null,
	skipTimeLabel: null,
	showAfterLoading: false,
	workAfterLoading: false,
	
	init:function()
	{
	},
	
	uninit:function()
	{
		if(this.miner)
		{
			this.miner.uninit();
			this.miner = null;
		}
	},
	
	loadAndShow:function()
	{
		if(gv.userData.getLevel() < g_MISCINFO.MINE_USER_LEVEL)
		{
			// show warning text if user has lower level
			var text = cc.formatStr(FWLocalization.text("TXT_MINER_REQUIRE_LEVEL"), g_MISCINFO.MINE_USER_LEVEL);
			FWUtils.showWarningText(text, cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
			return;
		}
		
		if(MINING_FAKE_DATA)
		{
			var object = {};
			object[KEY_STATUS] = MINE_STATUS_REST;
			object[KEY_FINISH_TIME] = -1;
			object[KEY_REQUIRE_ITEMS] = {T0:16, B0:11, P0:6};
			object[KEY_REWARD_ITEMS] = {GOLD:1000, EXP:500, REPU:250, T1:10, T2:20};
			this.onLoaded(object);
			return;
		}
		
		this.showAfterLoading = true;
		FWUtils.disableAllTouches();
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.load, 0.25, 0, 0, false);
		
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "mine");
	},
	
	load:function()
	{
		if (!Game.isFriendGarden())
		{
			var pk = network.connector.client.getOutPacket(this.RequestMineGetInfo);
			pk.pack();
			network.connector.client.sendPacket(pk);
		}
	},
	
	onLoaded:function(object)
	{
		if(!object)
			return;
		
		// server data
		gv.userData[GAME_MINE] = {};
		gv.userData[GAME_MINE][MINE_STATUS] = object[KEY_STATUS];
		gv.userData[GAME_MINE][MINE_FINISH] = object[KEY_FINISH_TIME];
		gv.userData[GAME_MINE][MINE_REQUIRE_ITEMS] = object[KEY_REQUIRE_ITEMS];
		gv.userData[GAME_MINE][MINE_REWARD_ITEMS] = object[KEY_REWARD_ITEMS];
		this.requireItems = FWUtils.getItemsArray(gv.userData[GAME_MINE][MINE_REQUIRE_ITEMS]);
		
		// convert 2 client data
		this.state = MINING_STATE_FREE;
		if(object[KEY_STATUS] === MINE_STATUS_REST)
			this.startTime = 0;
		else
			this.startTime = object[KEY_FINISH_TIME] - g_MISCINFO.MINE_DURATION_SECONDS;
		
		// jira#5082
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.refreshNotification);
		if(gv.userData[GAME_MINE][MINE_FINISH] > Game.getGameTimeInSeconds())
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.refreshNotification, gv.userData[GAME_MINE][MINE_FINISH] - Game.getGameTimeInSeconds() + 1, 0, 0, false);
		this.refreshNotification();
		if(!this.showAfterLoading)
			return;
		
		// show
		this.show();
		this.showAfterLoading = false;
		
		if(this.workAfterLoading)
		{
			this.workAfterLoading = false;
			this.setState(MINING_STATE_WORKING);
			this.miner.moveToTile(this.tileList[0]);
		}
		else
		{
			// state
			if(this.startTime <= 0)
				this.setState(MINING_STATE_FREE);
			else if(this.startTime + g_MISCINFO.MINE_DURATION_SECONDS > Game.getGameTimeInSeconds())
			{
				this.setState(MINING_STATE_WORKING);
				this.updateRemainTiles(false);
			}
			else
				this.setState(MINING_STATE_FINISHED);
		}
	},
	
	show:function()
	{
		// data
		this.initDisplayItems();
		
		// def
		var itemDef = 
		{
			tile:{type:UITYPE_IMAGE, field:"tile", scale:1, visible:"data.hasTile === true && Mining.state !== MINING_STATE_FINISHED", onTouchEnded:this.moveToTile.bind(this)},
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.5, visible:"data.hasItem === true && Mining.state >= MINING_STATE_WORKING"},
			gfx:{type:UITYPE_ITEM, field:"itemId", visible:"data.hasItem === true && Mining.state >= MINING_STATE_WORKING"},
			amount:{visible:false},// {type:UITYPE_TEXT, field:"amount", format:"x%s", visible:"data.hasItem === true && Mining.state >= MINING_STATE_WORKING", style:TEXT_STYLE_NUMBER},
			miningItem:{onTouchEnded:this.onTileTouched.bind(this)},
		};
		
		var requireItemDef = 
		{
			check:{visible:"data.isEnough === true"},
			requireAmount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, color:"cc.GREEN", visible:true},
			stockAmount:{type:UITYPE_TEXT, field:"currentAmount", style:TEXT_STYLE_NUMBER, color:"data.isEnough ? cc.GREEN : cc.RED", visible:true},
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			buyButton:{visible:"data.isEnough === false", onTouchEnded:this.buyMissingItem.bind(this)},
			bg:{onTouchBegan:this.showItemHint.bind(this),onDrop: this.buyMissingItem.bind(this),forceTouchEnd: true,onTouchEnded: this.buyMissingItem.bind(this)},
			amount:{visible:false}
		};
		
		var uiDef =
		{
			btnBack:{onTouchEnded:this.hide.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:this.tileList, itemUI:UI_MINING_ITEM, itemDef:itemDef, itemSize:cc.size(MINING_TILE_SIZE, MINING_TILE_SIZE)},
			requirePanel:{visible:this.state === MINING_STATE_FREE},
			requireText:{type:UITYPE_TEXT, id:"TXT_MINER_REQUIRE_ITEM", style:TEXT_STYLE_TEXT_DIALOG},
			requireItems:{type:UITYPE_2D_LIST, items:this.requireItems, itemUI:UI_MINING_REQUIRE_ITEM, itemDef:requireItemDef, itemSize:cc.size(95, 100), itemsAlign:"center", singleLine:true},
			startButton:{onTouchEnded:this.startMining.bind(this)},
			startText:{type:UITYPE_TEXT, id:"TXT_MINER_START", style:TEXT_STYLE_TEXT_BUTTON},
			workingPanel:{visible:this.state === MINING_STATE_WORKING},
			workingText:{type:UITYPE_TEXT, id:"TXT_MINER_WORKING", style:TEXT_STYLE_TEXT_DIALOG},
			skipTimePrice:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_BUTTON},
			skipTimeButton:{onTouchEnded:this.skipTime.bind(this)},
			receivePanel:{visible:this.state === MINING_STATE_FINISHED},
			receiveText:{type:UITYPE_TEXT, id:"TXT_MINER_FINISHED", style:TEXT_STYLE_TEXT_DIALOG},
			receiveButton:{visible:false},//receiveButton:{onTouchEnded:this.receiveRewards.bind(this)},
			receiveButtonText:{type:UITYPE_TEXT, value:"TXT_MINER_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
			darkBg:{visible:Mining.state >= MINING_STATE_WORKING},
			leftBackground:{type:UITYPE_IMAGE, value:"common/images/hud_miner_bg.png", isLocalTexture:true, discard:true, scale:cc.p(1, 1)},
			rightBackground:{type:UITYPE_IMAGE, value:"common/images/hud_miner_bg.png", isLocalTexture:true, discard:true, scale:cc.p(-1, 1)},
		};
		if(this.state === MINING_STATE_WORKING)
			uiDef.timerMarker = {type:UITYPE_TIME_BAR, startTime:this.startTime, endTime:this.startTime + g_MISCINFO.MINE_DURATION_SECONDS, countdown:true, onFinished:this.onMiningFinished.bind(this), onTick:this.updateSkipTimeDiamond.bind(this)};
		
		// show
		var widget = FWPool.getNode(UI_MINING, false);
		this.widget = widget;
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_NONE);
			widget.setLocalZOrder(Z_UI_MINING);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
			
			this.tileWidgetList = FWUtils.getChildByName(widget, "itemList");
			this.skipTimeLabel = FWUtils.getChildByName(widget, "skipTimePrice");
			
			if(!this.miner)
			{
				this.miner = new Miner();	
				this.miner.init(this.tileWidgetList);
			}
			
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
    		AudioManager.effect (EFFECT_POPUP_SHOW);
		}
	},
	
	hide:function(sender)
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		FWUI.hide(UI_MINING, UIFX_NONE);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	initDisplayItems:function()
	{
		//this.requireItems = FWUtils.getItemsArray(gv.userData[GAME_MINE][MINE_REQUIRE_ITEMS]); moved to onLoaded()
		for(var i=0; i<this.requireItems.length; i++)
		{
			var item = this.requireItems[i];
			item.currentAmount = gv.userStorages.getItemAmount(item.itemId);
			item.displayAmount = "/" + item.amount;//item.displayAmount = item.currentAmount + "/" + item.amount;
			item.isEnough = (item.amount <= item.currentAmount);
		}
		
		this.rewardItems = FWUtils.getItemsArray(gv.userData[GAME_MINE][MINE_REWARD_ITEMS]);
		this.resetRand(this.rewardItems[0].amount);
		var tilesCount = MINING_COLS_COUNT * MINING_ROWS_COUNT;
		var allPos = [];
		for(var i=0; i<this.rewardItems.length; i++)
		{
			var pos;
			var duplicate;
			do
			{
				pos = {};
				pos.x = this.getRand(0, MINING_COLS_COUNT);
				pos.y = this.getRand(0, MINING_ROWS_COUNT);
				if(pos.x === 1 && pos.y === 0)
				{
					// first empty tile
					duplicate = true;
					continue; 
				}
				
				duplicate = false;
				for(var j=0; j<i; j++)
				{
					if(pos.x === this.rewardItems[j].pos.x && pos.y === this.rewardItems[j].pos.y)
					{
						duplicate = true;
						break;
					}
				}
			}
			while(duplicate);
			this.rewardItems[i].pos = pos;
		}
		
		this.tileList = [];
		for(var i=0; i<tilesCount; i++)
		{
			var tile = {};
			this.tileList.push(tile);
			
			tile.tile = "hud/hud_miner_tile_0" + this.getRand(1, 7) + ".png";
			tile.hasItem = false;
			tile.hasTile = false;
			tile.index = i;
			tile.tileX = (i % MINING_COLS_COUNT);
			tile.tileY = Math.floor(i / MINING_COLS_COUNT);
			tile.zOrder = tilesCount - i;
			
			if(i === 1)
				continue; // first emtpy tile
				
			for(var j=0; j<this.rewardItems.length; j++)
			{
				var item = this.rewardItems[j];
				if(item.pos.x === tile.tileX && item.pos.y === tile.tileY)
				{
					tile.hasItem = true;
					tile.itemId = item.itemId;
					tile.amount = item.amount;
					break;
				}
			}
			
			tile.hasTile = true;
		}
	},
	
	getTileByIndex:function(idx)
	{
		return this.tileList[idx];
	},
	
	getTileByPos:function(x, y)
	{
		return this.tileList[y * MINING_COLS_COUNT + x];
	},
	
	getTilePosByXY:function(x, y)
	{
		return cc.p(MINING_TILE_SIZE / 2 + x * MINING_TILE_SIZE, MINING_TILE_SIZE * MINING_ROWS_COUNT - MINING_TILE_SIZE / 2 - y * MINING_TILE_SIZE - MINER_MID_Y);
	},
	
	getTileWidgetByIndex:function(idx)
	{
		var children = this.tileWidgetList.getChildren();
		for(var i=0; i<children.length; i++)
		{
			var tileWidget = children[i];
			if(tileWidget.uiBaseData && tileWidget.uiBaseData.index === idx)
				return tileWidget;
		}
		return null;
	},

	showExplosionEffect: function ()
	{
		var h = 3;
		var near = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
		var start = {};

		for (var i = 0; this.tileList.length; i++)
		{
			var tile = this.tileList[i];
			if (!tile || !tile.hasTile)
				continue;

			start = {x: i % MINING_COLS_COUNT, y: Math.floor (i / MINING_COLS_COUNT), z: 0};
			break;
		}

		var plan = [];
		var queue = [start];
		while (queue.length > 0)
		{
			var cell = queue.shift ();
			var index = cell.y * MINING_COLS_COUNT + cell.x;
			var tile = this.tileList[index];
			
			if (!tile || !tile.hasTile)
				continue;
			
			tile.hasTile = false;
			for (var i = 0; i < near.length; i++)
			{
				var next = {x: cell.x + near[i].x, y: cell.y + near[i].y, z: cell.z + 1};
				if (next.x > -1 && next.x < MINING_COLS_COUNT && next.y > -1 && next.y < MINING_ROWS_COUNT)
					queue.push (next);
			}

			plan.push
			(
				cc.sequence
				(
					cc.delayTime (cell.z * 0.25 + Math.random() * 0.25),
					cc.callFunc (this.showTileExplostion.bind (this, tile))
				)
			);
		}

		this.widget.runAction (cc.spawn(plan));
	},
	
	showTileExplostion:function(tile)
	{
		var tileWidget = this.getTileWidgetByIndex(tile.index);
		var pos = FWUtils.getWorldPosition(tileWidget);
		FWUtils.showSpine(SPINE_EFFECT_TILE_EXPLOSION, null, "animation", false, null, pos, Z_FX);
		FWUtils.getChildByName(tileWidget, "tile").setVisible(false);
		AudioManager.effect (EFFECT_MINE_BOOM);
	},
	
	update:function(dt)
	{
		if(this.state === MINING_STATE_WORKING)
		{
			// moved to miner.js
			//if(this.updateRemainTiles())
				//this.setState(MINING_STATE_FINISHED);
		}
		else if(this.state === MINING_STATE_BOMB)
		{
			if(!this.miner.fwObject.isAnimating)
			{
				this.showExplosionEffect ();
				
				// finished
				this.setState(MINING_STATE_FINISHED, false);
			}
		}
	},
	
	// returns true if finished, false otherwise
	updateRemainTiles:function(hasFx)//web updateRemainTiles:function(hasFx = true)
	{
		if(hasFx === undefined)
			hasFx = true;
		
		if(this.startTime <= 0)
			return false;
		
		var eachTileDuration = g_MISCINFO.MINE_DURATION_SECONDS / MINING_DIG_ORDER.length;
		var time = this.startTime + eachTileDuration;
		var i = 0;
		while(i < MINING_DIG_ORDER.length && time < Game.getGameTimeInSeconds())
		{
			var index = MINING_DIG_ORDER[i];
			var tile = this.tileList[index];
			
			if(tile.hasTile)
			{
				// hide dug tile
				var tileWidget = this.getTileWidgetByIndex(index);
				if (tileWidget)
					FWUtils.getChildByName(tileWidget, "tile").setVisible(false);
				tile.hasTile = false;
				
				//if(hasFx)
					//this.showTileExplostion(tile)
				
				if(i + 1 < MINING_DIG_ORDER.length)
				{
					// next tile
					if(hasFx)
						this.miner.moveToTile(this.tileList[MINING_DIG_ORDER[i + 1]]);
					else
					{
						this.miner.tileX = 1;
						this.miner.tileY = 0;
						this.miner.moveToTile(this.tileList[MINING_DIG_ORDER[i + 1]], false);
					}
				}
				else
				{
					// finished
					return true;
				}
			}
			
			i++;
			time += eachTileDuration;
		}
		
		// fix miner position when exit and come back immediately
		if(i <= 0 && !hasFx)
			this.miner.moveToTile(this.tileList[MINING_DIG_ORDER[0]], false);
		
		return false;
	},
	
	buyMissingItem:function(sender)
	{
		gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
		Game.showQuickBuy([{itemId:sender.uiData.itemId, amount:sender.uiData.amount}], function() {Mining.show();});
	},
	showItemHint:function(sender)
	{
		var position = null;
		position = FWUtils.getWorldPosition(sender);
		gv.hintManagerNew.show(null, null, sender.uiData.itemId, position);
	},
	startMining:function(sender)
	{
		if(!Game.consumeItems(this.requireItems, FWUtils.getWorldPosition(sender)))
		{
			Game.showQuickBuy(this.requireItems, function() {Mining.show();});
			return;
		}
		
		// fake
		this.startTime = Game.getGameTimeInSeconds();
		
		// moved to onLoaded
		//this.setState(MINING_STATE_WORKING);
		//this.miner.moveToTile(this.tileList[0]);
		
		// server
		if(!MINING_FAKE_DATA)
		{
			var pk = network.connector.client.getOutPacket(this.RequestMineStart);
			pk.pack();
			network.connector.client.sendPacket(pk);
		}
	},
	
	onMiningFinished:function(sender)
	{
		// already handled in update
	},
	
	updateSkipTimeDiamond:function(sender)
	{
		// skip time diamond
		this.skipTimeData = Game.getSkipTimeDiamond("MINER", this.startTime, g_MISCINFO.MINE_DURATION_SECONDS);
		this.skipTimeLabel.setString(this.skipTimeData.diamond);
		this.skipTimeLabel.setColor(gv.userData.getCoin() >= this.skipTimeData.diamond ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
	},
	
	skipTime:function(sender)
	{
		if(Game.consumeDiamond(this.skipTimeData.diamond, FWUtils.getWorldPosition(sender)) === false)
			return;
		
		// fake
		this.startTime = Game.getGameTimeInSeconds() - g_MISCINFO.MINE_DURATION_SECONDS;
		AudioManager.effect (EFFECT_GOLD_PAYING);
		
		this.setState(MINING_STATE_BOMB, false);

		// server
		if(!MINING_FAKE_DATA)
		{
			var pk = network.connector.client.getOutPacket(this.RequestMineSkipTime);
			pk.pack(this.skipTimeData.diamond);
			network.connector.client.sendPacket(pk);
		}
	},
	
	// jira#5058
	onTileTouched:function(sender)
	{
		if(this.state !== MINING_STATE_FINISHED)
			return;
		
		if(!Game.canReceiveGift(this.rewardItems))
			return;
		
		var children = this.tileWidgetList.getChildren();
		for(var i=0; i<children.length; i++)
		{
			var tileWidget = children[i];
			if(tileWidget.uiBaseData && tileWidget.uiBaseData.hasItem)
			{
				Game.addItems([tileWidget.uiBaseData], FWUtils.getWorldPosition(tileWidget), 0);
				var fx = FWUtils.getChildByName(tileWidget, "fx");
				var gfx = FWUtils.getChildByName(tileWidget, "gfx");
				var amount = FWUtils.getChildByName(tileWidget, "amount");
				fx.setVisible(false);
				gfx.setVisible(false);
				amount.setVisible(false);
			}
		}
		
		this.onRewardsReceived();
	},
	
	//receiveRewards:function(sender)
	//{
	//	Game.showGiftPopup(this.rewardItems, "", this.onRewardsReceived.bind(this));
	//},
	
	onRewardsReceived:function()
	{
		// server
		if(!MINING_FAKE_DATA)
		{
			var pk = network.connector.client.getOutPacket(this.RequestMineReceiveReward);
			pk.pack();
			network.connector.client.sendPacket(pk);
		}
		
		// next
		this.loadAndShow();
	},
	
	moveToTile:function(sender)
	{
		// test only
		//this.miner.moveToTile(sender.uiData);
	},
	
	setState:function(state, refresh)//web setState:function(state, refresh = true)
	{
		if(refresh === undefined)
			refresh = true;
		
		if(state === MINING_STATE_FREE)
		{
			this.miner.setState(STATE_MINER_IDLE);
		}
		else if(state === MINING_STATE_WORKING)
		{
			// nothing
		}
		else if(state === MINING_STATE_BOMB)
		{
			this.miner.setState(STATE_MINER_BOMB);
			
			var widget = FWPool.getNode(UI_MINING, false);
			var workingPanel = FWUtils.getChildByName(widget, "workingPanel");
			workingPanel.setVisible(false);
		}
		else if(state === MINING_STATE_FINISHED)
		{
			this.miner.setState(STATE_MINER_FINISHED);
		}
		
		this.state = state;
		
		if(refresh)
			this.show();
	},
	
	shakeCurrentTile:function()
	{
		for(var i=0; i<MINING_DIG_ORDER.length; i++)
		{
			var index = MINING_DIG_ORDER[i];
			var tile = this.tileList[index];
			if(tile.hasTile)
			{
				var tileWidget = this.getTileWidgetByIndex(index);
				if (!tileWidget)
					continue;
				
				// jira#5125
				//tileWidget.stopAllActions();
				//tileWidget.setScale(0.75);
				//tileWidget.runAction(new cc.EaseBounceOut(cc.scaleTo(0.25, 1)));
				if(tileWidget.orgX === undefined)
				{
					tileWidget.orgX = tileWidget.getPositionX();
					tileWidget.orgY = tileWidget.getPositionY();
				}
				tileWidget.stopAllActions();
				tileWidget.runAction(cc.sequence(
					cc.moveTo(0.025, cc.p(tileWidget.orgX + 5, tileWidget.orgY)),
					cc.moveTo(0.05, cc.p(tileWidget.orgX - 5, tileWidget.orgY)),
					cc.moveTo(0.05, cc.p(tileWidget.orgX + 5, tileWidget.orgY)),
					cc.moveTo(0.05, cc.p(tileWidget.orgX - 5, tileWidget.orgY)),
					cc.moveTo(0.025, cc.p(tileWidget.orgX, tileWidget.orgY))
				));
				
				AudioManager.effect (EFFECT_MINE_WORKING);
				return;
			}
		}
	},

	refreshNotification:function()
	{
		gv.arcade.refreshNotification();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	
	
	// stupid random generator
	rands:null,
	randIdx:0,
	resetRand:function(seed)//web resetRand:function(seed = 0)
	{
		if(seed === undefined)
			seed = 0;
		
		if(!this.rands)
			this.rands = [45,71,59,62,18,67,89,83,87,50,82,43,37,65,20,87,8,47,14,80,16,43,29,57,48,49,8,15,28,90,48,28,75,16,25,97,37,4,1,73,98,33,5,19,69,97,97,26,12,36,43,12,61,45,83,12,69,41,73,55,81,73,79,49,76,69,37,60,31,34,99,1,47,33,18,50,84,94,26,7,55,32,44,46,6,64,85,10,81,80,12,12,75,17,44,65,46,42,69,38];
		this.randIdx = seed % this.rands.length;
	},
	
	// [min, max)
	getRand:function(min, max)
	{
		this.randIdx++;
		if(this.randIdx >= this.rands.length)
			this.randIdx = 0;
		return min + (this.rands[this.randIdx] % (max - min));
	},

///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	RequestMineGetInfo:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MINE_GET_INFO);},
		pack:function()
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseMineGetInfo:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			cc.log("Mining.ResponseMineGetInfo: " + JSON.stringify(object));
			
			Mining.onLoaded(object);
			if(this.getError() !== 0)
				cc.log("Mining.ResponseMineGetInfo: error=" + this.getError());
		}
	}),
	
	RequestMineStart:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MINE_START);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseMineStart:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			gv.userData[GAME_MINE][MINE_STATUS] = object[KEY_STATUS];
			gv.userData[GAME_MINE][MINE_FINISH] = object[KEY_FINISH_TIME];
			Game.updateUserDataFromServer(object);
			Mining.refreshNotification();
			
			if(this.getError() !== 0)
				cc.log("Mining.ResponseMineStart: error=" + this.getError());
			else
			{
				Achievement.onAction(g_ACTIONS.ACTION_MINE_START.VALUE, null, 1);
				Mining.workAfterLoading = true;
			}
			
			Mining.loadAndShow();
		}
	}),	
	
	RequestMineSkipTime:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MINE_SKIP_TIME);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponseMineSkipTime:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			gv.userData[GAME_MINE][MINE_STATUS] = object[KEY_STATUS];
			gv.userData[GAME_MINE][MINE_FINISH] = object[KEY_FINISH_TIME];
			Game.updateUserDataFromServer(object);
			Mining.refreshNotification();
			
			if(this.getError() !== 0)
			{
				cc.log("Mining.ResponseMineSkipTime: error=" + this.getError());
				Mining.loadAndShow();
			}
		}
	}),
	
	RequestMineReceiveReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MINE_RECEIVE_REWARDS);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseMineReceiveRewards:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			
			if(this.getError() !== 0)
			{
				cc.log("Mining.ResponseMineReceiveRewards: error=" + this.getError());
				Mining.loadAndShow();
			}
		}
	}),	
};

network.packetMap[gv.CMD.MINE_GET_INFO] = Mining.ResponseMineGetInfo;
network.packetMap[gv.CMD.MINE_START] = Mining.ResponseMineStart;
network.packetMap[gv.CMD.MINE_SKIP_TIME] = Mining.ResponseMineSkipTime;
network.packetMap[gv.CMD.MINE_RECEIVE_REWARDS] = Mining.ResponseMineReceiveRewards;
