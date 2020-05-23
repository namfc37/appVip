//ConfigData
package bitzero.util 
{
	public class ConfigData
	{
		public function ConfigData()
		{
			super();
			return;
		}

		public var port:int=443;

		public var host:String="127.0.0.1";

		public var httpPort:int=8080;

		public var bboxPort:int=8080;

		public var zone:String;

		public var bboxHost:String;

		public var debug:Boolean=true;

		public var useBBox:Boolean=true;

		public var bboxPollingRate:int = 700;
		
		public var reconnectSeconds:int = 0;
	}
}


