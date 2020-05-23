package test.cmd.send 
{
	import bitzero.net.data.BaseCmd;
	
	public class SendGetUserData extends BaseCmd 
	{
		public function SendGetUserData() 
		{
			super(CmdDefine.GET_USER_DATA);
		}
		
		public override function createBody():Boolean 
		{
			return true;
		}
	}
}