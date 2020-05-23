package bitzero 
{
	import bitzero.controllers.system.cmd.*;
	import bitzero.controllers.system.SystemRequest;
	import bitzero.engine.*;
	import bitzero.core.*;
	import bitzero.exceptions.*;
	import bitzero.logging.*;
	import bitzero.net.data.BaseCmd;
	import bitzero.test.cmd.LoginCmd;

	import bitzero.util.*;
	import flash.events.*;
	import flash.utils.*;
	
	public class BitZero extends EventDispatcher
	{
		private var _log:Logger;

		private var _currentZone:String;

		private var _subVersion:int=6;

		private var _autoConnectOnConfig:Boolean=false;

		private var _isHttpMode:Boolean=false;

		private var _minVersion:int=8;

		private var _majVersion:int=0;

		private var _isConnected:Boolean=false;

		private var _isJoining:Boolean=false;

		private var _config:ConfigData;

		private var _debug:Boolean=false;

		private var _isConnecting:Boolean=false;

		private var _sessionToken:String = "";

		private var bzClient:EngineClient;


		private var _inited:Boolean = false;
		
		public function BitZero(enable:Boolean=false)
		{
			super();
			_log = Logger.getInstance();
			_log.enableEventDispatching = true;
			_config = new ConfigData();
			_debug = _config.debug;
			
			initialize();
			return;
		}

		public function get sessionToken():String
		{
			return _sessionToken;
		}

		public function connect(svIp:String=null, port:int=-1):void
		{
			if (isConnected) 
			{
				_log.warn("Already Connected");
				return;
			}
			if (_isConnecting) 
			{
				_log.warn("A connection attempt is already running");
				return;
			}
			if (config != null) 
			{
				if (svIp == null) 
				{
					svIp = config.host;
				}
				if (port == -1) 
				{
					port = config.port;
				}
			}
			if (svIp == null || svIp.length == 0) 
			{
				throw new ArgumentError("Invalid connection host/address");
			}
			if (port < 0 || port > 65535) 
			{
				throw new ArgumentError("Invalid connection port");
			}
			_isConnecting = true;
			bzClient.connect(svIp, port);
			return;
		}

		public function get currentIp():String
		{
			return bzClient.connectionIp;
		}

		public function send(cmd:BaseCmd):void
		{
			if (!isConnected) 
			{
				_log.warn("Not conncted: can\'t send any request: " + cmd);
			}

			var msg:Message = new Message();
			msg.targetController = cmd.crlID;
			msg.id = cmd.TypeId;

			if(cmd.createBody())
			{
				msg.content = cmd.getCmdBodys();
			}
			else 
				_log.warn("Content Data Send Create Fail: " + cmd);

			this.bzClient.send(msg);
 
			return;
		}

		public function getSocketEngine():EngineClient
		{
			return bzClient;
		}

		private function handleHandShake(e:BZEvent):void
		{
			var data:HandShakeMsg = e.params as HandShakeMsg;
			this._sessionToken = data.token;
			if (this._sessionToken.length < 2)
			{
				_isConnecting = false;
				logger.info(" handshaking fail ...");
				handleClientDisconnection(ClientDisconnectionReason.HANDSHAKE);
				return;
			}
			if (bzClient.isReconnecting) 
			{
				bzClient.isReconnecting = false;
				dispatchEvent(new BZEvent(BZEvent.CONNECTION_RESUME, { }));
				
				logger.info(" handshaking sucess CONNECTION_RESUME ...");
			}
			else 
			{
				_isConnecting = false;
				dispatchEvent(new BZEvent(BZEvent.CONNECTION, { "success":true }));
				
				logger.info(" handshaking sucess return token ...");
			}
			return;
		}

		private function initialize():void
		{
			if (_inited) 
			{
				return;
			}
			bzClient = new EngineClient(this);
			bzClient.ioHandler = new BZIOHandler(bzClient);
			bzClient.init();
			bzClient.addEventListener(EngineEvent.CONNECT, onSocketConnect);
			bzClient.addEventListener(EngineEvent.DISCONNECT, onSocketClose);
			bzClient.addEventListener(EngineEvent.RECONNECTION_TRY, onSocketReconnectionTry);
			bzClient.addEventListener(EngineEvent.IO_ERROR, onSocketIOError);
			bzClient.addEventListener(EngineEvent.SECURITY_ERROR, onSocketSecurityError);
			addEventListener(BZEvent.HANDSHAKE, handleHandShake);
			addEventListener(BZEvent.LOGIN, handleLogin);
			_inited = true;
			reset();
			return;
		}

		private function onConfigLoadFailure(e:BZEvent):void
		{
			var loader:ConfigLoader=e.target as ConfigLoader;
			loader.removeEventListener(BZEvent.CONFIG_LOAD_SUCCESS, onConfigLoadSuccess);
			loader.removeEventListener(BZEvent.CONFIG_LOAD_FAILURE, onConfigLoadFailure);
			var loc2:*=new BZEvent(BZEvent.CONFIG_LOAD_FAILURE, {});
			dispatchEvent(loc2);
			return;
		}

		private function onSocketClose(e:EngineEvent):void
		{
			reset();
			dispatchEvent(new BZEvent(BZEvent.CONNECTION_LOST, {"reason":e.params.reason}));
			return;
		}

		private function onSocketSecurityError(e:EngineEvent):void
		{
			if (_isConnecting) 
			{
				handleConnectionProblem(e);
			}
			return;
		}
		
		public function get isJoining():Boolean
		{
			return _isJoining;
		}

		public function get currentPort():int
		{
			return bzClient.connectionPort;
		}

		public function get logger():Logger
		{
			return _log;
		}

		private function handleLogin(e:BZEvent):void
		{
			// _currentZone = e.params.zone;
			return;
		}

		public function get compressionThreshold():int
		{
			return bzClient.compressionThreshold;
		}

		private function onSocketReconnectionTry(e:EngineEvent):void
		{
			dispatchEvent(new BZEvent(BZEvent.CONNECTION_RETRY, {}));
			return;
		}

		public function disconnect():void
		{
			if (isConnected) 
			{
				if (bzClient.reconnectionSeconds > 0) 
				{
					send(new ManualDisconnectionMsg());
				}
				setTimeout(function ():void
				{
					bzClient.disconnect(ClientDisconnectionReason.MANUAL);
					return;
				}, 100)
			}
			else 
			{
				_log.info("You are not connected");
			}
			return;
		}

		public function setReconnectionSeconds(sec:int):void
		{
			bzClient.reconnectionSeconds = sec;
			return;
		}

		public function handleClientDisconnection(str:String):void
		{
			bzClient.reconnectionSeconds = 0;
			bzClient.disconnect(str);
			reset();
			return;
		}


		private function onConfigLoadSuccess(e:bitzero.core.BZEvent):void
		{
			var loader:ConfigLoader=e.target as ConfigLoader;
			var cfdata:ConfigData=e.params.cfg as ConfigData;
			loader.removeEventListener(BZEvent.CONFIG_LOAD_SUCCESS, onConfigLoadSuccess);
			loader.removeEventListener(BZEvent.CONFIG_LOAD_FAILURE, onConfigLoadFailure);
			if (cfdata.host == null || cfdata.host.length == 0) 
			{
				throw new ArgumentError("Invalid Host/IpAddress in external config file");
			}
			if (cfdata.port < 0 || cfdata.port > 65535) 
			{
				throw new ArgumentError("Invalid TCP port in external config file");
			}
			if (cfdata.zone == null || cfdata.zone.length == 0) 
			{
				throw new ArgumentError("Invalid Zone name in external config file");
			}
			_config = cfdata;
			var eb:BZEvent=new BZEvent(BZEvent.CONFIG_LOAD_SUCCESS, {"config":cfdata});
			dispatchEvent(eb);
			if (_autoConnectOnConfig) 
			{
				connect(_config.host, _config.port);
			}
			return;
		}

		public function set debug(d:Boolean):void
		{
			_debug = d;
			return;
		}

		public function get isConnected():Boolean
		{
			var c:Boolean=false;
			if (bzClient != null) 
			{
				c = bzClient.connected;
			}
			return c;
		}

		public function getReconnectionSeconds():int
		{
			return bzClient.reconnectionSeconds;
		}

		private function handleConnectionProblem(e:EngineEvent):void
		{
			var pa:Object={"success":false, "errorMessage":e.params.message};
			dispatchEvent(new BZEvent(BZEvent.CONNECTION, pa));
			_isConnected = false;
			_isConnecting = false;
			return;
		}

		private function onSocketIOError(e:EngineEvent):void
		{
			if (_isConnecting) 
			{
				handleConnectionProblem(e);
			}
			return;
		}


		private function sendHandshakeRequest(h:Boolean=false):void
		{
			logger.info("Socket Connected .... handshaking ...");
			
			send(new HandShakeCmd(this.sessionToken));
			
			return;
		}

		public function loadConfig(cfurl:String="bz-config.xml", auto:Boolean=true):void
		{
			var loader:ConfigLoader=new ConfigLoader();
			loader.addEventListener(bitzero.core.BZEvent.CONFIG_LOAD_SUCCESS, onConfigLoadSuccess);
			loader.addEventListener(bitzero.core.BZEvent.CONFIG_LOAD_FAILURE, onConfigLoadFailure);
			_autoConnectOnConfig = auto;
			loader.loadConfig(cfurl);
			return;
		}

		private function reset():void
		{
			_isConnected = false;
			_isJoining = false;
			_currentZone = null;
   
			_sessionToken = "";
			
			setReconnectionSeconds(_config.reconnectSeconds);

			return;
		}

		public function get config():ConfigData
		{
			return _config;
		}

		public function get debug():Boolean
		{
			return _debug;
		}

		public function handleLogout():void
		{
			_isJoining = false;

			_currentZone = null;

			return;
		}

		public function get version():String
		{
			return "" + _majVersion + "." + _minVersion + "." + _subVersion;
		}


		public function killConnection():void
		{
			bzClient.killConnection();
			return;
		}
		
		public function testDisconnect():void 
		{
			bzClient.testDisconnect();
		}

		public function get currentZone():String
		{
			return _currentZone;
		}

		private function onSocketConnect(e:EngineEvent):void
		{
			if (e.params.success) 
			{
				sendHandshakeRequest(e.params._isReconnection);			
				// var pa:Object={"success":true, "errorMessage":"OK"};
				// dispatchEvent(new BZEvent(BZEvent.CONNECTION, pa));
			}
			else 
			{
				_log.warn("Connection attempt failed");
				handleConnectionProblem(e);
			}
			return;
		}
	}
}


