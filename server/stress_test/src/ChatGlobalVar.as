package  
{
	import flash.display.Sprite;
	/**
	 * ...
	 * @author ...
	 */
	public class ChatGlobalVar 
	{
		public static var version:int = 0;
	
		public static var serverIp:String = "10.198.48.52";
		public static var port:int = 450;
		static public var chatFace:Boolean = true;
		static public var chatting:Boolean;
		static public var flauntNum:Number;
		static public var rootSprite:Sprite;
		//static public var chatWindow:ChatWindow;
		static public var webUrl:String;
		
		static public var userName:String = "";
		
		static public var WIDTH:int = 600;
		static public var HEIGHT:int = 500;
		
		public function ChatGlobalVar() 
		{
			
		}
		
	}

}