//LoggerEvent
package bitzero.logging 
{
	import bitzero.core.*;
	import flash.events.*;
	
	public class LoggerEvent extends BaseEvent
	{
		public static const DEBUG:String="DEBUG";

		public static const WARNING:String="WARN";

		public static const INFO:String="INFO";

		public static const ERROR:String = "ERROR";
		
		public function LoggerEvent(name:String, params:Object=null)
		{
			super(name, params);
			return;
		}

		public override function toString():String
		{
			return formatToString("LoggerEvent", "type", "bubbles", "cancelable", "eventPhase", "params");
		}

		public override function clone():Event
		{
			return new LoggerEvent(this.type, this.params);
		}
	}
}


