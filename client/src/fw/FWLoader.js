
// TODO:
// - implement shouldLoadResource
// - unload functions
// - loadWidget/loadSpine + pool: try to reuse loaded data instead of loading multiple times
// - loadSpineToPool => loadSpine: must parse file list many times => optimize

var FWLoader =
{
	//widgetSizes: null, // TODO: remove if no use
	
	// load widget
	loadWidget:function(path)
	{
		// opt
		/*if(!this.widgetSizes)
		{
			this.widgetSizes = {};
			this.widgetSizes[UI_FLYING_ICON] = cc.size(100, 100);
			this.widgetSizes[UI_HOME_BUTTON] = cc.size(80, 80);
			this.widgetSizes[UI_ITEM] = cc.size(100, 100);
			this.widgetSizes[UI_ITEM_NO_BG] = cc.size(100, 100);
			this.widgetSizes[UI_ITEM_NO_BG2] = cc.size(100, 100);
			this.widgetSizes[UI_ORDER_ITEM] = cc.size(190, 190);
			this.widgetSizes[UI_ORDER_REQUEST_ITEM] = cc.size(120, 120);
			this.widgetSizes[UI_ORDER_REWARD_ITEM] = cc.size(130, 60);
			this.widgetSizes[UI_PRIVATE_SHOP_ITEM] = cc.size(180, 260);
			this.widgetSizes[UI_TIME] = cc.size(140, 40);
			this.widgetSizes[UI_UNLOCK_FLOOR_ITEM] = cc.size(170, 190);
			this.widgetSizes[UI_AIRSHIP_ITEM] = cc.size(140, 210);
			this.widgetSizes[UI_NEWSBOARD_ITEM] = cc.size(230, 256);
			this.widgetSizes[UI_POT_INFO_ITEM] = cc.size(95, 95);
			this.widgetSizes[UI_PLANT_ITEM] = cc.size(100, 100);
			this.widgetSizes[UI_MAILBOX_RECEIVE_ITEM] = cc.size(200, 200);
			this.widgetSizes[UI_MAILBOX_ITEM] = cc.size(580, 135);
			this.widgetSizes[UI_MINING_ITEM] = cc.size(115, 115);
			this.widgetSizes[UI_MINING_REQUIRE_ITEM] = cc.size(85, 90);
			this.widgetSizes[UI_PAYMENT_ITEM] = cc.size(600, 130);
			this.widgetSizes[UI_CHEST_ITEM] = cc.size(250, 250);
			this.widgetSizes[UI_DAILY_GIFT_ITEM] = cc.size(155, 175);
			this.widgetSizes[UI_DAILY_GIFT_REWARD] = cc.size(190, 175);
			this.widgetSizes[UI_DICE_ITEM] = cc.size(106, 106);
			this.widgetSizes[UI_HINT_ITEM] = cc.size(70, 70);
			this.widgetSizes[UI_HINT_ITEM_TITLE] = cc.size(140, 210);
			this.widgetSizes[UI_HINT_ITEM_TITLE_SIMPLE] = cc.size(140, 50);
			this.widgetSizes[UI_HINT_STAT] = cc.size(112, 34);
			this.widgetSizes[UI_HINT_TOAST] = cc.size(280, 60);
			this.widgetSizes[UI_IB_SHOP_ITEM] = cc.size(580, 124);
			this.widgetSizes[UI_IB_SHOP_TAB] = cc.size(82, 117);
			this.widgetSizes[UI_MACHINE_SLOT] = cc.size(110, 110);
			this.widgetSizes[UI_MACHINE_STAR] = cc.size(119, 40);
			this.widgetSizes[UI_GAME_HOUSE_ITEM] = cc.size(340, 420);
			this.widgetSizes[UI_REWARD_ITEM] = cc.size(160, 200);
			this.widgetSizes[UI_REWARD_ITEM_SIMPLE] = cc.size(160, 160);
			this.widgetSizes[UI_SMITHY_FORGE] = cc.size(854, 640);
			this.widgetSizes[UI_SMITHY_MATERIAL_POT] = cc.size(110, 110);
			this.widgetSizes[UI_SMITHY_MATERIAL_PRODUCT] = cc.size(88, 88);
			this.widgetSizes[UI_SMITHY_POT] = cc.size(110, 110);
			this.widgetSizes[UI_TOM_HINT] = cc.size(438, 150);
			this.widgetSizes[UI_TOM_HIRE_PACKAGE] = cc.size(580, 124);
			this.widgetSizes[UI_TOM_ITEM_SLOT] = cc.size(118, 132);
			this.widgetSizes[UI_TOM_ITEM_SLOT_PRICE] = cc.size(144, 190);
			this.widgetSizes[UI_EVENT_MILESTONE] = cc.size(300, 200);
			this.widgetSizes[UI_EVENT_PUZZLE] = cc.size(360, 460);
			this.widgetSizes[UI_EVENT_NEWS_ITEM] = cc.size(260, 440);
			this.widgetSizes[UI_FIREFLY] = cc.size(40, 40);
			this.widgetSizes[UI_UTIL_SETTING] = cc.size(700, 550);
			this.widgetSizes[UI_UTIL_LIBRARY] = cc.size(700, 550);
			this.widgetSizes[UI_UTIL_LIBRARY_POT] = cc.size(700, 250);
			this.widgetSizes[UI_UTIL_LIBRARY_DECOR] = cc.size(700, 250);
			this.widgetSizes[UI_UTIL_LIBRARY_MACHINE] = cc.size(700, 250);
			this.widgetSizes[UI_FRIEND_ITEM] = cc.size(150, 200);
		}*/
		
		//cc.log("FWLoader::loadWidget: " + path);
		var json = ccs.load(path);
		//return json.node;
		//return this.optimizeWidget(json.node, this.widgetSizes[path]);
		var widget = this.optimizeWidget(json.node);

		// jira#6281
		if(widget.getBackGroundColorOpacity && widget.getBackGroundColorOpacity() >= 128 && widget.getBackGroundColorType() !== ccui.Layout.BG_COLOR_NONE
			&& path !== UI_CHEST_OPEN && path !== UI_REWARD)
		{
			widget.hasDarkBg = true;
			widget.setBackGroundColorType(ccui.Layout.BG_COLOR_NONE);
		}
		else
			widget.hasDarkBg = false;

		// replace localized graphics
		if(path === UI_ZLOADING && cc.sys.isNative)
		{
			var logo = FWUtils.getChildByName(widget, "logo");
			var logo2 = FWUtils.getChildByName(widget, "logo2");
if(cc.sys.isNative)
{
			logo.loadTexture("res/home/home_logo.png", ccui.Widget.LOCAL_TEXTURE);
			logo2.loadTexture("res/home/home_logo.png", ccui.Widget.LOCAL_TEXTURE);
} else {
			logo.loadTexture("home/home_logo.png", ccui.Widget.LOCAL_TEXTURE);
			logo2.loadTexture("home/home_logo.png", ccui.Widget.LOCAL_TEXTURE);
}
		}
		
		return widget;
		
		// old api
		//return ccs.uiReader.widgetFromJsonFile("../" + path);
	},
	
	optimizeWidget:function(widget, contentSize)
	{
		if(!cc.sys.isNative && widget.constructor === ccui.TextField)
		{
			var box = new cc.EditBox(widget._customSize, new cc.Scale9Sprite("hud/icon_buff_bg.png"));
			box.setName(widget.getName());
			box.setPosition(widget.getPosition());
			box.setString(widget.getString());
			box.setInputFlag(widget.isPasswordEnabled() ? cc.EDITBOX_INPUT_FLAG_PASSWORD : cc.EDITBOX_INPUT_FLAG_SENSITIVE);
			box.setFontColor(widget.getTextColor());
			box.setPlaceHolder(widget.getPlaceHolder());
			box.setPlaceholderFontColor(widget.getPlaceHolderColor());
			if(widget.getMaxLength() > 0)
				box.setMaxLength(widget.getMaxLength());
			box.setTouchEnabled(widget.isTouchEnabled());//box.setEnabled(widget.isTouchEnabled());
			box.setLocalZOrder(widget.getLocalZOrder());
			box.setAnchorPoint(widget.getAnchorPoint());
			box.setFont(widget.getFontName(), widget.getFontSize());
			box.setPlaceholderFont(widget.getFontName(), widget.getFontSize() * 0.75);
			box._backgroundSprite.setVisible(false);
			box._backgroundSprite.setOpacity(0);
			return box;
		}
		else if(cc.sys.isNative && widget.constructor === ccui.Layout && widget.getLayoutType() === ccui.Layout.ABSOLUTE && !widget.isClippingEnabled()
			&& (widget.getBackGroundColorType() === ccui.Layout.BG_COLOR_NONE || widget.getBackGroundColorOpacity() <= 0))
		{
			// replace layout with widget
			var widget2 = new ccui.Widget();
			widget2.name = widget.name;
			widget2.setContentSize(contentSize || widget.getContentSize());
			widget2.setAnchorPoint(widget.getAnchorPoint());
			widget2.setPosition(widget.getPosition());
			widget2.setLocalZOrder(widget.getLocalZOrder());
			widget2.setOrderOfArrival(widget.getOrderOfArrival());
			widget2.setScale(widget.getScaleX(), widget.getScaleY());
			widget2.setLayoutParameter(widget.getLayoutParameter());
			widget2.setTouchEnabled(widget.isTouchEnabled());
			widget2.setVisible(widget.isVisible());
			
			var children = widget.getChildren().slice();
			for(var i=0, len=children.length; i<len; i++)
			{
				children[i].removeFromParent();
				widget2.addChild(this.optimizeWidget(children[i]));
			}
			
			return widget2;
		}
		else
		{
			// check children
			var children = widget.getChildren().slice();
			var hasOptimizedChild = false;
			for(var i=0, len=children.length; i<len; i++)
			{
				var child = children[i];
				var child2 = this.optimizeWidget(child);
				if(child !== child2)
				{
					if(!cc.sys.isNative && child.constructor === ccui.TextField)
					{
						child.removeFromParent();
						widget.addChild(child2);
					}
					else
					{
						hasOptimizedChild = true;
					}
					
					children[i] = child2;
				}
			}
			if(hasOptimizedChild)
			{
				widget.removeAllChildren();
				for(var i=0, len=children.length; i<len; i++)
					widget.addChild(children[i]);
			}
			return widget;
		}
	},
	
	// load widget and add to pool
	loadWidgetToPool:function(path, poolCount, clonable)
	{
		//cc.log("FWLoader::loadWidgetToPool: poolCount=" + poolCount);
		
		if(!clonable)
		{
			for(var i=0; i<poolCount; i++)
				FWPool.addNode(this.loadWidget(path), path);
		}
		else
		{
			// warning: cloning may cause display issues on some widgets
			var widget = this.loadWidget(path);
			widget.poolClonable = true;
			FWPool.addNode(widget, path);
			
			poolCount--;
			for(var i=0; i<poolCount; i++)
			{
				var clone = widget.clone();
				FWPool.addNode(clone, path);
			}
		}
	},
	
	// load sprite sheet
	loadSpriteSheet:function(paths)
	{
		var fileList = paths.split("|");
		//cc.log("FWLoader::loadSpriteSheet: " + fileList[0]);
		cc.loader.load(fileList, function(err, results)
		{
			if(err !== null)
			{
				cc.log("FWLoader::loadSpriteSheet " + fileList[0] + " error: " + err);
				return;
			}
			cc.spriteFrameCache.addSpriteFrames(fileList[0]);
		});
	},
	
	// load spine animation
	loadSpine:function(paths)
	{
		var fileList = paths.split("|");
		cc.log("FWLoader::loadSpine: " + fileList[0] + " - " + fileList[1]);
		try {
            var spine = new sp.SkeletonAnimation(fileList[0], fileList[1]);
            if(fileList.length >= 3)
            {
                var scale = Number(fileList[2]);
                spine.spineScale = scale;
                spine.setScale(scale);
            }
            return spine;
		}
		catch (e) {
            cc.log("FWLoader::loadSpine: %j", e);
			return null;
        }
	},
	
	// load spine animation and add to pool
	loadSpineToPool:function(paths, poolCount)
	{
		//cc.log("FWLoader::loadSpineToPool: poolCount=" + poolCount);
		for(var i=0; i<poolCount; i++)
			FWPool.addNode(this.loadSpine(paths), paths);
	},

	connectServer:function() {
		gv.gameClient.connect();
		this.continueLoading = false;
	},

	connectChat:function()
	{
        cc.log("FWLoader", "connectChat", Guild.getGuildId ());

		if (Guild.getGuildId () > 0)
			gv.chatClient.connect();
		
		//this.continueLoading = false;: cannot go home from friend's garden
	},

	initUserDataHelper:function() {
	},

///////////////////////////////////////////////////////////////////////////////////////
// loading process ////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	loadingStep: 0,
	loadingFunctions: [],
	loadingWaitTags: [],
	isLoadingActive: false,
	loadingFinishCallback: null,
	continueLoading: true,
	
	addLoading:function(func, waitTag)//web addLoading:function(func, waitTag = -1)
	{
		if(waitTag === undefined)
			waitTag = -1;
		
		this.loadingFunctions.push(func);
		if(waitTag >= 0 && this.loadingWaitTags.indexOf(waitTag) < 0)
			this.loadingWaitTags.push(waitTag);
		if(this.isLoadingActive === false)
		{
			this.isLoadingActive = true;
			this.continueLoading = true;
			cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
		}
	},
	
	getLoadingPercent:function()
	{
		if(this.loadingFunctions.length <= 0)
			return 100;
		return (this.loadingStep * 100 / this.loadingFunctions.length);//return FWUtils.fastFloor(this.loadingStep * 100 / this.loadingFunctions.length);
	},
	
	isLoadingFinished:function()
	{
		return (this.loadingStep >= this.loadingFunctions.length);
	},
	
	setLoadingFinishCallback:function(callback)
	{
		this.loadingFinishCallback = callback;
	},
	
	update:function(dt)
	{
		if(this.isLoadingFinished())
		{
			cc.director.getScheduler().unscheduleUpdateForTarget(this);
			this.isLoadingActive = false;
			this.loadingStep = 0;
			this.loadingFunctions = [];
			this.loadingWaitTags = [];
			if(this.loadingFinishCallback !== null)
			{
				this.loadingFinishCallback();
				this.loadingFinishCallback = null;
			}
		}
		else if(this.continueLoading === true)
		{
			if(_.isString(this.loadingFunctions[this.loadingStep]))
				eval(this.loadingFunctions[this.loadingStep]);
			else
				this.loadingFunctions[this.loadingStep]();
			this.loadingStep++;
		}
	},
	
	waitLoadingWithTag:function(tag)
	{
		if(this.loadingWaitTags.indexOf(tag) >= 0)
			this.loadingStep--;
	},
	
	finishLoadingWithTag:function(tag)
	{
		FWUtils.removeArrayElement(this.loadingWaitTags, tag);
	},

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	loadTexture:function(name, callback, blockLoading)
	{
		cc.log("FWLoader::loadTexture: " + name);
		
		if(cc.sys.isNative)
		{
			cc.textureCache.addImage(name);
			callback && callback();
		}
		else
		{
			if(blockLoading === true)
				FWLoader.continueLoading = false;
			cc.loader.load([name], 
				function()
				{
					callback && callback();
					if(blockLoading === true)
						FWLoader.continueLoading = true;
				});				
		}
	},
	
	discardTexture:function(name)
	{
		cc.log("FWLoader::discardTexture: " + name);
		cc.textureCache.removeTextureForKey(name);
	},
	
	loadTextureForSpine:function(name, callback, blockLoading)
	{
		var fileList = name.split("|");
		var textureName = fileList[0].replace(".json", ".png");
		this.loadTexture(textureName, callback, blockLoading);
	},
	
	discardTextureForSpine:function(name)
	{
		var fileList = name.split("|");
		var textureName = fileList[0].replace(".json", ".png");
		this.discardTexture(textureName);
	},
	
	addSpriteFrames:function(plist, callback, blockLoading)
	{
		cc.log("FWLoader::addSpriteFrames: " + plist + " blockLoading=" + blockLoading);
		
		if(cc.sys.isNative)
		{
			cc.spriteFrameCache.addSpriteFrames(plist);
			callback && callback();
		}
		else
		{
			if(blockLoading === true)
				FWLoader.continueLoading = false;
			cc.loader.load([plist, plist.replace(".plist", ".png")], 
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(plist);
					callback && callback();
					if(blockLoading === true)
						FWLoader.continueLoading = true;
				});				
		}
	},
	
	removeSpriteFrames:function(plist)
	{
		cc.log("FWLoader::removeSpriteFrames: " + plist + "|" + plist.replace(".plist", ".png"));
		cc.spriteFrameCache.removeSpriteFramesFromFile(plist);
		cc.textureCache.removeTextureForKey(plist.replace(".plist", ".png"));
	},
};
