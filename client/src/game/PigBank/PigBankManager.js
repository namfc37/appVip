const PIGBANK_ANIM_IDLE = "idle";
const PIGBANK_ANIM_WALK = "walk";
const PIGBANK_ANIM_WALK_DIAMOND = "walk_full";
const PIGBANK_ANIM_STAND = "stand";
const PIGBANK_ANIM_DIAMOND = "diamond";

const TIME_TOSS_DIAMOND_NPC_PIG = 1; //second

var PigBankManager = cc.Class.extend({
    LOGTAG: "[PigBankManager]",

    ctor:function(){
        //cc.log(this.LOGTAG+ " create !! ");
    },
    load: function(){},
    check: function(){
        if (!this.checkTime)
            this.updateCheckTime ();
        var current = Game.getGameTimeInSeconds();
        if(!(this.checkTime.start < current && current < this.checkTime.end))
        {
            //cc.log(this.LOGTAG+ " Current time not belongs to the range !!! ");
            return false;
        }

        if(this.checkTime.start < gv.mainUserData.timeGetReward && gv.mainUserData.timeGetReward < this.checkTime.end)
        {
            //cc.log(this.LOGTAG+ " Received Gift ");
            return false;
        }
        var requiredLevel = g_MISCINFO.PIG_UNLOCK_LEVEL;
        this.isEnoughLevel = gv.userData.isEnoughLevel(requiredLevel);
        //cc.log(this.LOGTAG+ " CHECK ENOUGH LEVEL :" + this.isEnoughLevel);

        if(!this.isEnoughLevel)
        {
            return false;
        }
        return true;

    },
    checkActive: function()
    {
        var current = Game.getGameTimeInSeconds();
        if (!this.checkTime)
            this.updateCheckTime ();
        if(!(this.checkTime.start < current && current < this.checkTime.end))
        {
            //cc.log(this.LOGTAG+ " Current time not belongs to the range !!! ");
            return false;
        }
        if(this.checkTime.start < gv.mainUserData.timeGetReward && gv.mainUserData.timeGetReward < this.checkTime.end)
        {
            //cc.log(this.LOGTAG+ " Received Gift ");
            return false;
        }
        return  g_MISCINFO.PIG_ACTIVE;
    },
    getTimeEvent:function()
    {
        this.updateCheckTime ();
        return this.checkTime;
    },
    show: function () {
        cc.log(this.LOGTAG+ " Show PigBank ");
        PigBank.currentTab= TAB_PIGBANK_MAIN;
        PigBank.show();
    },
    updateCheckTime: function ()
    {
        this.checkTime = null;
        var start = -1;
        var end = -1;

        var currentTime = Game.getGameTimeInSeconds();

        var rangeTime = g_MISCINFO.PIG_DURATION[0];
        for (var i = 0; i < g_MISCINFO.PIG_DURATION.length; i++) {
            if (g_MISCINFO.PIG_DURATION[i][0] <= currentTime && g_MISCINFO.PIG_DURATION[i][1] >= currentTime) {
                rangeTime = g_MISCINFO.PIG_DURATION[i];
            }
        }
        //g_MISCINFO.PIG_DURATION

        start = rangeTime[0];
        end = rangeTime[1];
        this.checkTime = {start:start, end:end};
        cc.log(this.LOGTAG + " Check time : " + start + "," + end);
    },
    checkEnoughDiamondPigBank: function()
    {
        return gv.userData.currentDiamond >= g_MISCINFO.PIG_MILESTONE_MIN;
    }



});






PigBankManager._instance = null;
PigBankManager.getInstance = function () {
    if (!PigBankManager._instance)
        PigBankManager._instance = new PigBankManager();
    return PigBankManager._instance;
};
//web var gv = gv || {};
gv.pigBankPanel = PigBankManager.getInstance();