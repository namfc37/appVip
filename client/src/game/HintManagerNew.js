const DIRECTION_UP = 0;
const DIRECTION_DOWN = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_RIGHT = 3;

const SCALE_ICON_HINT = 0.45;

const BAR_HINT_W = 365;


var HintManagerNew = cc.Class.extend({
    LOGTAG: "[HintManagerNew]",
    isShowing: false,
    hintPosition: null,
    direction:null,
    isShowUIDESC:false,
    oldHeight:null,
    numFrame:null,
    descPosition:null,
    hintType:null,
    init: function () {//web
        //cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0.01, cc.REPEAT_FOREVER, 0, false);
        cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
    },
    uninit:function()
    {
        cc.director.getScheduler().unscheduleUpdateForTarget(this);
    },
    update: function () {
        if (!this.isShowing) return;

        if (FWUI.draggedWidget) {
            //cc.log("position",FWUI.draggedWidget.getTouchMovePosition().x);
            this.hintPosition = FWUI.draggedWidget.getTouchMovePosition();

            if (this.hintMain) {
                this.setPositionHint(this.hintPosition);
            }
        }
		
        if(this.isShowUIDESC && cc.sys.isNative)
        {
            this.hintMain.setVisible(true);
            if(this.numFrame <5) {this.numFrame++; return; }
            if(this.lblBugNote&&this.hintMain&&this.boardHint)
            {
                var height = this.lblBugNote.getVirtualRendererSize().height;
                if (this.lblBugNote.getContentSize().height != height) {
                    if(this.oldHeight != height)
                    {
                        this.lblBugNote.setContentSize(this.lblBugNote.getContentSize().width,height);

                        this.boardHint.setContentSize(this.boardHint.getContentSize().width,height+80)
                        //this.hintMain.setPositionY(this.hintMain.getPosition().y-(250-height)/2 );
                        this.isShowUIDESC = false;
                        this.direction = null;
                        this.setPositionHint(cc.p(this.descPosition.x,this.descPosition.y),(250-height)/2-10);

                    }
                    else
                    {
                        if(this.oldHeight == 250)
                        {

                        }
                        else
                        {
                            this.lblBugNote.setContentSize(this.lblBugNote.getContentSize().width,height);
                            this.boardHint.setContentSize(this.boardHint.getContentSize().width,height+80)
                            //this.hintMain.setPositionY(this.hintMain.getPosition().y-(250-height)/2 );
                            this.isShowUIDESC = false;
                            this.direction = null;
                            this.setPositionHint(cc.p(this.descPosition.x,this.descPosition.y),(250-height)/2-10);
                        }
                    }
                }
            }
        }
    },
    setPositionHint: function (position,minusHeight) {
        if (!this.boardHint) return;
        var distance = 60;
        var newPosition =cc.p(0,0);
        var size = this.boardHint.getContentSize();
        var sizeScreen = cc.director.getVisibleSize();
        if(!this.direction)
        {
            if((position.y +size.height+distance)< sizeScreen.height)
            {
                this.direction = DIRECTION_UP;
                newPosition.x = position.x;
                newPosition.y = position.y +size.height/2+distance;
            }
            else
            {
                if(position.x > sizeScreen.width/2)
                {
                    this.direction = DIRECTION_LEFT;
                    newPosition.y = position.y;
                    newPosition.x = position.x -size.width/2-distance;
                }
                else
                {
                    this.direction = DIRECTION_RIGHT;
                    newPosition.y = position.y;
                    newPosition.x = position.x +size.width/2+distance;
                }
            }
        }
        else
        {
            switch (this.direction){
                case DIRECTION_UP: {
                    newPosition.x = position.x;
                    newPosition.y = position.y +size.height/2+distance;
                    break;
                }
                case DIRECTION_LEFT:{
                    newPosition.y = position.y;
                    newPosition.x = position.x -size.width/2-distance;
                    break;
                }
                case DIRECTION_RIGHT:
                {
                    newPosition.y = position.y;
                    newPosition.x = position.x +size.width/2+distance;
                    break;
                }
                default:
                {
                    break;
                }
            }

        }

        if(minusHeight)
        {
            newPosition.y -= minusHeight;
        }
        //newPosition.y = position.y;
        //newPosition.x = position.x + size.width / 2 + 40;
        this.hintMain.setPosition(newPosition);

        if(this.hintMain.getPositionY() + size.height/2 > sizeScreen.height)
        {
            this.hintMain.setPosition(cc.p(this.hintMain.getPositionX(),sizeScreen.height-size.height/2));
        }
        if(this.hintMain.getPositionX() + size.width/2 > sizeScreen.width)
        {
            this.hintMain.setPosition(cc.p(sizeScreen.width-size.width/2,this.hintMain.getPositionY()));
        }
        if(this.hintMain.getPositionX() - size.width/2 < 0)
        {
            this.hintMain.setPosition(cc.p(size.width/2,this.hintMain.getPositionY()));
        }
    },
    show: function (parent, hintType, itemId, position, zorder) {//web show: function (parent, hintType, itemId, position, zorder = 999999) {
		
		if(zorder === undefined)
			zorder = 999999;
		
        cc.log(this.LOGTAG, "show", " - hintType:", hintType, ", itemId:", itemId);

        var itemType;
		if (hintType === HINT_TYPE_TEXT) {}
        else if (hintType === HINT_TYPE_ACHIEVEMENT) {
            if (defineMap[itemId])
                itemType = defineMap[itemId].TYPE;
            else
                itemType = defineTypes.TYPE_ACHIEVEMENT;
        }
        else {
            hintType = this.getHintTypeByProductID(itemId);
        }


        this.createHint(hintType, itemId, itemType, parent, zorder, position);
        this.hintType = hintType;

    },
    showHint: function (widget, position) {
        if (!widget)
            return;
    },
    hideAllHint:function(){
        if(this.isShowing)
        {
            if(this.hintType || this.hintType === HINT_TYPE_POT) this.hideHint(this.hintType); ///HINT_TYPE_POT = 0 -> if(this.hintType) -> false
        }
    },
    hideHint: function (hintType,productId) {
        cc.log(this.LOGTAG, "hideHint", " - hintType:", hintType, ", itemId:", productId);
        this.isShowing = false;
        this.isShowUIDESC = false;
        this.direction = null;
        if(!hintType && productId)
        {
            hintType = this.getHintTypeByProductID(productId);
        }
        switch (hintType) {
            case HINT_TYPE_POT:
            {
                FWUI.hide(UI_HINT_POT_DICORATE, UIFX_NONE);
                break;
            }
            case HINT_TYPE_ITEM:
            {
                FWUI.hide(UI_HINT_BUGS, UIFX_NONE);
                break;
            }
            case HINT_TYPE_PLANT:
            {
                FWUI.hide(UI_HINT_PLANT, UIFX_NONE);
                break;
            }
            case HINT_TYPE_MACHINE:
            {
                this.lblBugNote.setContentSize(250,250);
                this.boardHint.setContentSize(cc.size(250,280));
                FWUI.hide(UI_HINT_DESC, UIFX_NONE);
                break;
            }
            case HINT_TYPE_PRODUCT:
            {
            }
            case HINT_TYPE_PRODUCT_MACHINE:
            {
                FWUI.hide(UI_HINT_TEST, UIFX_NONE);
                break;
            }
            case HINT_TYPE_DESC:
            case HINT_TYPE_TEXT:
            {
                this.lblBugNote.setContentSize(250,250);
                this.boardHint.setContentSize(cc.size(250,280));
                FWUI.hide(UI_HINT_DESC, UIFX_NONE);
                break;
            }
            case HINT_TYPE_ACHIEVEMENT:
            {
                FWUI.hide(UI_HINT_ACHIEVEMENT, UIFX_NONE);
                break;
            }
            case HINT_TYPE_SKIN:
            {
                FWUI.hide(UI_HINT_SKIN_CLOUD, UIFX_NONE);
                break;
            }
            case HINT_TYPE_HOOK:
            {
                FWUI.hide(UI_HINT_HOOK, UIFX_NONE);
                break;
            }
        }
    },
    createHint: function (hintType, itemId, itemType, parent, zorder, position) {

        cc.log(this.LOGTAG, "create", " - hintType:", hintType, ", itemId:", itemId, ", itemType:", itemType);

        switch (hintType) {
            case HINT_TYPE_POT:{
                this.createHintPotDecor(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_ITEM:{
                this.createHintBugs(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_PLANT:{
                this.createHintPlant(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_MACHINE:{
                this.createHintDesc(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_PRODUCT:{
                break;
            }
            case HINT_TYPE_PRODUCT_MACHINE:{
                this.createHintProductMachine(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_DESC:
            case HINT_TYPE_TEXT:
			{
                this.createHintDesc(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_ACHIEVEMENT:{
                this.createHintAchievement(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case HINT_TYPE_SKIN:{
                this.createHintSkin(hintType, itemId, itemType, parent, zorder, position);
                break;
            }
            case  HINT_TYPE_HOOK:{
                this.createHintHook(hintType, itemId, itemType, parent, zorder, position);
                break;
            }

        }
    },
    createHintProductMachine:function(hintType,itemId, itemType, parent, zorder, position) {
        var widget = FWPool.getNode(UI_HINT_TEST, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("ParentName", parent.getName());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            var barHint = FWUI.getChildByName(popup, "barHint");

            if(itemData.itemParts.length <= 2)
            {
                boardHint.setContentSize(cc.size(220,boardHint.getContentSize().height));
                //barHint.setContentSize(cc.size(180,5));
            }
            else
            {
                boardHint.setContentSize(cc.size(itemData.itemParts.length *75+30,boardHint.getContentSize().height));
                //barHint.setContentSize(cc.size(itemData.itemParts.length *75 ,5));
            }


            //if(itemData.itemParts.length>3)
            //{
            //    var size
            //    boardHint.setContentSize(cc.size(320,boardHint.getContentSize().height));
            //    barHint.setContentSize(cc.size(290,5));
            //}
            //else
            //{
            //    boardHint.setContentSize(cc.size(250,boardHint.getContentSize().height));
            //    barHint.setContentSize(cc.size(230,5));
            //}


            //cc.log("testSize",JSON.stringify(boardHint.getContentSize()));
            var timer = FWUI.getChildByName(popup, "timer");
            var listItem = FWUI.getChildByName(popup, "listItem");
            var itemDef = {
                icon: {type: UITYPE_IMAGE, field: "icon", scale: "data.iconScale"},
                iconLock: {type: UITYPE_IMAGE, visible: false},
                textTitle: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "text", visible: "data.text !== undefined", color: "data.textColor"},
                textAmount: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "textAmount", visible: "data.textAmount !== undefined", color: "data.textAmountColor"},
                textRequire: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "textRequire", visible: "data.textRequire !== undefined", color: "data.textRequireColor"}
            };
            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                lblExpBonus: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, value: itemData.itemStats[0].text, style: TEXT_STYLE_TEXT_NORMAL_GREEN},
                lb_time: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, id: FWUtils.secondsToTimeString(itemData.itemTime)},
                listItem: {type: UITYPE_2D_LIST, items: itemData.itemParts, itemUI: UI_HINT_ITEM, itemDef: itemDef, itemSize: cc.size(75, 75), singleLine: true, itemsAlign: "center"},
				lblCurrentAmount: {type: UITYPE_TEXT, value:cc.formatStr(FWLocalization.text("TXT_HINT_CURRENT_AMOUNT"), gv.userStorages.getItemAmount(itemId)), style: TEXT_STYLE_TEXT_NORMAL},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = boardHint;//FWUI.getChildByName(widget, "boardHint");


            var lblNameProduct = FWUI.getChildByName(widget, "lblNameProduct");
            if(lblNameProduct.getVirtualRendererSize().width+20 > this.boardHint.getContentSize().width)
            {
                this.boardHint.setContentSize(lblNameProduct.getVirtualRendererSize().width+20,this.boardHint.getContentSize().height);
            }
			
			barHint.setScale((boardHint.getContentSize().width - 30) / BAR_HINT_W, 1);

            if(position)
            {
                if(FWUI.isShowing(UI_MACHINE_PRODUCE))
                {
                    this.direction = DIRECTION_LEFT;
                }
                this.setPositionHint(position);
            }

            //widget.setLocalZOrder(Z_UI_AIRSHIP);
        }
    },
    createHintBugs:function(hintType,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_BUGS, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("positionParent", parent.getPositionX(), parent.getPositionY());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            //var barHint = FWUI.getChildByName(popup, "barHint");
            var lblBugsNote = FWUI.getChildByName(popup, "lblBugsNote");
            if(itemData.itemParts.length<=0)
            {
                position.y -= 50;
                boardHint.setContentSize(cc.size(250,160));
                //barHint.setContentSize(cc.size(290,5));
            }
            else
            {
                boardHint.setContentSize(cc.size(250,245));
                //barHint.setContentSize(cc.size(230,5));
            }



            //cc.log("testSize",JSON.stringify(boardHint.getContentSize()));
            var timer = FWUI.getChildByName(popup, "timer");
            var listItem = FWUI.getChildByName(popup, "listItem");
            var itemDef = {
                icon: {type: UITYPE_IMAGE, field: "icon", scale: "data.iconScale"},
                iconLock: {type: UITYPE_IMAGE, visible: false},
                textTitle: {type: UITYPE_TEXT, visible: false},
                textAmount: {type: UITYPE_TEXT, visible: false},
                textRequire: {type: UITYPE_TEXT,visible: false}
            };
            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                lblBugsNote:{type: UITYPE_TEXT, id: itemData.itemDesc,style:TEXT_STYLE_HINT_NOTE},
                listItem: {type: UITYPE_2D_LIST, items: itemData.itemParts, itemUI: UI_HINT_ITEM, itemDef: itemDef, itemSize: cc.size(70, 70), itemsAlign: "center"},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = FWUI.getChildByName(widget, "boardHint");



            //this.boardHint.setAnchorPoint(cc.p(0.5,0.5));
            if(position)
            {
                this.setPositionHint(position);
            }

            //widget.setLocalZOrder(Z_UI_AIRSHIP);
        }
    },
    createHintPlant:function(hintType,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_PLANT, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("positionParent", parent.getPositionX(), parent.getPositionY());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            //var barHint = FWUI.getChildByName(popup, "barHint");
            var lblNote = FWUI.getChildByName(popup, "lblNote");
            //if(itemData.itemParts.length<=0)
            //{
            //    position.y -= 50;
            //    boardHint.setContentSize(cc.size(250,180));
            //    //barHint.setContentSize(cc.size(290,5));
            //}
            //else
            //{
            //    boardHint.setContentSize(cc.size(250,280));
            //    //barHint.setContentSize(cc.size(230,5));
            //}



            //cc.log("testSize",JSON.stringify(boardHint.getContentSize()));
            var timer = FWUI.getChildByName(popup, "timer");
            var listItem = FWUI.getChildByName(popup, "listItem");
            var itemDef = {
                icon: {type: UITYPE_IMAGE, field: "icon", scale: "data.iconScale"},
                iconLock: {type: UITYPE_IMAGE, visible: false},
                textTitle: {type: UITYPE_TEXT, visible: false},
                textAmount: {type: UITYPE_TEXT, visible: false},
                textRequire: {type: UITYPE_TEXT,visible: false}
            };
            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                lblNote:{type: UITYPE_TEXT, id: itemData.itemDesc,style:TEXT_STYLE_HINT_NOTE},
                lblExpBonus: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, value: itemData.itemStats[0].text, style: TEXT_STYLE_TEXT_NORMAL_GREEN},
                lb_time: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, id: FWUtils.secondsToTimeString(itemData.itemTime),},
                listItem: {type: UITYPE_2D_LIST, items: itemData.itemParts, itemUI: UI_HINT_ITEM, itemDef: itemDef, itemSize: cc.size(80, 80), singleLine: true, itemsAlign: "center"},
                //imgExp:{visible:itemData.isPlantEvent},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = FWUI.getChildByName(widget, "boardHint");



            //this.boardHint.setAnchorPoint(cc.p(0.5,0.5));
            if(position)
            {
                this.setPositionHint(position);
            }

            //widget.setLocalZOrder(Z_UI_AIRSHIP);
        }
    },
    createHintPotDecor:function(hintType,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_POT_DICORATE, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("positionParent", parent.getPositionX(), parent.getPositionY());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            //var barHint = FWUI.getChildByName(popup, "barHint");

            //if(itemData.itemParts.length>3)
            //{
            //    boardHint.setContentSize(cc.size(320,300));
            //    barHint.setContentSize(cc.size(290,5));
            //}
            //else
            //{
            //    boardHint.setContentSize(cc.size(250,300));
            //    barHint.setContentSize(cc.size(230,5));
            //}


            //cc.log("testSize",JSON.stringify(boardHint.getContentSize()));
            var listItem = FWUI.getChildByName(popup, "listItem");
            var itemDef = {
                iconValue: {type: UITYPE_IMAGE, field: "icon",scale:0.5},
                textValue:{type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "text", style: TEXT_STYLE_TEXT_NORMAL_GREEN}
            };
            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                listItem: {type: UITYPE_2D_LIST, items: itemData.itemStats, itemUI: UI_HINT_ITEM_STATS, itemDef: itemDef, itemSize: cc.size(115, 50), singleLine: true, itemsAlign: "center"},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = FWUI.getChildByName(widget, "boardHint");
            if(position)
            {
                this.setPositionHint(position);
            }

            //widget.setLocalZOrder(Z_UI_AIRSHIP);
        }
    },
    createHintDesc:function(hintType,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_DESC, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;
			
            //cc.log("positionParent", parent.getPositionX(), parent.getPositionY());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            //var barHint = FWUI.getChildByName(popup, "barHint");
            var lblBugsNote = FWUI.getChildByName(popup, "lblBugsNote");

            //if(itemId === ID_NET_HOME|| itemId === ID_NET_FRIEND)
            //{
            //    position.y -= 50;
            //    boardHint.setContentSize(cc.size(250,180));
            //
            //}
            //else
            //{
                boardHint.setContentSize(cc.size(280,280));
            //}
			if(cc.sys.isNative)
				lblBugsNote.setContentSize(cc.size(lblBugsNote.getContentSize().width,0));

            this.oldHeight = lblBugsNote.getVirtualRendererSize().height;

            var timer = FWUI.getChildByName(popup, "timer");
            var listItem = FWUI.getChildByName(popup, "listItem");
            var itemDef = {
                icon: {type: UITYPE_IMAGE, field: "icon", scale: "data.iconScale"},
                iconLock: {type: UITYPE_IMAGE, visible: false},
                textTitle: {type: UITYPE_TEXT, visible: false},
                textAmount: {type: UITYPE_TEXT, visible: false},
                textRequire: {type: UITYPE_TEXT,visible: false}
            };
            var uiDefine = {
                center:{visible:false},
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                lblBugsNote:{type: UITYPE_TEXT, id: itemData.itemDesc,style:TEXT_STYLE_HINT_NOTE},
                //listItem: {type: UITYPE_2D_LIST, items: itemData.itemParts, itemUI: UI_HINT_ITEM, itemDef: itemDef, itemSize: cc.size(70, 70), itemsAlign: "center"},
            };



            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            this.isShowUIDESC = true;
            this.numFrame = 0;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = FWUI.getChildByName(widget, "boardHint");
            this.lblBugNote = FWUI.getChildByName(widget, "lblBugsNote");

            //this.boardHint.setAnchorPoint(cc.p(0.5,0.5));
            if(position)
            {
				if(cc.sys.isNative)
				{
					this.setPositionHint(cc.p(-9999,-9999));
					this.descPosition = position;
				}
				else
				{
					this.setPositionHint(position);
					this.boardHint.setContentSize(this.boardHint.getContentSize().width,lblBugsNote.getVirtualRendererSize().height+80);
					this.hintMain.setVisible(true);
				}
            }
        }
    },
    createHintAchievement:function(hintType,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_ACHIEVEMENT, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("positionParent", parent.getPositionX(), parent.getPositionY());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            //var barHint = FWUI.getChildByName(popup, "barHint");
            var lblBugsNote = FWUI.getChildByName(popup, "lblBugsNote");
            //if(itemData.itemParts.length<=0)
            //{
            //    position.y -= 100;
            //    boardHint.setContentSize(cc.size(250,180));
            //    barHint.setContentSize(cc.size(290,5));
            //}
            //else
            //{
            //    boardHint.setContentSize(cc.size(250,280));
            //    barHint.setContentSize(cc.size(230,5));
            //}



            cc.log("testSize",lblBugsNote.getVirtualRendererSize().height);

            var timer = FWUI.getChildByName(popup, "timer");

            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                lblBugsNote:{type: UITYPE_TEXT, id: itemData.itemLongDesc,style:TEXT_STYLE_HINT_NOTE},
                //listItem: {type: UITYPE_2D_LIST, items: itemData.itemParts, itemUI: UI_HINT_ITEM, itemDef: itemDef, itemSize: cc.size(70, 70), itemsAlign: "center"},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = FWUI.getChildByName(widget, "boardHint");



            //this.boardHint.setAnchorPoint(cc.p(0.5,0.5));
            if(position)
            {
                this.setPositionHint(position);
            }
        }
    },
    createHintSkin:function(hintType,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_SKIN_CLOUD, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("positionParent", parent.getPositionX(), parent.getPositionY());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            //var barHint = FWUI.getChildByName(popup, "barHint");
            var lblNote = FWUI.getChildByName(popup, "lblNote");
            //if(itemData.itemParts.length<=0)
            //{
            //    position.y -= 50;
            //    boardHint.setContentSize(cc.size(250,180));
            //    //barHint.setContentSize(cc.size(290,5));
            //}
            //else
            //{
            //    boardHint.setContentSize(cc.size(250,280));
            //    //barHint.setContentSize(cc.size(230,5));
            //}



            //cc.log("testSize",JSON.stringify(boardHint.getContentSize()));
            var timer = FWUI.getChildByName(popup, "timer");

            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                lblNote:{type: UITYPE_TEXT, id: itemData.itemLongDesc,style:TEXT_STYLE_HINT_NOTE},
                lb_time: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, id: FWUtils.secondsToTimeString(itemData.itemTime),},
                //imgExp:{visible:itemData.isPlantEvent},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = FWUI.getChildByName(widget, "boardHint");



            //this.boardHint.setAnchorPoint(cc.p(0.5,0.5));
            if(position)
            {
                this.setPositionHint(position);
            }

            //widget.setLocalZOrder(Z_UI_AIRSHIP);
        }
    },

    createHintHook:function(idHook,itemId, itemType, parent, zorder, position){
        var widget = FWPool.getNode(UI_HINT_HOOK, false);
        if (widget) {
            var itemData = this.getUIFillData(itemId, idHook);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            //cc.log("ParentName", parent.getName());

            var popup = FWUI.getChildByName(widget, "center");

            var boardHint = FWUI.getChildByName(popup, "boardHint");
            var barHint = FWUI.getChildByName(popup, "barHint");

            if(itemData.itemParts.length <= 2)
            {
                boardHint.setContentSize(cc.size(220,boardHint.getContentSize().height));
                //barHint.setContentSize(cc.size(180,5));
            }
            else
            {
                boardHint.setContentSize(cc.size(itemData.itemParts.length *75+30,boardHint.getContentSize().height));
                //barHint.setContentSize(cc.size(itemData.itemParts.length *75 ,5));
            }


            //cc.log("itemData.itemParts",JSON.stringify(itemData.itemParts.length));

            var timer = FWUI.getChildByName(popup, "timer");
            var listItem = FWUI.getChildByName(popup, "listItem");
            var itemDef = {
                icon: {type: UITYPE_IMAGE, field: "icon", scale: "data.iconScale"},
                iconLock: {type: UITYPE_IMAGE, visible: false},
                textTitle: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "text", visible: "data.text !== undefined", color: "data.textColor"},
                textAmount: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "textAmount", visible: "data.textAmount !== undefined", color: "data.textAmountColor"},
                textRequire: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, field: "textRequire", visible: "data.textRequire !== undefined", color: "data.textRequireColor"}
            };
            var uiDefine = {
                lblNameProduct: {type: UITYPE_TEXT, id: itemData.itemName, style: TEXT_STYLE_TEXT_NORMAL},
                //lblExpBonus: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, value: itemData.itemStats[0].text, style: TEXT_STYLE_TEXT_NORMAL_GREEN},
                lb_time: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, id: FWUtils.secondsToTimeString(itemData.itemTime)},
                listItem: {type: UITYPE_2D_LIST, items: itemData.itemParts, itemUI: UI_HINT_ITEM, itemDef: itemDef, itemSize: cc.size(75, 75), singleLine: true, itemsAlign: "center"},
            };

            //zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (widget.getParent() !== parent) {
                widget.removeFromParent();
                parent.addChild(widget, zorder);
            }
            //widget.setPosition(position);
            this.isShowing = true;
            FWUI.showWidgetWithData(widget, null, uiDefine, parent, UIFX_NONE);

            this.hintMain = FWUI.getChildByName(widget, "center");
            this.boardHint = boardHint;//FWUI.getChildByName(widget, "boardHint");


            var lblNameProduct = FWUI.getChildByName(widget, "lblNameProduct");
            if(lblNameProduct.getVirtualRendererSize().width+20 > this.boardHint.getContentSize().width)
            {
                this.boardHint.setContentSize(lblNameProduct.getVirtualRendererSize().width+20,this.boardHint.getContentSize().height);
            }
			
			barHint.setScale((boardHint.getContentSize().width - 30) / BAR_HINT_W, 1);

            if(position)
            {
                if(FWUI.isShowing(UI_EVENT3))
                {
                    this.direction = DIRECTION_LEFT;
                }
                this.setPositionHint(position);
            }
        }
    },




    getUIFillData: function (itemId, hintType) {

        switch (hintType) {
            case HINT_TYPE_POT:
                return this.getUIPotFillData(itemId);
            case HINT_TYPE_ITEM:
                return this.getUIItemFillData(itemId);
            case HINT_TYPE_PLANT:
                return this.getUIPlantFillData(itemId);
            case HINT_TYPE_MACHINE:
                return this.getDescFillData(itemId);
            case HINT_TYPE_PRODUCT:
                return this.getUIProductFillData(itemId);
            case HINT_TYPE_PRODUCT_MACHINE:
                return this.getUIProductMachineFillData(itemId);
            case HINT_TYPE_DESC:
                return this.getDescFillData(itemId);
            case HINT_TYPE_TEXT:
                return this.getTextFillData(itemId);
            case HINT_TYPE_ACHIEVEMENT:
                return this.getAchievementFillData(itemId);
            case HINT_TYPE_SKIN:
                return this.getSkinFillData(itemId);
            case HINT_TYPE_HOOK:
                return this.getHookFillData(itemId);
        }
    },
    getUIProductMachineFillData: function (productId) {
        cc.log(this.LOGTAG, " - getUIProductMachineFillData", "productId:", productId);

        var sources = [];
        if (g_PRODUCT[productId]) {
            var items = g_PRODUCT[productId].REQUIRE_ITEM;
            for (var itemId in items) {

                var itemAmount = gv.userStorages.getItemAmount(itemId);
                var itemRequire = items[itemId];

                var define = {
                    id: itemId,
                    textAmount: cc.formatStr("%d", itemAmount),
                    textRequire: cc.formatStr("/%d", itemRequire),
                    textAmountColor: (itemAmount >= itemRequire) ? cc.color.GREEN : cc.color.RED,
                    textRequireColor: cc.color.GREEN
                };

                var itemGfx = Game.getItemGfxByDefine(itemId);
                if (itemGfx.spine) {
                    define.iconType = HINT_ICON_TYPE_SPINE;
                    define.spine = itemGfx.spine;
                    define.spineAnim = itemGfx.anim;
                    define.spineScale = itemGfx.scale * HINT_ICON_SCALE_PRODUCT_INGREDIENT_SPINE;
                }
                else {
                    define.iconType = HINT_ICON_TYPE_SPRITE;
                    define.icon = itemGfx.sprite;
                    define.iconScale = SCALE_ICON_HINT;
                }

                sources.push(define);
            }
        }

        var productGfx = Game.getItemGfxByDefine(productId);
        return {
            itemId: productId,
            itemName: Game.getItemName(productId),
            itemTime: g_PRODUCT[productId].PRODUCTION_TIME,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            itemImage: productGfx.sprite,
            itemImageScale: HINT_ICON_SCALE_PRODUCT,
            itemDesc: FWLocalization.text("TXT_HINT_PRODUCT_INGREDIENTS"),
            itemStats: [
                {text: cc.formatStr("+%d", g_PRODUCT[productId].EXP_RECEIVE), icon: "hud/icon_exp.png"},
            ],
            itemParts: sources
        };
    },
    getUIPotFillData:function(itemId){
        cc.log(this.LOGTAG, " - getUIPotFillData", "itemId:", itemId);
        var gfx = Game.getItemGfxByDefine(itemId);
        var res = {
            itemId: itemId,
            itemName: Game.getItemName(itemId),
        };
        var itemType = defineMap[itemId].TYPE;
        if(itemType === defineTypes.TYPE_POT)
        {
            var potInfo = g_POT[itemId];
            res.itemStats = [
                {text: "+" + potInfo.BUG_APPEAR_RATIO + "%", icon: "hud/icon_bug.png"},
                {text: "-" + potInfo.TIME_DECREASE_DEFAULT + "s", icon: "hud/icon_time.png"},
                {text: "+" + potInfo.EXP_INCREASE, icon: "hud/icon_exp.png"},
            ];
        }
        else if(itemType === defineTypes.TYPE_DECOR)
        {
            var decorInfo = g_DECOR[itemId];
            res.itemStats = [
                {text: "+" + decorInfo.BUG_APPEAR_RATIO + "%", icon: "hud/icon_bug.png"},
                {text: "-" + decorInfo.TIME_DECREASE_DEFAULT + "s", icon: "hud/icon_time.png"},
                {text: "+" + decorInfo.EXP_INCREASE, icon: "hud/icon_exp.png"},
            ];
        }

        return res;
    },
    getDescFillData:function(itemId){
        var itemType = defineMap[itemId].TYPE;
        //var downLine = "";
        //switch (COUNTRY)
        //{
        //    case COUNTRY_VIETNAM:
        //        downLine = "\n\n";
        //        break;
        //    case COUNTRY_BRAZIL:
        //        downLine = "\n\n";
        //        break;
        //    case COUNTRY_THAILAND:
        //        downLine = "\n\n";
        //        break;
        //    case COUNTRY_MYANMAR:
        //        downLine = "\n\n";
        //        break;
        //    case COUNTRY_PHILIPPINE:
        //        downLine = "\n\n";
        //        break;
        //    case COUNTRY_GLOBAL:
        //        downLine = "\n";
        //        break;
        //}

        var result = {
            itemId: itemId,
            itemName: Game.getItemName(itemId),
            itemDesc:  FWLocalization.text(itemType === defineTypes.TYPE_DECOR ? "TXT_DESC_D0" : "TXT_DESC_" + itemId),
        };

        // event
        if(itemType === defineTypes.TYPE_EVENT)
        {
            result.itemName="";
            if(itemId === EVENT_TOKEN_ITEM_ID || itemId === g_EVENT_02.E02_POINT || itemId === g_EVENT_03.E03_POINT)
            {
                result.itemName= Game.getItemName(itemId);
                result.itemDesc = FWLocalization.text("TXT_DESC_" + itemId);
            }
            else if(itemId === EVENT_POSM_ITEM_ID)
            {
                result.itemName=Game.getItemName(EVENT_POSM_ITEM_ID);
                result.itemDesc =  FWLocalization.text("TXT_EVT_HINT_OUTGAME_PUZ");
            }
            else
                result.itemDesc = FWLocalization.text("TXT_EVT_HINT_PUZ");
        }
		
        return result;
    },
    getTextFillData:function(itemId){
        var result = {
            itemName: itemId[0],
            itemDesc: itemId[1],
        };
        return result;
    },
    getUIItemFillData:function(itemId){

        var itemType = defineMap[itemId].TYPE;
        if (itemType === defineTypes.TYPE_PEST) {

            var gfx = Game.getItemGfxByDefine(itemId);
            var data = {
                itemId: itemId,
                itemName: Game.getItemName(itemId),
                itemDesc: FWLocalization.text("TXT_HINT_BUG_APPEAR"),
            };

            data.itemParts = [];
            for (var key in g_PLANT) {
                var plant = g_PLANT[key];
                if (plant.BUG_ID === itemId) {
                    var plantGfx = Game.getItemGfxByDefine(plant);
                    data.itemParts.push({
                        id: key,
                        iconType: HINT_ICON_TYPE_SPRITE,
                        icon: plantGfx.sprite,
                        iconScale: SCALE_ICON_HINT,
                        isLocked: false
                    });
                }
            }

            // jira#5210
            if(data.itemParts.length <= 0)
                data.itemDesc = FWLocalization.text("TXT_HINT_BUG_APPEAR_FRIEND");

            return data;
        }

        return {};
    },
    getHintTypeByProductID:function(itemId) {
        var itemType = defineMap[itemId].TYPE;
        var hintType = null;
        if (itemType === defineTypes.TYPE_POT || itemType === defineTypes.TYPE_DECOR)
            hintType = HINT_TYPE_POT;
        else if (itemType === defineTypes.TYPE_PLANT)
            hintType = HINT_TYPE_PLANT;
        else if (itemType === defineTypes.TYPE_PEST)// || itemType === defineTypes.TYPE_DECOR || itemType === defineTypes.TYPE_MATERIAL)
            hintType = HINT_TYPE_ITEM;
        else if (itemType === defineTypes.TYPE_MACHINE)
            hintType = HINT_TYPE_MACHINE;
        else if (itemType === defineTypes.TYPE_PRODUCT || itemType === defineTypes.TYPE_PEARL) {
            if (!hintType) {
                // quick fix jira#5044
                //cc.log(this.LOGTAG, "show", "hintType must be specified with item of TYPE_PRODUCT");
                //return;
                hintType = HINT_TYPE_PRODUCT_MACHINE;
            }
        }
        else if (itemType === defineTypes.TYPE_MATERIAL || itemType === defineTypes.TYPE_MINERAL || itemType === defineTypes.TYPE_EVENT
            || itemType === defineTypes.TYPE_GACHAPON||itemType === defineTypes.TYPE_FISHING_ITEM
            ||itemType === defineTypes.TYPE_NONE||itemType === defineTypes.TYPE_MINIGAME)
            hintType = HINT_TYPE_DESC;

        else if(itemType === defineTypes.TYPE_SKIN)
            hintType = HINT_TYPE_SKIN;
        else if(itemType === defineTypes.TYPE_HOOK)
            hintType = HINT_TYPE_HOOK;
        return hintType;
    },
    getUIPlantFillData:function(plantId) {
        cc.log(this.LOGTAG, " - getUIPlantFillData", "plantId:", plantId);

        var plantGfx = Game.getItemGfxByDefine(plantId);
        var res = {
            itemId: plantId,
            itemName: Game.getItemName(plantId),
            itemTime: g_PLANT[plantId].GROW_TIME,// jira#5904 g_PLANT[plantId].SEED_TIME + g_PLANT[plantId].GROW_TIME,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            itemImage: plantGfx.sprite,
            itemImageScale: 1,// jira#6002 plantGfx.scale,
            itemStats: [
                {text: cc.formatStr("+%d", g_PLANT[plantId].HARVEST_EXP), icon: "hud/icon_exp.png"},
                //{ text: cc.formatStr("+%d", g_PLANT[plantId].HARVEST_GOLD), icon: "hud/icon_gold.png" } // jira#5308
            ],
            //isPlantEvent : true,
        };

        if (g_PLANT[plantId].BUG_ID) {
            var plantBugGfx = Game.getItemGfxByDefine(g_PLANT[plantId].BUG_ID);
            res.itemDesc = FWLocalization.text("TXT_HINT_BUG_ATTRACT");
            res.itemParts = [
                {
                    id: g_PLANT[plantId].BUG_ID,
                    //iconType: HINT_ICON_TYPE_SPINE,
                    //spine: plantBugGfx.spine,
                    //spineAnim: plantBugGfx.anim,
                    //spineScale: plantBugGfx.scale || HINT_ICON_SCALE_PLANT_BUG,
                    iconType: HINT_ICON_TYPE_SPRITE,
                    icon: plantBugGfx.sprite,
                    iconScale: SCALE_ICON_HINT,
                    isLocked: false
                }
            ];
        }
        else
        {
            res.itemParts = [];
            res.itemDesc = "";
            //res.isPlantEvent = true;
        }


        return res;
    },
    getAchievementFillData:function(itemId)
    {
        var result = {
            itemId: itemId,
            itemName: Achievement.currentAchievement.title,
            itemLongDesc: (Achievement.currentAchievement.isCompletedAll ? "TXT_ACHIEVEMENT_COMPLETE2" : Achievement.currentAchievement.desc),
            //itemStats: [],
        };

        //var itemGfx = Game.getItemGfxByDefine(itemId);
        //if(itemGfx.sprite)
        //{
        //    result.itemIconType = HINT_ICON_TYPE_SPRITE;
        //    result.itemImageScale = itemGfx.scale;
        //    result.itemImage = itemGfx.sprite;
        //}
        //else
        //{
        //    result.itemIconType = HINT_ICON_TYPE_SPINE;
        //    result.itemSpine = itemGfx.spine;
        //    result.itemSpineAnim = itemGfx.anim;
        //    result.itemSpineScale = itemGfx.scale;
        //    result.itemSpineSkin = itemGfx.skin;
        //}

        return result;
    },
    getSkinFillData:function(skinId) {
        cc.log(this.LOGTAG, " - getSkinFillData", "skinId:", skinId);

        var gfx = Game.getItemGfxByDefine(skinId);
        var res = {
            itemId: skinId,
            itemName: Game.getItemName(skinId),
            itemTime: g_SKIN_ITEM[skinId].EFFECT_DURATION,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            //itemImage: gfx.sprite,
            //itemImageScale: gfx.scale,
            //itemDesc: "TXT_HINT_BUY_FROM_STORE",
            itemLongDesc: "",//itemLongDesc: "TXT_HINT_BUY_FROM_STORE",
        };

        // jira#5935
        var skin = g_SKIN_ITEM[skinId];
        var combo = g_COMBO[skin.COMBO_ID];
        if(combo)
        {
            var buffInfo = combo.BUFF_INFO[0];
            if(buffInfo)
            {
                // copied from CloudFloors.showFloorBuff2
                var text1 = (buffInfo.type === BUFF_HARVEST_TIME || buffInfo.type === BUFF_PRODUCTION_TIME ? "-" : "+") + buffInfo.value + (buffInfo.unit === PERC ? "% " : " ");
                var text2 = "TXT_BUFF_" + buffInfo.type + (buffInfo.type < 3 || buffInfo.type === 5 ? "_" + buffInfo.area : "");
                res.itemLongDesc = text1 + FWLocalization.text(text2);
            }
        }

        return res;
    },
    getHookFillData:function(idHook){
        cc.log(this.LOGTAG, " - getHookFillData", "idHook:", idHook);

        var sources = [];
        if (g_FISHING_ITEMS[idHook]) {
            var arrItems = _.clone(g_FISHING_ITEMS[idHook].REQUIRE_DEFAULT);

            if(GameEventTemplate3.dataMaterialHook[idHook])
            {
                var arrItem = _.clone(GameEventTemplate3.dataMaterialHook[idHook]);

                for(var key in arrItem)
                {
                    arrItems[key] = arrItem[key];
                }

            }
            for (var itemId in arrItems) {

                var itemAmount = gv.userStorages.getItemAmount(itemId);
                var itemRequire = arrItems[itemId];

                var define = {
                    id: itemId,
                    textAmount: cc.formatStr("%d", itemAmount),
                    textRequire: cc.formatStr("/%d", itemRequire),
                    textAmountColor: (itemAmount >= itemRequire) ? cc.color.GREEN : cc.color.RED,
                    textRequireColor: cc.color.GREEN
                };

                var itemGfx = Game.getItemGfxByDefine(itemId);
                if (itemGfx.spine) {
                    define.iconType = HINT_ICON_TYPE_SPINE;
                    define.spine = itemGfx.spine;
                    define.spineAnim = itemGfx.anim;
                    define.spineScale = itemGfx.scale * HINT_ICON_SCALE_PRODUCT_INGREDIENT_SPINE;
                }
                else {
                    define.iconType = HINT_ICON_TYPE_SPRITE;
                    define.icon = itemGfx.sprite;
                    define.iconScale = SCALE_ICON_HINT;
                }
                sources.push(define);
            }
        }



        var res = {
            itemId: idHook,
            itemName: Game.getItemName(idHook),
            itemTime: g_FISHING_ITEMS[idHook].PRODUCTION_TIME,
            //itemIconType: HINT_ICON_TYPE_SPRITE,
            //itemImage: gfx.sprite,
            //itemImageScale: gfx.scale,
            //itemDesc: "TXT_HINT_BUY_FROM_STORE",
            //itemLongDesc: "",//itemLongDesc: "TXT_HINT_BUY_FROM_STORE",
            itemParts: sources,
        };

        return res;

    },

});

HintManagerNew._instance = null;
HintManagerNew.getInstance = function () {
    if (!HintManagerNew._instance)
        HintManagerNew._instance = new HintManagerNew();
    return HintManagerNew._instance;
};

//web var gv = gv || {};
gv.hintManagerNew = HintManagerNew.getInstance();