var Birds = {
	init:function()
	{
		this.values = {};
		this.values.skin = ["bird_1", "bird_2", "bird_3"];
		this.values.anims = {
			fly_up: [
				"bird_flying_up_1",	//x1 > x2, y1 > y2
				"bird_flying_up_2"	//x1 < x2, y1 > y2
			],
			fly_down: [
				"bird_flying_down_1" //x1 > x2
			],
			landing: [
				"bird_landing_1",
				"bird_landing_2",
				"bird_landing_3"
			],
			walk: [	
				"bird_walk1",
				"bird_walk2"
			],
			idle: [
				"bird_idle1",
				"bird_idle4"
			],
			eat: [
				"bird_idle2",	//eat something
				"bird_idle3",	//eat something
			],
			take_off: [
				"bird_take_off_1",
				"bird_take_off_2",
				"bird_take_off_3"
			]
		};
		this.values.actionName = ["take_off", "fly", "landing", "walk", "idle", "eat"];

		this.values.animDefault = "bird_idle1";
		this.values.scale = 0.2;
		this.values.fly_speed = [120, 140, 160];
		this.values.walk_speed = 5;

		// x: near -> far
		// y: left -> right
		// z: ground -> sky
		this.values.groups = {
			sky: {
				x: 7, y: 0, z: 5,
				w: 0, h: 0,
				p: [cc.p (0, 640), cc.p (0, 640), cc.p (0, 640)],
				act: [],
			},
			ground_1: {
				x: 2, y: 1, z: 1,
				w: 20, h: 4,
				p: [cc.p (320 - 70, 129 - 5 + 40), cc.p (360 - 70, 135 + 40), cc.p (398 - 30 - 70, 130 - 20 + 40)],
				act: ["walk", "eat"]
			},
			leader_board: {
				x: 5, y: 2, z: 2,
				w: 5, h: 0,
				p: [cc.p (434, 395 - 8), cc.p (465 - 5, 395 - 8), cc.p (487, 395 - 8)],
				act: ["walk", "idle"]
			},
			guild: {
				x: 6, y: 3, z: 4,
				w: 0, h: 0,
				p: [cc.p (605 - 5, 545), cc.p (630, 542), cc.p (678 - 15, 540 + 0)],
				act: ["idle"]
			},
			ground_2: {
				x: 4, y: 4, z: 1,
				w: 10, h: 4,
				p: [cc.p (707 + 5, 333), cc.p (737, 333 + 12), cc.p (776 - 10, 338 - 10)],
				act: ["walk", "eat"]
			},
			storage: {
				x: 3, y: 6, z: 3,
				w: 0, h: 0,
				p: [cc.p (930 + 10, 313 + 5), cc.p (980 - 5, 323 + 6), cc.p (1033 - 25, 344 - 5)],
				act: ["idle"]
			},
			ground_3: {
				x: 1, y: 5, z: 1,
				w: 20, h: 4,
				p: [cc.p (808 + 10 + 10, 87 + 20 + 35), cc.p (880 - 30, 88 - 12 + 35), cc.p (880 - 10, 88 + 12 + 35)],
				act: ["walk", "eat"]
			},
		};

		this.values.groupName = ["ground_1", "leader_board", "guild", "storage", "ground_3"];//"ground_2", 

		this.slots = {};
		this.slots_name = [];
		for (var i in this.values.groupName)
		{
			var groupName = this.values.groupName [i];
			var group = this.values.groups [groupName];
			for (var i in group.p)
			{
				this.slots [groupName + "_" + i] = {
					name: groupName + "_" + i,
					group: groupName,
					position: i,
					use: false
				};
				this.slots_name.push (groupName + "_" + i);
			}
		}
		
		this.objs = [];
		this.group_size = {};
		while (this.objs.length < 4)
		{
			var id = this.rand (this.slots_name.length);
			var slotName = this.slots_name [id];
			var slot = this.slots [slotName];

			if (slot.use)
				continue;

			var group = this.values.groups [slot.group];
			var position = group.p [slot.position];
			var skin = this.objs.length % this.values.skin.length; //this.rand (this.values.skin.length);
			var obj = this.create (this.values.skin [skin]);
			obj.setPosition (position);
			obj.data = {
				id: this.objs.length,
				group: slot.group,
				position: slot.position,
				plan: []
			};

			if (this.group_size [slot.group])
				this.group_size [slot.group] += 1;
			else
				this.group_size [slot.group] = 1;
			
			this.objs.push (obj);
			slot.use = true;
		}
	},
	
	create: function(skin)
	{
		var obj = new FWObject();
		obj.initWithSpine(SPINE_BIRDS);
		obj.setSkin(skin);
		obj.setAnimation(this.values.animDefault, true);
		obj.setScale(this.values.scale);
		// obj.setVisible(false);

		return obj;
	},

	show: function (bg)
	{
		for (var i in this.objs)
		{
			var obj = this.objs [i];
			obj.setParent(bg);
			obj.setVisible(true);
			obj.node.runAction (
				cc.sequence(
					cc.delayTime (Math.random () * 10),
					// cc.show(),
					cc.callFunc(function() {this.next (obj);}.bind(this))//web
				)
			);
		}
	},

	hide: function ()
	{

	},

	plan: function (obj)
	{
		var empty = [];

		if (Math.random () > 0.2)
			empty = this.together (obj);

		if (empty.length === 0)
		{
			for (var i in this.slots_name)
			{
				var slotName = this.slots_name [i];
				if (this.slots [slotName].use)
					continue;

				if (this.slots [slotName].group === obj.data.group)
					continue;

				empty.push (slotName);
			}
		}
		
		var slot = this.slots [empty [this.rand (empty.length)]];
		if (!slot)
			cc.log ("birds", JSON.stringify (empty), obj.data.group);
			
		slot.use = true;

		var groupName = slot.group;
		var group = this.values.groups [groupName];
		// cc.log ("birds", "plan", i, temp.length, groupName, group ? "has" : "null");

		var template = [
			{type: "take_off", param: slot.name},
			{type: "fly", param: slot.name},
			{type: "landing", param: slot.name}
		];

		var act = group.act;
		var step = (this.rand (act.length) + 1) * 3;
		while (step-- > 0)
			template.push ({type: act [this.rand (act.length)]});

		obj.data.plan = template;
	},

	take_off: function (obj, target)
	{
		var slot = this.slots [target];
		var current = this.values.groups [obj.data.group];
		var group = this.values.groups [slot.group];

		var isFar = current.x < group.x; 
		var isRight = current.y < group.y;
		var isUp = current.z < group.z;

		var anim = "";
		var flipX = false;

		if (isUp)
		{
			anim = "bird_take_off_2";
		}
		else
		{
			anim = Math.random() > 0.5 ? "bird_take_off_1" : "bird_take_off_3";
		}
		
		// cc.log ("bird", obj.data.position, "take_off", anim);

		obj.setFlip(flipX, false);
		obj.setAnimation(anim, false,
		function() {//web
			// cc.log ("bird", obj.data.position, "take_off");
			this.slots [obj.data.group + "_" + obj.data.position].use = false;
			this.group_size [obj.data.group] -= 1;
			this.next (obj);
		}.bind(this));
	},
	
	fly: function (obj, target)
	{
		var slot = this.slots [target];
		var current = this.values.groups [obj.data.group];
		var group = this.values.groups [slot.group];

		var isFar = current.x < group.x; 
		var isRight = current.y < group.y;
		var isUp = current.z < group.z;

		var flipX = isRight;
		var anim = "";
		if (isUp)
			anim = isFar ? "bird_flying_up_2" : "bird_flying_up_1";
		else
			anim = "bird_flying_down_1";
		
		// cc.log ("bird", obj.data.group, target, isFar ? "far" : "near", isRight ? "right" : "left", isUp ? "up" : "down", anim);

		var a = obj.getPosition ();
		var b = group.p [slot.position];
		var offset = cc.PSUB(b, a);
		var distance = cc.PLENGTH(offset);
		var speed = this.values.fly_speed [this.rand (this.values.fly_speed.length)];
		var moveTime = distance / speed;

		// cc.log ("bird", obj.data.position, "fly", JSON.stringify(a), JSON.stringify(b), JSON.stringify(offset), distance, this.values.fly_speed, moveTime);

		obj.setFlip(flipX, false);
		obj.setAnimation(anim, true);
		obj.node.stopAllActions ();
		obj.node.runAction (
			cc.sequence(
				cc.moveTo (moveTime, b),
				cc.callFunc(function() {this.next (obj);}.bind(this))//web
			)
		);
	},

	landing: function (obj, target)
	{
		var slot = this.slots [target];
		var current = this.values.groups [obj.data.group];
		var group = this.values.groups [slot.group];

		var isFar = current.x < group.x; 
		var isRight = current.y < group.y;
		var isUp = current.z < group.z;

		var flipX = isRight;
		var anim = "";
		if (isUp)
			anim = isFar ? "bird_landing_2" : "bird_landing_1";
		else
			anim = "bird_landing_3";

		// cc.log ("bird", obj.data.position, "landing", anim);

		obj.setFlip(flipX, false);
		obj.setAnimation(anim, false,
		function() {//web
			obj.data.group = slot.group;
			obj.data.position = slot.position;
			
			if (this.group_size [slot.group])
				this.group_size [slot.group] += 1;
			else
				this.group_size [slot.group] = 1;

			this.next (obj);
		}.bind(this));
	},

	walk: function (obj, param)
	{
		var groupName = obj.data.group;
		var group = this.values.groups [groupName];
		var position = group.p [obj.data.position];
		var x = position.x + (2 * Math.random() - 1) * group.w;
		var y = position.y + (2 * Math.random() - 1) * group.h;
		
		var a = obj.getPosition ();
		var b = cc.p (x, y);
		var offset = cc.PSUB(b, a);
		var distance = cc.PLENGTH(offset);
		var moveTime = distance / this.values.walk_speed;

		var isFar = offset.y > 0;
		var isRight = offset.x > 0;
		
		var flipX = isRight;
		var anim = isFar ? "bird_walk2" : "bird_walk1";
		
		// cc.log ("bird", obj.data.position, "walk", JSON.stringify(a), JSON.stringify(b), JSON.stringify(offset), distance, this.values.walk_speed, moveTime);

		obj.setFlip(flipX, false);
		obj.setAnimation(anim, true);
		obj.node.stopAllActions ();
		obj.node.runAction (
			cc.sequence(
				cc.moveTo (moveTime, b),
				cc.callFunc(function() {this.next (obj);}.bind(this))//web
			)
		);
	},

	idle: function (obj, param)
	{
		var i = this.rand (this.values.anims.idle.length);
		var anim = this.values.anims.idle [i];
		var flipX = Math.random () > 0.5;
		var delay = Math.random () * 3 + 10;
		
		obj.setFlip(flipX, false);
		obj.setAnimation(anim, true);
		obj.node.stopAllActions ();
		obj.node.runAction (
			cc.sequence(
				cc.delayTime (delay),
				cc.callFunc(function() {this.next (obj);}.bind(this))//web
			)
		);
	},

	eat: function (obj, param)
	{
		var i = this.rand (this.values.anims.eat.length);
		var anim = this.values.anims.eat [i];
		var flipX = Math.random () > 0.5;
		
		obj.setFlip(flipX, false);
		obj.setAnimation(anim, false, function() {this.next (obj);}.bind(this));//web
	},

	next: function (obj)
	{
		if (obj.data.plan.length < 1)
			this.plan (obj);
		
		var plan = obj.data.plan.shift ();
		if (this [plan.type])
			this [plan.type] (obj, plan.param);
	},

	together: function (obj)
	{
		var empty = [];
		for (var groupName in this.group_size)
		{
			if (groupName === obj.data.group)
				continue;

			var g = this.values.groups [groupName];
			var size = this.group_size [groupName];
			if (size === 0 || size >= g.p.length)
				continue;

			for (var i in g.p)
			{
				var slotName = groupName + "_" + i;
				if (this.slots [slotName].use)
					continue;

				empty.push (slotName);
			}
		}

		return empty;
	},

	disbane: function (groupName)
	{
		for (var i in this.objs)
		{
			var obj = this.objs [i];
			if (obj.data.group === groupName)
			{
				obj.data.plan = [];
				obj.node.stopAllActions ();
				this.next (obj);
			}
		}
	},

	rand: function (size)
	{
		return Math.floor (Math.random () * size);
	},

	time: function ()
	{
		var date = new Date();
		return "" + date.getTime();
	}
};
