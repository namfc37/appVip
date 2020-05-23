//ExtensionController
package bitzero.controllers 
{
	import bitzero.*;
	import bitzero.engine.*;
	import bitzero.core.*;
	
	public class ExtensionController extends BaseController
	{
		public static const KEY_CMD:String="c";

		public static const KEY_PARAMS:String="p";

		private var bz:BitZero;

		private var ezClient:EngineClient;
		
		public function ExtensionController(ez:EngineClient)
		{
			super();
			this.ezClient = ez;
			this.bz = ez.bz;
			return;
		}

		public override function handleMessage(msg:IMessage):void
		{
			if (bz.debug) 
			{
				log.debug(msg);
			}
			
			if (msg.id == 1)
			  bz.dispatchEvent(new BZEvent(BZEvent.LOGIN, msg));
			else if (msg.id == -1)
			  bz.dispatchEvent(new BZEvent(BZEvent.HANDSHAKE, msg));
			else
			  bz.dispatchEvent(new BZEvent(BZEvent.EXTENSION_RESPONSE, msg));
						  
			return;
		}

	}
}


