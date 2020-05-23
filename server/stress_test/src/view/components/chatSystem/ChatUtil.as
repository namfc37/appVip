package view.components.chatSystem
{
	import com.libs.utils.*;

	public class ChatUtil 
	{
		public static const CHANNEL_NAME:Array = ["% T.Giới", "Tất Cả","Map", "@ Hội","# Nhóm", "/ Mật","Speaker"];
		public static const CHANNEL_KEY:Array = ["%", "%", "^", "@", "#", "/", "$"];
		
		public static const CHANNEL_COLOR:Array = [Color.GREEN_S, Color.WHITE_S, Color.WHITE_S, Color.ORANGE_S, Color.PINK_S, Color.MAGENTA_S, Color.RED_S];
		
		// Map phím tắt với Channel tương ứng 
		public static const MAP_CHANNEL:Array = [NEAR, TEAM,PRIVATE, FACTION,WORLD,NEAR, TEAM,PRIVATE, FACTION,WORLD];
		
		public static var chatType:int = 0;
		
		public static const CHANNEL:Array = [WORLD];
		
		private static const SPEAKER:int = 6;
		private static const PRIVATE:int = 5;
		private static const TEAM:int = 4;
		private static const FACTION:int = 3;
		private static const MAP:int = 2;	
		private static const NEAR:int = 1;
		private static const WORLD:int = 0;

		public function ChatUtil()
		{
			return;
		}
		
		public static function getKey(id:int = - 1):String
		{
			if (id == -1)
				return CHANNEL_KEY[chatType];
			else
				return CHANNEL_KEY[id];
		}
		
		public static function getChannel(str:String):int
		{
			return CHANNEL_KEY.indexOf(str);
		}
	}
}
