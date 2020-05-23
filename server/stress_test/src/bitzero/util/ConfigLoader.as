//ConfigLoader
package bitzero.util 
{
	import bitzero.core.*;
	import flash.events.*;
	import flash.net.*;
	
	public class ConfigLoader extends EventDispatcher
	{
		public function ConfigLoader()
		{
			super();
			return;
		}

		public function loadConfig(url:String):void
		{
			var loader:URLLoader=new URLLoader();
			loader.addEventListener(Event.COMPLETE, onConfigLoadSuccess);
			loader.addEventListener(IOErrorEvent.IO_ERROR, onConfigLoadFailure);
			loader.load(new URLRequest(url));
			return;
		}

		private function onConfigLoadFailure(e:IOErrorEvent):void
		{
			var pa:Object={"message":e.text};
			var ev:BZEvent=new BZEvent(BZEvent.CONFIG_LOAD_FAILURE, pa);
			dispatchEvent(ev);
			return;
		}

		private function onConfigLoadSuccess(e:Event):void
		{
			var loader:URLLoader=e.target as URLLoader;
			var xmlData:XML=new XML(loader.data);
			var cfData:ConfigData=new ConfigData();
	
			cfData.bboxHost = xmlData.ip;
			cfData.host = xmlData.ip;
			cfData.port = int(xmlData.port);
			cfData.zone = xmlData.zone;
			if (xmlData.blueBoxAddress != undefined) 
			{
				cfData.bboxHost = xmlData.blueBoxAddress;
			}
			if (xmlData.blueBoxPort != undefined) 
			{
				cfData.bboxPort = xmlData.blueBoxPort;
			}
			if (xmlData.debug != undefined) 
			{
				cfData.debug = xmlData.debug.toLowerCase() != "true" ? false: true;
			}
			if (xmlData.useBlueBox != undefined) 
			{
				cfData.useBBox = xmlData.useBlueBox.toLowerCase() != "true" ? false: true;
			}
			if (xmlData.httpPort != undefined) 
			{
				cfData.httpPort = int(xmlData.httpPort);
			}
			if (xmlData.blueBoxPollingRate != undefined) 
			{
				cfData.bboxPollingRate = int(xmlData.blueBoxPollingRate);
			}
			var ev:BZEvent=new BZEvent(BZEvent.CONFIG_LOAD_SUCCESS, {"cfg":cfData});
			dispatchEvent(ev);
			return;
		}
	}
}


