package test.cmd.send 
{
	import bitzero.net.data.BaseCmd;
	import bitzero.logging.*;
	import constanst.*;
	
	public class SendPotPut extends BaseCmd 
	{
		public var potId:String;
		public var floorIndices:Vector.<int>;
		public var slotIndices:Vector.<int>;
		
		public function SendPotPut() 
		{
			super(CmdDefine.POT_PUT);
		}
		
		public override function createBody():Boolean 
		{
			this.writeString(KeyDefine.KEY_POT, this.potId);
			this.writeIntArray(KeyDefine.KEY_FLOOR, this.floorIndices);
			this.writeIntArray(KeyDefine.KEY_SLOT_ID, this.slotIndices);
			this.writeEndObject();
			return true;
		}
	}
}