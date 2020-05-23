package bitzero.net.data
{
	import com.libs.*;
	import com.net.core.*;
	import flash.utils.*;

	public class ByteCode 
	{
		private var head:ByteArray = null;
		private var body:ByteArray = null;
		public static var BEGINCHAR:String = "#";
		public static var ENDCHAR:String = "!";

		public function ByteCode()
		{
			return;
		}

		public function getHead(): ByteArray
		{
			if (this.head)
			{
				this.head.position = 0;
			}
			return this.head;
		}

		public function setHead(hba:ByteArray): void
		{
			this.head = hba;
			return;
		}

		public function getBody(): ByteArray
		{
			if (this.body)
			{
				this.body.position = 0;
			}
			return this.body;
		}

		public function setBody(ba:ByteArray): void
		{
			this.body = ba;
			return;
		}

		public static function getIntArray(ba:ByteArray): Array
		{
			if (!ba)
			{
				return null;
			}
			var arr:* = new Array();
			var pos:* = ba.position;
			ba.position = 0;
			while (ba.bytesAvailable > 3)
			{
				
				arr.push(ba.readInt());
			}
			ba.position = pos;
			return arr;
		}

		public static function TraceByte(ba:ByteArray, cmm:String = "Send ", ov:int = 16): String
		{
			var tmp:String = null;
			if (Setting.level == 0)
			{
				return "";
			}
			if (!ba && ba.bytesAvailable == 0)
			{
				return "";
			}
			var out:* = cmm + "(" + ba.length + " B)";
			ba.position = 0;
			while (ba && ba.bytesAvailable)
			{
				
				tmp = "00" + ba.readUnsignedByte().toString(ov).toUpperCase();
				out = out + (" " + tmp.slice(tmp.length - (256 / (ov * ov) + 1), tmp.length));
			}
			ba.position = 0;
			NetConfig.output(out);
			return out;
		}

		public static function TraceHead(ba:ByteArray, cmm:String = "Send "): String
		{
			var msgId:int = 0;
			if (Setting.level == 0)
			{
				return "";
			}
			if (!ba)
			{
				return "";
			}
			ba.position = 0;
			var out:* = cmm;
			var begin:Boolean = true;
			while (ba.bytesAvailable > 3)
			{
				
				msgId = ba.readInt();
				if (begin)
				{
					begin = false;
					if (NetConfig.noTrace(msgId))
					{
						return "";
					}
				}
				out = out + (" " + msgId);
			}
			ba.position = 0;
			NetConfig.output(out);
			return out;
		}

	}
}
