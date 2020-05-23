package bitzero.controllers.system.cmd 
{
	import bitzero.controllers.system.SystemRequest;
	import bitzero.net.data.BaseCmd;
	
	/**
	 * ...
	 * @author ...
	 */
	public class HandShakeCmd extends BaseCmd 
	{
		public var token:String = "";
		
		public function HandShakeCmd(token:String) 
		{
			super(SystemRequest.Handshake);
			this.token = token;
			this.ControllerId = 0;
		}
		
		override public function createBody():Boolean 
		{
			// this.writeString(token);
			return true;
		}
	}
}