package bitzero.controllers.system.cmd 
{
	import bitzero.controllers.system.SystemRequest;
	import bitzero.net.data.BaseCmd;
	
	public class ManualDisconnectionMsg extends BaseCmd 
	{
		public function ManualDisconnectionMsg() 
		{
			super(SystemRequest.ManualDisconnection);
			this.ControllerId = 0;
		}
	}
}