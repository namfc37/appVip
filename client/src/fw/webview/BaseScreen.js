var BaseScreen = cc.Layer.extend({
    screenConfig: null,
    fog: null,
    _clickEnable: true,
    //_tintDark : null,
    _changeLocalize: true,
    _currId: "",
    _enableKeyboardListener: true,
    _isShowing: false,
    _onSound: true,
    onLoaded: null,

    ctor: function () {
        this._super();
        return true;
    },

    syncAllChild: function (res) {
        this._currId = res;
        //LanguageSetting.addListener(res, this.localize.bind(this));
        //var path = fr.ClientConfig.getInstance().getResourcePath();
        //this.screenConfig = ccs.load(path + res);
		this.screenConfig = ccs.load(res);
        this._rootNode = this.screenConfig.node;
        var size = this._rootNode.getContentSize();
        //var designSize = fr.ClientConfig.getInstance().getDesignResolutionSize();
        var designSize = FWClientConfig.getDesignResolutionSize();
        if (size.width >= designSize.width && size.height >= designSize.height) {
            //xu ly da man hinh
            var visibleSize = cc.director.getVisibleSize();
            this._rootNode.setContentSize(visibleSize);
            ccui.Helper.doLayout(this._rootNode);
        }

        this._rootNode.setAnchorPoint(cc.p(0.5, 0.5));
        this._rootNode.setPosition(cc.p(this._rootNode.width / 2, this._rootNode.height / 2));
        this.addChild(this._rootNode, 0);

        var allChildren = this._rootNode.getChildren();
        this.syncAllChildHelper(allChildren);
    },

    resyncAllChild: function (res) {
        if (this._rootNode == null) return;
        var allChildren = this._rootNode.getChildren();
        for (var i = 0; i < allChildren.length; i++) {
            if (allChildren[i].parent != null) {
                allChildren[i].parent.removeChild(allChildren[i]);
            }
        }
        this.syncAllChild(res);
    },

    syncAllChildHelper: function (allChildren) {
        if (allChildren.length == 0) return;
        var nameChild;
        for (var i = 0; i < allChildren.length; i++) {
            nameChild = allChildren[i].getName();
            if (nameChild == undefined) continue;
            var arr = nameChild.split("_");
            if (arr.length != 2) continue;
            nameChild = arr[0] + arr[1];
            if (nameChild in this) {
                this[nameChild] = allChildren[i];
                //Utility.convertPosByResolutionSize(allChildren[i].x);
                if (arr[0] == "btn") {
                    this[nameChild].setPressedActionEnabled(true);
                    this[nameChild].addTouchEventListener(this.onTouchEvent, this);
                    this[nameChild].setZoomScale(-0.1);
                }
                if (arr[0] == "text") {
                    var alignHorizontal = this[nameChild].getTextHorizontalAlignment();
                    var alignVertical = this[nameChild].getTextVerticalAlignment();
                    var newAlign = this.convertAlignCustomRichText(alignHorizontal, alignVertical);
                    alignHorizontal = newAlign.x;
                    alignVertical = newAlign.y;
                    var size = this[nameChild].getContentSize();
                    var fontSize = this[nameChild].getFontSize();
                    var text = this[nameChild].getString();
                    var textColor = this[nameChild].getTextColor();
                    //var richText = CustomRichText.create(text, size, fr.ClientConfig.getInstance().getFontDefault(), fontSize, textColor, alignHorizontal, alignVertical);
                    var richText = CustomRichText.create(text, size, FONT_DEFAULT, fontSize, textColor, alignHorizontal, alignVertical);
                    this[nameChild].getParent().addChild(richText);
                    richText.setPosition(cc.p(this[nameChild].x, this[nameChild].y));
                    this[nameChild].removeFromParent(true);
                    richText.setName(nameChild);
                    this[nameChild] = richText;
                    //this[nameChild].setTouchEnabled(false);
                }
                this.syncAllChildHelper(this[nameChild].getChildren());
            }
        }
    },

    convertAlignCustomRichText: function (alignHorizontal, alignVertical) {
        switch (alignHorizontal) {
            case cc.TEXT_ALIGNMENT_CENTER:
                alignHorizontal = RichTextAlignment.CENTER;
                break;
            case cc.TEXT_ALIGNMENT_RIGHT:
                alignHorizontal = RichTextAlignment.RIGHT;
                break;
            case cc.TEXT_ALIGNMENT_LEFT:
                alignHorizontal = RichTextAlignment.LEFT;
                break;

        }
        switch (alignVertical) {
            case cc.VERTICAL_TEXT_ALIGNMENT_TOP:
                alignVertical = RichTextAlignment.TOP;
                break;
            case cc.VERTICAL_TEXT_ALIGNMENT_CENTER:
                alignVertical = RichTextAlignment.MIDDLE;
                break;
            case cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM:
                alignVertical = RichTextAlignment.BOTTOM;
                break;
        }
        return cc.p(alignHorizontal, alignVertical);
    },

    onTouchEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                this.onTouchBeganEvent(sender);
                break;
            case ccui.Widget.TOUCH_MOVED:
                this.onTouchMovedEvent(sender);
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.onTouchEndEvent(sender);
                break;
            case ccui.Widget.TOUCH_CANCELED:
                this.onTouchCancelledEvent(sender);
                break;
        }
    },

    onTouchBeganEvent: function (sender) {
        sender.stopAllActions();
    },

    onTouchEndEvent: function (sender) {
        sender.stopAllActions();
    },

    onTouchCancelledEvent: function (sender) {
        sender.stopAllActions();
    },

    onTouchMovedEvent: function (sender) {
    },
});