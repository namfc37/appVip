package bitzero.controllers 
{
	import bitzero.*;
	import bitzero.controllers.system.cmd.ClientDisconnecMsg;
	import bitzero.controllers.system.cmd.HandShakeMsg;
	import bitzero.controllers.system.SystemRequest;
	import bitzero.engine.*;
	import bitzero.core.*;
	import bitzero.net.data.BaseMsg;
	import bitzero.util.*;
	import flash.utils.ByteArray;
	
	public class SystemController extends BaseController
	{
		private var bz:BitZero;

		private var requestHandlers:Object;

		private var ezClient:EngineClient;
		
		public function SystemController(ez:EngineClient)
		{
			super();
			this.ezClient = ez;
			this.bz = ez.bz;
			requestHandlers = new Object();
			initRequestHandlers();
			return;
		}

		private function initRequestHandlers():void
		{
			requestHandlers[SystemRequest.Handshake] = "fnHandshake";
		   // requestHandlers[SystemRequest.Login] = "fnLogin";
			requestHandlers[SystemRequest.Logout] = "fnLogout";			
			requestHandlers[SystemRequest.Logout] = "fnPingPong";
			requestHandlers[SystemRequest.ClientDisconnection] = "fnClientDisconnection";
			
			return;
		}

		public override function handleMessage(msg:IMessage):void
		{
			if (bz.debug) 
			{
				log.debug(getEvtName(msg.id), msg);
			}
			var handler:*=requestHandlers[msg.id];
			if (handler == null) 
			{
				log.warn("Unknown message id: " + msg.id);
				bz.dispatchEvent(new BZEvent(BZEvent.SYSTEM_MESSAGE, msg));
			}
			else 
			{
				(this)[handler](msg);
			}
			return;
		}
		
		private function getEvtName(id:int):String
		{
			var name:String = requestHandlers[id];
			if(name != null)
			 return name.substr(2);
			else return id.toString();
		}
		
		private function fnClientDisconnection(msg:IMessage):void
		{
			var data:ClientDisconnecMsg = new ClientDisconnecMsg(msg.content);
			bz.handleClientDisconnection(ClientDisconnectionReason.getReason(data.ErrorCode));
			return;
		}
		
		private function fnPingPong(msg:IMessage):void
		{
			var data:BaseMsg = new BaseMsg(msg.content);
			
			bz.dispatchEvent(new BZEvent(BZEvent.PINGPONG, data));
			return;
		}
		
		private function fnHandshake(msg:IMessage):void
		{
			var data:HandShakeMsg = new HandShakeMsg(msg.content);
			bz.dispatchEvent(new BZEvent(BZEvent.HANDSHAKE, data));
			return;
		}

	}
}


