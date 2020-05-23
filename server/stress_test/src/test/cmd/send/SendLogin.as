package test.cmd.send 
{
	import bitzero.net.data.BaseCmd;
	import bitzero.logging.*;
	import constanst.*;
	
	public class SendLogin extends BaseCmd 
	{
		public var sessionKey:String;
		public var userId:String;
		public var clientVersion:String;
		public var rootClientVersion:Number;
		public var clientSource:String;
		public var deviceId:String;
		public var deviveName:String;
		public var osVersion:String;
		public var connectionType:String;
		public var languageCode:Number;
		public var operatorName:String;
		public var socialId:String;
		
		public function SendLogin() 
		{
			super(CmdDefine.CMD_CUSTOM_LOGIN);
		}
		
		public override function createBody():Boolean 
		{
			this.writeString (KeyDefine.KEY_USER_ID, this.userId);
			this.writeString (KeyDefine.KEY_CLIENT_VERSION, this.clientVersion);
			this.writeString (KeyDefine.KEY_OS_NAME, this.operatorName);
			this.writeString (KeyDefine.KEY_OS_VERSION, this.osVersion);
			this.writeString (KeyDefine.KEY_DEVICE_ID, this.deviceId);
			this.writeString (KeyDefine.KEY_DEVICE_NAME, this.deviveName);
			this.writeString (KeyDefine.KEY_CONNECTION_TYPE, this.connectionType);
			this.writeString (KeyDefine.KEY_SESSION_PORTAL, this.sessionKey);
			this.writeEndObject();
			return true;
		}
	}
}