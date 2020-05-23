//BaseEvent
package bitzero.core 
{
	import flash.events.*;
	
	public class BaseEvent extends Event
	{
		public var params:Object;
		
		public function BaseEvent(n:String, p:Object=null)
		{
			super(n);
			this.params = p;
			return;
		}

		public override function toString():String
		{
			return formatToString("BaseEvent", "type", "bubbles", "cancelable", "eventPhase", "params");
		}

		public override function clone():Event
		{
			return new BaseEvent(this.type, this.params);
		}
		
	}
}


