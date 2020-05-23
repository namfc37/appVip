//ClientDisconnectionReason
package bitzero.util 
{
	public class ClientDisconnectionReason extends Object
	{
		public static const KICK:String="kick";

		public static const UNKNOWN:String="unknown";

		public static const MANUAL:String="manual";

		public static const IDLE:String="idle";

		public static const BAN:String = "ban";
		
		public static const LOGIN:String = "login";
		
		public static const HANDSHAKE:String="handshake";

		private static var reasons:Array = ["idle", "kick", "ban","login","unknown","handshake"];
		
		public function ClientDisconnectionReason()
		{
			super();
			reasons = ["idle", "kick", "ban","login","unknown","handshake"];
			return;
		}

		public static function getReason(r:int):String
		{
			return reasons[r];
		}
	}
}


