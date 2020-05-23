//web var fr = fr || {};
//web var network = network || {};

network.packetMap = network.packetMap || {};
network.base = network.base || {};

network.chatMap = network.chatMap || {};
network.chatBase = network.chatBase || {};

if (cc.sys.isNative) {
    fr.OutPacket.extend = cc.Class.extend;
    fr.InPacket.extend = cc.Class.extend;
}

var packetUid = 0;

function addPacketHeader (packet) {
    packet.packHeader();        
    packetUid += g_MISCINFO.PACKET_UID_CLIENT_STEP;    
    PacketHelper.putInt(packet, KEY_PACKET_UID, packetUid);
    //cc.log("packetUid", packetUid);
}

function addPacketFooter (packet) {
    PacketHelper.markEndObject(packet);
    packet.updateSize();
}

// Connections

network.base.HandshakeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.HAND_SHAKE);
        this.setControllerId(gv.CONTROLLER_ID.SPECIAL_CONTROLLER);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    }
});

network.base.HandshakeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var object = PacketHelper.parseObject(this);
    }
});


network.base.PigUpdateResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var object = PacketHelper.parseObject(this);
        Game.updateUserDataFromServer(object);
        //this.pigDiamond= object[KEY_PIG_BANK];
    }
});

network.base.UserLoginRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(512);
        this.setCmdId(gv.CMD.USER_LOGIN);
    },
    pack: function (user) {
        addPacketHeader(this);

        PacketHelper.putString(this, KEY_CLIENT_VERSION, FWClientConfig.scriptVersion);
        PacketHelper.putString(this, KEY_OS_NAME, fr.platformWrapper.getOsName());
        PacketHelper.putString(this, KEY_OS_VERSION, fr.platformWrapper.getOSVersion());
        PacketHelper.putString(this, KEY_DEVICE_ID, fr.platformWrapper.getDeviceID());
        PacketHelper.putString(this, KEY_DEVICE_NAME, fr.platformWrapper.getDeviceModel());
        PacketHelper.putString(this, KEY_CONNECTION_TYPE, fr.platformWrapper.getConnectionStatusName());
        PacketHelper.putString(this, KEY_SESSION_PORTAL, ZPLogin.getCurrentSessionKey());//PacketHelper.putString(this, KEY_SESSION_PORTAL, fr.platformWrapper.getDeviceID());        
        PacketHelper.putString(this, KEY_SIM_OPERATOR, fr.platformWrapper.getSimOperator());
        PacketHelper.putString(this, KEY_SOCIAL_TYPE, FWClientConfig.socialType);
        PacketHelper.putString(this, KEY_PACKAGE_NAME, fr.platformWrapper.getPackageName());
        PacketHelper.putString(this, KEY_COUNTRY, COUNTRY);
        PacketHelper.putString(this, KEY_PHONE, fr.platformWrapper.getPhoneNumber());        
        PacketHelper.putInt(this, KEY_NUM, fr.platformWrapper.getPhoneCount());

        var iLocalShop = -1;
        if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowLocalShop)
            iLocalShop = fr.NativePortal.getInstance().isShowLocalShop() ? 1 : 0;
        PacketHelper.putInt(this, KEY_ACTIVE_LOCAL_PAYMENT, iLocalShop);
        //PacketHelper.putString(this, KEY_USER_ID, 5);
        // if (cc.sys.isNative)
        // {
        // try
        // {
        // var raw = jsb.fileUtils.getStringFromFile("/storage/emulated/0/vng/sgmb/dtsk.txt");
        // var data = raw.split(" ");
        // if (data.length >= 2)
        // {
        // PacketHelper.putString(this, KEY_USER_ID, data[0]);
        // PacketHelper.putString(this, KEY_SESSION_FILE, data[1]);
        // }
        // }
        // catch (error)
        // {
        // cc.log("LOAD SESSION ERROR: " + error);
        // }
        // }

        
        addPacketFooter(this);
    }
});

network.base.UserLoginResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
    }
});

network.base.UserDataRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.GET_USER_DATA);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    }
});

network.base.UserDataResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {		
        this.error = this.getError();
        if (this.error === 0) {
            /*gv.userData = new UserData();
            var object = PacketHelper.parseObject(this);
            if (object) {
                gv.userData.setCoin(object[KEY_COIN]);
                gv.userData.setGame(object[KEY_GAME]);

                gv.userData.privateShop = object[KEY_PRIVATE_SHOP];
                gv.userData.mailBox = object[KEY_MAIL_BOX];
                gv.userData.airship = object[KEY_AIRSHIP];
                gv.userData.userId = object[KEY_USER_ID];
				Payment.hasLocalPayment = object[KEY_USE_LOCAL_PAYMENT];

                Game.deltaServerTime = object[KEY_TIME_MILLIS] - _.now();
            }*/
			Game.loadUserData(PacketHelper.parseObject(this));
        }
        else {
            cc.log("UserDataResponse:", "error:", this.error);
        }
    }
});

// Level up

network.LevelupResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {

        this.error = this.getError();
        if (this.error) {
            cc.log("LevelupResponse:", "error:", this.error);
        }
        else {
            var object = PacketHelper.parseObject(this);
			LevelUp.prevLevel = gv.userData.getLevel();
            Game.updateUserDataFromServer(object);

            gv.userData.game[GAME_ORDER] = object[KEY_ORDER];
            Game.refreshUIMain(RF_UIMAIN_ORDER);
            if (FWUI.isShowing(UI_ORDER))
                Orders.show(Orders.selectedOrder[ORDER_ID]);
			
			// jira#5047
			Game.gameScene.background.updateStorageSkin();
			
			// jira#5046
            gv.arcade.refreshNotification();

			// jira#4928
            Game.refreshUIMain(RF_UIMAIN_NPC | RF_UIMAIN_DRAGON | RF_UIMAIN_AIRSHIP | RF_UIMAIN_TRUCK);
            
            // moved to LevelUp::onHide
			//gv.dailygift.showDailyGift();
			
			// jira#5482
			if(gv.ibshop.popupMain)
				gv.ibshop.popupMain.forceRefreshAll();

            cc.log("NETWORK LEVEL UP");
            LevelUp.show(object);
			//cc.director.getScheduler().scheduleCallbackForTarget(LevelUp, LevelUp.show, 0, 0, 1.5, false);
			
			// jira#5737
			Payment.updatePaymentDataFromServer(object[KEY_PAYMENT]);

            Game.refreshUIMain(RF_UIMAIN_PIGBANK);
            Game.refreshUIMain(RF_UIMAIN_VIP);

            //achievement
            Achievement.onAction(g_ACTIONS.ACTION_LEVEL_UP.VALUE, null, 1);
        }
    }
});

// Buy items

network.BuyItemCallback = null;
network.BuyItemRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.BUY_ITEM);
    },
    pack: function (items, priceCoin, callback) {

        network.BuyItemCallback = callback;
		
        addPacketHeader(this);
        PacketHelper.putMapItem(this, KEY_ITEMS, items);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    },
});

network.BuyItemResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        if (this.error)
            cc.log("BuyItemResponse:", "error:", this.error);
        else
            Game.updateUserDataFromServer(PacketHelper.parseObject(this));
		
		if (network.BuyItemCallback) {
			network.BuyItemCallback(this.getError());
			network.BuyItemCallback = null;
		}
    }
});

// Unlock game house

network.UnlockArcadeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.OPEN_BUILDING_GAME);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    },
});

network.UnlockArcadeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        if (this.getError() === 0) {
            gv.userData.setArcadeUnlocked(true);
        }
    }
});

//Ping
network.PingRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.PING);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    },
});

network.PingResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        if (this.getError() === 0) {
            var object = PacketHelper.parseObject(this);
            Game.deltaServerTime = object[KEY_TIME_MILLIS] - _.now();
            cc.log("PingResponse", "Game.deltaServerTime", Game.deltaServerTime);
        }
    }
});

network.sendRequestPing = function () {
    cc.log("GAME PING");
    var pk = network.connector.client.getOutPacket(network.PingRequest);
    pk.pack();
    network.connector.client.sendPacket(pk);
};

network.KickUserResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        gv.gameClient.isKicked = true;
        var error = this.getError();
        cc.log("KickUserResponse", this.getError());        
        var text;
        switch (error)
        {
            case ERROR_BANNED:
                text = "TXT_KICK_BANNED";
                break;
            case ERROR_ONLINE:
                text = "TXT_KICK_ONLINE";
                break;
            case ERROR_FORCE_UPDATE:
            case ERROR_CONNECT_OLD_SERVER:
                text = "TXT_FORCE_UPDATE_CONTENT";
                break;
            default:
                text = cc.formatStr(FWLocalization.text("TXT_LOGIN_ERROR"), error);
                break;
        }

        Game.showPopup({title:"TXT_POPUP_TITLE", content:text, okText:"TXT_EXIT_GAME_YES"}, function () {Game.endGameScene(); });//Game.showPopup({title:"TXT_POPUP_TITLE", content:text, okText:"TXT_EXIT_GAME_YES"}, function () {Game.endGame(); });
    }
});

// Common

network.CommonHandler = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        Game.updateUserDataFromServer(PacketHelper.parseObject(this));
        if (this.getError() !== 0)
            cc.log("network.CommonHandler: error=" + this.getError());
    }
});

// Giftcode
network.RequestGiftCodeGetReward = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.GIFTCODE_GET_REWARD);
    },
    pack: function (inputCode) {
        addPacketHeader(this);
        PacketHelper.putString(this, KEY_UID, inputCode);
        
        addPacketFooter(this);
		FWUtils.disableAllTouches();
    },
});

network.ResponseGiftCodeGetReward = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
		FWUtils.disableAllTouches(false);

		var error = this.getError();
        if (error !== 0)
		{
			// fail
			cc.log("network.ResponseGiftCodeGetReward: error=" + error);
			var msg;
			if(error === ERROR_LIMIT)
				msg = cc.formatStr(FWLocalization.text("TXT_GIFTCODE_ERROR_LIMIT"), this.getError());
			else if(error === ERROR_BUSY)
				msg = cc.formatStr(FWLocalization.text("TXT_GIFTCODE_ERROR_USED"), this.getError());
			else if(error === ERROR_TIMEOUT)
				msg = cc.formatStr(FWLocalization.text("TXT_GIFTCODE_ERROR_TIMEOUT"), this.getError());
			else
				msg = cc.formatStr(FWLocalization.text("TXT_GIFTCODE_ERROR"), this.getError());
			Game.showPopup({title:"TXT_POPUP_TITLE", content:msg}, function() {});
		}
		else
		{
			// success
			// var object = PacketHelper.parseObject(this);
			// Game.updateUserDataFromServer(object);
			// var widget = FWPool.getNode(UI_POPUP_GIFTCODE, false);
			// var button = FWUtils.getChildByName(widget, "btn_submit");
			// var rewardItems = FWUtils.getItemsArray(object[KEY_REWARD_ITEMS]);
			// FWUtils.showFlyingItemIcons(rewardItems, FWUtils.getWorldPosition(button));
			
			gv.miniPopup.hideGiftcode();

			var object = PacketHelper.parseObject(this);
			gv.userData.mailBox = object[KEY_MAIL_BOX];
			Game.refreshUIMain(RF_UIMAIN_MAIL);
			Game.showPopup({content:"TXT_GIFTCODE_SUCCESS"}, function() {});
		}
    }
});

network.ResponseNotifyLocalPayment = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
		var object = PacketHelper.parseObject(this);
		Payment.setLocalPaymentEnabled(object[KEY_ACTIVE_LOCAL_PAYMENT]);
    }
});

network.RequestPaymentGet = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.PAYMENT_GET);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    },
});

network.ResponsePaymentGet = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        if (this.getError() === 0) {
            var object = PacketHelper.parseObject(this);
			Payment.updatePaymentDataFromServer(object[KEY_PAYMENT]);
        }
    }
});

network.RequestConvertOldUser = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.CONVERT_OLD_USER);
    },
    pack: function (facebookId) {
        addPacketHeader(this);

        PacketHelper.putString(this, KEY_UID, facebookId);

        
        addPacketFooter(this);
    },
});

network.ResponseConvertOldUser = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        if (this.getError() === 0) {
            
        }
    }
});

network.RequestTruckUnlock = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.TRUCK_UNLOCK);
    },
    pack: function () {
        addPacketHeader(this);

        
        addPacketFooter(this);
    }
});

network.ResponseTruckUnlock = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {

    }
});
// Mapping

network.packetMap[gv.CMD.TRUCK_UNLOCK] = network.ResponseTruckUnlock;
// Mapping

network.packetMap[gv.CMD.HAND_SHAKE] = network.base.HandshakeResponse;
network.packetMap[gv.CMD.USER_LOGIN] = network.base.UserLoginResponse;
network.packetMap[gv.CMD.PIG_UPDATE_DIAMOND] = network.base.PigUpdateResponse;

network.packetMap[gv.CMD.GET_USER_DATA] = network.base.UserDataResponse;
network.packetMap[gv.CMD.OPEN_BUILDING_GAME] = network.UnlockArcadeResponse;

network.packetMap[gv.CMD.LEVEL_UP] = network.LevelupResponse;
network.packetMap[gv.CMD.BUY_ITEM] = network.BuyItemResponse;

network.packetMap[gv.CMD.PING] = network.PingResponse;
network.packetMap[gv.CMD.KICK_USER] = network.KickUserResponse;

network.packetMap[gv.CMD.GIFTCODE_GET_REWARD] = network.ResponseGiftCodeGetReward;

network.packetMap[gv.CMD.NOTIFY_LOCAL_PAYMENT] = network.ResponseNotifyLocalPayment;
network.packetMap[gv.CMD.PAYMENT_GET] = network.ResponsePaymentGet;

network.packetMap[gv.CMD.CONVERT_OLD_USER] = network.ResponseConvertOldUser;
