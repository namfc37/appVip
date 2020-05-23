package com.libs.controls
{
	import flash.display.*;
	import flash.events.*;
	import flash.utils.*;

	public class FrameTimer
	{
		private var timer:MovieClip;
		private var timers:Dictionary;
		private var myTimer:Timer;

		public function FrameTimer(clockTimer:Boolean = false, interval:int = 1000)
		{
			this.timers = new Dictionary();
			if (!clockTimer)
			{
				this.timer = new MovieClip();
				this.timer.addEventListener(Event.ENTER_FRAME, this.enterFrameHandler);
			}
			else
			{
				this.myTimer = new Timer(interval);
				this.myTimer.addEventListener(TimerEvent.TIMER, this.onHandler);
				this.myTimer.start();
			}
			return;
		}

		public function add(delay:int, repeat:int, callback:Function, overback:Function = null): void
		{
			var objTimer:* = new Object();
			objTimer.delay = delay;
			objTimer.counter = delay;
			objTimer.repeat = repeat;
			objTimer.callback = callback;
			if (overback != null)
			{
				objTimer.overback = overback;
			}
			this.timers[callback] = objTimer;
			return;
		}

		public function remove(func:Function): void
		{
			delete this.timers[func];
			return;
		}

		private function enterFrameHandler(event:Event): void
		{
			if (FrameTimerManager.isActivate)
			{
				this.onHandler();
			}
			return;
		}

		public function onHandler(event:Event = null): void
		{
			var objTimer:Object = null;
			for each (objTimer in this.timers)
			{
				objTimer.counter --;
				if (objTimer.counter > 0)
                    continue;
                    
                objTimer.counter = objTimer.delay;
                objTimer.callback();

                if (objTimer.repeat == -1)
                    continue;
                
                if (objTimer.repeat > 0)
                {
                    objTimer.repeat --;
                    if (objTimer.repeat == 0)
                    {
                        if (objTimer.hasOwnProperty("overback"))
                        {
                            objTimer.overback();
                        }
                        delete this.timers[objTimer.callback];
                    }
                }
			}
			return;
		}
	}
}
