package bitzero.controllers.system.cmd 
{
	import bitzero.net.data.BaseMsg;
	import flash.utils.ByteArray;
	
	public class ClientDisconnecMsg extends BaseMsg 
	{		
		public function ClientDisconnecMsg(data:ByteArray) 
		{
			super(data);
		}
	}
}