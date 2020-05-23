const DAILY_GIFT_KEY_CLAIMED = "dailygift.claimed";

var DailyGiftManager = cc.Class.extend({
    LOGTAG: "[DailyGiftManager]",
    hasGift: false,
	isShowInGame: false,
    ctor: function () {
    },

    showDailyGift: function (delayTime, isShowInGame) {//web showDailyGift: function (delayTime = 1000, isShowInGame) {
		
		if(delayTime === undefined)
			delayTime = 1000;

        this.isShowInGame = isShowInGame;

        this.showDailyGiftTimer = setTimeout(function() {//web
            clearTimeout(this.showDailyGiftTimer);
            if (this.canShow() || this.isShowInGame) {
				// feedback
				//if(Game.isAnyPopupShowing() || Tutorial.currentStep || (gv.background && gv.background.floorIndex >= 0 && !this.isShowInGame))
				if(Game.isAnyPopupShowing() || Tutorial.currentStep)
				{
					this.showDailyGift(2000, isShowInGame);
				}
				else
				{
					if(gv.background && gv.background.floorIndex >= 0 && !this.isShowInGame)
						gv.background.snapGround();

                    this.showPopup();
                    if(this.isNewUser())
                    {
                        //cc.log("showDailyGift",this.isClaimed(),fr.UserData.getBoolean(DAILY_GIFT_KEY_CLAIMED));
                        this.setClaimed(true);
                    }
                    this.hasGift = false;

                }
            }
        }.bind(this), delayTime);
    },

    // ui

    showPopup: function () {
        if (!this.popupMain)
            this.popupMain = new DailyGiftPopup();
        this.popupMain.show();
    },

    // command

    requestRewards: function () {
        network.connector.sendRequestDailyGift();
    },

    requestDaily: function () {
        network.connector.sendRequestDailyGiftGet();
    },
    // utilities

    isClaimed: function () {
        return fr.UserData.getBoolean(DAILY_GIFT_KEY_CLAIMED) || false;
    },

    setClaimed: function (value) {
        fr.UserData.setBoolean(DAILY_GIFT_KEY_CLAIMED, value);
    },

    getMilestones: function () {

        var dailygift = gv.userData.getDailyGift();
        if (!dailygift || !dailygift[DAILY_GIFT_REWARDS])
            return null;

        cc.log(this.LOGTAG,"getMilestones",JSON.stringify(dailygift));
        var activeMilestone = this.getMilestoneIndex();
        var receiveRewards =false;
        if(dailygift[DAILY_GIFT_CUR] === dailygift[DAILY_GIFT_MAX] ){
            if(this.isNewUser())
            {
               if(this.isClaimed() || this.isShowInGame) receiveRewards = true;
               else receiveRewards = false;
            }
            else {
                receiveRewards = true;
            }
        }
        var milestones = dailygift[DAILY_GIFT_REWARDS].map(function(item, index) {//web
            return {
                index: index,
                rewards: item,
                isActive: index === activeMilestone && !receiveRewards,
                isClaimed: index <= activeMilestone
            };
        });

        return milestones;
    },

    getMilestoneIndex: function () {
        var dailygift = gv.userData.getDailyGift();
        if (dailygift)
            return dailygift[DAILY_GIFT_MAX] - 1;
        return -1;
    },

    getDailyGiftTime: function () {
        return {
            timeEnd: this.timeEnd || 0,
            timeLeft: Math.max(this.timeEnd - Game.getGameTimeInSeconds(), 0),
            timeDuration: this.timeDuration || 0
        }
    },

    updateDailyGiftTime: function () {
        var dailygift = gv.userData.getDailyGift();
        if (dailygift) {
            this.timeDuration = ((dailygift[DAILY_GIFT_IS_NEW_USER]) ? g_MISCINFO.DAILY_GIFT_NEW_USER_DURATION : 999) * 24 * 3600;
            this.timeEnd = dailygift[DAILY_GIFT_TIME_START] + this.timeDuration;
        }
    },

    haveDailyGift: function () {

        if (!gv.userData.isEnoughLevel(g_MISCINFO.DAILY_GIFT_USER_LEVEL))
            return false;

        gv.dailygift.updateDailyGiftTime();

        var dailygift = gv.userData.getDailyGift();
        if (!dailygift[DAILY_GIFT_IS_NEW_USER]) return false;
        if (dailygift)
            return dailygift[DAILY_GIFT_CUR] < dailygift[DAILY_GIFT_MAX];

        return true;
    },
    isNewUser:function(){
        var dailygift = gv.userData.getDailyGift();
        if (dailygift)
            return dailygift[DAILY_GIFT_IS_NEW_USER];
        return false;
    },
    canShow: function () {
        var dailygift = gv.userData.getDailyGift();
        if(!this.isNewUser())
        {
            this.hasGift = dailygift[DAILY_GIFT_CUR] < dailygift[DAILY_GIFT_MAX];
        }

        return this.hasGift;
        //
        //else{
        //return true;
        //}

        /*if (!gv.userData.isEnoughLevel(g_MISCINFO.DAILY_GIFT_USER_LEVEL))
            return false;

        if (this.isClaimed())
            return false;


        if (dailygift)
            return dailygift[DAILY_GIFT_CUR] === dailygift[DAILY_GIFT_MAX];

        return false;*/
    },

    // callbacks

    onDataResponse: function (packet) {
        if (packet.error === 0) {
            this.hasGift = true;
            gv.userData.setDailyGift(packet.dailygift);
			
			// fix: gold, coin... is not updated
            //gv.userStorages.updateItems(packet.updateItems);
			
            this.updateDailyGiftTime();
            this.setClaimed(false);
        }
    },
    onDataResponseDailyGet: function (packet) {
        if (packet.error === 0) {
            this.hasGift = true;
            this.setClaimed(false);
            cc.log(this.LOGTAG,"onDataResponseDailyGet",JSON.stringify(packet));
            //gv.userData.setDailyGift(packet.dailygift);

            // fix: gold, coin... is not updated
            //gv.userStorages.updateItems(packet.updateItems);

            //this.updateDailyGiftTime();
            //this.setClaimed(false);
        }
    }
});

DailyGiftManager._instance = null;
DailyGiftManager.getInstance = function () {
    if (!DailyGiftManager._instance)
        DailyGiftManager._instance = new DailyGiftManager();
    return DailyGiftManager._instance;
};

//web var gv = gv || {};
gv.dailygift = DailyGiftManager.getInstance();