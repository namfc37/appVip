
const MARQUEE_SPEED = 100; // 100px/s
const MARQUEE_Y = 25;

var Marquee =
{
	marqueeLastNode: null,
	marqueeSpaceWidth: 0,
	
	init:function()
	{
		this.marqueeBg = FWUtils.getChildByName(Game.gameScene.uiMain, "marquee");
		this.marqueeBg.setVisible(false);
		this.marqueeLastNode = null;
		this.marqueeSpaceWidth = 0;
	},
	
	uninit:function()
	{
		if(this.marqueeBg)
		{
			this.marqueeBg.removeAllChildren();
			this.marqueeBg = null;
		}
	},
	
	getMarqueeNextX:function()
	{
		if(this.marqueeLastNode)
		{
			var pos = this.marqueeLastNode.getPosition();
			return pos.x + this.marqueeLastNode.w + this.marqueeSpaceWidth;
		}
		return 600;//cc.winSize.width;
	},
	
	newText:function()
	{
		this.addSpace(100);
	},
	
	addSpace:function(width)
	{
		this.marqueeSpaceWidth = width;
	},
	
	addText:function(text)
	{
		cc.log("Marquee::addText: text=" + text);
		
		var textNode = new ccui.Text();
		textNode.setString(FWLocalization.text(text));
		textNode.setFontName(FONT_ITALIC);
		textNode.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
		textNode.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		textNode.setAnchorPoint(0, 0.5);
		FWUI.applyTextStyle(textNode, TEXT_STYLE_TEXT_NORMAL);
		textNode.w = textNode.getVirtualRendererSize().width;

		var x = this.getMarqueeNextX();
		textNode.setPosition(x, MARQUEE_Y);
		
		this.marqueeBg.setVisible(true);
		this.marqueeBg.addChild(textNode);
		this.marqueeLastNode = textNode;
		this.marqueeSpaceWidth = 0;
		
		textNode.runAction(
			cc.sequence(cc.moveTo((x + textNode.w) / MARQUEE_SPEED, cc.p(-textNode.w, MARQUEE_Y)),
			cc.callFunc(function() {if(textNode === Marquee.marqueeLastNode) {Marquee.marqueeLastNode = null; Marquee.marqueeBg.setVisible(false);}}),
			cc.removeSelf())
			);
			
		return textNode;
	},
	
	addSprite:function(name, scale)//web addSprite:function(name, scale = 1)
	{
		if(scale === undefined)
			scale = 1;
		
		name = "#" + name;
		cc.log("Marquee::addSprite: name=" + name + " scale=" + scale);
		
		var sprite = new cc.Sprite(name);
		sprite.setScale(scale);
		sprite.setAnchorPoint(0, 0.5);
		sprite.w = sprite.getContentSize().width * scale;
		
		var x = this.getMarqueeNextX();
		sprite.setPosition(x, MARQUEE_Y);
		
		this.marqueeBg.setVisible(true);
		this.marqueeBg.addChild(sprite);
		this.marqueeLastNode = sprite;
		this.marqueeSpaceWidth = 0;
		
		sprite.runAction(
			cc.sequence(cc.moveTo((x + sprite.w) / MARQUEE_SPEED, cc.p(-sprite.w, MARQUEE_Y)),
			cc.callFunc(function() {if(sprite === Marquee.marqueeLastNode) {Marquee.marqueeLastNode = null; Marquee.marqueeBg.setVisible(false);}}),
			cc.removeSelf())
			);
			
		return sprite;
	},
	
	addSpine:function(name, skin, anim, width, scale, offset)//web addSpine:function(name, skin = null, anim = null, width = 0, scale = 1, offset = 0)
	{
		if(skin === undefined)
			skin = null;
		if(anim === undefined)
			anim = null;
		if(width === undefined)
			width = 0;
		if(scale === undefined)
			scale = 1;
		if(offset === undefined)
			offset = 0;
		
		cc.log("Marquee::addSpine: name=" + name + " skin=" + skin + " anim=" + anim + " width=" + width + " scale=" + scale + " offset=" + offset);
		
		var spine = FWPool.getNode(name);
		if(skin)
			spine.setSkin(skin);
		if(anim)
			spine.setAnimation(0, anim, true);
		spine.setScale(scale);
		spine.w = width;
		
		var x = this.getMarqueeNextX() + offset;
		spine.setPosition(x, MARQUEE_Y);
		
		this.marqueeBg.setVisible(true);
		this.marqueeBg.addChild(spine);
		this.marqueeLastNode = spine;
		this.marqueeSpaceWidth = 0;
		
		spine.runAction(
			cc.sequence(cc.moveTo((x + spine.w) / MARQUEE_SPEED, cc.p(-spine.w, MARQUEE_Y)),
			cc.callFunc(function() {FWPool.returnNode(spine); if(spine === Marquee.marqueeLastNode) {Marquee.marqueeLastNode = null; Marquee.marqueeBg.setVisible(false);}}),
			cc.removeSelf())
			);
			
		return spine;
	},
};
