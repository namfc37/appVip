package test.cmd.send 
{
	import bitzero.net.data.BaseCmd;
	import constanst.*;
	
	public class SendPlantHarvest extends BaseCmd 
	{
		private var floorIndices:Vector.<int>;
		private var slotIndices:Vector.<int>;
		
		public function SendPlantHarvest() 
		{
			super(CmdDefine.PLANT_HARVEST);
			
			this.floorIndices = new Vector.<int>();
			this.slotIndices = new Vector.<int>();
		}

		public function addFloor (floorId:int):void
		{
			for (var slotId:int = 0; slotId < 6; slotId++)
				this.addSlot (floorId, slotId);
		}

		public function addSlot (floorId:int, slotId:int):void
		{
			this.floorIndices.push (floorId);
			this.slotIndices.push (slotId);
		}
		
		public override function createBody():Boolean 
		{
			this.writeByteArray(KeyDefine.KEY_FLOOR, this.floorIndices);
			this.writeByteArray(KeyDefine.KEY_SLOT_ID, this.slotIndices);
			this.writeEndObject();
			return true;
		}
	}
}