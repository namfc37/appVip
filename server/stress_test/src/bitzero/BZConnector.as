package bitzero 
{
	import bitzero.core.BZEvent;
	import bitzero.engine.IMessage;
	import bitzero.logging.Logger;
	import bitzero.net.data.BaseCmd;
	import bitzero.net.events.MsgEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	/**
	 * ...
	 * @author ...
	 */
	public class BZConnector extends EventDispatcher
	{
		private static var instance:BZConnector;
		
		private var bzConnector:BitZero = null;
		public var host:String;
		public var ext:String;
	
		public var loginErr:int;		
		private var logger:Logger = Logger.getInstance();
		
		private var systemDispatcher:EventDispatcher = new EventDispatcher();
		
		public function BZConnector() 
		{
			bzConnector = new BitZero();
			
			bzConnector.addEventListener(BZEvent.CONNECTION, onConnection);
			bzConnector.addEventListener(BZEvent.CONNECTION_LOST, onConnectionLost);
			
			bzConnector.addEventListener(BZEvent.EXTENSION_RESPONSE, onServerResp);
			bzConnector.addEventListener(BZEvent.SYSTEM_MESSAGE, onSystemMsg);
			bzConnector.addEventListener(BZEvent.LOGIN, onLogin);
			
			bzConnector.addEventListener(BZEvent.CONNECTION_RESUME, onConnectionResum);
			bzConnector.addEventListener(BZEvent.CONNECTION_RETRY, onConnectionRetry);
			
			bzConnector.addEventListener(BZEvent.PINGPONG, onPingPong);
			
		}
		
		public function loadConfig():void
		{
			bzConnector.loadConfig("bz-config.xml", true);
		}
		
		private function onSystemMsg(e:BZEvent):void 
		{
			var event:MsgEvent = new MsgEvent(e.params as IMessage);
			systemDispatcher.dispatchEvent(event);
		}
		
		public function addSystemEventListener(type:String, listener:Function):void
		{
			systemDispatcher.addEventListener(type, listener);
		}
		
		public function removeSystemEventListener (type:String, listener:Function):void
		{
			systemDispatcher.removeEventListener(type, listener);
		}
		
		public function testDisconnect():void
		{
			bzConnector.testDisconnect();
		}
		
		private function onPingPong(e:BZEvent):void 
		{
			dispatchEvent(e);
		}
		
		private function onConnectionRetry(e:BZEvent):void 
		{
			dispatchEvent(e);
		}
		
		private function onConnectionResum(e:BZEvent):void 
		{
			dispatchEvent(e);
		}
			
		
		public static function getInstance():BZConnector
		{
			if(instance == null)
			{
				instance = new BZConnector();
			}
				
			return instance;
		}
		
		public function connect(gameServer:String, port:int):void
		{
			host = gameServer;
			try
			{
				bzConnector.connect(host, port);
				logger.info("Connect IP - host " , host , ' - ' , port);
			}
			catch (e:Error)
			{
				logger.info("Ko Connect duoc");
			}
		}
		
		public function disconnect():void
		{

			bzConnector.killConnection();
			
			bzConnector.removeEventListener(BZEvent.CONNECTION, onConnection);
			bzConnector.removeEventListener(BZEvent.CONNECTION_LOST, onConnectionLost);
			
			bzConnector.removeEventListener(BZEvent.EXTENSION_RESPONSE, onServerResp);
			bzConnector.removeEventListener(BZEvent.LOGIN, onLogin);
		}
		
		public function Send(data:Object):void
		{
			
			 var cmd:BaseCmd = data as BaseCmd;		
			
			try
			{
				bzConnector.send(cmd);
			}
			catch (e:Error)
			{
				var event:BZEvent = new BZEvent(BZEvent.LOGIN_ERROR,new Object());
				dispatchEvent(event);
			}
		}
		
		
		private function onLogin(e:BZEvent):void 
		{
			var event:MsgEvent = new MsgEvent(e.params as IMessage);
			dispatchEvent(event);
		}
		
		private function onServerResp(e:BZEvent):void 
		{
			var event:MsgEvent = new MsgEvent(e.params as IMessage);
			dispatchEvent(event);
		}	
		
		private function onConnectionLost(e:BZEvent):void 
		{
			dispatchEvent(e);
		}
		
		private function onConnection(e:BZEvent):void 
		{
					
			if (e.params["success"])
			{				
				dispatchEvent(e);
			}
			
		}
		
	}

}