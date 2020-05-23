package bitzero.core 
{
	/**
	 * ...
	 * @author ...
	 */
	public class PacketHeader 
	{
		
		private var _bigSized:Boolean;

		private var _encrypted:Boolean;

		private var _binary:Boolean;

		private var _compressed:Boolean;

		private var _blueBoxed:Boolean;

		private var _expectedLen:int;
		
		public function PacketHeader(encrypted:Boolean, compressed:Boolean=false, blueBoxed:Boolean=false, bigSized:Boolean=false)
		{
			super();
			_expectedLen = -1;
			_binary = true;
			_compressed = compressed;
			_encrypted = encrypted;
			_blueBoxed = blueBoxed;
			_bigSized = bigSized;
			return;
		}

		public function get binary():Boolean
		{
			return _binary;
		}

		public function set bigSized(p:Boolean):void
		{
			_bigSized = p;
			return;
		}

		public function get compressed():Boolean
		{
			return _compressed;
		}

		public function set compressed(p:Boolean):void
		{
			_compressed = p;
			return;
		}

		public function get encrypted():Boolean
		{
			return _encrypted;
		}

		public function set encrypted(p:Boolean):void
		{
			_encrypted = p;
			return;
		}

		public function set binary(p:Boolean):void
		{
			_binary = p;
			return;
		}

		public function encode():int
		{
			var data:int=0;
			if (binary) 
			{
				data = data + 128;
			}
			if (encrypted) 
			{
				data = data + 64;
			}
			if (compressed) 
			{
				data = data + 32;
			}
			if (blueBoxed) 
			{
				data = data + 16;
			}
			if (bigSized) 
			{
				data = data + 8;
			}
			return data;
		}

		public function get bigSized():Boolean
		{
			return _bigSized;
		}

		public function toString():String
		{
			var loc1:*="";
			loc1 = loc1 + "---------------------------------------------\n";
			loc1 = loc1 + "Binary:  \t" + binary + "\n";
			loc1 = loc1 + "Compressed:\t" + compressed + "\n";
			loc1 = loc1 + "Encrypted:\t" + encrypted + "\n";
			loc1 = loc1 + "BlueBoxed:\t" + blueBoxed + "\n";
			loc1 = loc1 + "BigSized:\t" + bigSized + "\n";
			loc1 = loc1 + "---------------------------------------------\n";
			return loc1;
		}

		public function set blueBoxed(p:Boolean):void
		{
			_blueBoxed = p;
			return;
		}

		public function get blueBoxed():Boolean
		{
			return _blueBoxed;
		}

		public function set expectedLen(p:int):void
		{
			_expectedLen = p;
			return;
		}

		public function get expectedLen():int
		{
			return _expectedLen;
		}

		public static function fromBinary(p:int):PacketHeader
		{
			return new PacketHeader((p & 64) > 0, (p & 32) > 0, (p & 16) > 0, (p & 8) > 0);
		}
	}

}