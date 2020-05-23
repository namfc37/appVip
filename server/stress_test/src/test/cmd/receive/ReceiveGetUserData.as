package test.cmd.receive 
{
	import bitzero.net.data.BaseMsg;
	import bitzero.logging.Logger;
	import constanst.*;
	import flash.utils.*;
	import test.logic.UserData;
	
	public class ReceiveGetUserData extends BaseMsg 
	{
		public var userId:int;
		public var coin:Number;
		public var game:Object;

		public var serverTime:Number;

		public var privateShop:Object;
		public var airShip:Object;
		public var mailBox:Object;
		
		public function ReceiveGetUserData(data:ByteArray) 
		{
			super(data);
		}
		
		public override function parseBody():Boolean 
		{
			this.coin = this.readLong (KeyDefine.KEY_COIN);
			this.game = this.readObject (KeyDefine.KEY_GAME);
			// this.privateShop = this.readObject (KeyDefine.KEY_PRIVATE_SHOP);
			// this.airShip = this.readObject (KeyDefine.KEY_AIRSHIP);
			// this.mailBox = this.readObject (KeyDefine.KEY_MAIL_BOX);
			this.userId = this.readInt (KeyDefine.KEY_USER_ID);
			// var userName:String = this.readString (KeyDefine.KEY_USER_NAME);
			this.serverTime = this.readLong (KeyDefine.KEY_TIME_MILLIS);
			// var userLocalPayment:Object = this.readObject (KeyDefine.KEY_USE_LOCAL_PAYMENT);
			//var jackShop:Object = this.readObject (KeyDefine.KEY_JACK_SHOP, game.getJackShop());
			//var jackMachine:Object = this.readObject (KeyDefine.KEY_JACK_MACHINE, game.getJackMachine());

			//this.printObject ("game", game);

			//var test1:Dictionary = new Dictionary ();
			//var class1:String = getQualifiedClassName (test1);
			//var type1:String = typeof (test1);
			//Logger.getInstance().info("test1: " + type1 + ", " + class1);
			//
			//var test2:Vector.<Number> = new Vector.<Number> ();
			//var class2:String = getQualifiedClassName (test2);
			//var type2:String = typeof (test2);
			//Logger.getInstance().info("test2: " + type2 + ", " + class2);
			//
			//var test3:Array = [0, 1];
			//var class3:String = getQualifiedClassName (test3);
			//var type3:String = typeof (test3);
			//Logger.getInstance().info("test3: " + type3 + ", " + class3);
			//
			//var test4:Boolean = true;
			//var class4:String = getQualifiedClassName (test4);
			//var type4:String = typeof (test4);
			//Logger.getInstance().info("test4: " + type4 + ", " + class4 + ", " + test4);
			//
			//var test5:int = 5;
			//var class5:String = getQualifiedClassName (test5);
			//var type5:String = typeof (test5);
			//Logger.getInstance().info("test5: " + type5 + ", " + class5 + ", " + test5);
			//
			//var test6:String = "text";
			//var class6:String = getQualifiedClassName (test6);
			//var type6:String = typeof (test6);
			//Logger.getInstance().info("test6: " + type6 + ", " + class6 + ", " + test6);
			
			return true;
		}
	}
}