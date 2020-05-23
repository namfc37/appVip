
var PotInfo =
{
	show:function(potId)
	{
		var potInfo = g_POT[potId];
		
		// combo & upgrade source
		var comboId = potInfo.COMBO_ID;
		var comboList = [];
		var upgradeList = [];
		for(var key in g_POT)
		{
			var pot = g_POT[key];
			if(comboId && comboId !== "" && pot.COMBO_ID === comboId)
				comboList.push({itemId:key, isCurrentPot:key === potId});
			
			for(var i=0; i<pot.UPGRADE_NEXT_ID.length; i++)
			{
				if(pot.UPGRADE_NEXT_ID[i] === potId)
				{
					upgradeList.push({itemId:key});
					break;
				}
			}
		}
		
		var comboItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			fx:{type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.5, visible:"data.isCurrentPot === true"},
		};
		
		var upgradeItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			fx:{visible:false},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:Game.getItemName(potId), style:TEXT_STYLE_TITLE_1},
			closeButton:{onTouchEnded:this.hide.bind(this)},
			gfx:{type:UITYPE_ITEM, value:potId, anim:"pot_icon_big",onTouchBegan:function() {PotInfo.showHintPot(upgradeList.length>0);}, onTouchEnded:function() {PotInfo.showHintPot(false);}, forceTouchEnd:true},
			fx:{type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.8},
			timeBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			timeIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			timeText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"-" + potInfo.TIME_DECREASE_DEFAULT + "s"},
			timeHint:{visible:false},
			timeHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_TIME"},
			expBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			expIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			expText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"+" + potInfo.EXP_INCREASE},
			expHint:{visible:false},
			expHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_EXP"},
			bugBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			bugIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			bugText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"+" + potInfo.BUG_APPEAR_RATIO + "%"},
			bugHint:{visible:false},
			bugHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_BUG"},
			gold:{visible:potInfo.GOLD_INCREASE > 0},
			goldBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			goldIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			goldText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"+" + potInfo.GOLD_INCREASE + "%"},
			goldHint:{visible:false},
			goldHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_GOLD"},
			comboText:{type:UITYPE_TEXT, value:"TXT_POTINFO_COMBO_NONE", style:TEXT_STYLE_TEXT_NORMAL, visible:comboList.length <= 0},
			title2:{type:UITYPE_TEXT, value:Game.getItemName(comboId), style:TEXT_STYLE_TEXT_NORMAL, visible:comboList.length > 0},
			potList:{type:UITYPE_2D_LIST, items:comboList, itemUI:UI_POT_INFO_ITEM, itemDef:comboItemDef, itemSize:cc.size(95, 95), singleLine:true, itemsAlign:"center", visible:comboList.length > 0},
			libraryButton:{onTouchEnded:this.showPotLibrary.bind(this), visible:true},
			libraryText:{type:UITYPE_TEXT, value:"TXT_LIBRARY_POT", style:TEXT_STYLE_TEXT_BUTTON},
			potClass:{visible:false},
			boardHint:{visible:false},
			upgradeText:{type:UITYPE_TEXT, value:"TXT_POTINFO_UPGRADE_FROM", style:TEXT_STYLE_HINT_NOTE},
			upgradeList:{type:UITYPE_2D_LIST, items:upgradeList, itemUI:UI_POT_INFO_ITEM, itemDef:upgradeItemDef, itemSize:cc.size(120, 90),singleLine:true, itemsAlign:"center"},
		};
		
		var widget = FWUI.showWithData(UI_POT_INFO, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_POT_INFO);

		this.boardHint =  FWUI.getChildByName(widget, "boardHint");
		AudioManager.effect (EFFECT_POPUP_SHOW);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
	},
	showHintPot:function(show)
	{

		if(this.boardHint)
		{
			var uiDef = {
				visible: show,
			}
			this.boardHint.setVisible(show);
			FWUI.fillData(this.boardHint, null, uiDef);

		}

	},
	hide:function()
	{
		FWUI.hide(UI_POT_INFO, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	showHint:function(sender, show)//web showHint:function(sender, show = true)
	{
		if(show === undefined)
			show = true;
		
		var name = sender.getName();
		
		// jira#5626
		if(name.endsWith("Icon"))
			name = name.substring(0, name.length - 4) + "Hint"; // e.g: timeIcon => timeHint, expIcon => expHint
		else 
			name = name.substring(0, name.length - 2) + "Hint"; // e.g: timeBg => timeHint, expBg => expHint
		
		var widget = FWPool.getNode(UI_POT_INFO, false);
		var hint = FWUtils.getChildByName(widget, name);
		
		if(show)
		{
			hint.setVisible(true);
			hint.stopAllActions();
			hint.setScale(0);
			hint.runAction(cc.scaleTo(0.15, 1));
		}
		else
		{
			hint.stopAllActions();
			hint.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(function() {hint.setVisible(false);})));
		}
	},
	
	hideHint:function(sender)
	{
		this.showHint(sender, false);
	},
	
	showPotLibrary:function(sender)
	{
		this.hide();
		gv.utilPanel.show (UTIL_LIBRARY, UTIL_LIBRARY_POT);
	},
};

