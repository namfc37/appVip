package bitzero.net.events
{
	import com.net.data.*;
	import com.net.utils.*;
	import flash.events.*;

	public class GenericEvent extends Event
	{
		public var byteCode:ByteCode;

		public function GenericEvent(cmId:String, bc:ByteCode)
		{
			super(cmId);
			this.byteCode = bc;
			return;
		}

		public function getSimpleMsg(): SimpleMsg
		{
			return MsgFactory.getMsg(SimpleMsg, this.byteCode) as SimpleMsg;
		}

	}
}
