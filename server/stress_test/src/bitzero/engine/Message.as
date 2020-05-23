//Message
package bitzero.engine 
{
	import flash.utils.ByteArray;
	
	public class Message  implements IMessage
	{
		private var _isEncrypted:Boolean;

		private var _id:int;

		private var _targetController:int;

		private var _content:ByteArray;
		
		public function Message()
		{
			super();
			isEncrypted = false;
			return;
		}

		public function get content():ByteArray
		{
			return _content;
		}

		public function get isEncrypted():Boolean
		{
			return _isEncrypted;
		}

		public function toString():String
		{
			var str:String="{ Message id: " + _id + " }\n";
			str = str + "{�Dump: }\n";
			str = str + _content.toString();
			return str;
		}

		public function get targetController():int
		{
			return _targetController;
		}

		public function get id():int
		{
			return _id;
		}

		public function set targetController(c:int):void
		{
			this._targetController = c;
			return;
		}

		public function set content(data:ByteArray):void
		{
			this._content = data;
			return;
		}

		public function set isEncrypted(e:Boolean):void
		{
			_isEncrypted = e;
			return;
		}

		public function set id(id:int):void
		{
			this._id = id;
			return;
		}
	}
}


