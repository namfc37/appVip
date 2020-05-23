var PopupManager = cc.Class.extend({
    LOGTAG: "[PopupManager]",

    ctor: function () {
    },

    showFlyingReward: function (items, delay, callback) {//web showFlyingReward: function (items, delay = 0, callback = null) {
		
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
		// jira#5111
        cc.log(this.LOGTAG, "show", "items: %j", items);

        /*if (!FWUI.isShowing(UI_REWARD_COLLECT)) {

            this.popupReward = FWPool.getNode(UI_REWARD_COLLECT, false);
            if (this.popupReward) {

                var itemStock = FWUI.getChildByName(this.popupReward, "itemStock");
                if (!itemStock.originScale)
                     itemStock.originScale = itemStock.getScale();

                var itemLight = FWUI.getChildByName(this.popupReward, "itemLight");
                itemLight.setVisible(false);

                items.forEach((item, index) => {

                    var itemNode = FWPool.getNode(UI_REWARD_ITEM_SIMPLE, true);
                    itemNode.setAnchorPoint(cc.ANCHOR_CENTER());
                    this.popupReward.addChild(itemNode);

                    var itemSpine = FWUI.getChildByName(itemNode, "spine");
                    var itemSprite = FWUI.getChildByName(itemNode, "sprite");

                    var itemGfx = Game.getItemGfxByDefine(item.itemId);
                    if (itemGfx.sprite) {
                        FWUI.fillData_image2(itemSprite, itemGfx.sprite, itemGfx.scale || 1.0);
                    }
                    else if (itemGfx.spine) {
                        FWUI.fillData_spine2(itemSpine, itemGfx.spine, itemGfx.skin || "", itemGfx.anim || "", itemGfx.scale || 1.0);
                    }

                    itemSpine.setVisible(itemGfx.spine !== undefined);
                    itemSprite.setVisible(itemGfx.sprite !== undefined);

                    var destination = itemStock.getPosition();
                    var actionCallback = cc.callFunc(() => {

                        var scale = (itemStock.originScale || 1.0);
                        itemStock.stopAllActions();
                        itemStock.setScale(scale * 1.25);
                        itemStock.runAction(new cc.EaseBounceOut(cc.scaleTo(0.5, scale)));

                        itemLight.isLast = index === items.length - 1;
                        itemLight.stopAllActions();
                        itemLight.setOpacity(255);
                        itemLight.setScale(1.5);
                        itemLight.runAction(cc.scaleTo(0.25, 2));
                        itemLight.runAction(cc.sequence(cc.show(), cc.fadeOut(0.25), cc.hide(), cc.callFunc((target) => {
                            if (target.isLast === true)
                                FWUI.hideWidget(this.popupReward, UIFX_NONE);
                        }, itemLight)));

                        if (index === items.length - 1)
                            callback && callback();
                    });

                    var action = cc.sequence(cc.delayTime(delay + index * 0.1), cc.show(),
                        new cc.EaseQuadraticActionIn(cc.jumpTo(0.8, destination, (destination.y > item.itemPosition.y) ? -200 : 200, 1)), cc.removeSelf(), actionCallback);

                    itemNode.setVisible(false);
                    itemNode.setPosition(item.itemPosition);

                    itemNode.stopAllActions();
                    itemNode.runAction(action);
                });

                itemStock.setVisible(false);
                itemStock.runAction(cc.sequence(cc.delayTime(delay), cc.show()));
            }

            FWUI.setWidgetCascadeOpacity(this.popupReward, true);
            FWUI.showWidget(this.popupReward, FWUtils.getCurrentScene(), UIFX_NONE, true);
			this.popupReward.setLocalZOrder(Z_UI_COMMON + 1); // jira#5078
        }*/
		FWUtils.showFlyingItemIcons(items, cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
		if(callback)
			callback();
    }
});

PopupManager._instance = null;
PopupManager.getInstance = function () {
    if (!PopupManager._instance)
        PopupManager._instance = new PopupManager();
    return PopupManager._instance;
};

//web var gv = gv || {};
gv.popup = new PopupManager();