package test.cmd.send 
{
	import bitzero.net.data.BaseCmd;
	import constanst.*;
	
	public class SendPlant extends BaseCmd 
	{
		private var plantId:String;
		private var floorIndices:Vector.<int>;
		private var slotIndices:Vector.<int>;

		private var time:int;
		private var times:Vector.<int>;
		
		public function SendPlant() 
		{
			super(CmdDefine.PLANT);
			
			this.floorIndices = new Vector.<int>();
			this.slotIndices = new Vector.<int>();
			this.times = new Vector.<int>();
		}

		public function setPlant (plantId:String):void
		{
			this.plantId = plantId;
		}

		public function setTime (time:int):void
		{
			this.time = time;
		}
	
		public function addFloor (floorId:int):void
		{
			for (var slotId:int = 0; slotId < 6; slotId++)
				this.addSlot (floorId, slotId, this.time);
		}
	
		public function addSlot (floorId:int, slotId:int, time:int):void
		{
			this.floorIndices.push (floorId);
			this.slotIndices.push (slotId);
			this.times.push (time);
		}
		
		public override function createBody():Boolean 
		{
			this.writeString(KeyDefine.KEY_PLANT, this.plantId);
			this.writeByteArray(KeyDefine.KEY_FLOOR, this.floorIndices);
			this.writeByteArray(KeyDefine.KEY_SLOT_ID, this.slotIndices);
			this.writeIntArray(KeyDefine.KEY_TIME, this.times);
			this.writeEndObject();
			return true;
		}
	}
}