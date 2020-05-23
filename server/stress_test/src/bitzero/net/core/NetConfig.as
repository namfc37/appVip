package bitzero.net.core
{

	public class NetConfig 
	{
		public static var noTraces:Array = [];
		public static var getErrorFun:Function;
		public static var outputFun:Function;
		public static var isServer:Boolean = false;

		public function NetConfig()
		{
			return;
		}

		public static function noTrace(id:int): Boolean
		{
			return noTraces.indexOf(id) >= 0;
		}

		public static function output(msg:String): void
		{
			if (outputFun != null)
			{
				outputFun(msg);
			}
			return;
		}

		public static function getError(err:int): String
		{
			if (getErrorFun != null)
			{
				return getErrorFun(err);
			}
			return "";
		}

	}
}
