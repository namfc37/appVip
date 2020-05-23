
var gv = gv || {};

cc.game.onStart = function () {
	if (!cc.sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
		document.body.removeChild(document.getElementById("cocosLoading"));
		
	if(cc.sys.isNative)
		fr.platformWrapper.logGameStep("INIT_0_GAME_ONSTART", "START", "SUCC", 0, "");

	// Pass true to enable retina display, disabled by default to improve performance
	if(fr.platformWrapper.getOsName() === "IOS")
		cc.view.enableRetina(true);
	else
		cc.view.enableRetina(false);
	// Adjust viewport meta
	cc.view.adjustViewPort(true);
	cc.loader.resPath = "res";
	//cc.LoaderScene.preload(g_resources, function () { // sinhhnh: tmp skip
	//hide fps
	cc.director.setDisplayStats(false);

	// sinhhnh: tmp skip
	FWClientConfig.init();
	// Setup the resolution policy and design resolution size
	cc.view.setDesignResolutionSize(FWClientConfig.getDesignResolutionSize().width, FWClientConfig.getDesignResolutionSize().height, cc.ResolutionPolicy.SHOW_ALL);
	// The game will be resized when browser size change
	cc.view.resizeWithBrowserSize(true);
	//update config resource
	FWClientConfig.detectResourceFromScreenSize();
	if (cc.sys.isNative) {
		if(fr.platformWrapper.getOsName() === "IOS")
			cc.director.setContentScaleFactor(FWClientConfig.getResourceScale());
		else
			cc.view.setContentScaleFactor(FWClientConfig.getResourceScale());
	}
	FWClientConfig.updateResourceSearchPath();

	gv.gameClient = new GameClient();
	gv.chatClient = new ChatClient();
	gv.poolObjects = new PacketPoolObject();
	network.connector = new network.Connector(gv.gameClient);

	//fr.view(ScreenMenu);
	//var screenWidth = 1024;
	//var screenHeight = 768;
	//var screenWidth = 1136;
	//var screenHeight = 640;
	//cc.view.setFrameSize(screenWidth, screenHeight);
	//cc.view.setDesignResolutionSize(screenWidth, screenHeight, cc.ResolutionPolicy.FIXED_HEIGHT);
	cc.view.resizeWithBrowserSize(true);
	if(fr.platformWrapper.getOsName() === "IOS")
		cc.director.setContentScaleFactor(1);
	else
		cc.view.setContentScaleFactor(1);
	
	// remove intro scene
	//if(cc.sys.localStorage.getItem("skipIntro") === "true")
		cc.director.runScene(new LoadingScene());
	//else
	//	cc.director.runScene(new IntroScene());
	
	//cc.director.setAnimationInterval(1 / 30);
	FWUI.init();
	fr.platformWrapper.init();
		gv.hint.init();
	gv.hintManagerNew.init();
};
cc.game.run();