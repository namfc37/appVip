
//web var fr = fr || {};

var WebViewLayer = BaseScreen.extend({
    // <INIT>

    initData: function () {
		fr.Localization = FWLocalization;
        this._resourceFile = "WebViewLayer.json";
    },

    initChildren: function () {
        // buttons
        this.btnClose = null;
        this.panelTitle = null;
        this.imageWebview = null;
        this.labelTitle = null;
    },

    initBlackBacground: function (alpha) {
        var alpha = DARKBG_ALPHA;//var alpha = alpha ? alpha : GameTuning.ALPHA_BLACK_BACKGROUND;
        var layer = new cc.LayerColor(cc.color(0, 0, 0, alpha), this.width, this.height);
        this.addChild(layer, -1, "black_layer");
    },

    localize: function () {

    },

    // <KEYBOARD EVENT LISTENER>

    onBackKeyPressed: function () {
        this.onBtnCloseClicked();
    },

    initKeyBoardListener: function () {
        var keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                if (keyCode === cc.KEY.back || keyCode === cc.KEY.escape) {
                    this.onBackKeyPressed();
                }
                event.stopPropagation();
            }.bind(this)
        });
        cc.eventManager.addListener(keyboardListener, this);
    },

    // <TOUCH EVENT LISTENER>

    initTouchListener: function () {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            }.bind(this),
            onTouchEnded: function (touch, event) {
                // this.onBtnCloseClicked();
            }.bind(this)
        }, this);
    },

    // <DEFAULT STATE>

    initState: function () {
        this.setTitle("");
    },

    // <REFRESH>

    refresh: function () {

    },

    addWebView: function (url) {
        var divWidth = this.width;
        var divHeight = this.height - this.panelTitle.height;
        if (cc.sys.os === cc.sys.OS_WINDOWS) {
            this.imageWebview.setVisible(true);
            var file = jsb.fileUtils.getWritablePath() + "webview_test.png";
            this.imageWebview.loadTexture(file);
            this.imageWebview.width = divWidth;
            this.imageWebview.height = this.height - this.panelTitle.height;
            return;
        }
        this.imageWebview.setVisible(false);
        this.webView = new ccui.WebView(url);
        this.webView.setContentSize(divWidth, divHeight);
        this.webView.setAnchorPoint(cc.p(0.5, 0));
        this.webView.setPosition(cc.p(this.width / 2, 0));
        this.webView.setScalesPageToFit(true);
        this.addChild(this.webView);
    },

    // <OVERRIDES>

    ctor: function (url) {
        this._super();
        this.initData();
        this.initChildren();
        this.initBlackBacground();
        this.initKeyBoardListener();
        this.initTouchListener();

        this.syncAllChild(this._resourceFile);
        this.addWebView(url);
        this.initState();
        this.localize();
        this.labelTitle.setFontSize(40);
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    // <BUTTONS EVENTS>

    onTouchEndEvent: function (sender) {
        this._super(sender);
        switch (sender) {
            case this.btnClose:
                this.onBtnCloseClicked();
                break;
            default:
                break;
        }
    },

    onBtnCloseClicked: function () {
        this.runActionDisappear();
    },

    // <ACTIONS>

    runActionAppear: function () {

    },

    runActionDisappear: function () {
        this.removeFromParent(true);
    },

    loadURL: function (url) {
        if (this.webView) {
            this.webView.loadURL(url);
        }
    },

    setTitle: function (title) {
        this.labelTitle.setString(title);
    }
});

var WebView = WebView || {};
WebView.show = function (url, title) {
    cc.log("WebView", "show", url);
    this.url = url;
    var scene = cc.director.getRunningScene();
    var temp = scene.getChildByName("webview");
    if (temp) {
        temp.loadURL(url);
        return;
    }
    var webview = new WebViewLayer(url);
    scene.addChild(webview, Z_TOUCH_EATER, "webview");//scene.addChild(webview, GameTuning.POPUP_ZODER + 1000, "webview");
    if (title) {
        webview.setTitle(title);
    }
};

WebView.hide = function () {
    cc.log("WebView", "hide", url);
    var scene = cc.director.getRunningScene();
    var webview = scene.getChildByName("webview");
    if (webview) {
        webview.removeFromParent(true);
    }
};
