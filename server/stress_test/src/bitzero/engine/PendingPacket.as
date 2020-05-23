package bitzero.engine 
{
	import bitzero.core.*;
	import flash.utils.*;
	
	public class PendingPacket 
	{
		private var _header:PacketHeader;

		private var _buffer:ByteArray;
		
		public function PendingPacket(pHeader:PacketHeader)
		{
			super();
			_header = pHeader;
			_buffer = new ByteArray();
			return;
		}

		public function get buffer():ByteArray
		{
			return _buffer;
		}

		public function set buffer(ba:ByteArray):void
		{
			_buffer = ba;
			return;
		}

		public function get header():PacketHeader
		{
			return _header;
		}
	}
}


