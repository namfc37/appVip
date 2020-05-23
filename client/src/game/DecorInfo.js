
var DecorInfo =
{
	show:function(decorId)
	{
		var decorInfo = g_DECOR[decorId];
		
		// combo & upgrade source
		var comboId = decorInfo.COMBO_ID;
		var comboList = [];
		for(var key in g_DECOR)
		{
			var decor = g_DECOR[key];
			if(comboId !== "" && decor.COMBO_ID === comboId)
				comboList.push({itemId:key, isCurrentDecor:key === decorId});
		}
		
		var comboItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			fx:{type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.5, visible:"data.isCurrentDecor === true"},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:Game.getItemName(decorId), style:TEXT_STYLE_TITLE_1},
			closeButton:{onTouchEnded:this.hide.bind(this)},
			gfx:{type:UITYPE_ITEM, value:decorId, scale:2},
			fx:{type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.8},
			comboText:{type:UITYPE_TEXT, value:"TXT_DECORINFO_COMBO_NONE", style:TEXT_STYLE_TEXT_NORMAL, visible:comboList.length <= 0},
			title2:{type:UITYPE_TEXT, value:Game.getItemName(comboId), style:TEXT_STYLE_TEXT_NORMAL, visible:comboList.length > 0},
			potList:{type:UITYPE_2D_LIST, items:comboList, itemUI:UI_POT_INFO_ITEM, itemDef:comboItemDef, itemSize:cc.size(95, 95), singleLine:true, itemsAlign:"center", visible:comboList.length > 0},
			comboInfo:{visible:comboList.length > 0},
			libraryButton:{onTouchEnded:this.showDecorLibrary.bind(this), visible:true},
			libraryText:{type:UITYPE_TEXT, value:"TXT_LIBRARY_DECOR", style:TEXT_STYLE_TEXT_BUTTON},
			
			// jira#5080
			timeBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			timeIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			timeText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"-" + decorInfo.TIME_DECREASE_DEFAULT + "s"},
			timeHint:{visible:false},
			timeHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_TIME"},
			expBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			expIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			expText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"+" + decorInfo.EXP_INCREASE},
			expHint:{visible:false},
			expHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_EXP"},
			bugBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			bugIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			bugText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"+" + decorInfo.BUG_APPEAR_RATIO + "%"},
			bugHint:{visible:false},
			bugHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_BUG"},
			gold_0:{visible:decorInfo.GOLD_INCREASE > 0},
			goldBg:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			goldIcon:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			goldText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"+" + decorInfo.GOLD_INCREASE + "%"},
			goldHint:{visible:false},
			goldHintText:{type:UITYPE_TEXT, value:"TXT_POTINFO_HINT_GOLD"},
		};
	
		var combo = g_COMBO[comboId];
		for(var i=0; i<3; i++)
		{
			// jira#5080
			//var buffInfo = (!combo || i >= combo.BUFF_INFO.length ? null : combo.BUFF_INFO[i]);
			var buffInfo = null;
			var opacity = 255;
			var j = i + 1;
			if(buffInfo)
			{
				uiDef["iconBg" + j] = {visible:true};
				uiDef["icon" + j] = {type:UITYPE_IMAGE, scale:0.5, value:Game.getBuffIconByType(buffInfo.type), opacity:opacity};
				uiDef["text" + j] = {opacity:opacity};
				uiDef["value" + j] = {type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:(buffInfo.type === BUFF_HARVEST_TIME || buffInfo.type === BUFF_PRODUCTION_TIME ? "-" : "+") + buffInfo.value + (buffInfo.unit === PERC ? "%  " : "  ")};
				uiDef["desc" + j] = {type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:"TXT_BUFF_" + buffInfo.type};
			}
			else
			{
				uiDef["iconBg" + j] = {visible:false};
				uiDef["icon" + j] = {visible:false};
				uiDef["text" + j] = {visible:false};
				uiDef["value" + j] = {visible:false};
				uiDef["desc" + j] = {visible:false};
			}
		}
		
		var widget = FWUI.showWithData(UI_DECOR_INFO, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_DECOR_INFO);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
	},
	
	hide:function()
	{
		FWUI.hide(UI_DECOR_INFO, UIFX_POP);
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
		
		var widget = FWPool.getNode(UI_DECOR_INFO, false);
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
	
	showDecorLibrary:function(sender)
	{
		this.hide();
		gv.utilPanel.show (UTIL_LIBRARY, UTIL_LIBRARY_DECOR);
	},
};

