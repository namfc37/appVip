package bitzero.net.data
{
	import flash.utils.*;

	public class Encoder 
	{
		public static const TYPE_END_OBJECT:int = 0;
		public static const TYPE_BOOLEAN_TRUE:int = 1;
		public static const TYPE_BOOLEAN_FALSE:int = 2;
		public static const TYPE_BYTE:int = 3;
		public static const TYPE_SHORT:int = 4;
		public static const TYPE_INT:int = 5;
		public static const TYPE_LONG:int = 6;
		public static const TYPE_FLOAT:int = 7;
		public static const TYPE_DOUBLE:int = 8;
		public static const TYPE_STRING:int = 9;
		public static const TYPE_OBJECT:int = 10;
		public static const TYPE_ARRAY_BOOLEAN:int = 11;
		public static const TYPE_ARRAY_BYTE:int = 12;
		public static const TYPE_ARRAY_SHORT:int = 13;
		public static const TYPE_ARRAY_INT:int = 14;
		public static const TYPE_ARRAY_LONG:int = 15;
		public static const TYPE_ARRAY_STRING:int = 16;
		public static const TYPE_ARRAY_OBJECT:int = 17;
		public static const TYPE_MAP_ITEM:int = 18;
		public static const TYPE_ZERO:int = 19;
		public static const TYPE_ARRAY_MAP_ITEM:int = 20;
		public static const TYPE_ARRAY_FLOAT:int = 21;
		public static const TYPE_ARRAY_DOUBLE:int = 22;

		protected var bytes:ByteArray;

		public function Encoder()
		{
			this.bytes = new ByteArray();
			this.bytes.endian = Endian.BIG_ENDIAN;
		}

		public function getBytes ():ByteArray
		{
			return this.bytes;
		}

		protected function putKey (key:int, type:int):void
		{
			this.bytes.writeByte(type);
			this.bytes.writeByte(key);
		}

		public function markEndObject ():void
		{
			this.bytes.writeByte(TYPE_END_OBJECT);
		}

		public function putByte (key:int, v:Number):void
		{
			if (v == 0)
				this.putKey(key, TYPE_ZERO);
			else
			{
				this.putKey(key, TYPE_BYTE);
				this.bytes.writeByte(v);
			}
		}

		public function putBoolean (key:int, v:Boolean):void
		{
			if (v)
				this.putKey(key, TYPE_BOOLEAN_TRUE);
			else
				this.putKey(key, TYPE_BOOLEAN_FALSE);
		}

		public function putShort (key:int, v:Number):void
		{
			if (v == 0)
				this.putKey(key, TYPE_ZERO);
			else
			{
				this.putKey(key, TYPE_SHORT);
				this.bytes.writeShort(v);
			}
		}

		public function putInt (key:int, v:Number):void
		{
			if (v == 0)
				this.putKey(key, TYPE_ZERO);
			else
			{
				this.putKey(key, TYPE_INT);
				this.bytes.writeInt(v);
			}
		}

		public function putLong (key:int, v:Number):void
		{
			if (v == 0)
				this.putKey(key, TYPE_ZERO);
			else
			{
				this.putKey(key, TYPE_LONG);
				this.bytes.writeDouble(v);
			}
		}

		public function putFloat (key:int, v:Number):void
		{
			if (v == 0)
				this.putKey(key, TYPE_ZERO);
			else
			{
				this.putKey(key, TYPE_FLOAT);
				this.bytes.writeFloat(v);
			}
		}

		public function putDouble (key:int, v:Number):void
		{
			if (v == 0)			
				this.putKey(key, TYPE_ZERO);
			else
			{
				this.putKey(key, TYPE_DOUBLE);
				this.bytes.writeDouble(v);
			}
		}

		public function putString (key:int, v:String):void
		{
			this.putKey(key, TYPE_STRING);
			this.bytes.writeUTF(v);
		}
		
		public function putMapItem (key:int, v:Object):void
		{
			var temp:Dictionary = new Dictionary();
			var len:int = 0;
			for (var k:String in v)
			{
				temp[k] = v[k];
				len += 1;
			}

			this.putKey(key, TYPE_MAP_ITEM);
			this.bytes.writeShort(len);
			for (var i:String in temp)
			{
				var value:Number = temp [i];
				this.bytes.writeUTF(i);
				this.bytes.writeInt(value);
			}
		}

		public function putByteArray (key:int, v:Vector.<int>):void
		{
			this.putKey(key, TYPE_ARRAY_BYTE);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeByte(v[i]);
		}
		
		public function putBooleanArray (key:int, v:Vector.<Boolean>):void
		{
			this.putKey(key, TYPE_ARRAY_BOOLEAN);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeBoolean(v[i]);
		}
		
		public function putShortArray (key:int, v:Vector.<int>):void
		{
			this.putKey(key, TYPE_ARRAY_SHORT);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeShort(v[i]);
		}
		
		public function putIntArray (key:int, v:Vector.<int>):void
		{
			this.putKey(key, TYPE_ARRAY_INT);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeInt(v[i]);
		}
		
		public function putLongArray (key:int, v:Vector.<Number>):void
		{
			this.putKey(key, TYPE_ARRAY_LONG);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeDouble(v[i]);
		}
		
		public function putFloatArray (key:int, v:Vector.<Number>):void
		{
			this.putKey(key, TYPE_ARRAY_FLOAT);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeFloat(v[i]);
		}
		
		public function putDoubleArray (key:int, v:Vector.<Number>):void
		{
			this.putKey(key, TYPE_ARRAY_DOUBLE);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeDouble(v[i]);
		}
		
		public function putStringArray (key:int, v:Vector.<String>):void
		{
			this.putKey(key, TYPE_ARRAY_STRING);
			this.bytes.writeShort(v.length);
			for (var i:int = 0; i < v.length; i++)
				this.bytes.writeUTF(v[i]);
		}
	}
}