package com.libs.events
{
	import flash.events.*;

	public class UIEvent extends Event
	{
		private var _data:Object;

		public function UIEvent(name:String, data:Object = null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(name, bubbles, cancelable);
			this._data = data;
			return;
		}

		public function get data(): Object
		{
			return this._data;
		}

		public function set data(data:Object): void
		{
			this._data = data;
			return;
		}

	}
}
