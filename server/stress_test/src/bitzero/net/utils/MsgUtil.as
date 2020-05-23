package bitzero.net.utils
{
	import flash.utils.*;

	public class MsgUtil
	{

		public function MsgUtil()
		{
			return;
		}

		public static function getTypeId(ba:ByteArray): int
		{
			ba.position = 0;
			return ba.readInt();
		}

		public static function getHeadData(ha:ByteArray, idx:int): int
		{
			ha.position = idx * 4;
			return ha.readInt();
		}

		public static function creatByteArray(): ByteArray
		{
			var ba:* = new ByteArray();
			ba.endian = Endian.BIG_ENDIAN;
			return ba;
		}

	}
}
