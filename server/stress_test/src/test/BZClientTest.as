package test 
{
	import bitzero.BitZero;
	import bitzero.core.BZEvent;
	import bitzero.engine.IMessage;
	import bitzero.logging.Logger;
	import bitzero.net.events.MsgEvent;
	import com.libs.controls.FrameTimerManager;
	import com.libs.utils.Random;
	import flash.sampler.NewObjectSample;
	import flash.utils.*;
	import test.cmd.receive.*;
	import test.cmd.send.*;
	import test.logic.UserData;
	
	public class BZClientTest 
	{
		public static var idgen:int = 0;
		public static var random:Random = new Random(85);
		
		private var bzConnector:BitZero = null;
		public var host:String;
		public var ext:String;
	
		public var id:String = "";		
		private var logger:Logger = Logger.getInstance();
		
		private var inRoom:Boolean = false;
		private var bean:Number = 0;
		
		public var flag:Boolean = false;
		private var userData:UserData;

		private var deltaServerTime:Number = 0;
		private var gameTimeS:Number = 0;

		private var actions:Vector.<*>;
			
		public function BZClientTest() 
		{
			userData = new UserData();
			bzConnector = new BitZero();
			id = "" + (++BZClientTest.idgen);
			actions = new Vector.<*> ();

			// logger.info("init BZClientTest id: ", id);
			bzConnector.addEventListener(BZEvent.CONNECTION, onConnection);
			bzConnector.addEventListener(BZEvent.CONNECTION_LOST, onConnectionLost);
			
			bzConnector.addEventListener(BZEvent.EXTENSION_RESPONSE, onServerResp);
			bzConnector.addEventListener(BZEvent.SYSTEM_MESSAGE, onSystemMsg);
			
			bzConnector.addEventListener(BZEvent.LOGIN, onLogin);
			
			bzConnector.addEventListener(BZEvent.CONNECTION_RESUME, onConnectionResum);
			bzConnector.addEventListener(BZEvent.CONNECTION_RETRY, onConnectionRetry);
			
			bzConnector.addEventListener(BZEvent.PINGPONG, onPingPong);
		}
		
		public function startTest(host:String,port:int):void
		{
			bzConnector.connect(host, port);
		}
		
		private function onPingPong(e:BZEvent):void 
		{
			
		}
		
		private function onConnectionRetry(e:BZEvent):void 
		{
			logger.info("onConnectionRetry id: ", id);
		}
		
		private function onConnectionResum(e:BZEvent):void 
		{
			logger.info("onConnectionResum id: ", id);
		}
		
		private function onLogin(e:BZEvent):void 
		{
			var msg:IMessage = e.params as IMessage;
			var event:MsgEvent = new MsgEvent(msg);
		
			if(event.ErrorCode == 0)
			{
				bzConnector.send(new SendGetUserData());
				FrameTimerManager.getTimer().add(5, -1, update);
			}
			else
				logger.info("onLogin: " + event.ErrorCode);	
		}
		
		private function onSystemMsg(e:BZEvent):void 
		{
			
		}
		
		private function onHandler(msg:IMessage):void
		{
			switch(msg.id)
			{
				case CmdDefine.GET_USER_DATA:
					this.receiveUserData (msg.content);
					break;
				case CmdDefine.PLANT:
					this.receivePlant (msg.content);
					break;
				case CmdDefine.PLANT_HARVEST:
					this.receivePlantHarvest (msg.content);
					break;
				default:
					break;
			}
		}
		
		private function update():void 
		{
//			update server time
			var date:Date = new Date ();
			var now:Number = date.time;
			this.gameTimeS = Math.round ((now + this.deltaServerTime) * 0.001);

			// logger.info("User " + id + " update: " + this.gameTimeS);
			if (this.actions.length == 0)
				return;
			
			if (this.actions [0] > this.gameTimeS)
				return;

			var time:Number = this.actions.shift ();
			var action:String = this.actions.shift ();
			switch (action)
			{
				case "sendPlantHarvest": this.sendPlantHarvest (); break;
				case "sendPlant": this.sendPlant ("T1"); break;
				default: break;
			}
		}
		
		private function onServerResp(e:BZEvent):void 
		{
			var msg:IMessage = e.params as IMessage;
			var event:MsgEvent = new MsgEvent(msg);

			this.onHandler(msg);				
		}
		
		private function onConnectionLost(e:BZEvent):void 
		{
			logger.info("onConnectionLost id: ", id);
		}
		
		private function onConnection(e:BZEvent):void 
		{
			if (!e.params["success"])
				return;
			
			this.sendLogin ();
		}

		private function sendLogin ():void
		{
			var msg:SendLogin = new SendLogin();
			msg.userId = id;
			msg.socialId = id;
			msg.sessionKey = id;
			msg.clientVersion = "stress_test";
			msg.rootClientVersion = 1;
			msg.clientSource = "test";
			msg.deviceId = id + "_device";
			msg.deviveName = "test";
			msg.osVersion = "web";
			msg.connectionType = "wifi";
			msg.languageCode = 1;
			msg.operatorName = "";
			bzConnector.send(msg);
		}

		private function receiveUserData (data:ByteArray):void
		{
			var cmd:ReceiveGetUserData = new ReceiveGetUserData(data);
			this.userData.game = cmd.game;
			this.userData.coin = cmd.coin;

			logger.info("receiveUserData: " + this.id + " = " + cmd.userId);
			
			var date:Date = new Date ();
			var now:Number = date.time;
			this.deltaServerTime = cmd.serverTime - now;
			this.gameTimeS = Math.round (this.deltaServerTime * 0.001);
			
			this.actions.push (this.gameTimeS + 10);
			this.actions.push ("sendPlantHarvest");
		}

		private function sendPlant (plantId:String):void
		{
			var msg:SendPlant = new SendPlant ();
			msg.setPlant (plantId);
			msg.setTime (this.gameTimeS);
			msg.addFloor (0);
			this.bzConnector.send(msg);
		}

		private function receivePlant (data:ByteArray):void
		{
			var cmd:ReceivePlant = new ReceivePlant (data);
			// logger.info("receivePlant: " + cmd.plantId + ":" + cmd.plantRemain);
			
			this.actions.push (this.gameTimeS + 125);
			this.actions.push ("sendPlantHarvest");
		}

		private function sendPlantHarvest ():void
		{
			var msg:SendPlantHarvest = new SendPlantHarvest ();
			msg.addFloor (0);
			this.bzConnector.send(msg);
		}

		private function receivePlantHarvest (data:ByteArray):void
		{
			var cmd:ReceivePlantHarvest = new ReceivePlantHarvest (data);
			// logger.info("receivePlantHarvest: " + cmd.level + ", " + cmd.exp + ", " + cmd.gold);
			
			this.actions.push (this.gameTimeS + 10);
			this.actions.push ("sendPlant");
		}
	}
}