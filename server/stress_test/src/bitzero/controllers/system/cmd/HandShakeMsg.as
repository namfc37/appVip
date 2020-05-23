package bitzero.controllers.system.cmd 
{
	import bitzero.net.data.BaseMsg;
	import bitzero.logging.Logger;
	import flash.utils.ByteArray;
	
	public class HandShakeMsg extends BaseMsg 
	{
		public var token:String = "";
		
		public function HandShakeMsg(data:ByteArray) 
		{
			super(data);
		}
		
		override public function parseBody():Boolean 
		{
			var temp:ByteArray = this.getBody();

//			cheat here, move position to read token
			temp.position = 4;
			token = temp.readUTF();
			return true;
		}
	}
}