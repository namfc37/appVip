//EngineClient
package bitzero.engine 
{
	import bitzero.*;
	import bitzero.controllers.*;
	import bitzero.exceptions.*;
	import bitzero.logging.*;
	import bitzero.util.*;
	import flash.events.*;
	import flash.net.*;
	import flash.utils.*;
	
	public class EngineClient extends EventDispatcher
	{
		private var _lastIpAddress:String;

		private var _reconnectionDelayMillis:int=1000;

		private var _connected:Boolean;

		private var _log:bitzero.logging.Logger;

		private var _compressionThreshold:int=2000000;

		private var _attemptingReconnection:Boolean=false;

		private var _controllersInited:Boolean=false;

		private var _socket:flash.net.Socket;

		private var _reconnectionSeconds:int=0;

		private var _bz:bitzero.BitZero;

		private var _controllers:Object;

		private var _ioHandler:bitzero.engine.IoHandler;

		private var _extController:ExtensionController;

		private var _lastTcpPort:int;

		private var _sysController:SystemController;
		
		public function EngineClient(bz:bitzero.BitZero=null)
		{
			super();
			_controllers = {};
			_bz = bz;
			_connected = false;
			_log = Logger.getInstance();
			return;
		}

		public function get bz():BitZero
		{
			return _bz;
		}

		public function get compressionThreshold():int
		{
			return _compressionThreshold;
		}

		private function initControllers():void
		{
			_sysController = new SystemController(this);
			_extController = new ExtensionController(this);
			addController(0, _sysController);
			addController(1, _extController);
			return;
		}

		public function get connected():Boolean
		{
			return _connected;
		}

		public function getControllerById(id:int):IController
		{
			return _controllers[id];
		}

		public function get reconnectionSeconds():int
		{
			return _reconnectionSeconds;
		}

		public function set ioHandler(ioH:IoHandler):void
		{
			if (_ioHandler != null) 
			{
				throw new BZError("IOHandler is already set!");
			}
			_ioHandler = ioH;
			return;
		}

		public function init():void
		{
			if (!_controllersInited) 
			{
				initControllers();
				_controllersInited = true;
			}
			_socket = new Socket();
			_socket.addEventListener(Event.CONNECT, onSocketConnect);
			_socket.addEventListener(Event.CLOSE, onSocketClose);
			_socket.addEventListener(ProgressEvent.SOCKET_DATA, onSocketData);
			_socket.addEventListener(IOErrorEvent.IO_ERROR, onSocketIOError);
			_socket.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSocketSecurityError);
			return;
		}

		private function onSocketIOError(ioE:IOErrorEvent):void
		{
			if (_attemptingReconnection) 
			{
				dispatchEvent(new EngineEvent(EngineEvent.DISCONNECT, {"reason":ClientDisconnectionReason.UNKNOWN}));
				return;
			}
			trace("## SocketError: " + ioE.toString());
			var ee:EngineEvent=new EngineEvent(EngineEvent.IO_ERROR);
			ee.params = {"message":ioE.toString()};
			dispatchEvent(ee);
			return;
		}

		private function onSocketSecurityError(see:SecurityErrorEvent):void
		{
			trace("## SecurityError: " + see.toString());
			var ee:EngineEvent=new EngineEvent(bitzero.engine.EngineEvent.SECURITY_ERROR);
			ee.params = {"message":see.text};
			dispatchEvent(ee);
			return;
		}

		public function send(msg:IMessage):void
		{
			_ioHandler.codec.onPacketWrite(msg);
			return;
		}

		public function get systemController():SystemController
		{
			return _sysController;
		}

		public function getController(id:int):IController
		{
			return _controllers[id] as IController;
		}

		public function disconnect(rs:String=null):void
		{
			try
			{
				_socket.close();
			}
			catch (e:Error) {}
			
			onSocketClose(new EngineEvent(EngineEvent.DISCONNECT, {"reason":rs}));
			return;
		}

		private function addController(id:int, ctr:IController):void
		{
			if (ctr == null) 
			{
				throw new ArgumentError("Controller is null, it can\'t be added.");
			}
			if (_controllers[id] != null) 
			{
				throw new ArgumentError("A controller with id: " + id + " already exists! Controller can\'t be added: " + ctr);
			}
			_controllers[id] = ctr;
			return;
		}

		public function addCustomController(id:int, cCtrl:Class):void
		{
			var ctr:*=cCtrl(this);
			addController(id, ctr);
			return;
		}

		public function get reconnectionDelayMillis():int
		{
			return _reconnectionDelayMillis;
		}

		public function get connectionIp():String
		{
			if (!connected) 
			{
				return "Not Connected";
			}
			return _lastIpAddress;
		}

		public function get extensionController():ExtensionController
		{
			return _extController;
		}

		public function set reconnectionDelayMillis(ms:int):void
		{
			_reconnectionDelayMillis = ms;
			return;
		}

		public function get ioHandler():IoHandler
		{
			return _ioHandler;
		}

		public function set compressionThreshold(pc:int):void
		{
			if (pc > 100) 
			{
				_compressionThreshold = pc;
			}
			else 
			{
				throw new ArgumentError("Compression threshold cannot be < 100 bytes.");
			}
			return;
		}

		public function killConnection():void
		{
			_socket.close();
			onSocketClose(new Event(Event.CLOSE));
			return;
		}

		private function onSocketConnect(e:Event):void
		{
			_connected = true;
			var pa:EngineEvent=new EngineEvent(EngineEvent.CONNECT);
			pa.params = {"success":true, "_isReconnection":_attemptingReconnection};
			dispatchEvent(pa);
			return;
		}

		public function set reconnectionSeconds(second:int):void
		{
			if (second < 0) 
			{
				_reconnectionSeconds = 0;
			}
			else 
			{
				_reconnectionSeconds = second;
			}
			return;
		}

		private function onSocketClose(e:Event):void
		{
			var isManualDisconnection:Boolean;
			var isRegularDisconnection:Boolean;
			var evt:Event;

			var loc1:*;
			evt = e;
			_connected = false;
			isRegularDisconnection = !_attemptingReconnection && bz.getReconnectionSeconds() == 0;
			isManualDisconnection = evt is EngineEvent && (evt as EngineEvent).params.reason == ClientDisconnectionReason.MANUAL;
			if (_attemptingReconnection || isRegularDisconnection || isManualDisconnection) 
			{
				if (evt is EngineEvent) 
				{
					dispatchEvent(evt);
				}
				else 
				{
					dispatchEvent(new EngineEvent(EngineEvent.DISCONNECT, {"reason":ClientDisconnectionReason.UNKNOWN}));
				}
				return;
			}
			
			_attemptingReconnection = true;
			dispatchEvent(new EngineEvent(EngineEvent.RECONNECTION_TRY));
			setTimeout(function ():void
			{
				connect(_lastIpAddress, _lastTcpPort);
				return;
			}, _reconnectionDelayMillis)
			return;
		}

		public function set isReconnecting(r:Boolean):void
		{
			_attemptingReconnection = r;
			return;
		}

		public function connect(ip:String="127.0.0.1", port:int=9339):void
		{
			_lastIpAddress = ip;
			_lastTcpPort = port;
			_socket.connect(ip, port);
			return;
		}

		public function get socket():Socket
		{
			return _socket;
		}

		public function get isReconnecting():Boolean
		{
			return _attemptingReconnection;
		}

		public function destroy():void
		{
			_socket.removeEventListener(Event.CONNECT, onSocketConnect);
			_socket.removeEventListener(Event.CLOSE, onSocketClose);
			_socket.removeEventListener(ProgressEvent.SOCKET_DATA, onSocketData);
			_socket.removeEventListener(IOErrorEvent.IO_ERROR, onSocketIOError);
			_socket.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, onSocketSecurityError);
			if (_socket.connected) 
			{
				_socket.close();
			}
			_socket = null;
			return;
		}
		
		public function testDisconnect():void 
		{
			_socket.close();
			 onSocketClose(new Event("testDisconnect"));
		}

		private function onSocketData(e:ProgressEvent):void
		{
			var ba:ByteArray=new ByteArray();
			_socket.readBytes(ba);
			_ioHandler.onDataRead(ba);
			
			return;
		}

		public function get connectionPort():int
		{
			if (!connected) 
			{
				return -1;
			}
			return _lastTcpPort;
		}	  
	}
}


