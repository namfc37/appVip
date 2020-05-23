//BaseController
package bitzero.engine 
{
	import bitzero.exceptions.*;
	import bitzero.logging.*;
	
	public class BaseController implements IController
	{
		
		protected var log:Logger;

		protected var _id:int = -1;
		
		public function BaseController()
		{
			super();
			log = Logger.getInstance();
			return;
		}

		public function set id(id:int):void
		{
			if (_id != -1) 
			{
				throw new BZError("Controller ID is already set: " + _id + ". Can\'t be changed at runtime!");
			}
			else 
			{
				_id = id;
			}
			return;
		}

		public function get id():int
		{
			return _id;
		}

		public function handleMessage(msg:IMessage):void
		{
			trace("System controller got request: " + msg);
			return;
		}
	}
}


