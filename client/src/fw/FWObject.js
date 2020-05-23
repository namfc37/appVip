
// TODO:
// - pool sprites if possible
// - support drag/drop
// - fix spine bounding box when flipping

var FWObject = cc.Class.extend
({
	node: null, // can be sprite or spine...
	spine: null,
	sprite: null,
	isMoving: false,
	isAnimating: false,
	isAnimationLoop:false,
	movementCallback: null,
	movementCallFunc: null, // internal callback, created once
	animationCallback: null,
	boundingBoxes: null, // TODO: support multiple bounding boxes for more precise hit detection
	customBoundingBoxes: null, // user-defined bounding boxes
	flipX: false,
	flipY: false,
	owner: null, // owner object, e.g GameObject, CloudFloorSlot...
	eventListener: null,
	visible: true,
	
	ctor:function(owner)//web ctor:function(owner = null)
	{
		if(owner === undefined)
			owner = null;
		
		this.owner = owner;
	},
	
	initWithSpine:function(spineName)
	{
		this.init(spineName);
	},
	
	initWithSprite:function(spriteName)
	{
		this.init(null, spriteName);
	},

	// common init
	init:function(spineName, spriteName)//web init:function(spineName = null, spriteName = null)
	{
		if(spineName === undefined)
			spineName = null;
		if(spriteName === undefined)
			spriteName = null;
		
		if((spineName !== null && this.spine !== null && this.spine.poolKey === spineName)
			|| (spriteName !== null && this.sprite !== null && this.sprite.spriteName === spriteName))
			return;
		
		this.uninit();
		
		if(spineName !== null)
		{
			this.node = this.spine = FWPool.getNode(spineName);
if(cc.sys.isNative)
	        this.spine.setCompleteListener(this.onAnimationFinished.bind(this));
        }
			
		if(spriteName !== null)
		{
			this.node = this.sprite = new cc.Sprite(spriteName);
			this.sprite.spriteName = spriteName;
			this.sprite.retain();
		}
		
		this.node.fwObject = this;
		this.movementCallFunc = cc.callFunc(this.onMovingFinished.bind(this));
		this.movementCallFunc.retain();
		
		FWObjectManager.add(this);
	},
	
	uninit:function()
	{
		if(this.node !== null)
		{
			cc.eventManager.removeListener(this.eventListener);
			this.eventListener = null;
			
			if(this.spine !== null)
			{
				FWPool.returnNode(this.spine);
				this.spine = null;
			}
			
			if(this.sprite !== null)
			{
				this.sprite.removeFromParent();
				this.sprite.release();
				this.sprite = null;
			}
			
			this.node.fwObject = undefined;
		}
		
		if(this.movementCallFunc)
			this.movementCallFunc.release();
		
		this.node = null;
		this.isMoving = false;
		this.isAnimating = false;
		this.isAnimationLoop = false;
		this.movementCallback = null;
		this.movementCallFunc = null;
		this.animationCallback = null;
		this.boundingBoxes = null;
		this.flipX = this.flipY = false;
		this.setDroppable(false);
		
		FWObjectManager.remove(this);
	},
	
	setSkin:function(name)
	{
		this.spine.setSkin(name);
		this.spine.skin = name;
	},
	
	setAnimation:function(name, loop, callback)//web setAnimation:function(name, loop, callback = null)
	{
		if(callback === undefined)
			callback = null;
		
		if(!cc.sys.isNative && this.isAnimating && this.spine.animation === name && this.isAnimationLoop === loop && this.animationCallback === callback)
			return;
		
		this.isAnimating = true;
		this.isAnimationLoop = loop;
		this.animationCallback = callback;
		this.spine.setAnimation(0, name, loop);
		this.spine.animation = name;
if(!cc.sys.isNative)
		this.spine.setCompleteListener(this.onAnimationFinished.bind(this));//web cocos3.16
	},
	
	getAnimation:function()
	{
		return this.spine.animation;
	},

	getSkin:function()
	{
		return this.spine.skin;
	},

    setAnimationTimeScale:function(scale)
	{
        if (this.spine)
            this.spine.setTimeScale(scale);
    },

	resetAnimation: function () {
        if (this.spine)
        	this.spine.clearTracks();
	},

	onAnimationFinished:function(trackIndex, loopCount)
	{
		if(this.isAnimationLoop)
			return;
	
		this.isAnimating = false;
		if(this.animationCallback !== null)
			this.animationCallback();
	},
	
	moveWithVelocity:function(dest, velocity, callback)
	{
		var duration = cc.pDistance(this.node.getPosition(), dest) / velocity;
		this.moveWithDuration(dest, duration, callback);
	},
	
	moveWithDuration:function(dest, duration, callback)//web moveWithDuration:function(dest, duration, callback = null)
	{
		if(callback === undefined)
			callback = null;
		
		var moveTo = cc.moveTo(duration, dest);
		var seq = cc.sequence(moveTo, this.movementCallFunc);
		this.isMoving = true;
		this.movementCallback = callback;
		this.node.runAction(seq);
	},
	
	onMovingFinished:function()
	{
		this.isMoving = false;
		if(this.movementCallback !== null)
			this.movementCallback();
	},
	
	// set position
	// note from cocos docs: passing 2 parameters x, y is more efficient than passing a point
	setPosition:function(x, y)
	{
		if(y !== undefined)
			this.node.setPosition(x, y);
		else
			this.node.setPosition(x.x, x.y);
	},
	
	getPositionX:function()
	{
		return this.node.getPositionX();
	},	
	
	getPositionY:function()
	{
		return this.node.getPositionY();
	},
	
	getPosition:function()
	{
		return this.node.getPosition();
	},
	
	setWorldPosition:function(x, y)
	{
		// TODO: implement
		// by now do not call this function unless isParentWorld() === true
		this.setPosition(x, y);
	},
	
	getWorldPosition:function()
	{
		return FWUtils.getWorldPosition(this.node);
	},
	
	// set scale and apply flipping
	setScale:function(x, y)
	{
		if(y === undefined)
			y = x;
		if(this.flipX)
			x = -x;
		if(this.flipY)
			y = -y;
		this.node.setScale(x, y);
	},
	
	// get original (no flipping) scale x
	getScaleX:function()
	{
		var scaleX = this.node.getScaleX();
		return (this.flipX ? -scaleX : scaleX);
	},
	
	// get original (no flipping) scale y
	getScaleY:function()
	{
		var scaleY = this.node.getScaleY();
		return (this.flipY ? -scaleY : scaleY);
	},
	
	getScale:function()
	{
		return this.getScaleX();
	},

	// set flip
	setFlip:function(flipX, flipY)
	{
		var scaleX = this.getScaleX();
		var scaleY = this.getScaleY();
		this.flipX = flipX;
		this.flipY = flipY;
		this.setScale(scaleX, scaleY);
	},

    getLocalZOrder: function () {
        return (this.node) ? this.node.getLocalZOrder() : 0;
    },

    setLocalZOrder: function (order) {
		this.node && this.node.setLocalZOrder(order);
	},

	getOpacity: function () {
        return (this.node) ? this.node.getOpacity() : 255;
	},

	setOpacity: function (value) {
        this.node && this.node.setOpacity(value);
	},

	setVisible:function(visible, flag)//web setVisible:function(visible, flag = true)
	{
		if(flag === undefined)
			flag = true;
		
		if(flag)
			this.visible = visible;
		
		if(this.node === null)
			return;
		
		this.node.setVisible(visible);

		var dropTag = FWUI.getUiDef(this, "dropTag");
		if(dropTag !== undefined)
		{
			if(visible === true)
				FWUI.registerDroppables(this, false);
			else
				FWUI.unregisterDroppables(this, false);
		}
	},
	
	isVisible:function()
	{
		//return (this.node !== null && this.node.isVisible());
		return this.visible;
	},
	
	// set event listener
	setEventListener:function(touchBeganListener, touchEndedListener, touchMovedListener, longTouchListener)//web setEventListener:function(touchBeganListener = null, touchEndedListener = null, touchMovedListener = null, longTouchListener = null)
	{
		if(touchBeganListener === undefined)
			touchBeganListener = null;
		if(touchEndedListener === undefined)
			touchEndedListener = null;
		if(touchMovedListener === undefined)
			touchMovedListener = null;
		if(longTouchListener === undefined)
			longTouchListener = null;
		
		cc.eventManager.removeListener(this.eventListener);

        var listener = cc.EventListener.create
		({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
			longTouchListener: longTouchListener,
            onTouchBegan:function(touch, event)
			{
				// opt
				this.fwObject = event.getCurrentTarget().fwObject;
				if(!this.fwObject.node || !this.fwObject.node.isVisible() || !this.fwObject.containsPoint(touch.getLocation()))
					return false;
				
				// jira#5238
				if(cc.sys.isNative && touch.getID() !== 0)
					return false;
				
				if(this.isDragged === true)
					return false; // cannot touch on dragging object
				
				//opt this.fwObject = event.getCurrentTarget().fwObject;
				//if(this.fwObject === undefined)
				//	FWUtils.debugProperties(event.getCurrentTarget());
				this.dragStartPos = this.fwObject.getWorldPosition();
				this.isDragged = false;
				this.snapWidget = null;
				this.longTouchPressed = false; // skip touchEnded and touchMoved after long touch
				if(!cc.sys.isNative)
					touch.startLocation = touch.getLocation(); 
				
                //opt if(this.fwObject.isVisible() && this.fwObject.containsPoint(touch.getLocation()))
				{
					// if touchBeganListener does not return a value, consumed = true
					// if touchBeganListener returns a value, consumed = that value
					var consumed = true;
					
					if(touchBeganListener !== null)
						consumed = touchBeganListener(touch, this.fwObject);
					
					if(consumed === undefined || consumed === true)
					{
						consumed = true;
				
						if(FWUI.getUiDef(this.fwObject, "notifyBlockedTouch") === true)
						{
							if(cc.sys.isNative)
								Game.onBlockedTouchBegan(touch.getStartLocation().x, touch.getStartLocation().y);
							else
								Game.onBlockedTouchBegan(touch.getLocation().x, touch.getLocation().y);
						}
						
						if(this.longTouchListener !== null)
						{
							Game.longTouch.setTouchInfo(LONG_TOUCH_ID, touch.getLocation().x, touch.getLocation().y);
							cc.director.getScheduler().scheduleCallbackForTarget(this, this.checkLongTouch, 0, 0, 0.35, false);
						}
					}
					return consumed;
				}
                //opt return false;
            },
            onTouchEnded:function(touch, event)
			{
				if(this.longTouchListener !== null)
				{
					Game.longTouch.setTouchInfo(LONG_TOUCH_ID, -1, -1);
					cc.director.getScheduler().unscheduleCallbackForTarget(this, this.checkLongTouch);
				}

				var notifyBlockedTouch = FWUI.getUiDef(this.fwObject, "notifyBlockedTouch");
				if(notifyBlockedTouch === true)
					Game.onBlockedTouchEnded(touch.getLocation().x, touch.getLocation().y);
				
				var startLocation = (cc.sys.isNative ? touch.getStartLocation() : touch.startLocation);
                if((this.fwObject.containsPoint(touch.getLocation())|| this.fwObject.forceTouchEnd) && touchEndedListener !== null && this.longTouchPressed === false
					&& (notifyBlockedTouch !== true || Math.abs(startLocation.y - touch.getLocation().y) < FWUI.validScrollGap)) // do not trigger event if user is scrolling
				{
					if(!FWUI.hasTouchedUI)
					{
						FWUI.hasTouchedUI = true;
						touchEndedListener(touch, this.fwObject);
					}
				}

				if(this.isDragged === true)
				{
					// check for dropping
					var dropped = false;
					if(this.snapWidget !== null)
						dropped = FWUI.onWidgetEvent_drop(this.fwObject, this.snapWidget);
					else
						dropped = FWUI.checkDrop(this.fwObject);
					if(dropped === false)
					{
						// move to original position
						var moveTo = cc.moveTo(UI_CANCEL_DRAG_DURATION, this.dragStartPos);
						var sequence = cc.sequence(moveTo, cc.callFunc(this.onDraggedObjectMovedToOriginalPosition.bind(this)));
						this.fwObject.node.runAction(sequence);
					}
					else
						this.isDragged = false;
				}
            },
            onTouchMoved:function(touch, event)
			{
				var dragTag = FWUI.getUiDef(this.fwObject, "dragTag");
                if(touchMovedListener !== null && (this.longTouchPressed === false || dragTag !== undefined))
					touchMovedListener(touch, this.fwObject);
				if(FWUI.getUiDef(this.fwObject, "notifyBlockedTouch") === true)
					Game.onBlockedTouchMoved(touch.getLocation().x, touch.getLocation().y);
				
				var startLocation = (cc.sys.isNative ? touch.getStartLocation() : touch.startLocation);
				if(dragTag !== undefined)
				{
					// drag
					this.isDragged = true;
					this.fwObject.setWorldPosition(this.dragStartPos.x + touch.getLocation().x - startLocation.x, this.dragStartPos.y + touch.getLocation().y - startLocation.y);
					
					this.snapWidget = FWUI.getSnapWidget(this.fwObject);
					if(this.snapWidget !== null
						&& this.snapWidget.getWorldPosition !== undefined) // currently only support snapping on FWObjects, TODO: snap on widgets
						this.fwObject.setWorldPosition(this.snapWidget.getWorldPosition());
				}
				
				if(this.longTouchListener !== null)
				{
					if(Math.abs(startLocation.y - touch.getLocation().y) >= FWUI.validScrollGap) // do not trigger event if user is scrolling
						Game.longTouch.setTouchInfo(LONG_TOUCH_ID, -1, -1);
					else
						Game.longTouch.setTouchInfo(LONG_TOUCH_ID, touch.getLocation().x, touch.getLocation().y);
				}
            },
			checkLongTouch:function()
			{
				if(this.longTouchListener === null)
					return;

				var touchedPos = Game.longTouch.getLocation();
				if(touchedPos.x < 0 || touchedPos.y < 0)
					return;

if(cc.sys.isNative)
				touchedPos.y = cc.winSize.height - touchedPos.y;
				if(this.fwObject.containsPoint(touchedPos))
				{
					this.longTouchPressed = true;
					this.longTouchListener(Game.longTouch, this.fwObject);
				}
			},
			onDraggedObjectMovedToOriginalPosition:function()
			{
				this.isDragged = false;
			},
        });
		
		cc.eventManager.addListener(listener, this.node);
		this.eventListener = listener;
	},
	
	getParent:function()
	{
		return this.node.getParent();
	},
	
	setParent:function(parent, zOrder)
	{
		if(!cc.sys.isNative && this.node && this.node.getParent() === parent)
		{
			if(this.node.getLocalZOrder() !== zOrder)
				this.node.setLocalZOrder(zOrder);
			return;
		}

		this.node.removeFromParent();
		if(parent)
		{
			if(zOrder !== undefined)
				this.node.setLocalZOrder(zOrder);
			parent.addChild(this.node);
			
			//web cocos3.16
			if(!cc.sys.isNative && this.eventListener)
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {cc.eventManager.addListener(this.eventListener, this.node);}.bind(this), 0, 0, 0, false);
		}
	},
	
	// is parent of this object === world?
	isParentWorld:function()
	{
		return (this.node && this.node.getParent() === FWUtils.getCurrentScene());
	},
	
	// check if this object contains a point
	containsPoint:function(point)
	{
		var boundingBox = this.getBoundingBox();
        
        //BUG HERE: boundingBox can be null
		if(!boundingBox)
			return false;
		
		if(_.isArray(boundingBox))
		{
			for(var i=0, len=boundingBox.length; i<len; i++)
			{
				if(cc.rectContainsPoint(boundingBox[i], point))
					return true;
			}
		}
		else if(cc.rectContainsPoint(boundingBox, point))
			return true;
		return false;
	},
	
	// - update bounding boxes information to boundingBoxes[]
	// - get current bounding boxes
	lastUpdateBoundingBoxesFrame: -99, // optimize: should not call updateBoundingBoxes() more than once per frame
	getBoundingBox:function()
	{
		// opt
		//if(this.lastUpdateBoundingBoxesFrame === cc.director.getTotalFrames())
		//if(this.lastUpdateBoundingBoxesFrame === Game.framesCount)
		if(this.lastUpdateBoundingBoxesFrame > Game.framesCount - 2) // update once per 2 frames
			return this.boundingBoxes; // already updated
		this.lastUpdateBoundingBoxesFrame = Game.framesCount;//this.lastUpdateBoundingBoxesFrame = cc.director.getTotalFrames();
		
		var pos = this.getWorldPosition();
		if(this.customBoundingBoxes)
		{
			//this.boundingBoxes = [];
			//for(var i=0, len=this.customBoundingBoxes.length; i<len; i++)
			//{
			//	var customRect = this.customBoundingBoxes[i];
			//	this.boundingBoxes.push(cc.rect(pos.x + customRect.x, pos.y + customRect.y, customRect.width, customRect.height));
			//}
			this.boundingBoxes = cc.rect(pos.x + this.customBoundingBoxes.x, pos.y + this.customBoundingBoxes.y, this.customBoundingBoxes.width, this.customBoundingBoxes.height);
		}
		else if(this.spine !== null)
		{
			var localPos = this.getPosition();
			this.boundingBoxes = this.spine.getBoundingBox();
			this.boundingBoxes.x += pos.x - localPos.x;
			this.boundingBoxes.y += pos.y - localPos.y;
		}
		else if(this.sprite !== null)
			this.boundingBoxes = this.sprite.getBoundingBoxToWorld();
		
		return this.boundingBoxes;
	},
	
	forceUpdateBoundingBox:function()
	{
		this.lastUpdateBoundingBoxesFrame = -99;
		this.getBoundingBox();
	},

	// draw bounding boxes for debugging purpose
	drawBoundingBoxes:function()
	{
		if(DEBUG_BOUNDING_BOXES_ZORDER <= 0)
			return;
		
		var boundingBox = this.getBoundingBox();
		if(_.isArray(boundingBox))
		{
			for(var i=0, len=boundingBox.length; i<len; i++)
				FWUtils.addBoundingBox(boundingBox[i]);
		}
		else
			FWUtils.addBoundingBox(boundingBox);
	},
	
	// register/unregister as draggable
	setDraggable:function(tag, callback)
	{
		if(tag === false)
		{
			FWUI.removeUiDef(this, "dragTag");
			FWUI.removeUiDef(this, "onDrop");
			
			// jira#5567
			if(this.eventListener)
				this.eventListener.isDragged = false;
		}
		else
		{
			FWUI.setUiDef(this, "type", UITYPE_FWOBJECT);
			FWUI.setUiDef(this, "dragTag", tag);
			FWUI.setUiDef(this, "onDrop", callback);
		}
	},
	
	// register/unregister as droppable
	setDroppable:function(tag)
	{
		if(tag === false)
		{
			FWUI.unregisterDroppables(this, false);	
			return;
		}
		
		FWUI.setUiDef(this, "dropTag", tag);
		FWUI.setUiDef(this, "type", UITYPE_FWOBJECT);
		if(this.isVisible())
			FWUI.registerDroppables(this, false);
	},
	
	// notify blocked touch
	setNotifyBlockedTouch:function(notify)
	{
		FWUI.setUiDef(this, "notifyBlockedTouch", notify);
	},
});

// manages all FWObjects to avoid leaking btw scenes
var FWObjectManager =
{
	fwObjectList:[],
	
	add:function(fwObject)
	{
		this.fwObjectList.push(fwObject);
	},
	
	remove:function(fwObject)
	{
		FWUtils.removeArrayElement(this.fwObjectList, fwObject);
	},
	
	cleanup:function()
	{
		var list = this.fwObjectList;
		this.fwObjectList = [];

		for(var i=0; i<list.length; i++)
			list[i].uninit();
	},
	
	// opt
	showAll: true,
	updateVisibility_showAll:function(floorIdx)
	{
		if(this.showAll)
			return;
		
		this.showAll = true;
		for(var i=0, count=this.fwObjectList.length; i<count; i++)
		{
			var fwObject = this.fwObjectList[i];
			if(fwObject.skipVisibilityCheck)
				continue;
			fwObject.setVisible(fwObject.visible);
		}
		
		var lastUnlockedFloor = CloudFloors.getLastUnlockedFloorIdx();
		var visible;
		for(var i=0; i<=lastUnlockedFloor; i++)
		{
			var widget = CloudFloors.firstFloorMarker.getChildByTag(i);
			if(widget)
			{
				visible = (floorIdx === undefined ? true : (i >= floorIdx - 3 && i <= floorIdx + 4));
				widget.setVisible(visible);
				
				for(var j=0; j<MAX_SLOTS_PER_FLOOR; j++)
					CloudFloors.slots[i][j].setUpdate(visible);
				
				gv.userMachine.getMachineByFloor(i).setUpdate(visible);
			}
		}
	},
	
	updateVisibility:function(floorIdx)
	{
		this.showAll = false;
		for(var i=0, count=this.fwObjectList.length; i<count; i++)
		{
			var fwObject = this.fwObjectList[i];
			if(fwObject.skipVisibilityCheck)
				continue;
			
			var box = fwObject.getBoundingBox();//BUG HERE: box can be null
			if(box && (box.y > cc.winSize.height || box.y + box.height < 0))
				fwObject.setVisible(false, false);
			else
				fwObject.setVisible(fwObject.visible);
		}
		
		var lastUnlockedFloor = CloudFloors.getLastUnlockedFloorIdx();
		var visible;
		for(var i=0; i<=lastUnlockedFloor; i++)
		{
			var widget = CloudFloors.firstFloorMarker.getChildByTag(i);
			if(widget)
			{
				widget.setVisible(i >= floorIdx && i <= floorIdx + 2);
				
				visible = (i >= floorIdx && i <= floorIdx + 1);
				for(var j=0; j<MAX_SLOTS_PER_FLOOR; j++)
					CloudFloors.slots[i][j].setUpdate(visible);
				
				gv.userMachine.getMachineByFloor(i).setUpdate(visible);
			}
		}
	},
};
