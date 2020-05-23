
// TODO:
// - optimize getNode by replacing for loop with indexing
// - check retain/release
// - return node/all nodes to pool

var FWPool =
{
	// pooled opbjects
	poolObjects: {},

	// add a node with specified key to pool
	addNode:function(node, key)
	{
		// add to pool
		var nodeList = this.poolObjects[key];
		if(!nodeList)
			this.poolObjects[key] = nodeList = [];
		node.poolKey = key;
		node.poolFree = true;
		if(node.retain !== undefined)
			node.retain(); // cocos node must be retained
		nodeList.push(node);
	},
	
	// return a node with specified key
	getNode:function(key, requireFreeNode, expand)//web getNode:function(key, requireFreeNode = true, expand = true)
	{
		if(requireFreeNode === undefined)
			requireFreeNode = true;
		if(expand === undefined)
			expand = true;
		
		var nodeList = this.poolObjects[key];
		if(nodeList === undefined || nodeList.length <= 0)
		{
			if(key.endsWith(".atlas"))
				FWLoader.loadSpineToPool(key, 1);
			else if(key.endsWith(".ExportJson"))
				FWLoader.loadWidgetToPool(key, 1);
			else
				return null; // not pooled
			nodeList = this.poolObjects[key];
		}
		
		if(requireFreeNode === false)
		{
			nodeList[0].poolFree = false;
			return nodeList[0];
		}
		
		var node;
		for(var i=0, len=nodeList.length; i<len; i++)
		{
			node = nodeList[i];
			if(node.poolFree === true)
			{
				node.poolFree = false;
				return node;
			}
		}
		
		// no free node
		//cc.log("FWPool::getNode: warning: no free node: " + key);
		if(expand === false)
			return null;
		
		// can expand, try to create new one
		node = nodeList[0];
		var newNode = null;
		if(_isType(node, ccui.Text))
			{} // to distinguish ccui.Text and ccui.Widget, do not remove
		else if(_isType(node, ccui.Widget))
		{
			if(node.poolClonable === true)
				newNode = node.clone();
			else
				newNode = FWLoader.loadWidget(key);
		}
		else if(_isType(node, sp.SkeletonAnimation))
			newNode = FWLoader.loadSpine(key);
		if(newNode !== null)
		{
			this.addNode(newNode, key);
			newNode.poolFree = false;
			return newNode;
		}
		
		// unknown node type
		return null;
	},

	// remove all nodes with specified key from pool
	removeNodes:function(key)
	{
		if(!key)
		{
			cc.log("FWPool::removeNodes: all");
			for(var key in this.poolObjects)
				this.removeNodes(key);
			return;
		}
		
		var nodeList = this.poolObjects[key];
		if(nodeList && nodeList.length > 0)
		{
			for(var i=0; i<nodeList.length; i++)
			{
				if(nodeList[i].release !== undefined)
					nodeList[i].release(); // cocos node must be released
			}
			this.poolObjects[key] = [];
		}
	},
	
	// return all nodes with specified key to pool
	// if key is not specified, return all nodes to pool
	returnNodes:function(key)
	{
		if(key === undefined)
		{
			// return all nodes
			for(key in this.poolObjects)
				this.returnNodes(key);
			return;
		}
		
		// return nodes with specified key
		var nodeList = this.poolObjects[key];
		if(!nodeList)
			return;
		
		for(var i=0; i<nodeList.length; i++)
			this.returnNode(nodeList[i]);
	},
	
	// return a node to pool
	returnNode:function(node)
	{
		if(node.dontReturnToPool)
			return false;
		
		if(node.poolKey === undefined)
			return false; // not pooled
		
		var nodeList = this.poolObjects[node.poolKey];
		if(nodeList === undefined)
			return false; // not pooled
		
		node.poolFree = true;
		if(node.removeFromParent !== undefined)
			node.removeFromParent();
		
		// jira#4633: temporary fix: reset node's display attributes to default
		if(node.setOpacity !== undefined)
			node.setOpacity(255);
		if(node.setColor !== undefined)
			node.setColor(cc.WHITE);
		if(node.setVisible !== undefined)
			node.setVisible(true);
		//if(node.isGreyScaledNode === true)
		//	FWUtils.applyGreyscaleNode(node, false);
		if(node.isGreyScaledSpine === true)
			FWUtils.applyGreyscaleSpine(node, false);
		
		// jira#5378
		if(node === FWUI.touchedWidget)
			FWUI.touchedWidget = null;
		if(node === FWUI.draggedWidget)
			FWUI.draggedWidget = null;
		
		// jira#5183
		if(node.poolKey === UI_ITEM_NO_BG)
		{
			var child = node.getChildren()[0]; // FWUtils.getChildByName(node, "ItemSprite")
			if(child.isGreyScaledNode)
				FWUtils.applyGreyscaleNode(child, false);
		}
		
		// jira#5680
		if(node.setTimeScale !== undefined)
			node.setTimeScale(1);
		
		return true;
	},
	
	returnNodesFromParent:function(parent)
	{
		var children = parent.getChildren().slice();
		for(var i=0, len=children.length; i<len; i++)
		{
			var child = children[i];
			if(child.poolKey)
				this.returnNode(child);
		}
		parent.removeAllChildren();
	},
	
	getPooledNodesCount:function(key)
	{
		if(this.poolObjects[key] === undefined)
			return 0;
		return this.poolObjects[key].length;
	},
};
