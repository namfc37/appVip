var MiniPopupManager = cc.Class.extend({
    LOGTAG: "[MiniPopupManager]",

    ctor: function () {
    },

    showWaiting: function ()
    {
        var popup = new PopupWaiting();
        popup.show();

        return popup;
    },

    showDisconnect: function ()
    {
        var popup = new PopupDisconnect();
		
		// jira#5522
        //popup.show();
		cc.director.getScheduler().scheduleCallbackForTarget(this, function() {popup.show();}, 1, 0, 0, false);

        return popup;
    },

    showUserInfo: function ()
    {
        var popup = new PopupUserInfo();
        popup.show();
		
		this.popupUserInfo = popup;
        
        return popup;
    },
    
    showGiftcode: function (code)
    {
        var popup = new PopupGiftcode();
        popup.show(code);
		this.giftcodePopup = popup;

        return popup;
    },
	
	hideGiftcode:function()
	{
		this.giftcodePopup.hide();
		this.giftcodePopup = null;
	},
    
    showGameQuit: function ()
    {
        var popup = new PopupGameQuit();
        popup.show();

        return popup;
    },
    
    showGameUpgrade: function ()
    {
        var popup = new PopupGameUpgrade();
        popup.show();

        return popup;
    },

    showTomPresent: function ()
    {
        var popup = new PopupFeaturePresent();
        popup.show({
            npc: "common/images/hud_banner_tom.png",
            level: g_MISCINFO.TOM_USER_LEVEL,
            title: "TXT_TOM_PRESENT_TITLE",
            present: "TXT_TOM_PRESENT_CONTENT"
        });
        
        return popup;
    },

    showAirshipPresent: function ()
    {
        var popup = new PopupFeaturePresent();
        popup.show({
            npc: "common/images/hud_airship_banner.png",
            level: g_MISCINFO.AS_UNLOCK_LEVEL,
            title: "TXT_AS_UNLOCK_TITLE",
            present: "TXT_AS_UNLOCK_CONTENT"
        });
        
        return popup;
    },

    showTruckPresent: function ()
    {
        var popup = new PopupFeaturePresent();
        popup.show({
            npc: "common/images/hud_banner_xe_hang.png",
            level: g_MISCINFO.TRUCK_UNLOCK_LEVEL,
            title: "TXT_TRUCK_UNLOCK_TITLE",
            present: "TXT_TRUCK_UNLOCK_CONTENT"
        });

        return popup;
    },
    showGameHousePresent: function ()
    {
        var popup = new PopupFeaturePresent();
        popup.show({
            npc: "common/images/hud_banner_game.png",
            level: g_MISCINFO.BUILDING_GAME_USER_LEVEL,
            title: "TXT_ARCADE_PRESENT_TITLE",
            present: "TXT_ARCADE_PRESENT_CONTENT"
        });
        
        return popup;
    },

    showAchievementPresent: function ()
    {
		// removed banner to reduce apk size
        // var popup = new PopupFeaturePresent();
        // popup.show({
            // npc: "common/images/hud_banner_achievement.png",
            // level: "",
            // title: "TXT_ACHIEVEMENT_PRESENT_TITLE",
            // present: "TXT_ACHIEVEMENT_PRESENT_CONTENT"
        // });

        // return popup;
    },

    showGuildPresent: function ()
    {
        var popup = new PopupFeaturePresent();
        popup.show({
            npc: "common/images/hud_banner_guild.png",
            level: "",
            title: !g_MISCINFO.GUILD_ACTIVE ? "TXT_GUILD_PRESENT_TITLE" : cc.formatStr(FWLocalization.text("TXT_GUILD_UNLOCK_LEVEL"), g_MISCINFO.GUILD_USER_LEVEL),
            present: "TXT_GUILD_PRESENT_CONTENT"
        });

        return popup;
    },

    showLeaderboardPresent: function ()
    {
        var popup = new PopupFeaturePresent();
        popup.show({
            npc: "common/images/hud_banner_ranking.png",
            level: "",
            title: cc.formatStr(FWLocalization.text("TXT_LEADER_BOARD_PRESENT_TITLE"), g_MISCINFO.RANKING_BOARD_LEVEL),
            present: "TXT_LEADER_BOARD_PRESENT_CONTENT"
        });
        
        return popup;
    },
	
    showLeaderboardInfo: function ()
    {
        var popup = new PopupFeaturePresent(false);
        popup.show({
            npc: "common/images/hud_banner_ranking_infor.png",
            level: "",
            title: "TXT_LEADER_BOARD_INFO_TITLE",
            present: "TXT_LEADER_BOARD_INFO_CONTENT"
        });
        
        return popup;
    },
    showLeaderInfoGachaPon: function ()
    {
        var popup = new PopupFeaturePresent(false);
        popup.show({
            npc: "common/images/hud_banner_gachapon_infor.png",
            level: "",
            title: "TXT_GACHAPON_INFO_TITLE",
            present: "TXT_GACHA_INFO_CONTENT"
        });

        return popup;
    },
    showLeaderInfoFishing: function()
    {
        var popup = new PopupFeaturePresent(false);
        popup.show({
            npc: "common/images/hud_banner_fishing_infor.png",
            level: "",
            title: "TXT_INFO_FISHING_TITLE",
            present: "TXT_INFO_FISHING_CONTENT"
        });

        return popup;
    }
});

MiniPopupManager._instance = null;
MiniPopupManager.getInstance = function ()
{
    if (!MiniPopupManager._instance)
        MiniPopupManager._instance = new MiniPopupManager();
    return MiniPopupManager._instance;
};

//web var gv = gv || {};
gv.miniPopup = MiniPopupManager.getInstance();