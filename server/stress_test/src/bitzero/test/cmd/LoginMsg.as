package bitzero.test.cmd 
{
	import bitzero.net.data.BaseMsg;
	import flash.utils.ByteArray;
	
	/**
	 * ...
	 * @author ...
	 */
	public class LoginMsg extends BaseMsg 
	{
		public var name:String;
		public var uId:int;
		public var score: int;
		
		public function LoginMsg(ba:ByteArray) 
		{
			super(ba);			
		}
		
		override public function parseBody(): Boolean
		{
			name = readStr();
			uId =  readInt();
			score = readInt();
			
			return true;
		}
		
	}

}