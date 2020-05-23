
const ORDER_ID_EMPTY = -9999;
const NEW_PAID_ORDER_WAIT_TIME = 3 * 60;
const ORDER_UNLOCK_LEVEL = 3;

var Orders =
{
	orderList: null,
	orderInProgress: null,
	selectedOrder: null,
	lblBuyOrderPrice: null,
	skipTimeData: null,
	newOrderWaitTime: 0,
	owl:null,
	boughtItemToDeliver: false, // jira#4751
	pendingOrder: null, // jira#4679
	savedDisplayIndex: -1, // jira#5761
	
	init:function()
	{
		// check if any order is in progress
		this.updateOrderList();
		if(this.orderInProgress && !Game.isFriendGarden())
			this.initOwl(STATE_OWL_RETURN);
	},
	
	uninit:function()
	{
		if(this.owl)
		{
			this.owl.uninit();
			this.owl = null;
		}
	},
	
	show:function(selectedId)//web show:function(selectedId = -1)
	{
		if(selectedId === undefined)
			selectedId = -1;
		
		if(gv.userData.getLevel() < ORDER_UNLOCK_LEVEL)
		{
			// show warning text if user has lower level
			var text = cc.formatStr(FWLocalization.text("TXT_ORDER_REQUIRE_LEVEL"), ORDER_UNLOCK_LEVEL);
			FWUtils.showWarningText(text, cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
			return;
		}
		
		if(selectedId < 0)
		{
			this.boughtItemToDeliver = false;
			
			// jira#4776
			if(this.selectedOrder !== null)
				selectedId = this.selectedOrder[ORDER_ID];
		}
		
		// selected order
		var orderList = this.updateOrderList();
		if(!orderList)
			return;
		var selectedOrder = null;
		
		// jira#5761
		if(this.savedDisplayIndex >= 0)
		{
			for(var i=0; i<orderList.length; i++)
			{
				if(orderList[i] && orderList[i].displayIndex === this.savedDisplayIndex)
				{
					selectedOrder = orderList[i];
					break;
				}
			}
		}
		
		if(!selectedOrder)
		{
			//var hasDailyOrder = false;
			for(var i=0; i<orderList.length; i++)
			{
				if(!orderList[i])
					continue;
				if(orderList[i][ORDER_ID] === selectedId)
					selectedOrder = orderList[i];
				//if(orderList[i].isDaily)
				//	hasDailyOrder = true;
			}
			if(selectedOrder === null && orderList.length > 0)
			{
				// auto select one
				if((orderList[0] && orderList[0][ORDER_ID] != ORDER_ID_EMPTY) || orderList.length <= 1)
					selectedOrder = orderList[0];
				else if(orderList.length > 1)
					selectedOrder = orderList[1];
			}
		}
		this.selectedOrder = selectedOrder;
		//this.pendingOrder = null;
		
		// title
		var title = "";
		var level = gv.userData.getLevel();
		if(selectedOrder !== null && selectedOrder.isEmpty === false)
		{
			var maxFreeOrders = json_user_level.DO_FREE_UNLOCK[level];
			var maxPaidOrders = json_user_level.DO_PAID_UNLOCK[level];
			var receivedFreeOrders = gv.userData.game[GAME_ORDER][ORDER_MANAGER_NUM_DAILY];
			var receivedPaidOrders = gv.userData.game[GAME_ORDER][ORDER_MANAGER_NUM_DAILY] - maxFreeOrders;
			if(receivedFreeOrders > maxFreeOrders)
				receivedFreeOrders = maxFreeOrders;
			if(receivedPaidOrders < 0)
				receivedPaidOrders = 0;
			
			if(selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_FREE)
				title = cc.formatStr(FWLocalization.text("TXT_ORDER_DAILY"), receivedFreeOrders, maxFreeOrders);
			else if(selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID)
				title = cc.formatStr(FWLocalization.text("TXT_ORDER_PAID"), receivedPaidOrders, maxPaidOrders);
			else
				title = FWLocalization.text("TXT_ORDER_NORMAL");
		}
		
		// jira#4796
		// var itemPosition;
		// if(hasDailyOrder)
			// itemsPosition = [[1,1],[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2]];
		// else
			// itemsPosition = [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[1,1]];
		var itemsPosition = [[1,1],[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2]];
		
		// def
		var itemDef =
		{
			bgNormal:{visible:"data[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_NORMAL_PLANT && data.showData === true"},
			bgBug:{visible:"data[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_NORMAL_BUG && data.showData === true"},
			bgDaily:{visible:"data.isDaily === true"},
			bgWaiting:{visible:"data.showData === false && data.isDaily === false"},
			selected:{visible:"data[ORDER_ID] === " + (this.selectedOrder === null ? null : this.selectedOrder[ORDER_ID])},
			iconExp:{visible:"data.showData === true"},
			iconGold:{visible:"data.showData === true"},
			lblExp:{type:UITYPE_TEXT, field:"totalExp", visible:"data.showData === true", style:TEXT_STYLE_NUMBER},
			lblGold:{type:UITYPE_TEXT, field:"totalGold", visible:"data.showData === true", style:TEXT_STYLE_NUMBER},
			checkBg:{visible:"data.showData === true"},
			check:{visible:"data.showData === true && data.isEnough === true"},
			itemTimerMarker:{type:UITYPE_TIME_BAR, visible:"data.isWaiting === true || (data.isDaily === true && data.showData === false)", startTime:"data.isWaiting ? data[ORDER_TIME] : FWUtils.secondsAtStartOfDay()", endTime:"data.isWaiting ? data.waitEndTime : FWUtils.secondsAtEndOfDay()", countdown:true, onFinished:this.onWaitTimeEnded.bind(this)},
			panel:{onTouchEnded:this.onOrderSelected.bind(this)},
		};
		var uiDef =
		{
			btnClose:{onTouchEnded:this.hide.bind(this)},
			lblTitle:{type:UITYPE_TEXT, value:title, style:TEXT_STYLE_TITLE_1},
			orderList:{type:UITYPE_2D_LIST, items:orderList, itemUI:UI_ORDER_ITEM, itemDef:itemDef, itemSize:cc.size(190, 190), itemsPosition:itemsPosition},
			owlSpineMarker:{type:UITYPE_SPINE, value:SPINE_OWL_TUTU, anim:"idle", scale:OWL_SCALE, visible:this.orderInProgress === null && this.owl === null},
			timerMarker:{type:UITYPE_TIME_BAR, visible:selectedOrder !== null && selectedOrder.isDaily && !selectedOrder.isEmpty, startTime:FWUtils.secondsAtStartOfDay(), endTime:FWUtils.secondsAtEndOfDay(), countdown:true},
		};
		
		// show
		var widget = FWPool.getNode(UI_ORDER, false);
		if(FWUI.isWidgetShowing(widget))
		{
			// refresh
			FWUI.unfillData(widget);
			FWUI.fillData(widget, orderList, uiDef);
		}
		else
		{
			// new
			FWUI.showWidgetWithData(widget, orderList, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_ORDER);
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateOrder, 1, cc.REPEAT_FOREVER, 0, false);
		
			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		this.lblBuyOrderPrice = null;
		var detailMarker = FWUtils.getChildByName(widget, "orderDetailMarker");
		this.showDetail(selectedOrder, detailMarker);
	},
	
	showDetail:function(selectedOrder, detailMarker)
	{
		var widget = FWUtils.getChildByName(detailMarker, "uiOrderDetail");
		if(selectedOrder === null)
		{
			if(widget)
				FWUI.hideWidget(widget);
			return;
		}
		
		// def
		var requireItemDef = 
		{
			bg:{visible:true, onTouchBegan:this.showRequireItemHint.bind(this), onTouchEnded:this.hideRequireItemHint.bind(this), forceTouchEnd:true},
			check:{visible:"data.isEnough === true"},
			requireAmount:{type:UITYPE_TEXT, field:"displayAmount", color:cc.GREEN, style:TEXT_STYLE_NUMBER},
			stockAmount:{type:UITYPE_TEXT, field:"stockAmount", color:"data.isEnough ? cc.GREEN : cc.RED", style:TEXT_STYLE_NUMBER},
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			buyButton:{visible:false},
		};
		var rewardItemDef = 
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", scale:0.6},
			amount:{type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER},
			bonus:{visible:"data.isBonus === true"},
		};
		var uiDef = 
		{
			imgDetailBgNormal:{visible:selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_NORMAL_PLANT && selectedOrder.showData === true},
			imgDetailBgBug:{visible:selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_NORMAL_BUG && selectedOrder.showData === true},
			imgDetailBgDaily:{visible:(selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID || selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_FREE) && selectedOrder.showData === true},
			imgDetailBgWaiting:{visible:selectedOrder.showData === false},
			imgAvatar:{type:UITYPE_IMAGE, value:cc.formatStr("npc/npc_%s.png", FWUtils.formatNumber(selectedOrder[ORDER_NPC], 2)), visible:selectedOrder.showData === true},
			lblNPCName:{type:UITYPE_TEXT, value:FWLocalization.text(cc.formatStr("TXT_NPC_%s", FWUtils.formatNumber(selectedOrder[ORDER_NPC], 2))), visible:selectedOrder.showData === true},
			lblNPCRequest:{type:UITYPE_TEXT, value:"TXT_ORDER_REQUEST", visible:selectedOrder.showData === true},
			requireList:{type:UITYPE_2D_LIST, items:selectedOrder.requireItems, itemUI:UI_ORDER_REQUEST_ITEM, itemDef:requireItemDef, itemSize:cc.size(120, 120), visible:selectedOrder.showData === true},
			imgSplitter:{visible:selectedOrder.showData === true},
			imgSplitter2:{visible:selectedOrder.showData === true},
			//imgSplitter3:{visible:selectedOrder.showData === true},
			lblReward:{type:UITYPE_TEXT, value:"TXT_ORDER_REWARD", visible:selectedOrder.showData === true},
			rewardList:{type:UITYPE_2D_LIST, items:selectedOrder.rewards, itemUI:UI_ORDER_REWARD_ITEM, itemDef:rewardItemDef, itemSize:cc.size(130, 60), visible:selectedOrder.showData === true, itemsAlign:"center"},
			btnDeliver:{visible:selectedOrder.showData === true && selectedOrder[ORDER_STATUS] !== ORDER_STATUS_INACTIVE, onTouchEnded:this.onDeliver.bind(this), enabled:(this.orderInProgress === null || (this.owl !== null && this.owl.state >= STATE_OWL_RETURN2)) && this.pendingOrder === null},
			lblDeliver:{visible:selectedOrder.showData === true && selectedOrder[ORDER_STATUS] !== ORDER_STATUS_INACTIVE, type:UITYPE_TEXT, value:"TXT_ORDER_DELIVER", style:TEXT_STYLE_TEXT_BUTTON},
			btnCancel:{visible:selectedOrder.showData === true, onTouchEnded:this.onCancelOrder.bind(this), enabled:true},
			btnBuyOrder:{visible:(selectedOrder.showData === true && selectedOrder[ORDER_STATUS] === ORDER_STATUS_INACTIVE) || selectedOrder.isWaiting === true, onTouchEnded:this.onBuyOrder.bind(this)},
			lblBuyOrderPrice:{visible:(selectedOrder.showData === true && selectedOrder[ORDER_STATUS] === ORDER_STATUS_INACTIVE) || selectedOrder.isWaiting === true, type:UITYPE_TEXT, value:selectedOrder[ORDER_PRICE], style:TEXT_STYLE_TEXT_BUTTON, color:selectedOrder[ORDER_PRICE] <= gv.userData.getGold() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND},
			lblBuyOrderTitle:{visible:(selectedOrder.showData === true && selectedOrder[ORDER_STATUS] === ORDER_STATUS_INACTIVE && selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID), type:UITYPE_TEXT, value:"TXT_ORDER_BUY_TITLE"},
			lblNoOrder:{visible:selectedOrder.showData === false, type:UITYPE_TEXT, value:selectedOrder.isWaiting ? "TXT_ORDER_WAITING" : "TXT_ORDER_END"},
			orderDetailTimeMarker:{type:UITYPE_TIME_BAR, visible:selectedOrder.showData === false, startTime:selectedOrder.isWaiting ? selectedOrder[ORDER_TIME] : FWUtils.secondsAtStartOfDay(), endTime:selectedOrder.isWaiting ? selectedOrder.waitEndTime : FWUtils.secondsAtEndOfDay(), countdown:true},
			lblReward2:{type:UITYPE_TEXT, value:"TXT_RANDOM_REWARD", visible:selectedOrder.showData === true && selectedOrder.rewards2.length > 0},
			rewardList2:{type:UITYPE_2D_LIST, items:selectedOrder.rewards2, itemUI:UI_ORDER_REWARD_ITEM, itemDef:rewardItemDef, itemSize:cc.size(130, 60), visible:selectedOrder.showData === true && selectedOrder.rewards2.length > 0, itemsAlign:"center"},
		};

		// show
		if(widget)
		{
			FWUI.unfillData(widget);
			FWUI.fillData(widget, selectedOrder, uiDef);
		}
		else
		{
			widget = FWUI.showWithData(UI_ORDER_DETAIL, selectedOrder, uiDef, detailMarker, UIFX_POP);
			widget.setName("uiOrderDetail");
		}
		this.lblBuyOrderPrice = FWUtils.getChildByName(widget, "lblBuyOrderPrice");
		this.updateOrder(0);
	},
	
	hide:function(widget, silent)//web hide:function(widget = null, silent = false)
	{
		if(widget === undefined)
			widget = null;
		if(silent === undefined)
			silent = false;
		
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateOrder);
		FWUI.hide(UI_ORDER, UIFX_POP);
		Game.refreshUIMain(RF_UIMAIN_ORDER);
		
		if (!silent)
			AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	updateOrder:function(dt)
	{
		if(this.selectedOrder !== null && this.selectedOrder.isWaiting === true && this.lblBuyOrderPrice !== null)
		{
			// skip time diamond
			this.skipTimeData = Game.getSkipTimeDiamond("ORDER", this.selectedOrder[ORDER_TIME], this.selectedOrder.waitEndTime - this.selectedOrder[ORDER_TIME]);
			this.lblBuyOrderPrice.setString(this.skipTimeData.diamond);
			this.lblBuyOrderPrice.setColor(this.skipTimeData.diamond <= gv.userData.getCoin() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
		}
	},
	
	updateOrderList:function()
	{
		// calc wait time (seconds)
		var level = gv.userData.getLevel();
		this.newOrderWaitTime = json_user_level.NEW_ORDER_WAIT_TIME[level];
		if(this.newOrderWaitTime < 0)
		{
			for(var i=level-1; i>=0; i--)
			{
				this.newOrderWaitTime = json_user_level.NEW_ORDER_WAIT_TIME[i];
				if(this.newOrderWaitTime >= 0)
					break;
			}
		}

		// orders
		var orders = gv.userData.game[GAME_ORDER];
		if(!orders)
			return null;
		var orderList = [];
		// daily order first
		if(orders[ORDER_MANAGER_DAILY][ORDER_SUB_TYPE] !== undefined)
			orderList.push(orders[ORDER_MANAGER_DAILY]);
		else if(gv.userData.getLevel() >= g_MISCINFO.DO_USER_LEVEL)
		{
			var emptyDailyOrder = {};
			emptyDailyOrder[ORDER_ID] = ORDER_ID_EMPTY;
			emptyDailyOrder[ORDER_SUB_TYPE] = defineTypes.SUB_TYPE_ORDER_DAILY_PAID;
			orderList.push(emptyDailyOrder);
		}
		else
			orderList.push(null);
		// normal orders
		orderList = orderList.concat(orders[ORDER_MANAGER_NORMAL]);
		//while(orderList.length < 9)
		//{
		//	var emptyNormalOrder = {};
		//	emptyNormalOrder[ORDER_ID] = ORDER_ID_EMPTY;
		//	emptyNormalOrder[ORDER_SUB_TYPE] = defineTypes.SUB_TYPE_ORDER_NORMAL_PLANT;
		//	orderList.push(emptyNormalOrder);
		//}
		
		// pre-calc display data
		for(var i=0; i<orderList.length; i++)
		{
			this.updateOrderDisplayData(orderList[i]);
			
			// jira#5761
			if(orderList[i])
				orderList[i].displayIndex = i;
		}
		
		// delivering order
		this.orderInProgress = null;
		if(orders[ORDER_MANAGER_DELIVERY][ORDER_SUB_TYPE] !== undefined)
		{
			this.orderInProgress = orders[ORDER_MANAGER_DELIVERY];
			this.updateOrderDisplayData(this.orderInProgress);
		}
		
		this.orderList = orderList;
		return orderList;
	},
	
	updateOrderDisplayData:function(order)
	{		
		if(!order)
			return;
		
		order.isDaily = (order[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID || order[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_FREE);
		order.isEnough = false;
		
		// empty?
		order.isEmpty = (order[ORDER_ID] < 0);
		if(order.isEmpty)
		{
			order.isWaiting = false;
			order.showData = false;
			return;
		}
		
		// waiting?
		if(order[ORDER_STATUS] === ORDER_STATUS_CANCEL)
		{
			if(order[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID)
				order.waitEndTime = order[ORDER_TIME] + NEW_PAID_ORDER_WAIT_TIME;
			else
				order.waitEndTime = order[ORDER_TIME] + this.newOrderWaitTime;
			order.isWaiting = (order.waitEndTime > Game.getGameTimeInSeconds());
			if (!order.isWaiting){
				if (order[ORDER_PRICE] > 0)
					order[ORDER_STATUS] = ORDER_STATUS_INACTIVE;
				else
					order[ORDER_STATUS] = ORDER_STATUS_ACTIVE;
			}
		}
		else
			order.isWaiting = false;
		
		order.showData = !order.isWaiting;
		if(!order.showData)
			return;
		
		// event
		order[ORDER_EVENT_ITEMS] = [];
		// use ORDER_BONUS_ITEMS for event items
		// var event = GameEvent.currentEvent;
		// if(event)
		// {
			// var dropItems = null;
			// var type = order[ORDER_SUB_TYPE];
			// if(type === defineTypes.SUB_TYPE_ORDER_NORMAL_PLANT || type === defineTypes.SUB_TYPE_ORDER_NORMAL_BUG)
				// dropItems = event.FEATURE_DROP_LIST.rules.ORDER_GET_REWARD;
			// else if(type === defineTypes.SUB_TYPE_ORDER_DAILY_FREE)
				// dropItems = event.FEATURE_DROP_LIST.rules.ORDER_GET_REWARD_ORDER_DAILY_FREE;
			// else if(type === defineTypes.SUB_TYPE_ORDER_DAILY_PAID)
				// dropItems = event.FEATURE_DROP_LIST.rules.ORDER_GET_REWARD_ORDER_DAILY_PAID;
			// if(dropItems)
				// order[ORDER_EVENT_ITEMS][event.FEATURE_DROP_LIST.dropItemID] = dropItems.quantity;
		// }
		
		// rewards
		order.totalExp = 0;
		order.totalGold = 0;
		order.rewards = []; // normal items
		order.rewards2 = []; // bonus & reward items
		var rewardList = [order[ORDER_REWARD_ITEMS], order[ORDER_BONUS_ITEMS], order[ORDER_EVENT_ITEMS]];
		for(var j=0; j<rewardList.length; j++)
		{
			var rewards = rewardList[j];
			for(var itemId in rewards)
			{
				var amount = rewards[itemId];
				if(itemId === ID_GOLD)
					order.totalGold += amount;
				else if(itemId === ID_EXP)
					order.totalExp += amount;
				
				var item = {itemId:itemId, amount:amount, isBonus:rewards === order[ORDER_BONUS_ITEMS], isEvent:rewards === order[ORDER_EVENT_ITEMS]};
				if(rewards === order[ORDER_REWARD_ITEMS])
					order.rewards.push(item);
				else
					order.rewards2.push(item);
			}
		}

		// requirement
		order.requireItems = [];
		order.isEnough = true;
		for(var itemId in order[ORDER_REQUIRE_ITEMS])
		{
			var requireAmount = order[ORDER_REQUIRE_ITEMS][itemId];
			var stockAmount = gv.userStorages.getItemAmount(itemId);
			order.requireItems.push({itemId:itemId, requireAmount:requireAmount, stockAmount:stockAmount, isEnough:(stockAmount >= requireAmount), displayAmount:"/" + requireAmount});//order.requireItems.push({itemId:itemId, requireAmount:requireAmount, stockAmount:stockAmount, isEnough:(stockAmount >= requireAmount), displayAmount:stockAmount + "/" + requireAmount});
			if(stockAmount < requireAmount)
				order.isEnough = false;
		}
	},	
	
	/*not usedreplaceOrder:function(oldOrderId, newOrder)
	{
		if(oldOrderId === undefined || newOrder === undefined)
			return false;
		
		var orders = gv.userData.game[GAME_ORDER];
		if(orders[ORDER_MANAGER_DAILY][ORDER_ID] === oldOrderId)
		{
			orders[ORDER_MANAGER_DAILY] = newOrder;
			return true;
		}
		else
		{
			for(var i=0; i<orders[ORDER_MANAGER_NORMAL].length; i++)
			{
				if(orders[ORDER_MANAGER_NORMAL][i][ORDER_ID] === oldOrderId)
				{
					orders[ORDER_MANAGER_NORMAL][i] = newOrder;
					return true;
				}
			}
		}
		return false;
	},*/

	// jira#4757
	getOrderIndex:function(orderId)
	{
		var orders = gv.userData.game[GAME_ORDER][ORDER_MANAGER_NORMAL];
		for(var i=0; i<orders.length; i++)
		{
			if(orders[i][ORDER_ID] === orderId)
				return i;
		}
		return -1;
	},
	
	removeOrder:function(orderId)
	{
		if(orderId === undefined)
			return false;
		
		var orders = gv.userData.game[GAME_ORDER];
		if(orders[ORDER_MANAGER_DAILY][ORDER_ID] === orderId)
		{
			orders[ORDER_MANAGER_DAILY] = {};
			return true;
		}
		else if(orders[ORDER_MANAGER_DELIVERY][ORDER_ID] === orderId)
		{
			orders[ORDER_MANAGER_DELIVERY] = {};
			return true;
		}
		else return (FWUtils.removeArrayElementByKeyValue(orders[ORDER_MANAGER_NORMAL], ORDER_ID, orderId) !== null);
	},
	
	addOrder:function(order, index)
	{
		if(!order || !order[ORDER_SUB_TYPE])
			return;
		
		var orders = gv.userData.game[GAME_ORDER];
		if(order[ORDER_STATUS] === ORDER_STATUS_DELIVERY)
			orders[ORDER_MANAGER_DELIVERY] = order;
		else if(order[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_FREE || order[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID)
		{
			// jira#4899: daily limit reached
			var level = gv.userData.getLevel();
			var maxFreeOrders = json_user_level.DO_FREE_UNLOCK[level];
			var maxPaidOrders = json_user_level.DO_PAID_UNLOCK[level];
			var receivedOrders = gv.userData.game[GAME_ORDER][ORDER_MANAGER_NUM_DAILY];
			if(receivedOrders > maxFreeOrders + maxPaidOrders)
				orders[ORDER_MANAGER_DAILY] = {};
			else
				orders[ORDER_MANAGER_DAILY] = order;
		}
		else if(index === undefined || index < 0)
			orders[ORDER_MANAGER_NORMAL].push(order);
		else
			orders[ORDER_MANAGER_NORMAL].splice(index, 0, order);
	},
	
	showRequireItemHint:function(sender)
	{
		var widget = FWPool.getNode(UI_ORDER, false);
		var position =null;
		if(FWUI.touchedWidget){
			//cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
			position = FWUI.touchedWidget.getTouchBeganPosition();
		}
		gv.hintManagerNew.show(widget, null, sender.uiData.itemId,position);
	},

	hideRequireItemHint:function(sender)
	{
		gv.hintManagerNew.hideHint(null,sender.uiData.itemId);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// event //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	onOrderSelected:function(sender)
	{
		this.savedDisplayIndex = sender.uiData.displayIndex;
		this.boughtItemToDeliver = false;
		this.show(sender.uiData[ORDER_ID]);
	},
	
	onDeliver:function(sender)
	{
		if(!this.selectedOrder.isEnough)
		{
			// buy missing items
			Game.showQuickBuy(this.selectedOrder.requireItems, this.onFinishedBuyingMissingItems.bind(this));
			return;
		}
		
		// jira#4751
		if(!this.boughtItemToDeliver)
		{
			var warningItems = [];
			for(var i=0; i<this.selectedOrder.requireItems.length; i++)
			{
				var requireItem = this.selectedOrder.requireItems[i];
				if(requireItem.requireAmount === requireItem.stockAmount && g_PLANT[requireItem.itemId] !== undefined)
					warningItems.push({itemId:requireItem.itemId});
			}
			if(warningItems.length > 0)
			{
				Game.showEmtpyStockWarning(warningItems, this.onDeliver2.bind(this));
				return;
			}
		}
		
		this.onDeliver2(sender);
	},
		
	onDeliver2:function(sender)
	{
		this.pendingOrder = null;
		
		// fix: exception
		//if(this.owl !== null || this.orderInProgress !== null)
		if(this.owl !== null)
		{
			if(this.owl.state === STATE_OWL_RETURN2)
			{
				this.pendingOrder = this.selectedOrder;
				this.owl.setState(STATE_OWL_FLY_AWAY);
				Orders.onReceiveRewards();
				
				// jira#4932: send next command after 1s
				this.hide();
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {this.onDeliver3(this.selectedOrder);}, 0, 0, 1, false);
				return;
			}
			else if(this.owl.state === STATE_OWL_FLY_AWAY)
			{
				this.pendingOrder = this.selectedOrder;
			}
			//else
			//{
			//	// another delivery is in progress
			//	var widget = FWPool.getNode(UI_ORDER_DETAIL, false);
			//	var btnDeliver = FWUtils.getChildByName(widget, "btnDeliver");
			//	FWUtils.showWarningText(FWLocalization.text("TXT_ORDER_OWL_BUSY"), FWUtils.getWorldPosition(btnDeliver));
			//	return;
			//}
		}
		
		// don't play effect_popup_close
		this.hide(null, true);
		
		// feedback: quick refresh
		//if(this.pendingOrder === null) 
			//this.onDeliver3(this.selectedOrder);
		this.onDeliver3(this.selectedOrder);
	},
	
	onDeliver3:function(order)
	{
		// fake status
		this.orderInProgress = order;
		this.orderInProgress[ORDER_STATUS] = ORDER_STATUS_DELIVERY;
		this.addOrder(this.orderInProgress);
		
		// fake subtract items from stock
		for(var i=0; i<this.orderInProgress.requireItems.length; i++)
			gv.userStorages.removeItem(this.orderInProgress.requireItems[i].itemId, this.orderInProgress.requireItems[i].requireAmount);
		
		// fake: inc daily order counter
		if(this.orderInProgress.isDaily)
			gv.userData.game[GAME_ORDER][ORDER_MANAGER_NUM_DAILY]++;
		
		// owl
		// feedback: quick refresh
		//this.initOwl(this.owl === null ? STATE_OWL_DELIVER : STATE_OWL_EXPLOITED_DELIVER); 
			//this.initOwl(STATE_OWL_DELIVER);
		if(this.pendingOrder === null)
			this.initOwl(STATE_OWL_DELIVER);
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestOrderDelivery);
		pk.pack(this.orderInProgress[ORDER_ID]);
		network.connector.client.sendPacket(pk);
	},
	
	onCancelOrder:function(sender)
	{
		// confirm
		var confirmContent = null;
		if(this.selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID && this.selectedOrder[ORDER_STATUS] === ORDER_STATUS_ACTIVE)
			confirmContent = FWLocalization.text("TXT_ORDER_SKIP_PAID");//confirmContent = cc.formatStr(FWLocalization.text("TXT_ORDER_SKIP_PAID"), this.selectedOrder[ORDER_PRICE]);
		else if(this.selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID || this.selectedOrder[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_FREE)
			confirmContent = FWLocalization.text("TXT_ORDER_SKIP_DAILY");
		// feedback: no confirmation for normal order
		//else
		//	confirmContent = FWLocalization.text("TXT_ORDER_SKIP_NORMAL");
	
		if(confirmContent)
			Game.showPopup0("", confirmContent, null, function() {Orders.onConfirmCancelOrder(sender);}, true, "TXT_OK");
		else
			Orders.onConfirmCancelOrder(sender);
	},
	
	onConfirmCancelOrder:function(sender)
	{
		// disable button so user cannot click multiple times
		FWUI.setWidgetEnabled(sender, false);
		
		// fake: inc daily order counter
		if(this.selectedOrder.isDaily)
			gv.userData.game[GAME_ORDER][ORDER_MANAGER_NUM_DAILY]++;
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestOrderCancel);
		pk.pack(this.selectedOrder[ORDER_ID]);
		network.connector.client.sendPacket(pk);
	},	
	
	onBuyOrder:function(sender)
	{
		if(this.selectedOrder.isWaiting)
		{
			// skip time
			if(Game.consumeDiamond(this.skipTimeData.diamond, FWUtils.getWorldPosition(sender)) === true)
			{
				// fake
				this.selectedOrder[ORDER_TIME] = 0;
				this.show(this.selectedOrder[ORDER_ID]);
				AudioManager.effect (EFFECT_GOLD_PAYING);
				
				// server
				var pk = network.connector.client.getOutPacket(this.RequestOrderSkipTime);
				pk.pack(this.selectedOrder[ORDER_ID], this.skipTimeData.diamond);
				network.connector.client.sendPacket(pk);
			}
		}
		else
		{
			// buy order
			if(Game.consumeDiamond(this.selectedOrder[ORDER_PRICE], FWUtils.getWorldPosition(sender)) === true)
			{
				// fake
				this.selectedOrder[ORDER_STATUS] = ORDER_STATUS_ACTIVE;
				this.show(this.selectedOrder[ORDER_ID]);
				AudioManager.effect (EFFECT_GOLD_PAYING);

				// server
				var pk = network.connector.client.getOutPacket(this.RequestOrderActive);
				pk.pack(this.selectedOrder[ORDER_ID], this.selectedOrder[ORDER_PRICE]);
				network.connector.client.sendPacket(pk);
			}
		}
	},
	
	onReceiveRewards:function()
	{
		this.showDeliverRewards();

		// fake
		if (this.orderInProgress)
			this.removeOrder(this.orderInProgress[ORDER_ID]);
		this.orderInProgress = null;
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestOrderGetReward);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onFinishedBuyingMissingItems:function()
	{
		this.boughtItemToDeliver = true;
		this.show(this.selectedOrder[ORDER_ID]);
	},
	
	onDeliveryFinished:function()
	{
		this.owl.uninit();
		this.owl = null;
		
		// jira#4635: quick refresh
		if(this.pendingOrder !== null)
		{
			// feedback: quick refresh
			//this.onDeliver3(this.pendingOrder);
			this.initOwl(STATE_OWL_DELIVER);
			
			this.pendingOrder = null;
		}
		else if(FWUI.isShowing(UI_ORDER))
			this.show(this.selectedOrder[ORDER_ID]);
	},
	
	onDeliveryError:function()
	{
		// jira#5625
		if(gv.userData.game[GAME_ORDER][ORDER_MANAGER_DELIVERY][ORDER_SUB_TYPE] !== undefined)
		{
			this.orderInProgress = gv.userData.game[GAME_ORDER][ORDER_MANAGER_DELIVERY];
			this.updateOrderDisplayData(this.orderInProgress);
			return;
		}
			
		// stop owl
		if(this.owl)
		{
			this.owl.uninit();
			this.owl = null;
		}
		
		// revert, add items back to stock
		if(this.orderInProgress)
		{
			for(var i=0; i<this.orderInProgress.requireItems.length; i++)
				gv.userStorages.addItem(this.orderInProgress.requireItems[i].itemId, this.orderInProgress.requireItems[i].requireAmount);
		}
		
		// jira#5598
		this.orderInProgress = null;
		this.pendingOrder = null;
		
		// jira#6018
		// for some reason, stock does no longer match with server
		// disconnect => reconnect to reload all
		Game.gameScene.onReloadGame();
	},
	
	onEnableDeliverButton:function()
	{
		if(FWUI.isShowing(UI_ORDER))
			this.show(this.selectedOrder[ORDER_ID]);
	},
	
	onWaitTimeEnded:function(sender)
	{
		this.show(sender.uiData[ORDER_ID]);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// owl ////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	initOwl:function(state)
	{
		if(this.owl === null)
		{
			this.owl = new Owl();
			this.owl.init();
		}
		this.owl.setState(state);
	},
	
	showDroppingDeliverItems:function()
	{
		if(this.orderInProgress)
		{
			var startPosition = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
			for(var i=0; i<this.orderInProgress.requireItems.length; i++)
				FWUtils.showFlyingItemIcon(this.orderInProgress.requireItems[i].itemId, -this.orderInProgress.requireItems[i].requireAmount, startPosition, undefined, i * 0.2, false, {zOrder:Z_OWL + 1, duration:0.5});
		}
		
		if(FWUI.isShowing(UI_ORDER))
			this.show(this.selectedOrder ? this.selectedOrder[ORDER_ID] : -1);
	},
	
	showDeliverRewards:function()
	{
		// feedback: duplicate rewards for better feeling
		//var startPosition = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
		//for(var i=0; i<this.orderInProgress.rewards.length; i++)
		//	FWUtils.showFlyingItemIcon(this.orderInProgress.rewards[i].itemId, this.orderInProgress.rewards[i].amount, startPosition, Game.getFlyingDestinationForItem(this.orderInProgress.rewards[i].itemId), i * 0.35);
	
		if(!this.orderInProgress)
			return;
	
		var pos = {getPosition:function()
		{
			if(!Orders.owl)
				return cc.p(-200, cc.winSize.height / 2);
			else
			{
				var pos = Orders.owl.fwObject.node.getPosition();
				pos.x += _.random(-25, 25);
				pos.y += _.random(-50, 0);
				return pos;
			}
		}};
		
		var delay = 0;
		var rewards = this.orderInProgress.rewards.concat(this.orderInProgress.rewards2);
		for(var i=0; i<rewards.length; i++)
		{
			var itemId = rewards[i].itemId;
			var amount = rewards[i].amount;
			var dest = Game.getFlyingDestinationForItem(itemId);
			if(itemId === ID_EXP || itemId === ID_GOLD)
			{
				var j = 0;
				var step = FWUtils.fastFloor(amount / 10);				
				if(step < 1)
					step = 1;
				while(amount > 0)
				{
					amount -= step;
					FWUtils.showFlyingItemIcon(itemId, amount > 0 ? step : amount + step, pos, dest, delay);
					j++;
					if(j >= 2)
					{
						j = 0;
						delay += 0.05;
					}
				}
			}
			else
			{
				FWUtils.showFlyingItemIcon(itemId, amount, pos, dest, delay);
				delay += 0.05;
			}
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestOrderDelivery:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ORDER_DELIVERY);},
		pack:function(orderId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, orderId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseOrderDelivery:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Orders.ResponseOrderDelivery: error=" + this.getError());
				gv.userData.game[GAME_ORDER] = object[KEY_ORDER];
				if(FWUI.isShowing(UI_ORDER))
					Orders.show(selectedOrder);
				else
					Game.refreshUIMain(RF_UIMAIN_ORDER);
				Orders.onDeliveryError();
			}
			else
			{
				var index = Orders.getOrderIndex(object[KEY_OLD_ORDER][ORDER_ID]);
				FWUtils.removeArrayElementByKeyValue(gv.userData.game[GAME_ORDER][ORDER_MANAGER_NORMAL], ORDER_ID, object[KEY_OLD_ORDER][ORDER_ID]);
				if((object[KEY_OLD_ORDER][ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_FREE || object[KEY_OLD_ORDER][ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_DAILY_PAID)
					&& object[KEY_SLOT_OBJECT][ORDER_SUB_TYPE] === undefined)
					{
						gv.userData.game[GAME_ORDER][ORDER_MANAGER_DAILY] = {};
						Game.refreshUIMain(RF_UIMAIN_ORDER);
					}
				else
					Orders.addOrder(object[KEY_SLOT_OBJECT], index);
				Orders.addOrder(Orders.orderInProgress);
				
				if(FWUI.isShowing(UI_ORDER))
				{
					var orders = gv.userData.game[GAME_ORDER][ORDER_MANAGER_NORMAL];
					var selectedOrder = (index >= 0 && index < orders.length ? orders[index][ORDER_ID] : -1);
					Orders.show(selectedOrder);
				}
				else
					Game.refreshUIMain(RF_UIMAIN_ORDER);
					
				// achievement
				Achievement.onAction(g_ACTIONS.ACTION_ORDER_DELIVERY.VALUE, null, 1);
				if(Orders.orderInProgress)
					Achievement.onAction(Orders.orderInProgress.isDaily ? g_ACTIONS.ACTION_ORDER_DAILY_DELIVERY.VALUE : g_ACTIONS.ACTION_ORDER_NORMAL_DELIVERY.VALUE, null, 1);
			}
		}
	}),
	
	RequestOrderActive:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ORDER_ACTIVE);},
		pack:function(orderId, price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_SLOT_ID, orderId);
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponseOrderActive:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() === 0)
			{
				var object = PacketHelper.parseObject(this);
				var index = Orders.getOrderIndex(object[KEY_SLOT_ID]);
				Game.updateUserDataFromServer(object);
				Orders.removeOrder(object[KEY_SLOT_ID]);
				Orders.addOrder(object[KEY_SLOT_OBJECT], index);
				Orders.show(object[KEY_SLOT_OBJECT][ORDER_ID]);
			}
			else
				cc.log("Orders.ResponseOrderActive: error=" + this.getError());
		}
	}),

	RequestOrderCancel:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ORDER_CANCEL);},
		pack:function(orderId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, orderId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseOrderCancel:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
			{
				cc.log("Orders.ResponseOrderCancel: error=" + this.getError());
				return;
			}
			
			var object = PacketHelper.parseObject(this);
			var index = Orders.getOrderIndex(object[KEY_SLOT_ID]);
			Game.updateUserDataFromServer(object);
			Orders.removeOrder(object[KEY_SLOT_ID]);
			Orders.addOrder(object[KEY_SLOT_OBJECT], index);
			Orders.show(object[KEY_SLOT_OBJECT][ORDER_ID]);

			//achievement
			Achievement.onAction(g_ACTIONS.ACTION_ORDER_CANCEL.VALUE, null, 1);
		}
	}),
	
	RequestOrderGetReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ORDER_GET_REWARD);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseOrderGetReward:fr.InPacket.extend
	({
		ctor: function () {this._super();},
		readData:function()
		{
			Game.updateUserDataFromServer(PacketHelper.parseObject(this));
			gv.userData.game[GAME_ORDER][ORDER_MANAGER_DELIVERY] = {};
			Orders.orderInProgress = null; // jira#4790: receive exp => level up => stuck
			if (this.getError() !== 0)
				cc.log("Orders.ResponseOrderGetReward: error=" + this.getError());
		}
	}),
	
	RequestOrderSkipTime:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ORDER_SKIP_TIME);},
		pack:function(orderId, price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_SLOT_ID, orderId);
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
};

network.packetMap[gv.CMD.ORDER_DELIVERY] = Orders.ResponseOrderDelivery;
network.packetMap[gv.CMD.ORDER_ACTIVE] = Orders.ResponseOrderActive;
network.packetMap[gv.CMD.ORDER_CANCEL] = Orders.ResponseOrderCancel;
network.packetMap[gv.CMD.ORDER_GET_REWARD] = Orders.ResponseOrderGetReward;
network.packetMap[gv.CMD.ORDER_SKIP_TIME] = Orders.ResponseOrderActive;
