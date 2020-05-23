package bitzero.net.events
{
	import bitzero.engine.IMessage;
	import flash.events.*;
	import flash.utils.ByteArray;

	public class MsgEvent extends Event
	{
		private var msg:IMessage;

		public function MsgEvent(bms:IMessage = null)
		{
			super(bms.id.toString());
			this.msg = bms;
			return;
		}

		public function get msgData(): ByteArray
		{
			return this.msg.content;
		}
		
		public function get ErrorCode():int
		{
			var err:int = this.msg.content.readByte();
			this.msg.content.position --;
			return err;
		}

	}
}
