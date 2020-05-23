package bitzero.net.data
{
	import bitzero.net.core.*;
	import bitzero.net.data.*;
	import bitzero.logging.Logger;
	import flash.utils.*;

	public class BaseMsg
	{
		protected var bodys:Decoder;
		protected var err:int = 0;
		
		public function BaseMsg(data:ByteArray)
		{
			try
			{
				this.err = data.readByte();
				this.bodys = new Decoder (data);

				this.parseBody ();
			}
			catch (e:Error)
			{
				Logger.getInstance().info("BaseMsg.error: " + e.message + ", " + typeof (data));
			}
		}
		
		public function parseBody():Boolean 
		{
			Logger.getInstance().info("BaseMsg.parseBody");
			return true;
		}

		protected function printObject (path:String, object:Object):void
		{
			if (typeof (object) != "object")
			{
				// Logger.getInstance().info(path + ": " + object);
				return;
			}
			
			var className:String = getQualifiedClassName (object);
			if (className == "flash.utils::Dictionary")
			{
				var dic:Dictionary = object as Dictionary
				for (var dicKey:String in dic)
				{
					var dicVal:Object = dic [dicKey];
					this.printObject (path + "." + dicKey, dicVal);
				}
				return;
			}

			if (className == "__AS3__.vec::Vector")
			{
				var vector:Vector = object as Vector
				for (var vId:int = 0; vId < vector.length; vId++)
				{
					var vecVal:Object = vector [vId];
					this.printObject (path + "[" + vId + "]", dicVal);
				}
				return;
			}

			for (var key:String in object)
			{
				var val:Object = object [key];
				this.printObject (path + "." + key, val);
			}
		}
		
		protected function readBoolean(key:int):Boolean
		{
			try
			{
				return this.bodys.read(key) as Boolean;
			}
			catch (e:Error)
			{
			}
			return false;
		}

		protected function readByte(key:int):int
		{
			try
			{
				return bodys.read(key) as int;
			}
			catch (e:Error)
			{
			}
			return 0;
		}

		protected function readShort(key:int):int
		{
			try
			{
				return this.bodys.read(key) as int;
			}
			catch (e:Error)
			{
			}
			return 0;
		}

		protected function readInt(key:int):int
		{
			try
			{
				return this.bodys.read(key) as int;
			}
			catch (e:Error)
			{
			}
			return 0;
		}
		
		protected function readLong(key:int):Number
		{
			try
			{
				return this.bodys.read(key) as Number;
			}
			catch (e:Error)
			{
			}
			return 0;
		}

		protected function readDouble(key:int):Number
		{
			try
			{
				return this.bodys.read(key) as Number;
			}
			catch (e:Error)
			{
			}
			return 0;
		}
		
		protected function readFloat(key:int):Number
		{
			try
			{
				return this.bodys.read(key) as Number;
			}
			catch (e:Error)
			{
			}
			return 0;
		}

		protected function readString(key:int):String
		{
			try
			{
				return this.bodys.read(key) as String;
			}
			catch (e:Error)
			{
			}
			return "";
		}
		
		protected function readBooleanArray(key:int):Vector.<Boolean>
		{
			try
			{
				return this.bodys.read(key) as Vector.<Boolean>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<Boolean>(0);
		}

		protected function readByteArray(key:int):Vector.<int>
		{
			try
			{
				return this.bodys.read(key) as Vector.<int>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<int>(0);
		}
		
		protected function readShortArray(key:int):Vector.<int>
		{
			try
			{
				return this.bodys.read(key) as Vector.<int>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<int>(0);
		}

		protected function readIntArray(key:int):Vector.<int>
		{
			try
			{
				return this.bodys.read(key) as Vector.<int>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<int>(0);
		}
		
		protected function readLongArray(key:int):Vector.<Number>
		{
			try
			{
				return this.bodys.read(key) as Vector.<Number>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<Number>(0);
		}
		
		protected function readFloatArray(key:int):Vector.<Number>
		{
			try
			{
				return this.bodys.read(key) as Vector.<Number>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<Number>(0);
		}
		
		protected function readDoubleArray(key:int):Vector.<Number>
		{
			try
			{
				return this.bodys.read(key) as Vector.<Number>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<Number>(0);
		}
		
		protected function readStringArray(key:int):Vector.<String>
		{
			try
			{
				return this.bodys.read(key) as Vector.<String>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<String>(0);
		}
		
		protected function readObject(key:int):Dictionary
		{
			try
			{
				return this.bodys.read(key) as Dictionary;
			}
			catch (e:Error)
			{
			}
			return new Dictionary ();
		}
		
		protected function readObjectArray(key:int):Vector.<Object>
		{
			try
			{
				return this.bodys.read(key) as Vector.<Object>;
			}
			catch (e:Error)
			{
			}
			return new Vector.<Object>(0);
		}

		public function get ErrorCode():int
		{
			return err;
		}

		public function getError():String
		{
			return err.toString();
		}

		public function getBody():ByteArray
		{
			return this.bodys.getRaw();
		}
	}
}