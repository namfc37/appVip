const ARCADE_ID_TREASURE = 0;
const ARCADE_ID_MGMATCH = 1;
const ARCADE_ID_MINING = 2;
const ARCADE_ID_SMITHY = 3;
const ARCADE_ID_FISHING = 4;
//const ARCADE_ID_FISHERMAN = 3;

const ARCADE_PAGE_SCALE_SELECTED = 1.0;
const ARCADE_PAGE_SCALE_UNSELECTED = 0.85;

const ARCADE_LIGHT_SCALE_SELECTED = 2.5;

var ArcadePopup = cc.Node.extend({
    LOGTAG: "[ArcadePopup]",

    ctor: function () {
        this._super();
        this.items = [
            {
                id: ARCADE_ID_TREASURE,
                name: FWLocalization.text("TXT_ARCADE_TREASURE"),
                shortName: FWLocalization.text("TXT_ARCADE_TREASURE_SHORT"),
                spine: SPINE_NPC_BEE,
                spineAnim: "fly_1",
                spineScale: 0.7,
                spineOffset: cc.p(10, -120),
                clipOffset: cc.p(100, 50),
                unlockLevel: g_MISCINFO.DICE_USER_LEVEL
            },
            {
                id: ARCADE_ID_MGMATCH,
                name: FWLocalization.text("TXT_ARCADE_MGMATCH"),
                shortName: FWLocalization.text("TXT_ARCADE_MGMATCH_SHORT"),
                spine: SPINE_CLOUD_MINIGAME,
                spineAnim: "animation",
                spineScale: 0.11,
                spineOffset: cc.p(0, 100),
                unlockLevel: g_MISCINFO.FLIPPINGCARDS_USER_LEVEL
            },
            {
                id: ARCADE_ID_MINING,
                name: FWLocalization.text("TXT_ARCADE_MINING"),
                shortName: FWLocalization.text("TXT_ARCADE_MINING_SHORT"),
                spine: SPINE_NPC_MINER,
                spineAnim: "idle_select",
                spineScale: 0.3,
                spineOffset: cc.p(-10, -70),
                unlockLevel: g_MISCINFO.MINE_USER_LEVEL
            },
            {
                id: ARCADE_ID_SMITHY,
                name: FWLocalization.text("TXT_ARCADE_SMITHY"),
                shortName: FWLocalization.text("TXT_ARCADE_SMITHY_SHORT"),
                spine: SPINE_NPC_BLACKSMITH,
                spineAnim: "npc_idle_select",
                spineScale: 0.3,
                spineOffset: cc.p(0, -70),
                unlockLevel: g_MISCINFO.BLACKSMITH_USER_LEVEL
            },
            // {
            //     id: ARCADE_ID_FISHERMAN,
            //     name: FWLocalization.text("TXT_ARCADE_FISHERMAN"),
            //     shortName: FWLocalization.text("TXT_ARCADE_FISHERMAN_SHORT"),
            //     spine: SPINE_NPC_FISHERMAN,
            //     spineAnim: "npc_normal",
            //     spineScale: 0.3,
            //     spineOffset: cc.p(-80, -100),
            //     unlockLevel: g_MISCINFO.
            // },
        ];

        if(g_MISCINFO.FISHING_ACTIVE){
            var item =  {
                    id: ARCADE_ID_FISHING,
                    name: FWLocalization.text("TXT_FISHING"),
                    shortName: FWLocalization.text("TXT_FISHING_SHORT"),
                    spine: SPINE_FISHING_NPC,
                    spineAnim: "npc_normal",
                    spineScale: 0.3,
                    spineOffset: cc.p(-90, -130),
                    clipOffset: cc.p(80, 50),
                    unlockLevel: g_MISCINFO.FISHING_USER_LEVEL
                };
            this.items.push(item);
        }
		//web
        //this.items.sort ((a, b) => a.unlockLevel > b.unlockLevel ? 1 : -1);
        this.items.sort (function(a, b) {return (a.unlockLevel > b.unlockLevel ? 1 : -1);});
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function () {
        cc.log(this.LOGTAG, "show");

        if (!FWUI.isShowing(UI_GAME_HOUSE)) {
            this.widget = FWPool.getNode(UI_GAME_HOUSE, false);
            if (this.widget) {
                this.panelItems = FWUI.getChildByName(this.widget, "panelItems");
                this.panelItems.setUsingCustomScrollThreshold(true);
                this.panelItems.setCustomScrollThreshold(0.3);
				//web
                //this.panelItems.addEventListener((sender, type) => {
                //    if (type === ccui.PageView.EVENT_TURNING)
                //        this.selectItem(sender.getCurPageIndex());
                //});
                this.panelItems.addEventListener(function(sender, type) {
                    if (type === ccui.PageView.EVENT_TURNING || !cc.sys.isNative)
                        this.selectItem(sender.getCurPageIndex());
                }.bind(this));

                if (!this.isInitialized) {
                    this.isInitialized = true;
					
                    if (this.panelItems) {
						this.panelItems.removeAllPages();
                        for (var i = 0; i < this.items.length; i++) {
                            var data = this.items[i];
                            data.lock = data.unlockLevel > gv.userData.getLevel();
                            
                            var item = FWPool.getNode(UI_GAME_HOUSE_ITEM);
                            this.panelItems.addPage(item);

                            item.panel = FWUI.getChildByName(item, "panel");
                            item.panel.setScale(ARCADE_PAGE_SCALE_UNSELECTED);

                            var panelNPC = FWUI.getChildByName(item, "panelNPC");
                            if (panelNPC)
                            {
                                var stencil = new cc.Sprite("#hud/hud_npc_slot_mask.png");
                                var panelClip = new cc.ClippingNode();
                                panelClip.setStencil(stencil);
                                panelClip.setAlphaThreshold(0.1);
                                panelClip.setPosition(panelNPC.width * 0.5 + 0, panelNPC.height * 0.5 + 50);
                                panelNPC.addChild(panelClip);

                                var npc = new FWObject();
                                npc.initWithSpine(data.spine);
                                npc.setAnimation(data.spineAnim, true);
                                npc.setPosition(cc.p(data.spineOffset.x, data.spineOffset.y - panelNPC.height * 0.5));
                                npc.setScale(data.spineScale);
                                npc.setParent(panelClip);
								item.npc = npc;
                            }

                            item.light = FWUI.getChildByName(item, "panelLight");
                            if (item.light) {
								// jira#5498
								if (item.light.spine)
								{
									item.light.spine.uninit();
									item.light.spine = null;
								}
								
                                if (!item.light.spine) {
                                    item.light.spine = new FWObject();
                                    item.light.spine.initWithSpine(SPINE_EFFECT_POT_SLOT);
                                    item.light.spine.setAnimation("effect_light_icon", true);
                                    item.light.spine.setScale(ARCADE_LIGHT_SCALE_SELECTED);
                                    item.light.spine.setParent(item.light);
                                    item.light.spine.setPosition(cc.p(0, 0));
                                }
                            }

                            FWUI.fillData(item, data, {
                                textTitle: { visible: false }, //type: UITYPE_TEXT, id: data.name, style: TEXT_STYLE_TEXT_BIG_GREEN },
                                textUnlock: { type: UITYPE_TEXT, id: cc.formatStr (FWLocalization.text("TXT_ARCADE_ITEM_UNLOCK_LV"), data.unlockLevel), style: TEXT_STYLE_TEXT_NORMAL, visible: data.lock },
                                slotBack: { onTouchEnded: this.onItemTouched.bind(this) },
                            });
							data.uiItem = item;
                        }
                    }
                }
				else
				{
					// jira#5590
					for (var i = 0; i < this.items.length; i++)
					{
						var data = this.items[i];
						if(data.lock)
						{
							data.lock = data.unlockLevel > gv.userData.getLevel();
							if(!data.lock)
							{
								var textUnlock = FWUtils.getChildByName(data.uiItem, "textUnlock");
								textUnlock.setVisible(data.lock);
							}
						}
						
if(!cc.sys.isNative){
						//web: fix: all animations freeze when showing popup 2nd time
						var item = data.uiItem;
						if(item.light.spine)
						{
							//web item.light.spine.node.init(); //web cocos3.8
							item.light.spine.node.setAnimation(0, "effect_light_icon", true);
						}
						if(item.npc)
						{
							//item.npc.node.init(); //web cocos3.8
							item.npc.node.setAnimation(0, data.spineAnim, true);
						}
}
					}
				}

                this.textTitle = FWUI.getChildByName(this.widget, "textTitle");
                var uiDefine = {
                    textTitle: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TITLE_1 },
                    cloudTop: {visible:true},
                    buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) }
                };

                FWUI.fillData(this.widget, null, uiDefine);

if(cc.sys.isNative)
                this.panelItems.setCurPageIndex(0);
else
                this.panelItems.scrollToPage(0);//web this.panelItems.setCurPageIndex(0);
				
				// jira#5014
				if(this.selectedItem !== undefined && this.selectedItem >= 0)
				{
					var selectedItem = this.selectedItem;
					this.selectedItem = -1;
					this.panelItems.scrollToPage(selectedItem);
					this.selectItem(selectedItem);
				}
				else
				    this.selectItem(0);
            }

            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
			this.widget.setLocalZOrder(Z_UI_COMMON - 1); // jira#4755
            
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
			
			// jira#5132
			FWUtils.showDarkBg(null, Z_UI_COMMON - 2, "darkBgArcade", null, true);
        }
    },

    hide: function () {
        FWUI.hideWidget(this.widget, UIFX_POP);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		// jira#5132
		FWUtils.hideDarkBg(null, "darkBgArcade");
    },

    selectItem: function (itemIndex, instant) {//web selectItem: function (itemIndex, instant = false) {
		
		if(instant === undefined)
			instant = false;

        this.selectedItem = this.selectedItem || -1;
        if (this.selectedItem === itemIndex)
            return;

        this.selectedItem = itemIndex;

        var pages = this.panelItems.getPages();
        for (var i = 0; i < pages.length; i++) {

            pages[i].panel.stopAllActions();
            pages[i].panel.runAction(new cc.EaseSineOut(cc.scaleTo(0.1, (i === itemIndex) ? ARCADE_PAGE_SCALE_SELECTED : ARCADE_PAGE_SCALE_UNSELECTED)));

            var targetLightScale = (i === itemIndex) ? ARCADE_LIGHT_SCALE_SELECTED : 1.0;
            var targetLightOpacity = (i === itemIndex) ? 255 : 120;

            var light = pages[i].light.spine.node;
            if (light) {
                if (instant) {
                    light.setOpacity(255);
                }
                else if (light.getOpacity() !== targetLightOpacity) {
                    light.stopAllActions();
                    light.runAction(cc.spawn(cc.fadeTo(0.15, targetLightOpacity), new cc.EaseSineOut(cc.scaleTo(0.15, targetLightScale))));
                }
            }
        }

        this.textTitle.setString(this.items[itemIndex].name);
    },

    onItemTouched: function (sender) {
        cc.log(this.LOGTAG, "onItemTouched", "id:", sender.uiData.id);
        cc.log(this.LOGTAG, "onItemTouched", "pageIndex:", this.panelItems.getCurPageIndex());
        cc.log(this.LOGTAG, "onItemTouched", "selectedItem:", this.selectedItem,"id",this.items[this.selectedItem].id);

        if (sender.uiData) {

            var isTouched = sender.uiData.id === this.items[this.selectedItem].id;

            //if (sender.uiData.id !== this.panelItems.getCurPageIndex()) {
            //    this.panelItems.scrollToPage(sender.uiData.id);
            //    this.selectItem(sender.uiData.id);
            //}

            if (isTouched) {
                switch (this.items[this.selectedItem].id) {
                    case ARCADE_ID_SMITHY: {
                        if (gv.arcade.isBlacksmithUnlocked()) {
                            gv.smithy.showPopup();
                        }
                        else {
                            FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_SMITHY_MSG_LIMIT_LEVEL"), g_MISCINFO.BLACKSMITH_USER_LEVEL), FWUtils.getWorldPosition(sender));
                        }
                    }
                        break;
                    case ARCADE_ID_TREASURE: {
                        if (gv.arcade.isDiceUnlocked()) {
                            gv.dice.showPopup();
                        }
                        else {
                            FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_DICE_MSG_LIMIT_LEVEL"), g_MISCINFO.DICE_USER_LEVEL), FWUtils.getWorldPosition(sender));
                        }
                    }
                        break;
                    //case ARCADE_ID_FISHERMAN:
                    //    FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
                    //    break;
                    case ARCADE_ID_MINING:
                        if(gv.userData.getLevel() >= g_MISCINFO.MINE_USER_LEVEL)
                            Mining.loadAndShow();
                        else
                            FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_MINER_REQUIRE_LEVEL"), g_MISCINFO.MINE_USER_LEVEL), FWUtils.getWorldPosition(sender));
						break;
						
					case ARCADE_ID_MGMATCH:
						if(gv.userData.getLevel() >= g_MISCINFO.FLIPPINGCARDS_USER_LEVEL)
							MGMatch.showIntro();
						else
							FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_ARCADE_ITEM_UNLOCK_LV"), g_MISCINFO.FLIPPINGCARDS_USER_LEVEL), FWUtils.getWorldPosition(sender));
						break;

                    case ARCADE_ID_FISHING:
                        if(gv.userData.getLevel() >= g_MISCINFO.FISHING_USER_LEVEL)
                            GameEventTemplate3.show();
                        else
                            FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_ARCADE_ITEM_UNLOCK_LV"), g_MISCINFO.FISHING_USER_LEVEL), FWUtils.getWorldPosition(sender));
                        break;
                }
            }
			else // jira#7057
			{
				this.panelItems.scrollToPage(this.getPageIndexById(sender.uiData.id));
			}
        }
    },

    onButtonCloseTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonCloseTouched");
        this.hide();
    },
	
	// jira#7057
	getPageIndexById:function(id)
	{
		for(var i=0; i<this.items.length; i++)
		{
			if(this.items[i].id === id)
				return i;
		}
		return 0;
	},
});