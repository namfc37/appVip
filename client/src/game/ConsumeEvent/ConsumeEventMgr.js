var ConsumeEventMgr = cc.Class.extend({
    LOGTAG: "[ConsumeEventMgr]",

    ctor: function () {
    },
    show:function(){
        this.sceneConsume = new ComsumeEventScene();
        if(gv.consumEventMgr.check())
        {
            FWUtils.setCurrentScene(this.sceneConsume, SCENE_TRANSITION_DURATION, true);
        }
        else
        {
            delete this.sceneConsume;
        }

    },
    check:function()
    {
        if (!this.checkTime)
        this.updateCheckTime ();
        var current = Game.getGameTimeInSeconds();
        if(!(this.checkTime.start < current && current < this.checkTime.end))
        {
            return false;
        }
        var requiredLevel = g_MISCINFO.CONSUME_USER_LEVEL;
        this.isEnoughLevel = gv.userData.isEnoughLevel(requiredLevel);
        if(!this.isEnoughLevel)
        {
            return false;
        }
        return true;
    },
    updateCheckTime: function ()
    {
        this.checkTime = null;
        var start = -1;
        var end = -1;
        start =g_MISCINFO.CONSUME_TIME_START;
        end = g_MISCINFO.CONSUME_TIME_END;
        this.checkTime = {start:start, end:end};//web this.checkTime = {start,end};
        //cc.log(this.LOGTAG+" Check time : "+ start +"," + end);
    },
    getTimeEvent:function()
    {
        this.updateCheckTime();
        return this.checkTime;
    },
    checkActive: function()
    {
        var current = Game.getGameTimeInSeconds();
        if (!this.checkTime)
            this.updateCheckTime ();
        if(!(this.checkTime.start < current && current < this.checkTime.end))
        {
            cc.log(this.LOGTAG+ " Current time not belongs to the range !!! ");
            return false;
        }
        cc.log(this.LOGTAG+ " Current time to the range !!! ");
        return true;
    },
    //////////// SERVER /////////////
    RequestConsumeEventGet:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.CONSUME_GET);},
        pack:function()
        {
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),
    ResponseConsumeEventGet:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            var object = PacketHelper.parseObject(this);
            gv.consumEventMgr.sceneConsume.setDataFromServerBegin(object[KEY_CONSUME_EVENT][CONSUME_LIST_CONSUME]);
            cc.log("ResponseConsumeEventGet",JSON.stringify(object));
        }
    }),



    RequestShootBalloon:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.CONSUME_SPIN);},
        pack:function(idTab)
        {
            addPacketHeader(this);
            PacketHelper.putString(this, KEY_CONSUME_ID, idTab);
            
            addPacketFooter(this);
        },
    }),
    ResponseShootBalloon:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            var object = PacketHelper.parseObject(this);
            gv.consumEventMgr.sceneConsume.setData(object[KEY_CONSUME_EVENT][CONSUME_LIST_CONSUME]);
            cc.log("ResponseShootBalloon",JSON.stringify(object));
        }
    }),

    RequestClaimRewards:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.CONSUME_CLAIM_REWARD);},
        pack:function(idTab)
        {
            addPacketHeader(this);
            PacketHelper.putString(this, KEY_CONSUME_ID, idTab);
            
            addPacketFooter(this);
        },
    }),
    ResponseClaimRewards:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            var object = PacketHelper.parseObject(this);
            gv.consumEventMgr.sceneConsume.setData(object[KEY_CONSUME_EVENT][CONSUME_LIST_CONSUME]);
            cc.log("ResponseClaimRewards",JSON.stringify(object));
        }
    }),
});

ConsumeEventMgr._instance = null;
ConsumeEventMgr.getInstance = function () {
    if (!PopupManager._instance)
        ConsumeEventMgr._instance = new ConsumeEventMgr();
    return ConsumeEventMgr._instance;
};

//web var gv = gv || {};
gv.consumEventMgr = new ConsumeEventMgr();


network.packetMap[gv.CMD.CONSUME_SPIN] = gv.consumEventMgr.ResponseShootBalloon;
network.packetMap[gv.CMD.CONSUME_CLAIM_REWARD] = gv.consumEventMgr.ResponseClaimRewards;
network.packetMap[gv.CMD.CONSUME_GET] = gv.consumEventMgr.ResponseConsumeEventGet;