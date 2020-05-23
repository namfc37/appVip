const UTIL_LIBRARY_POT = "pot";
const UTIL_LIBRARY_DECOR = "decor";
const UTIL_LIBRARY_MACHINE = "machine";

var UtilPanelLibrary = cc.Node.extend({
	LOGTAG: "[UtilPanelLibrary]",

	ctor: function ()
	{
		this._super();
        
		this.potOnFloors = {};
		this.decorOnFloors = {};
		
		this.widget = FWPool.getNode(UI_UTIL_LIBRARY, false);
		this.container = FWUI.getChildByName(this.widget, "scrollview");
		this.tab_pot_on = FWUI.getChildByName(this.widget, "tab_pot_on");
		this.tab_pot_off = FWUI.getChildByName(this.widget, "tab_pot_off");
		this.tab_decor_on = FWUI.getChildByName(this.widget, "tab_decor_on");
		this.tab_decor_off = FWUI.getChildByName(this.widget, "tab_decor_off");
		this.tab_machine_on = FWUI.getChildByName(this.widget, "tab_machine_on");
		this.tab_machine_off = FWUI.getChildByName(this.widget, "tab_machine_off");

		this.tabs = {};
		this.tabs [UTIL_LIBRARY_POT] = {
			on: this.tab_pot_on,
			off: this.tab_pot_off,
			panel: function() {return this.createPot ();}.bind(this)
		};

		this.tabs [UTIL_LIBRARY_DECOR] = {
			on: this.tab_decor_on,
			off: this.tab_decor_off,
			panel: function() {return this.createDecor ();}.bind(this)
		};

		this.tabs [UTIL_LIBRARY_MACHINE] = {
			on: this.tab_machine_on,
			off: this.tab_machine_off,
			panel: function() {return this.createMachine ();}.bind(this)
		};

		// this.container.addEventListener(this.onScroll.bind(this));
		this.inner = this.container.getInnerContainer();
		if(this.container.setScrollBarOpacity) //web
			this.container.setScrollBarOpacity(0);
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},
	
	update: function (dt)
	{
		if (!this.isAutoScroll)
			return;

		var current = _.now();
		if (current < this.next)
			return;

		if (this.scrollY === 0 || this.scrollY === 550 - this.containerHeight)
			return;

		var r = (this.scrollY) / 165;
		var row = this.isUp ? Math.ceil (r) : Math.floor (r);
		
		// cc.log ("row", r, row, this.isUp, this.scrollY);
		this.inner.runAction(cc.moveTo(0.5, cc.p(0, row * 165)));
		this.isAutoScroll = false;
		this.next = 0;
	},

	checkItemOnFloors: function ()
	{
		var floors = CloudFloors.getLastUnlockedFloorIdx();
		var potOnFloors = {};
		for (var f = 0; f <= floors; f++)
		{
			var pots = CloudFloors.getPotsOnFloor(f);
			// cc.log (this.LOGTAG, f, JSON.stringify(pots));

			for (var i in pots)
			{
				var id = pots [i];
				if (potOnFloors [id])
					potOnFloors [id] += 1;
				else
					potOnFloors [id] = 1;
			}
		}
		// cc.log (this.LOGTAG, "potOnFloors", JSON.stringify(potOnFloors));
		
		//web var floors = CloudFloors.getLastUnlockedFloorIdx();
		var decorOnFloors = {};
		for (var f = 0; f <= floors; f++)
		{
			var decors = CloudFloors.getDecorsOnFloor(f);
			// cc.log (this.LOGTAG, f, JSON.stringify(decors));

			for (var i in decors)
			{
				var id = decors [i];
				if (decorOnFloors [id])
					decorOnFloors [id] += 1;
				else
					decorOnFloors [id] = 1;
			}
		}
		// cc.log (this.LOGTAG, "decorOnFloors", JSON.stringify(decorOnFloors));

		this.potOnFloors = potOnFloors;
		this.decorOnFloors = decorOnFloors;
	},
    
    createPot: function ()
    {
        var combo = {};
        var normal = [];
        for (var id in g_POT)
        {
            var pot = g_POT [id];
            if ("COMBO_ID" in pot)
            {
                var comboId = pot.COMBO_ID;
                if (comboId in combo)
                    combo [comboId].push (id);
                else
                    combo [comboId] = [id];
            }
            else
                normal.push (id);
		}

        var shelfs = [];
        for (var id in combo)
        {
            var combo = g_COMBO [id];
            var shelf = FWPool.getNode(UI_UTIL_LIBRARY_POT, true, true);

            for (var c = 0; c < combo.CHILDREN.length; c++)
            {
                var childId = combo.CHILDREN [c];
                var amount = gv.userStorages.getItemAmount(childId) + (this.potOnFloors [childId] ? this.potOnFloors [childId] : 0);

                cc.log ("combo", id, c, childId, amount);
                var slot = FWUI.getChildByName(shelf, "m_6_" + c);
                
                var data = {
                    itemId: childId,
                    itemAmount: amount
                };
                
                var slotDefine = {};
                slotDefine ["spine_6_" + c] = { type: UITYPE_SPINE, field: "itemId", anim: "pot_icon_small", subType: defineTypes.TYPE_POT, locked: "data.itemAmount < 1"};
                slotDefine ["lb_amount_6_" + c] = { type: UITYPE_TEXT, field: "itemAmount", format: "x%s", style: TEXT_STYLE_NUMBER, visible: "data.itemAmount > 0"};
				slotDefine ["touch_6_" + c] = { onTouchEnded: function(sender) {this.onTouchPot (sender, sender.uiData.itemId);}.bind(this) };//web
				
                FWUI.fillData(slot, data, slotDefine);
            }
            
            var shelfDefine = {
                lb_name: { type: UITYPE_TEXT, id: Game.getItemName(id), style: TEXT_STYLE_TEXT_NORMAL }
            };

            FWUI.fillData(shelf, null, shelfDefine);
            shelfs.push (shelf);
        }

        var h = 165;
        var y = (shelfs.length) * h - 170;
        for (var i in shelfs)
        {
            var shelf = shelfs [i];
            shelf.setPosition (0, y);
    
            y -= h;
        }

		var panelHeight = (shelfs.length) * h + 50;

        return {
            childs: shelfs,
            height: panelHeight
        };
    },
    
    createDecor: function ()
    {
        var combo = {};
        var normal = [];
        for (var id in g_DECOR)
        {
            var decor = g_DECOR [id];
            if ("COMBO_ID" in decor)
            {
                var comboId = decor.COMBO_ID;
                if (comboId in combo)
                    combo [comboId].push (id);
                else
                    combo [comboId] = [id];
            }
            else
                normal.push (id);
        }

        var shelfs = [];
        for (var id in combo)
        {
            var combo = g_COMBO [id];
            var shelf = FWPool.getNode(UI_UTIL_LIBRARY_DECOR, true, true);

            for (var c = 0; c < combo.CHILDREN.length; c++)
            {
                var childId = combo.CHILDREN [c];
                var amount = gv.userStorages.getItemAmount(childId) + (this.decorOnFloors [childId] ? this.decorOnFloors [childId] : 0);

                cc.log ("combo", id, c, childId, amount);
                var slot = FWUI.getChildByName(shelf, "m_6_" + c);

                var data = {
                    itemId: childId,
                    itemAmount: amount
                };
                
                var slotDefine = {};
                slotDefine ["spine_6_" + c] = { type: UITYPE_SPINE, field: "itemId", anim: "normal", subType: defineTypes.TYPE_DECOR, locked: "data.itemAmount < 1"};
                slotDefine ["lb_amount_6_" + c] = { type: UITYPE_TEXT, field: "itemAmount", format: "x%s", style: TEXT_STYLE_NUMBER, visible: "data.itemAmount > 0"};
				slotDefine ["touch_6_" + c] = { onTouchEnded: function(sender) {this.onTouchDecor (sender, sender.uiData.itemId);}.bind(this) };//web

                FWUI.fillData(slot, data, slotDefine);
            }
            
            var shelfDefine = {
                lb_name: { type: UITYPE_TEXT, id: Game.getItemName(id), style: TEXT_STYLE_TEXT_NORMAL }
            };

            FWUI.fillData(shelf, null, shelfDefine);
            shelfs.push (shelf);
        }
        
        var h = 165;
        var y = (shelfs.length) * h - 170;
        for (var i in shelfs)
        {
            var shelf = shelfs [i];
            shelf.setPosition (0, y);
    
            y -= h;
        }

        var panelHeight = (shelfs.length) * h + 50;

        return {
            childs: shelfs,
            height: panelHeight
        };
    },
    
    createMachine: function ()
    {
		var shelfs = [];
		var temp = [];
		for (var id in g_MACHINE)
		{
			var machine = g_MACHINE [id];
			temp.push ({
				id: id,
				unlockLevel: machine.LEVEL_UNLOCK
			});
		}

		var machines = [];
		var t = [];
		while (temp.length > 0)
		{
			t.push (temp.shift ());
			if (t.length  === 3)
			{
				machines.push (t);
				t = [];
			}
		}

		if (t.length !== 0)
			machines.push (t);

		for (var i in machines)
		{
			var t = machines [i];
			var shelf = FWPool.getNode(UI_UTIL_LIBRARY_MACHINE, true, true);

			for (var c = 0; c < 3; c++)
			{
				var slot = FWUI.getChildByName(shelf, "m_3_" + c);
				var marker = FWUI.getChildByName(shelf, "spine_3_" + c);
				if (!t[c])
				{
					slot.setVisible (false);
					continue;
				}

				var childId = t[c].id;
				var unlockLevel = t[c].unlockLevel;

				var realMachine = gv.userMachine.getMachineById (childId);
				var state = realMachine.state;
				var locked = state < MACHINE_STATE_READY;

				cc.log ("machine", i, c, childId, unlockLevel, state);

				var data = {
					machineId: childId,
					machineName: !locked
						?	Game.getItemName(childId) + " Lv." + realMachine.level
						:	cc.formatStr(FWLocalization.text("TXT_MACHINE_UNLOCK_NAME"), unlockLevel),
					machineUnlockLevel: unlockLevel,
					locked: locked
				};

				var spineToFill = {
					spine: Game.getMachineSpineByDefine(childId),
					skin: !locked
						?	"level_" + Math.floor(realMachine.level / 5 + 1)
						:	"level_1",
					anim: state === MACHINE_STATE_PRODUCING ? "work" : "rest",
					scale: MACHINE_ANIM_SCALES [childId] * 0.6
				};
				
				var slotDefine = {};
				slotDefine ["spine_3_" + c] = { type: UITYPE_SPINE, field: "machineId", spineToFill: spineToFill, locked: "data.locked"};
				slotDefine ["lb_name_3_" + c] = { type: UITYPE_TEXT, field: "machineName", style: TEXT_STYLE_TEXT_SMALL };
				slotDefine ["touch_3_" + c] = { onTouchEnded: function(sender) {gv.userMachine.showPopupMachineUnlockInfo(1, sender.uiData.machineId);} };//web

				FWUI.fillData(slot, data, slotDefine);
			}
			
			shelfs.push (shelf);
		}
		
		var h = 165;
		var y = (shelfs.length) * h - 170;
		for (var i in shelfs)
		{
			var shelf = shelfs [i];
			shelf.setPosition (0, y);
	
			y -= h;
		}

		var panelHeight = (shelfs.length) * h + 50;

		return {
			childs: shelfs,
			height: panelHeight
		};
    },

	show: function (parent, tab)//web show: function (parent, tab = null)
	{
		cc.log(this.LOGTAG, "show");
		
		this.currentTab = null;
		this.checkItemOnFloors ();
		this.onTab (null, tab === undefined || tab === null ? UTIL_LIBRARY_POT : tab);//web
		
		if (FWUI.isShowing(UI_UTIL_LIBRARY))
			return;
		
		this.myParent = parent;
		FWUI.showWidget(this.widget, parent.container, UIFX_POP, true);
		// cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0.33, cc.REPEAT_FOREVER, 0, false);
	},

	hide: function ()
	{
		this.cleanupCurrentTab();
		this.container.removeAllChildren ();
		this.currentTab = null;

		// cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
	},

	onTab: function (sender, tab)
	{
		cc.log(this.LOGTAG, "onTab", tab);

		if (this.currentTab === tab)
			return;
		
		this.cleanupCurrentTab();

		for (var i in this.tabs)
		{
			//web
			var tab0 = this.tabs [i];
			tab0.on.setVisible (false);
			tab0.off.setVisible (true);
		}

		var current = this.tabs [tab];
		current.on.setVisible (true);
        current.off.setVisible (false);
        
        if (current.panel)
        {
			var data = current.panel ();
            var childs = data.childs;
            var height = data.height;

            this.container.removeAllChildren ();
            for (var i in childs)
            {
                var child = childs [i];
                this.container.addChild (child);
            }
			this.container.setInnerContainerSize(cc.size(700, height));
			this.containerHeight = height;
			
			// jira#5542
			this.container.jumpToTop();
        }

        var uiDefine = {
            tab_pot_on: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY_POT);}.bind(this) },
            tab_pot_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY_POT);}.bind(this) },
            tab_decor_on: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY_DECOR);}.bind(this) },
            tab_decor_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY_DECOR);}.bind(this) },
            tab_machine_on: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY_MACHINE);}.bind(this) },
            tab_machine_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY_MACHINE);}.bind(this) },
        };

		FWUI.fillData(this.widget, null, uiDefine);
		this.currentTab = tab;
	},
	
	cleanupCurrentTab:function()
	{
		var children = this.container.getChildren().slice();
		for(var i=0, len=children.length; i<len; i++)
		{
			var child = children[i];
			if(child.poolKey === UI_UTIL_LIBRARY_POT || child.poolKey === UI_UTIL_LIBRARY_DECOR || child.poolKey === UI_UTIL_LIBRARY_MACHINE)
			{
				for(var j=0; j<6; j++)
				{
					var widget = FWUtils.getChildByName(child, "m_6_" + j);
					if(widget)
						FWUI.unfillData(widget);
					
					widget = FWUtils.getChildByName(child, "m_3_" + j);
					if(widget)
						FWUI.unfillData(widget);
				}
				FWUI.unfillData(child);
				FWPool.returnNode(child);
			}
		}
	},
	
	onTouchPot: function (sender, potId)
	{
		if(sender.uiData.itemAmount <= 0)
		{
			var pos = FWUtils.getWorldPosition(sender);
			pos.y += 40;
			FWUtils.showWarningText(FWLocalization.text("TXT_LIBRARY_LOCKED"), pos, cc.WHITE);
			return;
		}
		
		cc.log(this.LOGTAG, "onTouchPot", potId);
		var popup = new UtilPanelInfo ();
		popup.show (potId);
	},
	
	onTouchDecor: function (sender, decorId)
	{
		if(sender.uiData.itemAmount <= 0)
		{
			var pos = FWUtils.getWorldPosition(sender);
			pos.y -= 40;
			FWUtils.showWarningText(FWLocalization.text("TXT_LIBRARY_LOCKED"), pos, cc.WHITE);
			return;
		}
			
		cc.log(this.LOGTAG, "onTouchDecor", decorId);
		var popup = new UtilPanelInfo ();
		popup.show (decorId);
	},

	onScroll: function (sender, type)
	{
		// ccui.ScrollView.EVENT_BOUNCE_BOTTOM    6
		// ccui.ScrollView.EVENT_BOUNCE_LEFT    7
		// ccui.ScrollView.EVENT_BOUNCE_RIGHT    8
		// ccui.ScrollView.EVENT_BOUNCE_TOP    5
		// ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM    1
		// ccui.ScrollView.EVENT_SCROLL_TO_LEFT    2
		// ccui.ScrollView.EVENT_SCROLL_TO_RIGHT    3
		// ccui.ScrollView.EVENT_SCROLL_TO_TOP    0
		// ccui.ScrollView.EVENT_SCROLLING    4
		
		if (type !== 9)
		{
			this.isAutoScroll = false;
			return;
		}
        
		this.next = _.now() + 33;
		this.isAutoScroll = true;

		if (this.scrollY != this.inner.getPosition().y)
		{
			this.isUp = this.scrollY < this.inner.getPosition().y;
			this.scrollY = this.inner.getPosition().y;
		}
	},
});