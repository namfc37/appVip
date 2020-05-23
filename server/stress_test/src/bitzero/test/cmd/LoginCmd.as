package bitzero.test.cmd 
{
	import bitzero.net.data.BaseCmd;
	
	/**
	 * ...
	 * @author ...
	 */
	public class LoginCmd extends BaseCmd 
	{
		public var name:String = "Toannobita";
		public var uId:int = 08101985;
		
		public function LoginCmd(cmId:int=0) 
		{
			super(cmId);		
		}
		
		public override function createBody():Boolean
		{
			this.bodys.writeString(name);
			this.bodys.writeInt(uId);
			return true;
		}
		
	}

}