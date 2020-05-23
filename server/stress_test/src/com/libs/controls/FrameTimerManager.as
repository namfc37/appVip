package com.libs.controls
{
	import flash.utils.*;

	public class FrameTimerManager
	{
		private static var dic:Dictionary = new Dictionary();
		public static var isActivate:Boolean = true;
		private static var timerDic:Dictionary = new Dictionary();

		public function FrameTimerManager()
		{
			return;
		}

		public static function getInstance(name:String = "default"): FrameTimer
		{
			if (dic[name] == null)
			{
				dic[name] = new FrameTimer();
			}
			return dic[name];
		}

		public static function freeInstance(name:String = "default"): void
		{
			delete dic[name];
			return;
		}

		public static function getTimer(name:String = "default"): FrameTimer
		{
			if (timerDic[name] == null)
			{
				timerDic[name] = new FrameTimer(true, 1000);
			}
			return timerDic[name];
		}

		public static function freeTimer(name:String = "default"): void
		{
			delete timerDic[name];
			return;
		}

		public static function jsTimer(): void
		{
			if (isActivate)
			{
				return;
			}
			 var obj:* = null;
			for each (obj in dic)
			{
				
				obj.onHandler();
			}
			return;
		}

	}
}
