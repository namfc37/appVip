package view.components.chatSystem
{
	import com.libs.controls.FrameTimerManager;
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	import flash.system.*;
	import flash.text.*;
	import flash.utils.*;

	
	/**
	 * Thực hiện các tiện ích liên quan đến mặt cười 
	 */
	
	public class ChatFaceUtil 
	{
		public static const FACE_HEIGHT:int = 24;
		public static const FACE_WIDHT:int = 24;
		
		public static const Placeholder:String = String.fromCharCode(12288);
		private static var placeHolderFormat:TextFormat;
		
		private static var reg:RegExp;
		private static var waitQueue:Array = [];
		
		private static var isSWFLoaded:Boolean = false;	   
		private static var isSWFLoading:Boolean = false;
		
		private static var addTimer:Boolean = false;
		
		private static var facePools:Dictionary = new Dictionary();
		private static var childrenTotal:uint;
		
		public static var Smileys_Names:Array = ["/01", "/02", "/03", "/04", "/05", "/06", "/07", "/08", "/09", "/10", "/11", "/12", "/13", "/14", "/15", "/16", "/17", "/18", "/19", "/20", "/21", "/22", "/23", "/24", "/25", "/26", "/27"];
		
		public function ChatFaceUtil()
		{
			return;
		}

		public static function get PlaceHolderFormat(): TextFormat
		{
			if (!placeHolderFormat)
			{
				placeHolderFormat = new TextFormat(null, 12);
				placeHolderFormat.letterSpacing = 12;
			}
			return placeHolderFormat;
		}

		public static function disposeFaceSprite(fsp:Sprite): void
		{
			delete facePools[fsp.name];
			return;
		}

		private static function cleanAll(): void
		{
			facePools = null;
			facePools = new Dictionary();
			return;
		}

		public static function getFace(name:String): Sprite
		{
			var fcls:Class = null;
			var mvClp:MovieClip = null;
			var fspr:Sprite = null;
			var fName:String= name.replace("/", "f");
			var cfPool:Array = facePools[fName];
			if (!addTimer)
			{
				addTimer = true;
				FrameTimerManager.getTimer().add(100, 0, cleanAll);
			}
			if (cfPool && cfPool.length)
			{
				return cfPool.pop();
			}
			if (isSWFLoaded)
			{
				fcls = getFaceClass(fName);
				mvClp = new fcls;
				mvClp.name = fName;
				return mvClp;
			}
			loadFaceSwf();
			fspr = new Sprite();
			fspr.name = fName;
			fspr.graphics.lineStyle(0, 0, 0);
			fspr.graphics.drawRect(0, 0, FACE_WIDHT, FACE_HEIGHT);
			waitQueue.push(fspr);
			return fspr;
		}

		private static function loadFaceSwf(): void
		{
			if (isSWFLoaded)
			{
				return;
			}
			if (isSWFLoading)
			{
				return;
			}
			
			return;
		}

		private static function exeWaitWQueue(): void
		{
			var spr:Sprite = null;
			var fname:String = null;
			var fspr:Sprite = null;
			var i:int = 0;
			while (i < waitQueue.length)
			{
				
				spr = waitQueue[i];
				fname = spr.name;
				fspr = getFace(fname);
				spr.addChild(fspr);
				i += 1;
			}
			waitQueue = [];
			return;
		}

		private static function getFaceClass(name:String): Class
		{
			return ApplicationDomain.currentDomain.getDefinition(name) as Class;
		}

		public static function returnFace(fspr:Sprite): void
		{
			var facePool:Array = null;
			if (fspr && fspr.name)
			{
				facePool = facePools[fspr.name];
				if (!facePool)
				{
					facePool = [];
					facePools[fspr.name] = facePool;
				}
				facePool.push(fspr);
			}
			return;
		}

		public static function get getRegExp(): RegExp
		{
			if (reg)
			{
				return reg;
			}
			var str:String = Smileys_Names.join("|");
			reg = new RegExp(str, "g");
			return reg;
		}

	}
}
