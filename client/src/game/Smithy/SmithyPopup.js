const SMITHY_TAB_FORGE_ID = 0;
const SMITHY_TAB_POWER_ID = 1;

const SMITHY_MATERIAL_MIN = 2;
const SMITHY_MATERIAL_MAX = 6;

const SMITHY_FORGE_POT_SIZE = 110;
const SMITHY_FORGE_MATERIAL_POT_SIZE = 110;
const SMITHY_FORGE_MATERIAL_PRODUCT_SIZE = 88;

const SMITHY_SCALE_POT_NORMAL = 0.9;
const SMITHY_SCALE_POT_LARGE = 1.3;
const SMITHY_SCALE_POT_EXTRA_LARGE = 2.0;

const SMITHY_SCALE_MATERIAL = 0.45;
const SMITHY_SCALE_ITEM = 0.65;

const SMITHY_ITEM_SELECTOR_POT = "pot";
const SMITHY_ITEM_SELECTOR_GRASS = "grass";
const SMITHY_ITEM_SELECTOR_GLOVE = "glove";

const SMITHY_FRAME_TEX = "hud/hud_blacksmith_frame_normal_1.png";
const SMITHY_FRAME_ACTIVE_TEX = "hud/hud_blacksmith_frame_active_1.png";

const SMITHY_BAR_VER_TEX = "hud/hud_blacksmith_frame_normal_2.png";
const SMITHY_BAR_VER_ACTIVE_TEX = "hud/hud_blacksmith_frame_active_2.png";

const SMITHY_BAR_HOR_TEX = "hud/hud_blacksmith_frame_normal_3.png";
const SMITHY_BAR_HOR_ACTIVE_TEX = "hud/hud_blacksmith_frame_active_3.png";

const SMITHY_ANIM_TALK = "npc_talk";
const SMITHY_ANIM_WORKING = "npc_working";

var SmithyPopup = cc.Node.extend({
	LOGTAG: "[SmithyPopup]",

	ctor: function () {
		this._super();
		this.listPotSet = g_BLACKSMITH.SPECIAL_SETS;
	},

	onEnter: function () {
		this._super();
	},

	onExit: function () {
		this._super();
	},

	initForgePage: function (page) {

		// init pot sets

		this.panelPotSet = FWUI.getChildByName(page, "panelPotSet");
if(cc.sys.isNative)
		this.panelPotSet.setDirection(ccui.PageView.DIRECTION_HORIZONTAL);
		this.panelPotSet.setCustomScrollThreshold(SMITHY_FORGE_POT_SIZE * 0.8);
		this.panelPotSet.setUsingCustomScrollThreshold(true);

		this.listPot = [];
		this.listPotItem = [];
		for (var setId in this.listPotSet) {
			var potList = this.listPotSet[setId].map(function(potId) {//web
				var potDefine = defineMap[potId];
				this.listPot.push({
					potId: potId,
					potLevel: potDefine.LEVEL_UNLOCK,
				});
				return {
					potId: potId,
					potLevel: potDefine.LEVEL_UNLOCK,
					potLevelText: (!gv.userData.isEnoughLevel(potDefine.LEVEL_UNLOCK)) ? cc.formatStr(FWLocalization.text("TXT_LV"), potDefine.LEVEL_UNLOCK) : ""
				}
			}.bind(this));

			var potDefine = {
				iconPot: { type: UITYPE_SPINE, field: "potId", scale: SMITHY_SCALE_POT_NORMAL, anim: "pot_icon_small", subType: defineTypes.TYPE_POT },
				iconCheck: { visible: false },
				textLevel: { type: UITYPE_TEXT, field: "potLevelText", style: TEXT_STYLE_TEXT_NORMAL },
				container: { onTouchBegan:this.showItemHint.bind(this),onTouchEnded: this.onPotTouched.bind(this),onDrop: this.onPotTouched.bind(this),forceTouchEnd: true, notifyBlockedTouch: true },
			};

			var container = new ccui.Layout();
			this.panelPotSet.addPage(container);

			container.setContentSize(cc.size(SMITHY_FORGE_POT_SIZE * 6, SMITHY_FORGE_POT_SIZE));
			container.setPosition(cc.p(0, 0));

			FWUI.fillData_2dlist(container, null, {
				items: potList,
				itemUI: UI_SMITHY_POT,
				itemDef: potDefine,
				itemSize: cc.size(SMITHY_FORGE_POT_SIZE, SMITHY_FORGE_MATERIAL_POT_SIZE)
			});

			var pots = container.getChildren();
			for (var i = 0; i < pots.length; i++)
				this.listPotItem.push(pots[i]);
		}

if(cc.sys.isNative)
		this.panelPotSet.setCurPageIndex(0);
else
		this.panelPotSet.scrollToPage(0);//web this.panelPotSet.setCurPageIndex(0);

		// init misc

		var uiDefine = {
			textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_SMITHY_POT_MATERIAL"), style: TEXT_STYLE_TEXT_NORMAL },
			textGrassDesc: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_SMITHY_POT_RATE"), style: TEXT_STYLE_TEXT_NORMAL },
			textGrassValue: { type: UITYPE_TEXT, id: FWLocalization.text("0%"), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
			textVipValue: { type: UITYPE_TEXT, id: FWLocalization.text("+0%"), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
			textGloveDesc: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_SMITHY_POT_KEEP"), style: TEXT_STYLE_TEXT_NORMAL },
			textGloveValue: { type: UITYPE_TEXT, id: FWLocalization.text("0%"), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
			textPrice: { type: UITYPE_TEXT, id: "0", style: TEXT_STYLE_NUMBER },
			slotItemGrass: { onTouchBegan:this.showItemHint.bind(this),onTouchEnded: this.onSlotItemGrassTouched.bind(this), dropTag: SMITHY_ITEM_SELECTOR_GRASS ,onDrop: this.onSlotItemGrassTouched.bind(this),forceTouchEnd: true,},
			slotItemGlove: {onTouchBegan:this.showItemHint.bind(this), onTouchEnded: this.onSlotItemGloveTouched.bind(this), dropTag: SMITHY_ITEM_SELECTOR_GLOVE,onDrop: this.onSlotItemGloveTouched.bind(this),forceTouchEnd: true, },
			buttonExecute: { onTouchEnded: this.onButtonExecuteTouched.bind(this) }
		};

		FWUI.fillData(page, null, uiDefine);

		this.panelPot = FWUI.getChildByName(page, "panelPot");

		this.panelPotFrame = FWUI.getChildByName(page, "panelPotFrame");
		this.panelGemFrame = FWUI.getChildByName(page, "panelGemFrame");
		this.panelMineralFrame = FWUI.getChildByName(page, "panelMineralFrame");

		this.slotMain = FWUI.getChildByName(page, "slotMain");
		this.slotItemGrass = FWUI.getChildByName(page, "slotItemGrass");
		this.slotItemGlove = FWUI.getChildByName(page, "slotItemGlove");

		this.barCenter = FWUI.getChildByName(page, "barCenter");

		this.barLeft = FWUI.getChildByName(page, "barLeft");
		this.barRight = FWUI.getChildByName(page, "barRight");
		this.barLeftActive = FWUI.getChildByName(page, "barLeftActive");
		this.barRightActive = FWUI.getChildByName(page, "barRightActive");
		this.barLeftLong = FWUI.getChildByName(page, "barLeftLong");
		this.barRightLong = FWUI.getChildByName(page, "barRightLong");

		this.iconItemGrass = FWUI.getChildByName(page, "iconItemGrass");
		this.iconItemGlove = FWUI.getChildByName(page, "iconItemGlove");

		this.buttonAddItemGrass = FWUI.getChildByName(page, "buttonAddItemGrass");
		this.buttonAddItemGlove = FWUI.getChildByName(page, "buttonAddItemGlove");

		this.textPrice = FWUI.getChildByName(page, "textPrice");
		this.textGrassValue = FWUI.getChildByName(page, "textGrassValue");
		this.textGloveValue = FWUI.getChildByName(page, "textGloveValue");


		this.textVipValue = FWUI.getChildByName(page,"textVipValue");
		this.imgIconBuffVip = FWUI.getChildByName(page,"imgIconBuffVip");

		this.textGrassDesc = FWUI.getChildByName(page, "textGrassDesc");
		this.textGloveDesc = FWUI.getChildByName(page, "textGloveDesc");

		this.buttonExecute = FWUI.getChildByName(page, "buttonExecute");
		this.iconGold = FWUI.getChildByName(page, "iconGold");

		// init bar light

		var barHorScaleX = 1.1;
		var barVerScaleY = 1.0;

		this.barCenterLiquid = new FWObject();
		this.barCenterLiquid.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.barCenterLiquid.setAnimation("effect_line_arrow_1", true);
		this.barCenterLiquid.setPosition(cc.p(this.barCenter.width * 0.5, this.barCenter.height * 0.5 - 5));
		this.barCenterLiquid.setScale(1.0, barVerScaleY);
		this.barCenterLiquid.setParent(this.barCenter);

		this.barLeftLiquid = new FWObject();
		this.barLeftLiquid.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.barLeftLiquid.setAnimation("effect_line_arrow_2", true);
		this.barLeftLiquid.setPosition(cc.p(this.barLeftActive.width * 0.5 - 25, this.barLeftActive.height * 0.5));
		this.barLeftLiquid.setScale(barHorScaleX, 1.0);
		this.barLeftLiquid.setParent(this.barLeftActive);

		this.barRightLiquid = new FWObject();
		this.barRightLiquid.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.barRightLiquid.setAnimation("effect_line_arrow_2", true);
		this.barRightLiquid.setPosition(cc.p(this.barRightActive.width * 0.5 + 25, this.barRightActive.height * 0.5));
		this.barRightLiquid.setScale(-barHorScaleX, 1.0);
		this.barRightLiquid.setParent(this.barRightActive);

		this.barLeftLongLiquid = new FWObject();
		this.barLeftLongLiquid.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.barLeftLongLiquid.setAnimation("effect_line_arrow_2", true);
		this.barLeftLongLiquid.setPosition(cc.p(this.barLeftLong.width * 0.5, this.barLeftLong.height * 0.5));
		this.barLeftLongLiquid.setScale(barHorScaleX, 1.0);
		this.barLeftLongLiquid.setParent(this.barLeftLong);

		this.barRightLongLiquid = new FWObject();
		this.barRightLongLiquid.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.barRightLongLiquid.setAnimation("effect_line_arrow_2", true);
		this.barRightLongLiquid.setPosition(cc.p(this.barRightLong.width * 0.5, this.barRightLong.height * 0.5));
		this.barRightLongLiquid.setScale(-barHorScaleX, 1.0);
		this.barRightLongLiquid.setParent(this.barRightLong);

		// init pot light

		this.potSlot = FWUI.getChildByName(page, "slotMain");
		this.potSpine = FWUI.getChildByName(page, "potSpine");
		this.potSpine.originalPosition = this.potSpine.getPosition();
		this.potSpine.originalZOrder = this.potSpine.getLocalZOrder();
		this.potSpine.originalParent = this.potSpine.getParent();

		var potLightContainer = FWUI.getChildByName(page, "potLight");
		if (!this.potLight) {
			this.potLight = new FWObject();
			this.potLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
			this.potLight.setAnimation("effect_light_icon", true);
			this.potLight.setScale(1.2);
			this.potLight.setParent(potLightContainer);
			this.potLight.setPosition(cc.p(0, 0));
			this.potLight.setVisible(false);
		}

		this.textHint = FWUI.getChildByName(this.widget, "textHint");
		this.panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
		this.panelNPC.setLocalZOrder(1000);

		this.npc_talk = FWUI.getChildByName(this.panelNPC, "NPC_taking");
		this.npc_working = FWUI.getChildByName(this.panelNPC, "NPC_working");
		
		if (!this.npcSmithy)
		{
			this.npcSmithy = new FWObject();
			this.npcSmithy.initWithSpine(SPINE_NPC_BLACKSMITH);
			this.npcSmithy.setAnimation(SMITHY_ANIM_TALK, true);
			this.npcSmithy.setParent(this.npc_talk);
		}

		if (!this.npcSmithyWorking)
		{
			this.npcSmithyWorking = new FWObject();
			this.npcSmithyWorking.initWithSpine(SPINE_NPC_BLACKSMITH);
			this.npcSmithyWorking.setAnimation(SMITHY_ANIM_WORKING, true);
			this.npcSmithyWorking.setParent(this.npc_working);
			this.npcSmithyWorking.setVisible(false);//web this.npcSmithyWorking.setOpacity (0);
		}

		// init pot reward

		if (!this.potEffectStart) {
			this.potEffectStart = new FWObject();
			this.potEffectStart.initWithSpine(SPINE_EFFECT_UNLOCK);
			this.potEffectStart.setPosition(cc.PADD(FWUtils.getWorldPosition(this.potSpine), cc.p(0, -100)));
			this.potEffectStart.setLocalZOrder(999);
			this.potEffectStart.setVisible(false);
			this.potEffectStart.setParent (this.panelNPC, 3);
		}

		if (!this.potEffectEnd) {
			this.potEffectEnd = new FWObject();
			this.potEffectEnd.initWithSpine(SPINE_EFFECT_POT_SLOT);
			this.potEffectEnd.setPosition(FWUtils.getWorldPosition(this.potSpine));
			this.potEffectEnd.setLocalZOrder(998);
			this.potEffectEnd.setVisible(false);
			this.potEffectEnd.setParent (this.panelNPC, 3);
			this.potEffectEnd.setScale(1); // jira#5566
		}

		if (!this.panelReward) {

			this.panelReward = FWPool.getNode(UI_REWARD);
			this.panelReward.setVisible(false);
			this.panelReward.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
			this.panelReward.setLocalZOrder(999);
			this.widget.addChild(this.panelReward);

			if (!this.particleReward) {
				this.particleReward = new cc.ParticleSystem("effects/particle_congrats.plist");
				this.particleReward.setDuration(-1);
				this.particleReward.setTotalParticles(15);
				this.particleReward.setPosVar(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.25));
				this.particleReward.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 1.25);
				this.panelReward.addChild(this.particleReward);
			}

			FWUI.fillData(this.panelReward, null, {
				buttonClose: { onTouchEnded: this.onRewardItemTouched.bind(this) }
			});
		}
	},

	initPowerPage: function (page) {

		var uiDefine = {
		};

		FWUI.fillData(page, null, uiDefine);
	},

	show: function () {
		cc.log(this.LOGTAG, "show");

		if (!FWUI.isShowing(UI_SMITHY_MAIN))
		{
			this.widget = FWPool.getNode(UI_SMITHY_MAIN, false);
			if (this.widget)
			{
				// init tab buttons

				if (!this.listTab) {

					this.listTab = this.listTab || {};
					var panelContent = FWUI.getChildByName(this.widget, "panelContent");

					var tabNames = [{ id: SMITHY_TAB_FORGE_ID, name: "Forge", template: UI_SMITHY_FORGE }, { id: SMITHY_TAB_POWER_ID, name: "Power", template: "" }];
					tabNames.forEach(function(tabData) {//web

						var tabButtonInactive = FWUI.getChildByName(this.widget, cc.formatStr("tab%s", tabData.name));
						var tabButtonActive = FWUI.getChildByName(this.widget, cc.formatStr("tab%sActive", tabData.name));

						tabButtonInactive.index = tabData.id;
						tabButtonActive.index = tabData.id;

						var tabPage = (tabData.template !== "") ? FWPool.getNode(tabData.template, false) : new cc.Node();
						panelContent.addChild(tabPage);

						if (tabData.id === SMITHY_TAB_FORGE_ID)
							this.initForgePage(tabPage);
						else if (tabData.id === SMITHY_TAB_POWER_ID)
							this.initPowerPage(tabPage);

						this.listTab[tabData.id] = {
							tabButton: {
								active: tabButtonActive,
								inactive: tabButtonInactive
							},
							tabPage: tabPage
						};
					}.bind(this));
				}

				// fill data main

				var uiDefine = {
					textHint: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_DIALOG },
					textForge: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_SMITHY_FORGE"), style: TEXT_STYLE_TEXT_NORMAL },
					textPower: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_SMITHY_POWERUP"), style: TEXT_STYLE_TEXT_NORMAL },
					tabForge: { onTouchEnded: this.onTabTouched.bind(this) },
					tabPower: { onTouchEnded: this.onTabTouched.bind(this) },
					tabForgeInactive: { onTouchEnded: this.onTabTouched.bind(this) },
					tabPowerInactive: { onTouchEnded: this.onTabTouched.bind(this) },
					buttonBack: { onTouchEnded: this.onButtonCloseTouched.bind(this) }
				};

				FWUI.fillData(this.widget, null, uiDefine);
			}

			FWUI.setWidgetCascadeOpacity(this.widget, true);
			FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
			this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755

			this.data = {
				selectedPot: null,
				selectedPotSet: null,
				selectedPotCombine: null,
				selectedGrass: null,
				selectedGlove: null,
				materials: []
			};

			this.updateForge();
			this.updateMaterials();
			this.updateItems();

			this.selectTab(SMITHY_TAB_FORGE_ID);

			var selectPot = this.listPot.find(function(item) {return gv.userData.isEnoughLevel(item.potLevel);});//web
			if (selectPot)
				this.selectPot(selectPot.potId);
				
			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {return this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
	},

	hide: function () {
		if(this.isBusy)
			return true;
		
		FWUI.hideWidget(this.widget, UIFX_NONE);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		// jira#5218
		FWUI.droppables = {};
	},

	showSelector: function (type, position, reset) {//web showSelector: function (type, position, reset = true) {

		if(reset === undefined)
			reset = true;
		
		var isLeft = position.x < cc.winSize.width * 0.5;

		this.selector = FWPool.getNode(UI_SMITHY_SELECTOR, false);

		this.selectorMenu = FWUI.getChildByName(this.selector, "panelMenu");
		this.selectorList = FWUI.getChildByName(this.selector, "panelItems");

		this.selectorTextPage = FWUI.getChildByName(this.selector, "textPage");
		this.selectorButtonPage = FWUI.getChildByName(this.selector, "buttonPage");
		this.selectorButtonPagePrev = FWUI.getChildByName(this.selector, "buttonPagePrev");
		this.selectorButtonPageNext = FWUI.getChildByName(this.selector, "buttonPageNext");

		var panelFrame = FWUI.getChildByName(this.selector, "panelFrame");
		panelFrame.setFlippedX(!isLeft);

		var menuPosition = (isLeft) ? cc.p(position.x, position.y - this.selectorMenu.height - 20) : cc.p(position.x - this.selectorMenu.width, position.y - this.selectorMenu.height - 20);
		this.selectorMenu.setPosition(menuPosition);

		this.selectorGrid = (isLeft) ? [[1,0], [2,0], [0,1], [1,1], [2,1]] : [[0,0], [1,0], [0,1], [1,1], [2,1]];

		var uiDefine = {
			iconDrop: { position: position, visible: type === SMITHY_ITEM_SELECTOR_POT },
			iconAdd: { position: position },
			container: { onTouchEnded: function (sender) {
				this.hideSelector();
			}.bind(this)}
		};

		if (!FWUI.isShowing(UI_SMITHY_SELECTOR)) {

			FWUI.fillData(this.selectorMenu, null, {
				arrowLeft: { visible: isLeft },
				arrowRight: { visible: !isLeft },
				textPage: { type: UITYPE_TEXT, style: TEXT_STYLE_NUMBER, value: "0/0" },
				buttonPage: { visible: true, onTouchEnded: this.onButtonSelectorPageSwitchTouched.bind(this) },
				buttonPagePrev: { visible: true, onTouchEnded: this.onButtonSelectorPagePrevTouched.bind(this) },
				buttonPageNext: { visible: true, onTouchEnded: this.onButtonSelectorPageNextTouched.bind(this) }
			});

			FWUI.fillData(this.selector, null, uiDefine);
			FWUI.showWidget(this.selector, FWUtils.getCurrentScene(), UIFX_NONE);
			this.selector.setLocalZOrder(Z_UI_COMMON + 1); // jira#4755

			var buttonPage = FWUI.getChildByName(this.selectorMenu, "buttonPage");
			buttonPage.setZoomScale(0);

			this.updateSelector(type);

			if (reset)
				this.selectSelectorPage(0);
			else
				this.updateSelectorPage();
			
			if(!this.hideFunc2)
				this.hideFunc2 = function() {this.hideSelector()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc2);
		}
	},

	itemSort: function (a, b)
	{
		if (a.itemAmount < 1 && b.itemAmount > 0)	return 1;
		if (a.itemAmount > 0 && b.itemAmount < 1)	return -1;
		if (a.itemId > b.itemId)					return 1;
		if (a.itemId < b.itemId)					return -1;
													return 0;
	},

	updateSelector: function (type) {

		var itemList = [];
		var itemDefine = {};
		var itemUI = "";

		switch (type)
		{
			case SMITHY_ITEM_SELECTOR_POT:
			{
				for (var potId in g_BLACKSMITH.MATERIAL_POT_RATE)
				{
					var usedCount = this.data.materials.reduce(function(accumulator, value) { return accumulator + ((value === potId) ? 1 : 0); }, 0);//web
					var leftCount = Math.max(gv.userStorages.getItemAmount(potId) - usedCount, 0);
					itemList.push({
						itemId: potId,
						itemAmount: leftCount
					});
				}
				itemList.sort (this.itemSort);
	
				itemDefine = {
					ItemSprite: { visible: false },
					ItemSpine: { type: UITYPE_SPINE, field: "itemId", scale: SMITHY_SCALE_POT_NORMAL, anim: "pot_icon_small", subType: defineTypes.TYPE_POT, visible: true, locked: "data.itemAmount < 1"},
					Amount: { type: UITYPE_TEXT, field: "itemAmount", format: "x%s", style: TEXT_STYLE_NUMBER, visible: "data.itemAmount > 0"},
					UIItem: {
						// dragTag: type,
						// dropOnMove: false,
						onTouchBegan: this.onMaterialPotDropBegan.bind(this),
						onTouchEnded: this.onMaterialPotDropEnded.bind(this),
						onTouchHold:  this.showItemHint.bind(this),
						isCallBackTouchCancel:true,
						callBackTouchCancel: this.hideItemHint.bind(this),
						// onDrop: this.onMaterialPotDropped.bind(this)
					},
				};
				
				itemUI = UI_ITEM_NO_BG;
			}
			break;

			case SMITHY_ITEM_SELECTOR_GRASS:
			case SMITHY_ITEM_SELECTOR_GLOVE:
			{
				var sourceItems = (type === SMITHY_ITEM_SELECTOR_GRASS) ? g_BLACKSMITH.BONUS_RATE_VIOLET_GRASS : g_BLACKSMITH.GLOVES_RATE;
				var selectedItem = (type === SMITHY_ITEM_SELECTOR_GRASS) ? this.data.selectedGrass : this.data.selectedGlove;
	
				for (var itemId in sourceItems)
				{
					var usedCount = (selectedItem === itemId) ? 1 : 0;
					var leftCount = Math.max(gv.userStorages.getItemAmount(itemId) - usedCount, 0);
					var itemGfx = Game.getItemGfxByDefine(itemId);
					itemList.push({
						itemId: itemId,
						itemType: type,
						itemIcon: itemGfx.sprite,
						itemIconScale: itemGfx.scale,
						itemAmount: leftCount
					});
				}
				itemList.sort (this.itemSort);
	
				itemDefine = {
					slot: { visible: false },
					icon: { type: UITYPE_IMAGE, field: "itemIcon", scale: SMITHY_SCALE_ITEM, visible: true, locked: "data.itemAmount == 0" },
					textAmount: { type: UITYPE_TEXT, field: "itemAmount", format: "x%s", style: TEXT_STYLE_NUMBER, visible: "data.itemAmount > 0", position: cc.p (95, 10) },
					textRequire: { visible: false },
					iconAdd: { visible: "data.itemAmount == 0", onTouchEnded: this.onSupportItemDropEnded.bind(this)},
					container: {
						// dragTag: type,
						// dropOnMove: false,
						onTouchBegan: this.onSupportItemDropBegan.bind(this),
						onTouchEnded: this.onSupportItemDropEnded.bind(this),
						onTouchHold:  this.showItemHint.bind(this),
						isCallBackTouchCancel:true,
						callBackTouchCancel: this.hideItemHint.bind(this),
						//forceTouchEnd: true,
						// onDrop: this.onSupportItemDropped.bind(this)
					},
				};

				itemUI = UI_SMITHY_MATERIAL_PRODUCT;
			}
			break;
		}
		
		var panelItems = FWUI.getChildByName(this.selectorMenu, "panelItems");
		panelItems.removeAllChildren();

		if (this.selectorMenu)
        {
			FWUI.fillData(this.selectorMenu, null, {
				panelItems: {
					type: UITYPE_2D_LIST,
					items: itemList,
					itemUI: itemUI,
					itemDef: itemDefine,
					itemSize: cc.size(100, 100),
					itemsPerPage: 5,
					itemBackground: "#hud/menu_list_slot.png",
					itemsPosition: this.selectorGrid
				}
			});
		}
	},

	selectSelectorPage: function (page, offset) {//web selectSelectorPage: function (page, offset = 0) {
		
		if(offset === undefined)
			offset = 0;

		if (page !== null && page >= 0)
			this.selectorList.uiPageText = FWUI.set2dlistPage(this.selectorList, page);
		else if (offset !== 0)
			this.selectorList.uiPageText = FWUI.set2dlistPage(this.selectorList, offset, true);

		// apply greyscale for empty items

		var pageItems = this.selectorList.getChildren();
		for (var i = 0; i < pageItems.length; i++) {

			if (!pageItems[i].uiData)
				continue;

			var itemSpine = FWUI.getChildByName(pageItems[i], "ItemSpine");
			var itemSprite = FWUI.getChildByName(pageItems[i], "ItemSprite");
			var amount = pageItems[i].uiData.itemAmount;
			var isGreyScale = amount <= 0;

			if (itemSpine && itemSpine.isVisible())
				FWUtils.applyGreyscaleSpine(itemSpine, isGreyScale);

			if (itemSprite && itemSprite.isVisible())
				FWUtils.applyGreyscaleNode(itemSprite, isGreyScale);
		}

		this.updateSelectorPage();
	},

	updateSelectorPage: function () {

		var pageCount = this.selectorList.uiPagesCount;

		this.selectorButtonPage.setVisible(pageCount > 1);
		this.selectorButtonPagePrev.setVisible(pageCount > 1);
		this.selectorButtonPageNext.setVisible(pageCount > 1);

		this.selectorButtonPagePrev.setEnabled(pageCount > 1 && this.selectorList.uiCurrentPage > 0);
		this.selectorButtonPageNext.setEnabled(pageCount > 1 && this.selectorList.uiCurrentPage < pageCount - 1);

		this.selectorTextPage.setString(this.selectorList.uiPageText);
	},

	hideSelector: function () {
		if (this.selector)
		{
			FWUI.hideWidget(this.selector, UIFX_NONE);
			Game.gameScene.unregisterBackKey(this.hideFunc2);
		}
	},

	showReward: function (potId, potPosition)
	{
		cc.log(this.LOGTAG, "showReward:", "potId:", potId);
		if (!this.panelReward)
			return;

		this.rewardId = potId;
		this.rewardPosition = potPosition;

		var uiDefine =
		{
			textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_SMITHY_FORGE_SUCCESS"), style: TEXT_STYLE_TEXT_NORMAL },
			textTitleDetail:
			{
				type: UITYPE_TEXT,
				id: cc.formatStr(FWLocalization.text("TXT_SMITHY_POT_NAME"), Game.getItemName(defineMap[potId].ID)),
				style: TEXT_STYLE_TEXT_NORMAL_GREEN
			},
			textDesc:
			{
				type: UITYPE_TEXT,
				id: FWLocalization.text("TXT_WHEEL_REWARD_HINT"),
				style: TEXT_STYLE_TEXT_NORMAL
			},
			textAmount: { type: UITYPE_TEXT, value: "" },
			itemTouch: { onTouchEnded: this.onRewardItemTouched.bind(this) },
			container: { onTouchEnded: function () {} },
			cloudBottom:{visible:false},
			cloudTop:{visible:false},
		};

		this.panelReward.removeChildByName("itemIcon");
		this.panelReward.removeChildByName("textMessage");
		FWUI.fillData(this.panelReward, null, uiDefine);

		var itemLight = FWUI.getChildByName(this.panelReward, "itemLight");
		if (!this.rewardLight)
		{
			this.rewardLight = new FWObject();
			this.rewardLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
			this.rewardLight.setAnimation("effect_light_icon", true);
			this.rewardLight.setScale(1.5);
			this.rewardLight.setParent(itemLight);
			this.rewardLight.setPosition(cc.p(0, 0));
		}

		var itemGfx = Game.getItemGfxByDefine(potId);
		var itemSpine = FWUI.getChildByName(this.panelReward, "itemSpine");
		if (itemSpine)
		{
			FWUI.fillData_spine2(itemSpine, itemGfx.spine, itemGfx.skin || "", itemGfx.anim || "", 1.0);

			itemSpine.originalScale = itemSpine.getScale();
			itemSpine.originalPosition = itemSpine.getPosition();

			var itemAction = cc.sequence(
				cc.show(),
				cc.place(potPosition),
				cc.spawn(
					new cc.EaseSineOut(cc.scaleTo(0.3, SMITHY_SCALE_POT_EXTRA_LARGE * 1.5)),
					new cc.EaseSineOut(cc.moveTo(0.3, itemSpine.originalPosition)), cc.fadeIn(0.3)
				),
				new cc.EaseExponentialIn(cc.scaleTo(0.3, SMITHY_SCALE_POT_EXTRA_LARGE))
			);

			itemSpine.runAction(itemAction);
			itemSpine.setVisible(itemGfx.spine !== undefined);

			this.rewardPosition = itemSpine.originalPosition;
		}

		var children = this.panelReward.getChildren();
		for (var i = 0; i < children.length; i++)
		{
			if (children[i].name !== "itemSpine") {
				//web children[i].setOpacity(0);
				children[i].setVisible(false);
				children[i].runAction(cc.sequence(cc.delayTime(0.5), cc.show(), cc.fadeIn(0.3)));
			}
		}

		// moved to Game.js
		/*var x = 200;
		var y = cc.winSize.height * 0.33;
		var w = cc.winSize.width - 400;
		var h = cc.winSize.height * 0.5;

		var firework = (obj) =>
		{
			var play = cc.callFunc(() =>
			{
				obj.setPosition (cc.p(Math.random() * w + x, Math.random() * h + y));
				obj.setAnimation("animation", false, () => firework(obj));
			});

			this.panelReward.runAction (cc.sequence(cc.delayTime(Math.random() * 3), play));
		};

		var firework_objs = [];
		for (var i = 0; i < 6; i++)
		{
			var effect = new FWObject();
			effect.initWithSpine(SPINE_EFFECT_FIREWORK);
			effect.setParent(this.panelReward, 0);
			effect.setScale (0.6);
			effect.node.setTimeScale (1.5);

			firework_objs.push (effect);
			firework (effect);
		}*/
		Game.showFireworks(this.panelReward);

		this.panelReward.setVisible(true);
	},

	hideReward: function () {
		cc.log(this.LOGTAG, "hideReward");

		if (this.panelReward)
		{
			this.panelReward.setVisible(false);
			this.panelReward.stopAllActions();
		}

		if (this.rewardId) {
			gv.popup.showFlyingReward([{
				itemId: this.rewardId,
				itemPosition: this.rewardPosition,
				itemAmount: 1
			}]);
		}
	},

	showEffect: function (isSuccess, callback)//web showEffect: function (isSuccess, callback = null)
	{
		if(callback === undefined)
			callback = null;
		
		this.isBusy = true;
		var endEffect = isSuccess ? "effect_pot_upgrade_success_2" : "effect_pot_upgrade_fail";
		var endSound = isSuccess ? EFFECT_UPGRADE_SUCCESS_2 : EFFECT_UPGRADE_FAIL_2;

		var pharse1 = cc.callFunc(function() //web
		{
			FWUtils.changeParent(this.potSpine, this.panelNPC, 2);
			this.potSpine.setPosition(cc.p (this.potSpine.originalPosition.x + 284, this.potSpine.originalPosition.y));
			this.potSpine.setVisible(false);//web this.potSpine.setOpacity(0);
			
			FWUtils.showDarkBg(this.panelNPC, 1, "darkBg", 220);
			this.npcSmithyWorking.setVisible(true);//web this.npcSmithyWorking.setOpacity (255);
			this.npcSmithy.setVisible(false);//web this.npcSmithy.setOpacity (0);
		}.bind(this));

		var pharse2 = cc.callFunc(function() //web
		{
			this.potEffectStart.setVisible(true);
			this.potEffectStart.setAnimation("effect_unlock_pot_win", false, function()
			{
				this.potEffectStart.setVisible(false);
			}.bind(this));
			this.potEffectStart.setPosition(cc.p (this.potSpine.originalPosition.x + 284, this.potSpine.originalPosition.y - 100));
		}.bind(this));

		var pharse3 = cc.callFunc(function() //web
		{
			this.potSpine.setVisible(true);//web this.potSpine.setOpacity(255);
			this.npcSmithyWorking.setVisible(false);//web this.npcSmithyWorking.setOpacity (0);

			this.potEffectEnd.setVisible(true);
			this.potEffectEnd.setAnimation(endEffect, false, function()
			{
				this.potEffectEnd.setVisible(false);
			}.bind(this));
			this.potEffectEnd.setPosition(cc.p (this.potSpine.originalPosition.x + 284, this.potSpine.originalPosition.y));

			this.npcSmithy.setVisible(true);//web this.npcSmithy.setOpacity (255);
			if (!isSuccess)
				FWUtils.hideDarkBg(this.panelNPC);

			AudioManager.effect (endSound);
		}.bind(this));

		var pharse4 = cc.callFunc(function() //web
		{
			this.potSpine.setPosition(this.potSpine.originalPosition);
			this.potSpine.setLocalZOrder(this.potSpine.originalZOrder);
			FWUtils.changeParent(this.potSpine, this.potSpine.originalParent);

			if (isSuccess)
				FWUtils.hideDarkBg(this.panelNPC);

			if (callback)
				callback ();
		}.bind(this));
		
		this.widget.stopAllActions();
		this.widget.runAction(cc.sequence(pharse1, cc.delayTime(3.0), pharse2, cc.delayTime(1.0), pharse3, cc.delayTime(4.0), pharse4));
	},

	selectTab: function (tabIndex) {
		cc.log(this.LOGTAG, "selectTab", " - tabIndex:", tabIndex);

		this.activeTab = this.activeTab || -1;
		if (this.activeTab === tabIndex)
			return;

		this.activeTab = tabIndex;
		for (var index in this.listTab) {

			var isActive = index == this.activeTab;

			this.listTab[index].tabButton.active.setVisible(isActive);
			this.listTab[index].tabButton.inactive.setVisible(!isActive);

			var tabPage = this.listTab[index].tabPage;
			tabPage.setVisible(isActive);
		}
	},

	selectPot: function (potId) {
		cc.log(this.LOGTAG, "selectPot", " - potId:", potId);

		this.data.selectedPot = this.data.selectedPot || -1;
		if (this.data.selectedPot === potId)
			return;

		this.data.selectedPot = potId;
		this.data.selectedPotSet = g_BLACKSMITH.RECIPES[potId].SPECIAL_SET;
		this.data.selectedPotCombine = g_BLACKSMITH.RECIPES[potId].SET_POT_COMBINE;

		this.data.materials = [];

		this.updateForge();
		this.updateMaterials();
		this.updateItems();
	},

	updateForge: function () {

		// get elements

		var potDefine = g_BLACKSMITH.RECIPES[this.data.selectedPot];
		var panelContent = this.listTab[SMITHY_TAB_FORGE_ID].tabPage;

		var panelMineral = FWUI.getChildByName(panelContent, "panelMineral");
		var panelGems = FWUI.getChildByName(panelContent, "panelGem");

		// update pot

		this.potSpine.setVisible(this.data.selectedPot !== null);
		this.potLight.setVisible(this.data.selectedPot !== null);
		if (this.data.selectedPot) {
			var potGfx = Game.getItemGfxByDefine(this.data.selectedPot);
			if (potGfx) {
				FWUI.fillData(panelContent, null, {
					potSpine: { type: UITYPE_SPINE, id: potGfx.spine, anim: potGfx.anim, skin: potGfx.skin, scale: SMITHY_SCALE_POT_LARGE }
				});
			}
		}

		this.slotMain.loadTexture((this.data.selectedPot) ? SMITHY_FRAME_ACTIVE_TEX : SMITHY_FRAME_TEX, ccui.Widget.PLIST_TEXTURE);

		// update pot list

		if (this.listPotItem) {
			this.listPotItem.forEach(function(pot) {//web

				var isActive = pot.uiData.potId === this.data.selectedPot;
				pot.setOpacity((isActive) ? 255 : 120);

				var iconCheck = FWUI.getChildByName(pot, "iconCheck");
				iconCheck && iconCheck.setVisible(isActive);
			}.bind(this));
		}

		if (this.panelPotSet) {
			var pages = this.panelPotSet.getPages();
			for (var i = 0; i < pages.length; i++) {
				var children = pages[i].getChildren();
				for (var j = 0; j < children.length; j++) {
					var textLevel = FWUI.getChildByName(children[j], "textLevel");
					textLevel.setString((gv.userData.isEnoughLevel(children[j].uiData.potLevel)) ? "" : cc.formatStr("Lv.%d", children[j].uiData.potLevel));
				}
			}
		}

		// update materials

		var materialItemDefine = {
			textAmount: { type: UITYPE_TEXT, field: "textAmount", color: "data.textAmountColor", style: TEXT_STYLE_TEXT_NORMAL },
			textRequire: { type: UITYPE_TEXT, field: "textRequire", color: "data.textRequireColor", style: TEXT_STYLE_TEXT_NORMAL },
			icon: { type: UITYPE_IMAGE, field: "icon", scale: SMITHY_SCALE_MATERIAL },
			iconAdd: { onTouchEnded: this.onMaterialTouched.bind(this), visible: "data.amount < data.required" },
			container: { onTouchBegan:this.showItemHint.bind(this),onDrop: this.onMaterialTouched.bind(this),forceTouchEnd: true,onTouchEnded: this.onMaterialTouched.bind(this) }
		};

		var materialPanels = [
			{
				itemBar: this.barLeftLong,
				itemBarLiquid: this.barLeftLongLiquid,
				itemFrame: this.panelMineralFrame,
				itemPanel: panelMineral,
				itemType: defineTypes.TYPE_MINERAL
			},
			{
				itemBar: this.barRightLong,
				itemBarLiquid: this.barRightLongLiquid,
				itemFrame: this.panelGemFrame,
				itemPanel: panelGems,
				itemType: defineTypes.TYPE_PEARL
			}
		];

		materialPanels.forEach(function(panel) {

			panel.itemFrame.loadTexture(SMITHY_FRAME_TEX, ccui.Widget.PLIST_TEXTURE);
			panel.itemBar.loadTexture(SMITHY_BAR_HOR_TEX, ccui.Widget.PLIST_TEXTURE);

			var isFullFilled = false;
			if (potDefine) {

				isFullFilled = true;

				var materialItems = [];
				for (var item in potDefine.MATERIALS) {

					if (item === "GOLD" || defineMap[item].TYPE !== panel.itemType)
						continue;

					var itemAmount = gv.userStorages.getItemAmount(item);
					var itemAmountRequired = potDefine.MATERIALS[item];

					var itemAmountText = cc.formatStr("%d", itemAmount);
					var itemAmountTextColor = (itemAmount >= itemAmountRequired) ? cc.color.GREEN : cc.color.RED;

					var itemRequireText = cc.formatStr("/%d", itemAmountRequired);
					var itemRequireTextColor = cc.color.GREEN;

					if (itemAmount < itemAmountRequired)
						isFullFilled = false;

					materialItems.push({
						id: item,
						icon: Game.getItemGfxByDefine(item).sprite,
						iconScale: Game.getItemGfxByDefine(item).scale,
						amount: gv.userStorages.getItemAmount(item),
						required: potDefine.MATERIALS[item],
						textAmount: itemAmountText,
						textAmountColor: itemAmountTextColor,
						textRequire: itemRequireText,
						textRequireColor: itemRequireTextColor
					});
				}

				panel.itemBar.loadTexture((isFullFilled) ? SMITHY_BAR_HOR_ACTIVE_TEX : SMITHY_BAR_HOR_TEX, ccui.Widget.PLIST_TEXTURE);
				panel.itemFrame.loadTexture((isFullFilled) ? SMITHY_FRAME_ACTIVE_TEX : SMITHY_FRAME_TEX, ccui.Widget.PLIST_TEXTURE);

				FWUI.fillData_2dlist(panel.itemPanel, null, {
					items: materialItems,
					itemUI: UI_SMITHY_MATERIAL_PRODUCT,
					itemDef: materialItemDefine,
					itemSize: cc.size(SMITHY_FORGE_MATERIAL_PRODUCT_SIZE, SMITHY_FORGE_MATERIAL_PRODUCT_SIZE)
				});

				var totalWidth = 0, startX = 0;
				var itemPanelChildren = panel.itemPanel.getChildren();
				for (var i = 0; i < itemPanelChildren.length; i++) {
					var textAmount = FWUI.getChildByName(itemPanelChildren[i], "textAmount");
					var textRequire = FWUI.getChildByName(itemPanelChildren[i], "textRequire");
					totalWidth = textAmount.getBoundingBox().width + textRequire.getBoundingBox().width;
					startX = (SMITHY_FORGE_MATERIAL_PRODUCT_SIZE - totalWidth) * 0.5;
					textAmount.setPositionX(startX + textAmount.getBoundingBox().width);
					textRequire.setPositionX(startX + totalWidth - textRequire.getBoundingBox().width);
				}
			}

			panel.itemPanel.setVisible(potDefine !== undefined);
			panel.itemBarLiquid.setVisible(isFullFilled);
		}.bind(this));

		// update price

		this.buttonExecute.setVisible(potDefine !== undefined);
		if (potDefine) {
			this.textPrice.setTextColor((gv.userData.isEnoughGold(potDefine.MATERIALS.GOLD)) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
			FWUtils.setTextAutoExpand(FWUtils.formatNumberWithCommas(potDefine.MATERIALS.GOLD), this.buttonExecute, this.textPrice, this.iconGold);
		}

		// update hint
		if (potDefine) {
			var potName = Game.getItemName(potDefine.POT);
			var compoName = Game.getItemName(g_POT[potDefine.POT].COMBO_ID);
			this.textHint.setString(cc.formatStr(FWLocalization.text("TXT_SMITHY_POT_HINT_SELECTED"), potName, compoName));
		} else {
			this.textHint.setString(FWLocalization.text("TXT_SMITHY_POT_HINT_NOT_SELECTED"));
		}
	},

	updateItems: function () {

		this.buttonAddItemGrass.setVisible(this.data.selectedGrass === null);
		this.buttonAddItemGlove.setVisible(this.data.selectedGlove === null);

		this.slotItemGrass.loadTexture((this.data.selectedGrass) ? SMITHY_FRAME_ACTIVE_TEX : SMITHY_FRAME_TEX, ccui.Widget.PLIST_TEXTURE);

		var isFullFilledPotMaterials = this.data.materials.length >= SMITHY_MATERIAL_MIN;

		var reachedConditionLeft = isFullFilledPotMaterials && this.data.selectedGrass;
		var reachedConditionRight = isFullFilledPotMaterials && this.data.selectedGlove;

		this.barLeft.setVisible(!reachedConditionLeft);
		this.barLeftActive.setVisible(reachedConditionLeft);
		this.barLeftLiquid.setVisible(reachedConditionLeft);

		var successRate = this.data.successRate || 0;
		if (this.data.selectedGrass === null) {

			var itemGfx = Game.getItemGfxByDefine(Object.keys(g_BLACKSMITH.BONUS_RATE_VIOLET_GRASS)[0]);
			if (itemGfx)
				FWUI.fillData_image2(this.iconItemGrass, itemGfx.sprite, itemGfx.scale || 0.6);

			successRate = successRate * 100;
			successRate = Math.floor(successRate * 10) / 10;
		}
		else {

			var itemGfx = Game.getItemGfxByDefine(this.data.selectedGrass);
			if (itemGfx)
				FWUI.fillData_image2(this.iconItemGrass, itemGfx.sprite, itemGfx.scale || 0.6);

			var grassRate = g_BLACKSMITH.BONUS_RATE_VIOLET_GRASS[this.data.selectedGrass] * g_MISCINFO.BLACKSMITH_VIOLET_GRASS_RATE_UNIT;
			successRate = (successRate + grassRate) * 100;
			successRate = Math.floor(successRate * 10) / 10;
		}

		this.textGrassValue.setString(cc.formatStr("%d%", successRate));
		if(gv.vipManager.check())
		{
			FWUI.getChildByName(this.widget,"panelVipPercent").setVisible(true);
			this.textVipValue.setString(cc.formatStr("+%d%", gv.vipManager.blackSmithRate));
			cc.log("LOAD IMG");
			this.imgIconBuffVip.loadTexture(gv.vipManager.iconBuffVip, ccui.Widget.PLIST_TEXTURE);
		}
		else
		{
			FWUI.getChildByName(this.widget,"panelVipPercent").setVisible(false);
		}


		this.textGloveValue.setString("0%");
		this.slotItemGlove.loadTexture((this.data.selectedGlove) ? SMITHY_FRAME_ACTIVE_TEX : SMITHY_FRAME_TEX, ccui.Widget.PLIST_TEXTURE);

		this.barRight.setVisible(!reachedConditionRight);
		this.barRightActive.setVisible(reachedConditionRight);
		this.barRightLiquid.setVisible(reachedConditionRight);

		if (this.data.selectedGlove === null) {
			var itemGfx = Game.getItemGfxByDefine(Object.keys(g_BLACKSMITH.GLOVES_RATE)[0]);
			if (itemGfx)
				FWUI.fillData_image2(this.iconItemGlove, itemGfx.sprite, itemGfx.scale || 0.6);
		}
		else {

			var itemGfx = Game.getItemGfxByDefine(this.data.selectedGlove);
			if (itemGfx)
				FWUI.fillData_image2(this.iconItemGlove, itemGfx.sprite, itemGfx.scale || 0.6);

			this.textGloveValue.setString(cc.formatStr("%d%", g_BLACKSMITH.GLOVES_RATE[this.data.selectedGlove] * g_MISCINFO.BLACKSMITH_GLOVES_RATE_UNIT * 100));
		}

		this.textGrassDesc.setPositionX(this.textGrassValue.x - this.textGrassValue.getBoundingBox().width - 5);
		this.textGloveDesc.setPositionX(this.textGloveValue.x + this.textGloveValue.getBoundingBox().width + 5);

		FWUtils.applyGreyscaleNode(this.iconItemGrass, this.data.selectedGrass === null);
		FWUtils.applyGreyscaleNode(this.iconItemGlove, this.data.selectedGlove === null);
	},

	pushMaterial: function (itemId) {
		this.data.materials.push(itemId);
		this.updateMaterials();
		this.updateItems();
	},

	pullMaterial: function (itemIndex) {
		this.data.materials.splice(itemIndex, 1);
		this.updateMaterials();
		this.updateItems();
	},

	updateMaterials: function ()
	{
		if (!this.data.materials)
			return;

		// update sucess rate
		this.data.successRate = 0;
		for (var i = 0; i < this.data.materials.length; i++)
		{
			var potId = this.data.materials[i];
			var rate = g_BLACKSMITH.MATERIAL_POT_RATE[potId][this.data.selectedPotSet] * g_MISCINFO.BLACKSMITH_POT_RATE_UNIT;
			this.data.successRate += rate;
		}

		if (this.data.selectedPotCombine)
		{
			var validCombines = [];
			for (var combineId in this.data.selectedPotCombine)
			{
				var combineRate = this.data.selectedPotCombine[combineId] * g_MISCINFO.BLACKSMITH_POT_SET_RATE_UNIT;
				var combine = g_COMBO[combineId];
				
				if (!combine)
					continue;

				var isFullCombine = true;
				for (var i in combine.CHILDREN)
				{
					if (this.data.materials.indexOf(combine.CHILDREN [i]) === -1)
					{
						isFullCombine = false;
						break;
					}
				}

				if (isFullCombine)
					validCombines.push({
						combineId: combineId,
						combineRate: combineRate
					});
			}

			validCombines = _.sortByDecent(validCombines, "combineRate");
			if (validCombines.length > 0)
				this.data.successRate += validCombines[0].combineRate;
		}

		// update pot list

		var materialPotItems = [];
		var materialPotCount = Math.max(Math.min(this.data.materials.length + 1, SMITHY_MATERIAL_MAX), SMITHY_MATERIAL_MIN);
		for (var i = 0; i < materialPotCount; i++) {
			materialPotItems.push({
				index: i,
				potId: (i < this.data.materials.length) ? this.data.materials[i] : null,
				potExist: i < this.data.materials.length
			});
		}

		var materialPotDefine = {
			slot: { dropTag: SMITHY_ITEM_SELECTOR_POT },
			icon: { type: UITYPE_SPINE, field: "potId", scale: SMITHY_SCALE_POT_NORMAL, anim: "pot_icon_small", subType: defineTypes.TYPE_POT, visible: "data.potExist === true" },
			iconEmpty: { visible: "data.potExist === false" },
			buttonAdd: { onTouchEnded: this.onMaterialPotAddButtonTouched.bind(this), visible: "data.potExist === false" },
			buttonRemove: { onTouchEnded: this.onMaterialPotRemoveButtonTouched.bind(this), visible: "data.potExist === true" },
		};

		var reachedCondition = this.data.selectedPot && this.data.materials.length >= SMITHY_MATERIAL_MIN;

		this.panelPot.setContentSize(cc.size(materialPotItems.length * SMITHY_FORGE_MATERIAL_POT_SIZE + 10, this.panelPot.height));
		this.panelPot.setPosition(cc.p(this.panelPotFrame.x - this.panelPot.width * 0.5, this.panelPot.y));

		this.panelPotFrame.loadTexture((reachedCondition) ? SMITHY_FRAME_ACTIVE_TEX : SMITHY_FRAME_TEX, ccui.Widget.PLIST_TEXTURE);
		this.panelPotFrame.setContentSize(cc.size(this.panelPot.width + 28, this.panelPotFrame.height));

		this.barCenter.loadTexture((reachedCondition) ? SMITHY_BAR_VER_ACTIVE_TEX : SMITHY_BAR_VER_TEX, ccui.Widget.PLIST_TEXTURE);
		this.barCenterLiquid.setVisible(reachedCondition);

		FWUI.fillData_2dlist(this.panelPot, null, {
			items: materialPotItems,
			itemUI: UI_SMITHY_MATERIAL_POT,
			itemDef: materialPotDefine,
			itemSize: cc.size(SMITHY_FORGE_MATERIAL_POT_SIZE, SMITHY_FORGE_MATERIAL_POT_SIZE)
		});
	},

	onTabTouched: function (sender) {
		cc.log(this.LOGTAG, "onPotTouched", " - tabIndex:", sender.index);
		this.selectTab(sender.index || 0);
	},

	onPotTouched: function (sender) {
		cc.log(this.LOGTAG, "onPotTouched", " - uiData: %j", sender.uiData);
		var potId = sender.uiData.potId;
		this.hideItemHint();
		var potDefine = defineMap[potId];
		if (g_BLACKSMITH.RECIPES[potId]) {
			if (gv.userData.isEnoughLevel(potDefine.LEVEL_UNLOCK)) {
				this.selectPot(sender.uiData.potId);
			}
			else {
				FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_SMITHY_FORGE_LIMIT_LEVEL"), potDefine.LEVEL_UNLOCK), FWUtils.getWorldPosition(sender));
			}
		}
	},

	onMaterialTouched: function (sender) {
		cc.log(this.LOGTAG, "onMaterialTouched:", " - uiData: %j", sender.uiData);
		this.hideItemHint();
		if (sender.uiData.amount < sender.uiData.required)
		{
			Game.showQuickBuy(
				[{itemId: sender.uiData.id, requireAmount: sender.uiData.required}],
				function() {this.updateForge();}.bind(this)//web
			);
		}
	},
	showItemHint:function(sender)
	{
		if(this.isShowingHint) return;
		var position = null;
		position = FWUtils.getWorldPosition(sender);
		var name = sender.getName();
		var id = null;
		if(name == "slotItemGrass")
		{
			id = this.data.selectedGrass;
		}
		else if (name == "slotItemGlove")
		{
			id = this.data.selectedGlove;
		}
		else
		{
			id = sender.uiData.id || sender.uiData.potId || sender.uiData.itemId;
		}
		if(id)
		{
			gv.hintManagerNew.show(null, null,id, position);
			this.isShowingHint = true;
		}
	},
	hideItemHint:function(sender){
		this.isShowingHint = false;
		gv.hintManagerNew.hideAllHint();
	},

	onMaterialPotDropBegan: function (sender) {
		//this.showItemHint(sender);
		cc.log(this.LOGTAG, "onMaterialPotDropBegan:", " - uiData: %j", sender.uiData);
	},

	onMaterialPotDropEnded: function (sender) {
		cc.log(this.LOGTAG, "onMaterialPotDropEnded:", " - uiData: %j", sender.uiData);
		var potId = sender.uiData.itemId;
		var potAmount = sender.uiData.itemAmount;
		if (potAmount > 0) {

			this.pushMaterial(potId);
			this.hideSelector();

			if (this.data.materials.length < SMITHY_MATERIAL_MAX) {
				var panelPotItems = this.panelPot.getChildren();
				var nextSlotIndex = this.data.materials.length;
				if (nextSlotIndex < panelPotItems.length) {
					var buttonAdd = FWUI.getChildByName(panelPotItems[nextSlotIndex], "buttonAdd");
					this.showSelector(SMITHY_ITEM_SELECTOR_POT, FWUtils.getWorldPosition(buttonAdd), false);
				}
			}
		}
		this.hideItemHint();
		this.isShowingHint = false;
	},

	onMaterialPotDropped: function (draggedWidget, droppedWidget) {
		cc.log(this.LOGTAG, "onMaterialPotDropped", " - uiData: %j", draggedWidget.uiData);
	},

	onMaterialPotAddButtonTouched: function (sender) {
		cc.log(this.LOGTAG, "onMaterialPotAddButtonTouched");
		if (this.data.selectedPot) {
			this.showSelector(SMITHY_ITEM_SELECTOR_POT, FWUtils.getWorldPosition(sender));
		}
		else {
			gv.hint.showHintToast(null, FWLocalization.text("TXT_SMITHY_MSG_UNSELECTED_POT"));
		}
	},

	onMaterialPotRemoveButtonTouched: function (sender) {
		cc.log(this.LOGTAG, "onMaterialPotRemoveButtonTouched", " - uiData: %j", sender.uiData);
		var index = sender.uiData.index;
		if (index >= 0 && index < this.data.materials.length) {
			this.pullMaterial(index);
		}
	},

	onSupportItemDropBegan: function (sender)
	{
		cc.log(this.LOGTAG, "onSupportItemDropBegan:", " - uiData: %j", sender.uiData);
		//this.showItemHint(sender);
		var data = sender.uiData;
	},

	onSupportItemDropEnded: function (sender)
	{
		cc.log(this.LOGTAG, "onSupportItemDropEnded:", " - uiData: %j", sender.uiData);
		cc.log(this.LOGTAG, "onSupportItemTouched:", " - uiData: %j", sender.uiData);
		this.hideItemHint();
		var itemId = sender.uiData.itemId;
		var itemType = sender.uiData.itemType;
		var itemAmount = sender.uiData.itemAmount;
		if (itemAmount > 0)
		{
			if (itemType === SMITHY_ITEM_SELECTOR_GRASS)
				this.data.selectedGrass = itemId;
			else
				this.data.selectedGlove = itemId;

			this.updateItems();
		}
		else
		{
			switch (itemType)
			{
				case SMITHY_ITEM_SELECTOR_GRASS:
				case SMITHY_ITEM_SELECTOR_GLOVE:
					Game.openShop(sender.uiData.itemId, function() //web
					{
						this.updateForge();
						this.updateMaterials();
						this.updateItems();
					}.bind(this));
				break;
			}
		}
		this.hideSelector();
	},

	onSupportItemDropped: function (draggedWidget, droppedWidget) {
		cc.log(this.LOGTAG, "onSupportItemDropped", " - uiData: %j", draggedWidget.uiData);
	},

	onSlotItemGrassTouched: function (sender) {
		cc.log(this.LOGTAG, "onSlotItemGrassTouched");
		this.hideItemHint();
		if (this.data.selectedGrass === null) {
			this.showSelector(SMITHY_ITEM_SELECTOR_GRASS, FWUtils.getWorldPosition(sender));
		}
		else {
			this.data.selectedGrass = null;
			this.updateItems();
		}
	},

	onSlotItemGloveTouched: function (sender) {
		cc.log(this.LOGTAG, "onSlotItemGloveTouched");
		this.hideItemHint();
		if (this.data.selectedGlove === null) {
			this.showSelector(SMITHY_ITEM_SELECTOR_GLOVE, FWUtils.getWorldPosition(sender));
		}
		else {
			this.data.selectedGlove = null;
			this.updateItems();
		}
	},

	onRewardItemTouched: function (sender) {
		cc.log(this.LOGTAG, "onRewardItemTouched");

		this.data = {
			selectedPot: null,
			selectedPotSet: null,
			selectedPotCombine: null,
			selectedGrass: null,
			selectedGlove: null,
			materials: []
		};

		this.updateForge();
		this.updateMaterials();
		this.updateItems();

		this.hideReward();
	},

	onButtonSelectorPageSwitchTouched: function (sender) {
		cc.log(this.LOGTAG, "onButtonSelectorPageSwitchTouched");
	},

	onButtonSelectorPagePrevTouched: function (sender) {
		this.selectSelectorPage(null, -1);
	},

	onButtonSelectorPageNextTouched: function (sender) {
		this.selectSelectorPage(null, 1);
	},

	onButtonExecuteTouched: function (sender)
	{
		cc.log(this.LOGTAG, "onButtonExecuteTouched");
		if (this.data.selectedPot == null || this.isBusy)
			return;

		// test
		//this.onForgeResponse ({success:true});
		//return;

		if (this.data.materials.length < SMITHY_MATERIAL_MIN)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_SMITHY_MSG_NOT_ENOUGH_POT"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		var storage = gv.userStorages.getStorage(STORAGE_TYPE_ITEMS);
		if (storage)
		{
			var storageStatus = storage.getStorageStatus();
			if (storageStatus === STORAGE_STATUS_FULL)
			{
				Game.showUpgradeStock("hud/icon_tab_items.png", STORAGE_TYPE_ITEMS);
				return;
			}
		}

		var recipe = g_BLACKSMITH.RECIPES[this.data.selectedPot];
		if (!gv.userData.isEnoughGold(recipe.MATERIALS.GOLD))
		{
			Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD, function() {this.updateForge();}.bind(this));}.bind(this), true, "TXT_BUY");
			return;
		}

		var missItems = [];
		for (var item in recipe.MATERIALS)
		{
			if (item === "GOLD")
				continue;
				
			var itemAmount = gv.userStorages.getItemAmount(item);
			var itemAmountRequired = recipe.MATERIALS[item];
			
			if (itemAmount < itemAmountRequired)
				missItems.push ({
					itemId: item,
					requireAmount: itemAmountRequired
				});
		}

		if (missItems.length > 0)
		{
			Game.showQuickBuy(missItems, function() {this.updateForge();}.bind(this));
			return;
		}

		var materials = {};
		this.data.materials.forEach(function(itemId) {//web
			materials[itemId] = materials[itemId] || 0;
			materials[itemId]++;
		});

		if (this.data.selectedGrass)
			materials[this.data.selectedGrass] = 1;

		if (this.data.selectedGlove)
			materials[this.data.selectedGlove] = 1;

		gv.smithy.requestForge(this.data.selectedPot, materials);
	},

	onButtonCloseTouched: function (sender) {
		cc.log(this.LOGTAG, "onButtonCloseTouched");
		this.hide();
	},

	onForgeResponse: function (packet)
	{
		cc.log(this.LOGTAG, "onForgeResponse: %j", packet);
		// if (packet.error !== 0)
		// {
		// 	if (packet.error === ERROR_OUT_OF_CAPACITY)
		// 		Game.showUpgradeStock ("hud/icon_tab_items.png", STORAGE_TYPE_ITEMS);
		// 	return;
		// }

		var isSuccess = packet.success;
		var callback = function() //web
		{
			if (isSuccess)
				this.showReward(this.data.selectedPot, FWUtils.getWorldPosition(this.potSpine));
					
			this.data.selectedGrass = null;
			this.data.selectedGlove = null;
			this.data.materials = [];

			this.updateForge();
			this.updateMaterials();
			this.updateItems();
			this.isBusy = false;
		}.bind(this);

		this.showEffect (isSuccess, callback);
		
		if(!isSuccess)
			Achievement.onAction(g_ACTIONS.ACTION_MAKE_POT_FAIL.VALUE, null, 1);
		else
			Game.shouldShowRatingPopup = true;
	}
});