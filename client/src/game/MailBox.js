
const MAILBOX_TAB_MAIL = 0;
const MAILBOX_TAB_GIFT = 1;
const MAILBOX_KEEP_DAYS = 15;
const MAILBOX_BRIEFING_LENGTH = 100;

const MAILBOX_FAKE_DATA = false;

var MailBox =
{
	currentTab: MAILBOX_TAB_MAIL,
	
	// jira#4847
	checkedMailsCount: 0,
	btnReceiveAll: null,
	
	init:function()
	{
		if(MAILBOX_FAKE_DATA)
		{
			// fake data
			var mailBox = {};
			mailBox[MAIL_LIST_MAIL] = [];
			for(var i=0; i<20; i++)
			{
				var mail = {};
				mail[MAIL_UID] = i;
				mail[MAIL_TYPE] = (i % 3);
				mail[MAIL_TITLE] = "Mail title #" + i;
				mail[MAIL_CONTENT] = "Mail content";
				mail[MAIL_TIME_CREATE] = Game.getGameTimeInSeconds() - (86400 * i);
				mail[MAIL_IS_READ] = (i % 2 === 0 ? false : true);
				if(i < 5)
					mail[MAIL_ITEMS] = {};
				else
					mail[MAIL_ITEMS] = {GOLD:100 * i, EXP:10 * i, COIN:i};
				mailBox[MAIL_LIST_MAIL].push(mail);
			}
			gv.userData.mailBox = mailBox;
			cc.log("MailBox::init: mailbox fake data: " + JSON.stringify(gv.userData.mailBox));
		}
		else
			cc.log("MailBox::init: mailbox data: " + JSON.stringify(gv.userData.mailBox));
	},
	
	show:function(tab)
	{
		if(tab === undefined)
			tab = this.currentTab;
		else
			this.currentTab = tab;
		
		// mail list of current tab
		var displayMailList = this.getDisplayMailList(tab);
		
		// notification on tab
		var mailNotifyNew = false;
		var mailNotifyHot = false;
		var giftNotifyNew = false;
		var giftNotifyHot = false;
		var mailList = gv.userData.getMailList();
		for(var i=0; i<mailList.length; i++)
		{
			var mail = mailList[i];
			var mailRemainDays = this.getMailRemainDays(mail[MAIL_TIME_CREATE]);
			if(_.size(mail[MAIL_ITEMS]) > 0)
			{
				// gift
				if(mail[MAIL_IS_READ] === false)
					giftNotifyNew = true;
				if(mailRemainDays <= 1)
					giftNotifyHot = true;
			}
			else
			{
				// mail
				if(mail[MAIL_IS_READ] === false)
					mailNotifyNew = true;
				if(mailRemainDays <= 1)
					mailNotifyHot = true;
			}
		}
		
		// ui
		var itemDef =
		{
			checkBg:{onTouchEnded:this.onCheckMail.bind(this)},
			checkIcon:{visible:"data.isChecked === true"},
			itemTitle:{type:UITYPE_TEXT, field:MAIL_TITLE, style:TEXT_STYLE_TEXT_DIALOG_KEYWORD},//itemTitle:{type:UITYPE_TEXT, field:"MAIL_TITLE"},
			content:{type:UITYPE_TEXT, field:"briefing", style:TEXT_STYLE_TEXT_DIALOG},
			time:{type:UITYPE_TEXT, field:"timeText", style:TEXT_STYLE_TEXT_DIALOG},
			notifyBg:{visible:"data.isHot === true || data[MAIL_IS_READ] === false", anim:UIANIM_BLINK},
			notifyNew:{visible:"data.isHot === false && data[MAIL_IS_READ] === false"},
			notifyHot:{visible:"data.isHot === true"},
			bg:{color:"data.color"},//bg:{color:"data.color", onTouchEnded:this.showMail.bind(this)},
			Panel_7:{onTouchEnded:this.showMail.bind(this)},
		};
		
		var uiDef =
		{
			tapToClose:{onTouchEnded:this.hide.bind(this)},
			tabMailOff:{visible:tab !== MAILBOX_TAB_MAIL, onTouchEnded:this.onChangeTab.bind(this)},
			tabGiftOff:{visible:tab !== MAILBOX_TAB_GIFT, onTouchEnded:this.onChangeTab.bind(this)},
			tabMailOn:{visible:tab === MAILBOX_TAB_MAIL},
			tabGiftOn:{visible:tab === MAILBOX_TAB_GIFT},
			checkAllBg:{onTouchEnded:this.onCheckAllMails.bind(this)},
			checkAllIcon:{visible:false},
			btnDelete:{onTouchEnded:this.onDeleteMail.bind(this)},
			title:{type:UITYPE_TEXT, value:"TXT_MAILBOX_TITLE", style:TEXT_STYLE_TITLE_1},//title:{type:UITYPE_TEXT, value:"TXT_MAILBOX_TITLE", shadow:SHADOW_DEFAULT},
			subtitle:{type:UITYPE_TEXT, value:MAILBOX_KEEP_DAYS, format:"TXT_MAILBOX_SUBTITLE", style:TEXT_STYLE_TEXT_HINT_BROWN},//subtitle:{type:UITYPE_TEXT, value:MAILBOX_KEEP_DAYS, format:"TXT_MAILBOX_SUBTITLE"},
			receiveAllPanel:{visible:tab === MAILBOX_TAB_GIFT},
			btnReceiveAll:{onTouchEnded:this.onReceiveAll.bind(this), enabled:displayMailList.length > 0},
			txtReceiveAll:{type:UITYPE_TEXT, value:"TXT_MAILBOX_RECEIVE_ALL", style:TEXT_STYLE_TEXT_BUTTON},//txtReceiveAll:{type:UITYPE_TEXT, value:"TXT_MAILBOX_RECEIVE_ALL", shadow:SHADOW_DEFAULT},
			mailNotify:{anim:UIANIM_BLINK},
			giftNotify:{anim:UIANIM_BLINK},
			itemList:{type:UITYPE_2D_LIST, itemUI:UI_MAILBOX_ITEM, itemDef:itemDef, itemSize:cc.size(580, 135), items:displayMailList, vertical:true},
		};
		
		var widget = FWPool.getNode(UI_MAILBOX, false);
		if(FWUI.isWidgetShowing(widget))
		{
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(cc.winSize.width + 200, cc.winSize.height / 2), toPos:cc.p(cc.winSize.width / 2, cc.winSize.height / 2)});
			widget.setLocalZOrder(Z_UI_MAILBOX);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);

			this.btnReceiveAll = FWUtils.getChildByName(widget, "btnReceiveAll");
            
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			// jira#5132
			//FWUtils.showDarkBg(null, Z_UI_MAILBOX - 1);
		}
		
		this.showTabNotification();
		this.btnReceiveAll.setEnabled(this.checkedMailsCount > 0);
		
		// jira#5472
		var itemList = FWUtils.getChildByName(widget, "itemList");
		itemList.scrollToPercentVertical(0, 0.01, false);
	},
	
	hide:function()
	{
		FWUI.hide(UI_MAILBOX, {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(cc.winSize.width / 2, cc.winSize.height / 2), toPos:cc.p(cc.winSize.width + 200, cc.winSize.height / 2)});
		Game.refreshUIMain(RF_UIMAIN_MAIL);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		// jira#5132
		//FWUtils.hideDarkBg();
	},
	
	showTabNotification:function()
	{
		var mailNotifyNew = false;
		var mailNotifyHot = false;
		var giftNotifyNew = false;
		var giftNotifyHot = false;
		var mailList = gv.userData.getMailList();
		for(var i=0; i<mailList.length; i++)
		{
			var mail = mailList[i];
			var mailRemainDays = this.getMailRemainDays(mail[MAIL_TIME_CREATE]);
			if(_.size(mail[MAIL_ITEMS]) > 0)
			{
				// gift
				if(mail[MAIL_IS_READ] === false)
					giftNotifyNew = true;
				if(mailRemainDays <= 1)
					giftNotifyHot = true;
			}
			else
			{
				// mail
				if(mail[MAIL_IS_READ] === false)
					mailNotifyNew = true;
				if(mailRemainDays <= 1)
					mailNotifyHot = true;
			}
		}
		
		var widget = FWPool.getNode(UI_MAILBOX, false);
		var mailNotifyWidget = FWUtils.getChildByName(widget, "mailNotify");
		var mailNotifyNewWidget = FWUtils.getChildByName(widget, "mailNotifyNew");
		var mailNotifyHotWidget = FWUtils.getChildByName(widget, "mailNotifyHot");
		var giftNotifyWidget = FWUtils.getChildByName(widget, "giftNotify");
		var giftNotifyNewWidget = FWUtils.getChildByName(widget, "giftNotifyNew");
		var giftNotifyHotWidget = FWUtils.getChildByName(widget, "giftNotifyHot");

		mailNotifyWidget.setVisible(mailNotifyNew === true || mailNotifyHot === true);
		mailNotifyNewWidget.setVisible(mailNotifyNew === true && mailNotifyHot === false);
		mailNotifyHotWidget.setVisible(mailNotifyHot === true);
		giftNotifyWidget.setVisible(giftNotifyNew === true || giftNotifyHot === true);
		giftNotifyNewWidget.setVisible(giftNotifyNew === true && giftNotifyHot === false);
		giftNotifyHotWidget.setVisible(giftNotifyHot === true);
	},
	
	getDisplayMailList:function(tab)
	{
		var mailList = gv.userData.getMailList();
		var displayMailList = [];
		this.checkedMailsCount = 0;
		
		for(var i=0; i<mailList.length; i++)
		{
			var mail = mailList[i];
			var itemsCount = _.size(mail[MAIL_ITEMS]);
			
			if((tab === MAILBOX_TAB_MAIL && itemsCount > 0) || (tab === MAILBOX_TAB_GIFT && itemsCount <= 0))
				continue; // not this tab
			
			mail.tab = tab;
			mail.isChecked = false;
			mail.isHot = false;
			mail.color = (mail[MAIL_IS_READ] ? cc.color(192, 192, 192, 255) : cc.WHITE);
			
			// override title & content for some types
			mail[MAIL_TITLE] = this.parseMailText(mail[MAIL_TITLE]);//FWLocalization.text(mail[MAIL_TITLE]);
			mail[MAIL_CONTENT] = this.parseMailText(mail[MAIL_CONTENT]);//FWLocalization.text(mail[MAIL_CONTENT]);
			mail.briefing = FWUtils.cutLongString(mail[MAIL_CONTENT], MAILBOX_BRIEFING_LENGTH);
			
			this.updateMailTimeText(mail);
			displayMailList.push(mail);
		}
		
		displayMailList = _.sortByDecent(displayMailList, function(val)
		{
			return (val[MAIL_TIME_CREATE] + (val[MAIL_IS_READ] ? 0 : 1) * 86400 * 365);
		});
		return displayMailList;
	},
	
	updateMailTimeText:function(mail)
	{
		var mailRemainDays = this.getMailRemainDays(mail[MAIL_TIME_CREATE]);
		if(mailRemainDays === MAILBOX_KEEP_DAYS)
			mail.timeText = "TXT_MAILBOX_TODAY";
		else if(mailRemainDays === MAILBOX_KEEP_DAYS - 1)
			mail.timeText = "TXT_MAILBOX_YESTERDAY";
		else if(mailRemainDays <= 1)
		{
			mail.timeText = "TXT_MAILBOX_DUE";
			mail.isHot = true;
		}
		else
			mail.timeText = FWUtils.secondsToDayMonthString(mail[MAIL_TIME_CREATE]);
	},
	
	getMailRemainDays:function(creationTime)
	{
		return (MAILBOX_KEEP_DAYS - Math.floor((Game.getGameTimeInSeconds() - creationTime) / 86400));
	},
	
	parseMailText:function(text)
	{
		if(!text.startsWith("TXT_"))
			return text;
		
		if(text.indexOf(",") < 0)
			return FWLocalization.text(text);
		
		var texts = text.split(",");
		for(var i=0; i<texts.length; i++)
			texts[i] = FWLocalization.text(texts[i]);
		
		if(texts.length === 2)
			return cc.formatStr(texts[0], texts[1]);
		else if(texts.length === 3)
			return cc.formatStr(texts[0], texts[1], texts[2]);
		else if(texts.length === 4)
			return cc.formatStr(texts[0], texts[1], texts[2], texts[3]);
		else // if(texts.length === 5)
			return cc.formatStr(texts[0], texts[1], texts[2], texts[3], texts[4]);
	},
	
	checkedMailsCount: 0,
	onCheckMail:function(sender, check)
	{
		if(check === undefined)
			check = !sender.uiData.isChecked;
		
		this.checkedMailsCount += (check ? 1 : -1);
		this.btnReceiveAll.setEnabled(this.checkedMailsCount > 0);
		
		var checkIcon = sender.getParent().getChildByName("checkIcon");
		checkIcon.setVisible(check);
		sender.uiData.isChecked = check;
	},
	
	onCheckAllMails:function(sender)
	{
		var widget = FWPool.getNode(UI_MAILBOX, false);
		var checkAllIcon = FWUtils.getChildByName(widget, "checkAllIcon");
		var check = !checkAllIcon.isVisible();
		checkAllIcon.setVisible(check);
		
		var itemList = FWUtils.getChildByName(widget, "itemList");
		var children = itemList.getChildren();
		for(var i=0; i<children.length; i++)
		{
			var checkBg = FWUtils.getChildByName(children[i], "checkBg");
			this.onCheckMail(checkBg, check);
		}
	},
	
	onChangeTab:function(sender)
	{
		var name = sender.getName();
		if(name === "tabMailOff")
			this.show(MAILBOX_TAB_MAIL);
		else if(name === "tabGiftOff")
			this.show(MAILBOX_TAB_GIFT);
	},
	
	onDeleteMail:function(sender)
	{
		// fake
		var mailList = gv.userData.getMailList();
		var deleteUids = [];
		for(var i=0; i<mailList.length; i++)
		{
			var mail = mailList[i];
			if(mail.isChecked && mail.tab === this.currentTab)
			{
				deleteUids.push(mail[MAIL_UID]);
				mailList.splice(i, 1);
				i--;
			}
		}
		this.show();
		
		// server
		var pk = network.connector.client.getOutPacket(MailBox.RequestMailDelete);
		pk.pack(deleteUids);
		network.connector.client.sendPacket(pk);
	},

	onReceiveAll:function(sender)
	{
		// fake
		var receiveUids = [];
		var mailList = gv.userData.getMailList();
		var widget = FWPool.getNode(UI_MAILBOX, false);
		var itemList = FWUtils.getChildByName(widget, "itemList");
		var children = itemList.getChildren();
		for(var i=0, rewardIndex=0; i<children.length; i++)
		{
			var mail = children[i].uiBaseData;
			if(!mail.isChecked)
				continue;
			
			var giftList = FWUtils.getItemsArray(mail[MAIL_ITEMS]);
			if(!Game.canReceiveGift(giftList))
				break;

			var needCheckStock = (mail[MAIL_TYPE] !== MAIL_OFFER && mail[MAIL_TYPE] !== MAIL_FIRST_CHARGE_ITEM);
			Game.addItems(giftList, FWUtils.getWorldPosition(children[i]), (rewardIndex++) * 0.05, needCheckStock);
			receiveUids.push(mail[MAIL_UID]);
			FWUtils.removeArrayElement(mailList, mail);
		}
		this.show();
		
		// server
		var pk = network.connector.client.getOutPacket(MailBox.RequestMailGetReward);
		pk.pack(receiveUids);
		network.connector.client.sendPacket(pk);
	},
	
	showMail:function(sender)
	{
		if(Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y) > 20)
			return; // scrolled
		
		// mark as read
		var mail = sender.uiData;
		if(mail[MAIL_IS_READ] === false)
		{
			mail[MAIL_IS_READ] = true;
			
			// jira#5622
			//sender.setColor(cc.color(96, 96, 96, 255));
			var bg = sender.getChildByName("bg");
			bg.setColor(cc.color(192, 192, 192, 255));
			
			if(!mail.isHot)
			{
				var notifyBg = FWUtils.getChildByName(sender, "notifyBg");
				notifyBg.setVisible(false);
			}
			this.showTabNotification();
			
			var pk = network.connector.client.getOutPacket(MailBox.RequestMailMarkRead);
			pk.pack(mail[MAIL_UID]);
			network.connector.client.sendPacket(pk);
		}
		
		if(this.currentTab === MAILBOX_TAB_GIFT)
		{
			this.showGift(sender);
			return;
		}
		
		var uiDef = 
		{
			title:{type:UITYPE_TEXT, value:mail[MAIL_TITLE], style:TEXT_STYLE_TEXT_NORMAL},//title:{type:UITYPE_TEXT, value:mail[MAIL_TITLE], shadow:SHADOW_DEFAULT},
			content:{type:UITYPE_TEXT, value:mail[MAIL_CONTENT], style:TEXT_STYLE_TEXT_DIALOG},//content:{type:UITYPE_TEXT, value:mail[MAIL_CONTENT]},
			okText:{type:UITYPE_TEXT, value:mail[MAIL_TYPE] === MAIL_GIFTCODE ? "TXT_MAILBOX_ENTER_GIFTCODE" : "TXT_MAILBOX_CLOSE", style:TEXT_STYLE_TEXT_BUTTON},//okText:{type:UITYPE_TEXT, value:"TXT_MAILBOX_CLOSE"},
			btnOk:{onTouchEnded:function(sender) {this.onHideMailButton(mail);}.bind(this)},
		};
		
		var widget = FWUI.showWithData(UI_MAILBOX_MESSAGE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_MAILBOX_MAIL);
		
		if(!this.hideFunc2)
			this.hideFunc2 = function() {this.hideMail()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc2);
	},
	
	onHideMailButton:function(mail)
	{
		// jira#7028
		if(mail[MAIL_TYPE] === MAIL_GIFTCODE)
		{
			this.hideMail();
			this.hide();
			gv.miniPopup.showGiftcode(mail[MAIL_CONTENT]);
		}
		else
			this.hideMail();
	},
	
	hideMail:function()
	{
		FWUI.hide(UI_MAILBOX_MESSAGE, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc2);
	},
	
	showGift:function(sender)
	{
		var mail = sender.uiData;
		var giftList = mail[MAIL_ITEMS]
		var title = mail[MAIL_TITLE]
		var receiveCallback = function() {MailBox.receiveGift(mail);}//web
		var cancelCallback = null;
		var receiveInMailbox = false;
		var needCheckStock = (mail[MAIL_TYPE] !== MAIL_OFFER && mail[MAIL_TYPE] !== MAIL_FIRST_CHARGE_ITEM);
		var isPOSM = (giftList[EVENT_POSM_ITEM_ID] !== undefined && giftList[EVENT_POSM_ITEM_ID] > 0);
        
		Game.showGiftPopup(giftList, title, receiveCallback, cancelCallback, receiveInMailbox, needCheckStock, isPOSM);
	},
	
	receiveGift:function(mail)
	{
		// fake: delete mail
		gv.userData.mailRemove(mail);
		this.show();
		
		// server
		var pk = network.connector.client.getOutPacket(MailBox.RequestMailGetReward);
		pk.pack([mail[MAIL_UID]]);
		network.connector.client.sendPacket(pk);
	},
	
	updateMailBoxDataFromServer:function(userData, mailBoxData, isMainUser)//web updateMailBoxDataFromServer:function(userData, mailBoxData, isMainUser = true)
	{
		if(isMainUser === undefined)
			isMainUser = true;
		
		userData.mailBox = mailBoxData;
		
		if(isMainUser)
		{
			var mailList = userData.getMailList();
			var normalMailList = [];
			var guildMailList = [];
			var mailGuildAcceptJoin = null;
			//var mailGuildKick = null; don't need this, use broadcast instead
			Guild.mailGuildDisband = null;
			
			for(var i in mailList)
			{
				var mail = mailList[i];
				var mailType = mail[MAIL_TYPE];
				if (mailType === MAIL_OFFER)
					mail[MAIL_TITLE] = gv.offerPanel.offerName (mail[MAIL_TITLE]);
				else if (mailType === MAIL_FIRST_CHARGE_ITEM)
				{
					var channel = Number(mail[MAIL_TITLE]);
					if(!isNaN(channel))
						mail[MAIL_TITLE] = Payment.getFirstChargeMailTitle(channel);
				}
				else if (mailType === MAIL_CONVERT_OLD_USER)
				{
					mail[MAIL_TITLE] = FWLocalization.text(mail[MAIL_TITLE]);
					mail[MAIL_CONTENT] = FWLocalization.text(mail[MAIL_CONTENT]);
				}
				
				if(mailType === MAIL_GUILD_INVITE || mailType === MAIL_GUILD_KICK || mailType === MAIL_GUILD_NOTIFY || mailType === MAIL_GUILD_ACCEPT_JOIN || mailType === MAIL_GUILD_DISBAND || mailType === MAIL_GUILD_DONATE_FAIL)
				{
					if(mail[MAIL_IS_READ] === false)
					{
						if(mailType === MAIL_GUILD_ACCEPT_JOIN)
							mailGuildAcceptJoin = mail;
						//else if(mailType === MAIL_GUILD_KICK)
						//	mailGuildKick = mail;
						else if(mailType === MAIL_GUILD_DISBAND)
							Guild.mailGuildDisband = mail;
					}
					guildMailList.push(mail);
				}
				else
					normalMailList.push(mail);
			}
			
			Guild.mailList = guildMailList;
			userData.mailBox[MAIL_LIST_MAIL] = normalMailList;
			
			if(mailGuildAcceptJoin)
			{
				if(Guild.playerGuildData && Guild.playerGuildData[GUILD_USER_ID] < 0)
				{
					// this user has just been accepted as guild member
					Guild.loadPlayerGuildData();
				}
				
				var pk = network.connector.client.getOutPacket(MailBox.RequestMailMarkRead);
				pk.pack(mailGuildAcceptJoin[MAIL_UID]);
				network.connector.client.sendPacket(pk);
			}
			/*if(mailGuildKick)
			{
				if(Guild.playerGuildData && Guild.playerGuildData[GUILD_USER_ID] >= 0)
				{
					// this user has just been kicked
					Guild.onQuit();
				}
				
				var pk = network.connector.client.getOutPacket(MailBox.RequestMailMarkRead);
				pk.pack(mailGuildKick[MAIL_UID]);
				network.connector.client.sendPacket(pk);
			}*/
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// server ///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	RequestMailMarkRead:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MAIL_MARK_READ);},
		pack:function(uid)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, [uid]);
			
			addPacketFooter(this);
		},
	}),

	RequestMailDelete:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MAIL_DELETE);},
		pack:function(uids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, uids);
			
			addPacketFooter(this);
		},
	}),

	ResponseMail:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(!MAILBOX_FAKE_DATA)
			{
				if(this.getError() !== 0)
				{
					cc.log("MailBox::ResponseMail: error=" + this.getError());
					
					var object = PacketHelper.parseObject(this);
					gv.userData.mailBox = object[KEY_MAIL_BOX];
					MailBox.show(); // refresh
				}
			}
		}
	}),
	
	RequestMailGetReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MAIL_GET_REWARD);},
		pack:function(uids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, uids);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseMailGetReward:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(!MAILBOX_FAKE_DATA)
			{
				var object = PacketHelper.parseObject(this);
				Game.updateUserDataFromServer(object);
				
				if(this.getError() !== 0)
				{
					cc.log("MailBox::ResponseMailGetReward: error=" + this.getError());
					gv.userData.mailBox = object[KEY_MAIL_BOX];
					MailBox.show(); // refresh
				}
			}
		}
	}),
	
	ResponseMailNotify:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			MailBox.updateMailBoxDataFromServer(gv.userData, object[KEY_MAIL_BOX]);//gv.userData.mailBox = object[KEY_MAIL_BOX];
			if(FWUI.isShowing(UI_MAILBOX))
				MailBox.show();
			else
				Game.refreshUIMain(RF_UIMAIN_MAIL);
			
			if(this.getError() !== 0)
				cc.log("MailBox::ResponseMailNotify: error=" + this.getError());
		}
	}),	
};

network.packetMap[gv.CMD.MAIL_MARK_READ] = MailBox.ResponseMail;
network.packetMap[gv.CMD.MAIL_DELETE] = MailBox.ResponseMail;
network.packetMap[gv.CMD.MAIL_GET_REWARD] = MailBox.ResponseMailGetReward;
network.packetMap[gv.CMD.MAIL_NOTIFY] = MailBox.ResponseMailNotify;
