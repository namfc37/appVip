
const STATE_MINER_IDLE = 1;
const STATE_MINER_MOVE = 2;
const STATE_MINER_DIG = 3;
const STATE_MINER_BOMB = 4;
const STATE_MINER_FINISHED = 5;
const MINER_MID_Y = 60;

var Miner = cc.Class.extend
({
	fwObject: null,
	state: STATE_NONE,
	movePath: null,
	movePathIdx: 0,
	tileX: 0,
	tileY: 0,
	digAnim: null,
	digAnimTimer: 0,
	
	ctor:function()
	{
		this.fwObject = new FWObject();
	},
	
	init:function(parent)
	{
		this.fwObject.initWithSpine(SPINE_NPC_MINER);
		this.fwObject.setParent(parent, 100);
		this.fwObject.setScale(0.1);
		
		this.setState(STATE_MINER_IDLE);
		cc.director.getScheduler().scheduleUpdateForTarget(this, UPDATE_PRIORITY_GAME_OBJECT, false);
	},
	
	uninit:function()
	{
		this.fwObject.uninit();
		cc.director.getScheduler().unscheduleUpdateForTarget(this);
		FWPool.returnNode(this);
	},
	
	setState:function(state)
	{
		this.fwObject.node.stopAllActions();
		this.fwObject.isMoving = false;
		
		if(state === STATE_MINER_IDLE)
		{
			this.tileX = 2;
			this.tileY = -2;
			this.fwObject.setPosition(Mining.getTilePosByXY(this.tileX, this.tileY));
			this.fwObject.setAnimation("idle", true);
			this.fwObject.setFlip(false, false);
		}
		else if(state === STATE_MINER_BOMB)
		{
			this.fwObject.setAnimation("bomb_around", false);
		}
		else if(state === STATE_MINER_FINISHED)
		{
			this.fwObject.setAnimation("idle", true);
		}
		
		this.state = state;
	},
	
	setPosition:function(pos)
	{
		this.fwObject.setPosition(pos);
	},
	
	moveToTile:function(tile, hasAnim)//web moveToTile:function(tile, hasAnim = true)
	{
		if(hasAnim === undefined)
			hasAnim = true;
		
		this.movePath = [];
		this.movePathIdx = 0;
		var finished = false;
		
		if(tile.tileY > this.tileY)
		{
			this.movePath.push({x:1, y:this.tileY, anim:"walk"});
			
			var tile2 = Mining.getTileByPos(1, tile.tileY);
			if(tile2.hasTile === true)
			{
				this.movePath.push({x:1, y:tile.tileY - 1, anim:"jump", velocity:250});	
				this.movePath.push({x:1, y:tile.tileY - 1, anim:"digging_down"});
				finished = true;
			}
			else
				this.movePath.push({x:1, y:tile.tileY, anim:"jump", velocity:250});
		}
		
		if(!finished)
		{
			if(tile.tileX > this.tileX)
			{
				this.movePath.push({x:tile.tileX - 1, y:tile.tileY, anim:"walk", flip:true});	
				this.movePath.push({x:tile.tileX - 1, y:tile.tileY, anim:"digging_side", flip:true});
			}
			else
			{
				this.movePath.push({x:tile.tileX + 1, y:tile.tileY, anim:"walk"});	
				this.movePath.push({x:tile.tileX + 1, y:tile.tileY, anim:"digging_side"});
			}
		}
		
		if(hasAnim)
			this.setState(STATE_MINER_MOVE);
		else
		{
			// teleport
			var info = this.movePath[this.movePath.length - 1];
			this.setPosition(Mining.getTilePosByXY(info.x, info.y));
			this.tileX = info.x;
			this.tileY = info.y;
			this.fwObject.setAnimation(info.anim, false);
			this.fwObject.setFlip(info.flip === true, false);
			this.digAnim = info.anim;
			this.digAnimTimer = 0;
			this.setState(STATE_MINER_DIG);
			this.movePath = null;
		}
	},
	
	update:function(dt)
	{
		if(this.state === STATE_MINER_MOVE && this.movePath && !this.fwObject.isMoving)
		{
			var info = this.movePath[this.movePathIdx++];
			var pos = Mining.getTilePosByXY(info.x, info.y);
			this.tileX = info.x;
			this.tileY = info.y;
			this.fwObject.moveWithVelocity(pos, info.velocity || 125);
			this.fwObject.setAnimation(info.anim, true);
			this.fwObject.setFlip(info.flip === true, false);
			if(this.movePathIdx >= this.movePath.length)
			{
				this.fwObject.setAnimation(info.anim, false);
				this.digAnim = info.anim;
				this.digAnimTimer = 0;
				this.setState(STATE_MINER_DIG);
				this.movePath = null;
			}
			else
				this.fwObject.setAnimation(info.anim, true);
		}
		else if(this.state === STATE_MINER_DIG)
		{
			if(!this.fwObject.isAnimating)
			{
				this.fwObject.setAnimation(this.digAnim, false);
				this.digAnimTimer = 0;
			}
			
			if(this.digAnimTimer < 0.35 && this.digAnimTimer + dt >= 0.35)
			{
				// use timer to match animation with explosion
				Mining.shakeCurrentTile();
				if(Mining.updateRemainTiles())
					Mining.setState(MINING_STATE_FINISHED);				
			}
			this.digAnimTimer += dt;
		}
	},
});
