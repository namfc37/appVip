
var LevelUp =
{
	rewardListWidget: null,
	prevLevel: 0,

	show:function(data)
	{
		var level = gv.userData.getLevel();
		var unlockList = gv.userData.getUnlockItems(level);

		for(var j=0;j<unlockList.length;j++)
		{
			unlockList[j].isUnlocked = true;
		}

		var temp = data [KEY_BONUS_ITEMS];
		//var rewardList = [];
		for (var i in temp)
		{
			var index = unlockList.findIndex(function(item) {return item.itemId ===i;});
			if(index >-1)
			{
				unlockList[index].amount = temp[i];
				unlockList[index].displayAmount = "x" + temp[i];
				//unlockList[index].isUnlocked = true;
			}
			else
			{
				unlockList.push({
					itemId: i,
					amount: temp [i],
					displayAmount: "x" + temp [i],
					isUnlocked: false
				});
			}
		}

		var unlockItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:"data.amount > 0"},
			iconUnlock:{visible:"data.isUnlocked"},
		};
		var uiDef =
		{
			btnReceive:{onTouchEnded:this.receiveRewards.bind(this)},
			receiveText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_LEVEL_UP_RECEIVE"},
			//rewardList:{type:UITYPE_2D_LIST, items:rewardList, itemUI:UI_LEVEL_UP_REWARD, itemDef:rewardItemDef, itemSize:cc.size(140, 170), itemsAlign:"center", singleLine:true, visible:true},
			lblBonus:{type:UITYPE_TEXT, style:TEXT_STYLE_TITLE_2, value:"TXT_LEVEL_UP_REWARD", visible:true},
			lblLevel:{type:UITYPE_TEXT, style:TEXT_STYLE_LVUP_2, value:level},
			lblLevelUp:{type:UITYPE_TEXT, style:TEXT_STYLE_LVUP_1, value:"TXT_LEVEL_UP"},
			unlockedItems:{visible:unlockList.length>=6, type:UITYPE_2D_LIST, items:unlockList, itemUI:UI_LEVEL_UP_UNLOCK, itemDef:unlockItemDef, itemSize:cc.size(120, 110)},//, itemsAlign:"center", singleLine:true},
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:2.5, visible:true},
			NPC:{visible:true},
		};

		//FWUtils.showDarkBg(null, Z_UI_LEVEL_UP - 1, "darkBgLevelUp", null, false);

		this.widget = FWPool.getNode(UI_LEVEL_UP_NEW, false);
		this.widget.setLocalZOrder(Z_UI_LEVEL_UP);
		FWUI.showWidgetWithData(this.widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);

		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);

		var btnReceive = FWUtils.getChildByName(this.widget, "btnReceive");
		var lightContainer = FWUI.getChildByName(this.widget, "effectLight");

		if(unlockList.length >=6)
		{
			this.rewardListWidget = FWUtils.getChildByName(this.widget, "unlockedItems");
		}
		else
		{
			this.rewardListWidget = FWUtils.getChildByName(this.widget, "container");
		}


		if (unlockList.length < 1)
		{
			this.widget.setPosition (cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5 - 50));
			btnReceive.setPosition (cc.p(0, -280 + 110));
		}
		else
		{
			btnReceive.setPosition (cc.p(0, -280));
		}

		var backLight = new FWObject();
		backLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
		backLight.setAnimation("effect_light_icon", true);
		backLight.setScale(2.5);
		backLight.setParent(lightContainer);
		backLight.setPosition(cc.p(0, 0));

		AudioManager.effect (EFFECT_LEVEL_UP);
		Game.showFireworks(this.widget, {x: 0, y: 0, width: cc.winSize.width, height: cc.winSize.height});

		//cc.log("LevelUp: unlockList=" + JSON.stringify(unlockList));
		this.container = FWUtils.getChildByName(this.widget, "container");
		// jira#5649
		CloudFloors.showPotSetFx(CloudFloors.getLastUnlockedFloorIdx() + 1);

		if(unlockList.length <6)
		{
			this.fillData_items(unlockList);
		}
	},
	fillData_items: function (data)
	{
		var ids = [];
		for (var i in data)
		{
			var gfx = Game.getItemGfxByDefine(data[i].itemId);
			var layer = new cc.Layer();

			layer.item = new FWObject();
			layer.item.parentLayer = layer;
			layer.item.forceTouchEnd = true;
			layer.item.itemId = data[i].itemId;
			layer.item.amount = data[i].amount;
			if (gfx.spine)
			{
				layer.item.initWithSpine (gfx.spine);
				layer.item.setSkin(gfx.skin);
				layer.item.setAnimation(gfx.anim, true);
				layer.item.setPosition(0, 0);
			}
			else if (gfx.sprite)
			{
				layer.item.initWithSprite ("#" + gfx.sprite);
			}

			layer.item.setEventListener( this.showItemHintItem.bind(this),this.hideItemHintItem.bind(this));
			layer.item.setScale (gfx.scale || 1);

			layer.item.setParent (layer);




			if(data[i].amount)
			{
				// use k
				var text = "x" + data[i].amount;
				if(text.endsWith("000"))
					text = text.substring(0, text.length - 3) + "K";

				layer.label = FWUtils.createUIText(text, cc.p(40, -40), cc.size(0, 0), cc.color.WHITE, FONT_SIZE_DEFAULT, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER, FONT_ITALIC);
				layer.label.setAnchorPoint (1, 0);
				FWUI.applyTextStyle(layer.label, TEXT_STYLE_NUMBER);
				layer.addChild (layer.label);
				layer.label.setLocalZOrder(1);
			}

			if(data[i].isUnlocked)
			{
				layer.icon = new cc.Sprite("#hud/icon_unlock_1.png");
				layer.icon.setScale(0.7);
				layer.icon.setName("iconAlert");
				layer.icon.setPosition(cc.p(-35, 35));
				layer.addChild(layer.icon);
				layer.icon.setLocalZOrder(1);
			}
			// jira#5632
			layer.item.node.setLocalZOrder(0);
			ids.push (layer);
		}

		var rows = ids.length < 4 ? 1 : 2
		var columns = Math.ceil (ids.length / rows);
		var itemWidth = 110;
		var itemHeight = 100;
		var itemOffsetX = 0;
		var itemOffsetY = 0;

		var scale = Math.min (itemWidth / 100, itemHeight / 100);
		scale = Math.floor (scale * 100) / 100;

		for (var r = 0; r < rows; r++)
		{
			var y = itemOffsetY + ((rows - 1) * 0.5 - r) * itemHeight;

			var tempC = ids.length - r * columns;
			if (tempC >= columns)
				tempC = columns

			for (var c = 0; c < tempC; c++)
			{
				var x = itemOffsetX + ((tempC - 1) * 0.5 - c) * itemWidth;
				x*=-1;
				var layer = ids [r * columns + c];
				layer.setPosition (cc.p (x, y));
				layer.item.setScale (layer.item.getScale () * scale);

				this.container.addChild (layer);
			}
		}
	},
	onItemTouched:function(sender,type){
		if (type === ccui.Widget.TOUCH_ENDED) {
			cc.log( "onItemTouched", "slotIndex:", JSON.stringify(sender));
		}
		else if (type === ccui.Widget.TOUCH_BEGAN) {
			cc.log( "onItemTouched","began");
		}
	},
	hide:function()
	{
		//this.widget.hasFireworks = false;
		//FWUtils.hideDarkBg(null, "darkBgLevelUp");
		FWUI.hide(UI_LEVEL_UP_NEW, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc);

		// jira#5571
		FWUtils.disableAllTouchesByDuration(1);

		var level = gv.userData.getLevel();
		if(level >= 16)
			Game.shouldShowRatingPopup = true;
		if(this.prevLevel < NEWS_POPUP_LEVEL && level >= NEWS_POPUP_LEVEL)// jira#6814 else if(this.prevLevel < NEWS_POPUP_LEVEL && level >= NEWS_POPUP_LEVEL)
			showPopupByName("event");
		else if(this.prevLevel < g_MISCINFO.DAILY_GIFT_USER_LEVEL && level >= g_MISCINFO.DAILY_GIFT_USER_LEVEL)
			showPopupByName("daily_reward");
		else if(this.prevLevel < g_MISCINFO.QUEST_BOOK_USER_LEVEL && level >= g_MISCINFO.QUEST_BOOK_USER_LEVEL)
			QuestBook.refresh();

		// feedback: remove ranking hint at lv.11, event new has higher priority
		//Ranking.onLevelUp(level, this.prevLevel);

		if(this.container)
		{
			var items = this.container.getChildren();
			for(var i=0; i<items.length; i++)
				items[i].item.uninit(); // uninit FWObject to return spine to pool
			this.container.removeAllChildren();
		}
		Minigame.onLevelUp(level, this.prevLevel);
	},

	receiveRewards:function(sender)
	{
		var children = this.rewardListWidget.getChildren();
		cc.log("receiveRewards",this.rewardListWidget.getName());
		if(this.rewardListWidget.getName()=== "container")
		{
			var index = 0;
			for(var i=0; i<children.length; i++)
			{
				var child = children[i];
				if(!child.item)
					continue;

				if(child.item.amount)
				{
					var itemId = child.item.itemId;
					var amount = child.item.amount;

					var position = child.item.parentLayer.getPosition();
					position.x += cc.winSize.width/2;
					position.y += cc.winSize.height/2 -90;

					FWUtils.showFlyingItemIcon(itemId, amount, position, Game.getFlyingDestinationForItem(itemId), index * 0.15);
					index++;
				}
			}
		}
		else
		{
			var index = 0;
			for(var i=0; i<children.length; i++)
			{
				var child = children[i];
				if(!child.uiBaseData)
					continue;

				var itemId = child.uiBaseData.itemId;
				var amount = child.uiBaseData.amount;
				FWUtils.showFlyingItemIcon(itemId, amount, FWUtils.getWorldPosition(child), Game.getFlyingDestinationForItem(itemId), index * 0.15);
				index++;
			}
		}


		this.hide();
	},

	showItemHint:function(sender)
	{
		//cc.log("showItemHint",JSON.stringify(sender)); cyclic object value
		var position = null;
		position = FWUtils.getWorldPosition(sender);
		gv.hintManagerNew.show(null, null, sender.uiData.itemId, position);
	},
	hideItemHint:function(sender)
	{
		//cc.log("hideItemHint",JSON.stringify(sender)); cyclic object value
		gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
	},
	showItemHintItem:function(touch,sender)
	{
		cc.log("showItemHintItem",JSON.stringify(sender.itemId));
		//var position =  FWUtils.getWorldPosition(sender.parent);
		var position = sender.parentLayer.getPosition();
		position.x += cc.winSize.width/2;
		position.y += cc.winSize.height/2 -90;
		gv.hintManagerNew.show(null, null, sender.itemId, position);
	},
	hideItemHintItem:function(touch,sender)
	{
		cc.log("hideItemHintItem",JSON.stringify(sender.itemId));
		gv.hintManagerNew.hideHint( null, sender.itemId);
	},
};

