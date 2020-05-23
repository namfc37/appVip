var FriendManager = cc.Class.extend({
    LOGTAG: "[FriendManager]",

    ctor: function () {
    },

    show: function (tab = FRIEND_TAB_LIST)
    {
        if (!this.panel)
            this.panel = new FriendPanel();
        
        this.panel.show(tab);
    },
});

FriendManager._instance = null;
FriendManager.getInstance = function ()
{
    if (!FriendManager._instance)
        FriendManager._instance = new FriendManager();
    return FriendManager._instance;
};

//web var gv = gv || {};
gv.friendPanel = FriendManager.getInstance();