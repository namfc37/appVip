package test.cmd.receive 
{
	import bitzero.net.data.BaseMsg;
	import bitzero.logging.Logger;
	import constanst.*;
	import flash.utils.*;
	import test.logic.UserData;
	
	public class ReceivePlant extends BaseMsg 
	{
        public var plantId:String;
		public var plantRemain:int;

		public var iFloors:Vector.<int>;
		public var iSlots:Vector.<int>;
		public var slots:Vector.<Object>;
		
		public function ReceivePlant(data:ByteArray) 
		{
			super(data);
		}
		
		public override function parseBody():Boolean 
		{
            this.plantId = this.readString (KeyDefine.KEY_PLANT);
            this.plantRemain = this.readInt (KeyDefine.KEY_REMAIN_ITEM);
            this.iFloors = this.readByteArray (KeyDefine.KEY_FLOOR);
            this.iSlots = this.readByteArray (KeyDefine.KEY_SLOT_ID);
            this.slots = this.readObjectArray (KeyDefine.KEY_SLOT_OBJECT);

			return true;
		}
	}
}