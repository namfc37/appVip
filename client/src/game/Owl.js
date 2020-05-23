
const STATE_NONE = 0;
const STATE_OWL_DELIVER = 1;
const STATE_OWL_EXPLOITED_DELIVER = 2;
const STATE_OWL_RETURN = 3;
const STATE_OWL_RETURN2 = 4; // jira#4635 stopped moving, can touch to collect rewards
const STATE_OWL_FLY_AWAY = 5;

var Owl = cc.Class.extend
({
	fwObject: null,
	state: STATE_NONE,
	
	ctor:function()
	{
		this.fwObject = new FWObject();
	},
	
	init:function()
	{
		this.fwObject.initWithSpine(SPINE_OWL_TUTU);
		this.fwObject.setParent(Game.gameScene, Z_OWL);
		this.fwObject.setScale(OWL_SCALE);
		this.fwObject.setEventListener(null, this.onTouchEnded.bind(this));
		//this.fwObject.setNotifyBlockedTouch(true);
		
		cc.director.getScheduler().scheduleUpdateForTarget(this, UPDATE_PRIORITY_GAME_OBJECT, false);
	},
	
	uninit:function()
	{
		this.fwObject.uninit();
		cc.director.getScheduler().unscheduleUpdateForTarget(this);
		FWPool.returnNode(this);
	},
	
	setState:function(state, isTutorial)//web setState:function(state, isTutorial = false)
	{
		if(isTutorial === undefined)
			isTutorial = false;
		
		if(!isTutorial)
		{
			Tutorial.onGameEvent(EVT_OWL_STATE, state);
			if(Tutorial.currentStep
				&& (state === STATE_OWL_DELIVER && Tutorial.currentStep.id === TUTO_STEP_25_RED))
				{
					this.fwObject.setVisible(false);
					return; // wait until dialog finished
				}
		}
		
		this.fwObject.node.stopAllActions();
		if(state === STATE_OWL_DELIVER || state === STATE_OWL_EXPLOITED_DELIVER)
		{
			if(state === STATE_OWL_DELIVER)
				this.fwObject.setPosition(cc.winSize.width + 200, cc.winSize.height / 4);
			
			this.fwObject.setAnimation("free_fly", true);
			this.fwObject.setFlip(this.fwObject.getWorldPosition().x < cc.winSize.width / 2 ? true : false, false);
			this.fwObject.node.runAction(cc.sequence(
				cc.moveTo(1.3, cc.winSize.width / 2, cc.winSize.height / 2).easing(cc.easeSineOut()),
				cc.callFunc(function() {this.fwObject.setAnimation("free_stop", true);}.bind(this)), //cc.delayTime(1), // skipped due to incontinuous animation
				cc.delayTime(0.5),
				cc.callFunc(function() {this.fwObject.setAnimation("quest_stop", true); Orders.showDroppingDeliverItems();}.bind(this)),
				cc.delayTime(1),
				cc.callFunc(function() {this.fwObject.setAnimation("quest_fly", true); this.fwObject.setFlip(true, false);}.bind(this)),
				cc.moveTo(1.3, cc.winSize.width + 200, cc.winSize.height).easing(cc.easeSineIn()),
				cc.delayTime(1),
				cc.callFunc(function() {this.setState(STATE_OWL_RETURN);}.bind(this))
			));
			AudioManager.effect (EFFECT_OWL_FLY_AWAY);
		}
		else if(state === STATE_OWL_RETURN)
		{
			this.fwObject.setAnimation("gold_fly", true);
			this.fwObject.setPosition(cc.winSize.width + 200, cc.winSize.height);
			this.fwObject.setFlip(false, false);
			this.fwObject.node.runAction(cc.sequence
			(
				cc.callFunc(function() {AudioManager.effect (EFFECT_OWL_COLLECT);}.bind(this)),
				cc.moveTo(1.3, cc.winSize.width / 2, cc.winSize.height / 2).easing(cc.easeSineOut()),
				cc.callFunc(function() {this.setState(STATE_OWL_RETURN2);}.bind(this)),
				cc.callFunc(function() {this.fwObject.setAnimation("gold_stop", true);}.bind(this)),
				cc.callFunc(function() {Orders.onEnableDeliverButton();}) // jira#4679
			));
		}
		else if(state === STATE_OWL_FLY_AWAY)
		{
			this.fwObject.setAnimation("free_fly", true);
			this.fwObject.node.runAction(cc.sequence
			(
				cc.moveTo(1.3, -200, cc.winSize.height / 2).easing(cc.easeSineIn()),
				cc.callFunc(function() {Orders.onDeliveryFinished();})
			));
		}
			
		this.state = state;
	},
	
	update:function(dt)
	{
		// debug bounding boxes
		//if(DEBUG_BOUNDING_BOXES_ZORDER > 0)
			//this.fwObject.drawBoundingBoxes();
	},
	
	onTouchBegan:function(touch, sender)
	{
		cc.log("Owl::onTouchBegan");
		//Game.onGameObjectEvent_touchBegan(this, sender);
		return true;
	},
	
	onTouchEnded:function(touch, sender)
	{
		cc.log("Owl::onTouchEnded");
		//Game.onGameObjectEvent_touchEnded(this, sender);
		
		if(this.state === STATE_OWL_RETURN2)
		{
			this.setState(STATE_OWL_FLY_AWAY);
			Orders.onReceiveRewards();
		}
	},
});
