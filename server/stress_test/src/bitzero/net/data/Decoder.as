package bitzero.net.data
{
	import flash.utils.*;

	public class Decoder
	{
		protected var raw:ByteArray;
		protected var map:Dictionary;
		protected var log:String;
		public function Decoder(bytes:ByteArray)
		{
			this.log = "";
			this.raw = bytes;
			this.map = this.parseObject (bytes);
		}

		public function read (key:int):Object
		{
			return this.map [key];
		}

		public function getRaw ():ByteArray
		{
			return this.raw;
		}

		public function getLog ():String
		{
			return this.log;
		}

		protected function parseObject (bytes:ByteArray):Dictionary
		{
			var object:Dictionary = new Dictionary();
			var isDone:Boolean = false;
			var i:int = 0, j:int = 0;
			while (!isDone)
			{
				var type:int = bytes.readByte();
				if (type == Encoder.TYPE_END_OBJECT)
					break;

				var len:int = 0;
				var value:* = null;
				var key:int = bytes.readByte();
				switch (type)
				{
					case Encoder.TYPE_BOOLEAN_TRUE:
						value = true;
					break;
					case Encoder.TYPE_BOOLEAN_FALSE:
						value = false;
					break;
					case Encoder.TYPE_ZERO:
						value = 0;
					break;
					case Encoder.TYPE_BYTE:
						value = bytes.readByte();
					break;
					case Encoder.TYPE_SHORT:
						value = bytes.readShort();
					break;
					case Encoder.TYPE_INT:
						value = bytes.readInt();
					break;
					case Encoder.TYPE_LONG:
						value = Decoder.readLong (bytes);
					break;
					case Encoder.TYPE_FLOAT:
						value = bytes.readFloat();
					break;
					case Encoder.TYPE_DOUBLE:
						value = bytes.readDouble();
					break;
					case Encoder.TYPE_STRING:
						value = bytes.readUTF();
					break;
					case Encoder.TYPE_OBJECT:
						value = this.parseObject(bytes);
					break;
					case Encoder.TYPE_ARRAY_BOOLEAN:
					{
						len = bytes.readShort();
						value = new Vector.<Boolean> ();
						for (i = 0; i < len; i++)
							value.push (bytes.readByte() == 0 ? false : true);
					}
					break;
					case Encoder.TYPE_ARRAY_BYTE:
					{
						len = bytes.readShort();
						value = new Vector.<int> ();
						for (i = 0; i < len; i++)
							value.push (bytes.readByte());
					}
					break;
					case Encoder.TYPE_ARRAY_SHORT:
					{
						len = bytes.readShort();
						value = new Vector.<int> ();
						for (i = 0; i < len; i++)
							value.push (bytes.readShort());
					}
					break;
					case Encoder.TYPE_ARRAY_INT:
					{
						len = bytes.readShort();
						value = new Vector.<int> ();
						for (i = 0; i < len; i++)
							value.push (bytes.readInt());
					}
						break;
					case Encoder.TYPE_ARRAY_LONG:
					{
						len = bytes.readShort();
						value = new Vector.<Number> ();
						for (i = 0; i < len; i++)
							value.push (Decoder.readLong (bytes));
					}
					break;
					case Encoder.TYPE_ARRAY_STRING:
					{
						len = bytes.readShort();
						value = new Vector.<String> ();
						for (i = 0; i < len; i++)
							value.push (bytes.readUTF());
					}
					break;
					case Encoder.TYPE_ARRAY_OBJECT:
					{
						len = bytes.readShort();
						value = new Vector.<Object> ();
						for (i = 0; i < len; i++)
							value.push (this.parseObject(bytes));
					}
					break;
					case Encoder.TYPE_MAP_ITEM:
					{
						len = bytes.readShort();
						value = new Dictionary();
						for (i = 0; i < len; i++)
							value[bytes.readUTF()] = bytes.readInt();
					}
					break;
					case Encoder.TYPE_ARRAY_MAP_ITEM:
					{
						len = bytes.readShort();
						value = new Vector.<Dictionary> ();
						for (i = 0; i < len; i++)
						{
							var map:Dictionary = new Dictionary();							
							var mapSize:int = bytes.readShort();							
							for (j = 0; j < mapSize; j++)
								map[bytes.readUTF()] = bytes.readInt();
							value.push (map);
						}
					}
					break;
					default:
						isDone = true;
					break;
				}
				object[key] = value;
				log += ", " + key + ": " + value;
			}

			return object;
		}

		private static function readLong (bytes:ByteArray):Number
		{
			var msb:uint = bytes.readUnsignedInt();
			var lsb:uint = bytes.readUnsignedInt();
			var result:Number;

			if (msb & 0x80000000)
			{
				msb ^= 0xFFFFFFFF;
				lsb ^= 0xFFFFFFFF;
				result = -(Number(msb)*4294967296 + Number(lsb) + 1);
			}
			else
			{
				result = Number(msb)*4294967296 + Number(lsb);
			}

			return result;
		//	value = bytes.readDouble();//(bytes.readInt() << 32) + bytes.readInt();
		}
	}
}