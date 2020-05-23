//Logger
package bitzero.logging 
{
	import flash.events.*;
	
	public class Logger extends EventDispatcher
	{
		private var _loggingLevel:int;

		private var _enableConsoleTrace:Boolean=false;

		private var _enableEventDispatching:Boolean=true;

		private static var _locked:Boolean=true;

		private static var _instance:Logger;
		
		
		public function Logger()
		{
			super();
			if (_locked) 
			{
				throw new Error("Cannot instantiate the Logger using the constructor. Please use the getInstance() method");
			}
			_loggingLevel = LogLevel.INFO;
			return;
		}
		
		 public static function getInstance():Logger
		{
			if (_instance == null) 
			{
				_locked = false;
				_instance = new Logger();
				_locked = true;
			}
			return _instance;
		}

		public function set enableConsoleTrace(trc:Boolean):void
		{
			_enableConsoleTrace = trc;
			return;
		}

		public function get loggingLevel():int
		{
			return _loggingLevel;
		}

		public function warn(... rest):void
		{
			log(LogLevel.WARN, rest.join(" "));
			return;
		}

		public function set enableEventDispatching(enable:Boolean):void
		{
			_enableEventDispatching = enable;
			return;
		}

		public function set loggingLevel(lv:int):void
		{
			_loggingLevel = lv;
			return;
		}

		public function debug(... rest):void
		{
			log(LogLevel.DEBUG, rest.join(" "));
			return;
		}

		public function info(... rest):void
		{
			log(LogLevel.INFO, rest.join(" "));
			return;
		}

		public function error(... rest):void
		{
			log(LogLevel.ERROR, rest.join(" "));
			return;
		}

		public function get enableConsoleTrace():Boolean
		{
			return _enableConsoleTrace;
		}

		public function get enableEventDispatching():Boolean
		{
			return _enableEventDispatching;
		}

		private function log(logLv:int, logContent:String):void
		{
			
			if (logLv < _loggingLevel) 
			{
				return;
			}
			var logType:String=LogLevel.fromString(logLv);
			if (_enableConsoleTrace) 
			{
				trace("[BZ - " + logType + "]", logContent);
			}
			var param:Object={};
			param.message = logContent;
			var logEvent:LoggerEvent=null;
			if (_enableEventDispatching) 
			{
				logEvent = new LoggerEvent(logType, param);
				dispatchEvent(logEvent);
			}
			return;
		}

	  
 
	}
}


