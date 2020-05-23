var VipManager = cc.Class.extend({
    LOGTAG : "[VipManager]",

    ctor: function() {
        this.idVip = null;
        this.iconVip = imgIconVip.OFFER_VIP_0;
        this.iconBuffVip = imgIconBuffVip.OFFER_VIP_0;
        this.iconFrameVip = imgFrameVip.OFFER_VIP_0;
        this.instantReceiveReward = {};
        this.convertGoldBonus = null;
        this.dailyLoginReward = {};
        this.updatePotRate = null;
        this.blackSmithRate = null;
        this.airshipGoldBonus = null;
        this.bugRate = null;
        this.timeBought = 0;
        this.timeEndValid = 0;
        this.levelUnlockVip = g_MISCINFO.VIP_UNLOCK_LEVEL;
        this.isActive = g_MISCINFO.VIP_ACTIVE;

        //this.init(OFFER_VIP_1);
    },
    init: function(idVip){
        /// TEST
        //var object2 = g_VIP.VIP_ITEMS[OFFER_VIP_2];

        if(idVip == VIP_INACTIVE)
        {
            return;
        }
        this.idVip = idVip;
        this.iconVip = imgIconVip[idVip];
        this.iconBuffVip = imgIconBuffVip[idVip];
        this.iconFrameVip = imgFrameVip[idVip];
        this.instantReceiveReward = {};
        this.convertGoldBonus = g_VIP.VIP_ITEMS[idVip].CONVERT_GOLD_BONUS;
        this.dailyLoginReward = {};
        this.updatePotRate = g_VIP.VIP_ITEMS[idVip].UPGRADE_POT_RATE;
        this.blackSmithRate = g_VIP.VIP_ITEMS[idVip].BLACKSMITH_RATE;
        this.airshipGoldBonus = g_VIP.VIP_ITEMS[idVip].AIRSHIP_GOLD_BONUS;
        this.bugRate = g_VIP.VIP_ITEMS[idVip].BUG_RATE;

        Game.refreshUIMain(RF_UIMAIN_VIP);
        //this.timeValid = null;
    },
    check: function()
    {

        cc.log(this.LOGTAG+ "ICON BUFF VIP :",this.iconBuffVip);
        //cc.log(this.LOGTAG+ " Check Vip .... ");
        var current = Game.getGameTimeInSeconds();
        return (this.timeBought < current && current < this.timeEndValid);
    },
    checkActive:function()
    {
        if(!gv.userData.isEnoughLevel(this.levelUnlockVip))
        {
            cc.log(this.LOGTAG+ " CHECK NOT ENOUGH LEVEL : " +gv.userData.getLevel()+"," +this.levelUnlockVip);
            return false;
        }
        if(!this.isActive)
        {
            cc.log(this.LOGTAG+ " VIP NOT ACTIVE ");
            return false;
        }
        return true;
    },
    show: function()
    {
        cc.log(this.LOGTAG+ " Show UI ");
        PigBank.currentTab= TAB_VIP_SYSTEM_MAIN;
        PigBank.show();
    },
    checkKeyVip: function(key)
    {
        if(!this.check()) return false;
        return this.idVip === key;
    }


});



VipManager._instance = null;
VipManager.getInstance = function () {
    if (!VipManager._instance)
        VipManager._instance = new VipManager();
    return VipManager._instance;
};
//web var gv = gv || {};
gv.vipManager = VipManager.getInstance();