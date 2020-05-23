//BZProtocolCodec
package bitzero.core 
{
	import bitzero.engine.*;
	import bitzero.exceptions.*;
	import bitzero.logging.*;
	import bitzero.protocol.*;
	import flash.utils.*;
	
	public class BZProtocolCodec  implements IProtocolCodec
	{
		private static const ACTION_ID:String="a";

		private static const PARAM_ID:String="p";

		private static const CONTROLLER_ID:String="c";

		private var _ioHandler:IoHandler;

		private var log:Logger;

		private var ezClient:EngineClient;
		
		public function BZProtocolCodec(ioH:IoHandler, ezC:EngineClient)
		{
			super();
			this._ioHandler = ioH;
			this.log = Logger.getInstance();
			this.ezClient = ezC;
			return;
		}

		public function get ioHandler():IoHandler
		{
			return _ioHandler;
		}

		public function onPacketRead(data:ByteArray):void
		{
			data.position = 0;
			dispatchRequest(data);
			return;
		}

		public function set ioHandler(ioH:IoHandler):void
		{
			if (_ioHandler != null) 
			{
				throw new bitzero.exceptions.BZError("IOHandler is already defined for thir ProtocolHandler instance: " + this);
			}
			this._ioHandler = ioHandler;
			return;
		}

		private function dispatchRequest(data:ByteArray):void
		{
			if (data.length < 3) 
			{
				throw new BZCodecError("Request rejected: No Controller ID in request!");
			}
			
			var msg:Message = new Message();
			msg.targetController = data.readByte();
			msg.id = data.readShort();
			msg.content = data;
			
			var ctrler :IController= ezClient.getController(msg.targetController);
			if (ctrler == null) 
			{
				throw new BZError("Cannot handle server response. Unknown controller, id: " + msg.targetController);
			}
			ctrler.handleMessage(msg);
		}

		public function onPacketWrite(msg:IMessage):void
		{
			var data:ByteArray= new ByteArray();
			data.writeByte(msg.targetController);
			data.writeShort(msg.id);
			data.writeBytes(msg.content,0,msg.content.length);
			msg.content = data;
			ioHandler.onDataWrite(msg);
		}
	}
}