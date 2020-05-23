package test.cmd.receive 
{
	import bitzero.net.data.BaseMsg;
	import bitzero.logging.Logger;
	import constanst.*;
	import flash.utils.*;
	import test.logic.UserData;
	
	public class ReceivePlantHarvest extends BaseMsg 
	{
		public var iFloors:Vector.<int>;
		public var iSlots:Vector.<int>;
		public var slots:Vector.<Object>;
		public var updateItem:Dictionary;
		public var level:int;
		public var exp:int;
		public var gold:int;

		public function ReceivePlantHarvest(data:ByteArray) 
		{
			super(data);
		}
		
		public override function parseBody():Boolean 
		{
			this.iFloors = this.readByteArray (KeyDefine.KEY_FLOOR);
			this.iSlots = this.readByteArray (KeyDefine.KEY_SLOT_ID);
			this.slots = this.readObjectArray (KeyDefine.KEY_SLOT_OBJECT);
			this.updateItem = this.readObject (KeyDefine.KEY_UPDATE_ITEMS);
			this.level = this.readShort (KeyDefine.KEY_LEVEL);
			this.exp = this.readLong (KeyDefine.KEY_EXP);
			this.gold = this.readLong (KeyDefine.KEY_GOLD);

			return true;
		}
	}
}