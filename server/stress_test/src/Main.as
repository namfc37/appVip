package 
{
	import bitzero.core.BZEvent;
	import bitzero.logging.Logger;
	import bitzero.logging.LoggerEvent;
	import com.libs.controls.FrameTimerManager;
	import flash.display.Sprite;
	import flash.events.DataEvent;
	import flash.events.Event;
	import org.aswing.AsWingManager;
	import org.aswing.geom.IntDimension;
	import org.aswing.JFrame;
	import org.aswing.JPanel;
	import test.BZClientTest;
	import view.components.ui.ChatPanel;
	
	/**
	 * ...
	 * @author ToanTN
	 */
	public class Main extends Sprite 
	{
		private var listClient:Array = [];
		
		private var cmdFrame :JFrame = new JFrame(this, "Command Console");
		private var  cmdPanel:ChatPanel;
		
		public function Main():void 
		{
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void 
		{
			AsWingManager.initAsStandard(this);
			
			removeEventListener(Event.ADDED_TO_STAGE, init);
			 
			// khoi tap frame 
			cmdFrame.getContentPane().append(creatCmdPane());
			cmdFrame.setSize(new IntDimension(ChatGlobalVar.WIDTH + 10, ChatGlobalVar.HEIGHT + 40));
			cmdFrame.show();
			
			cmdPanel.addEventListener("command", executeCommand);
			
			Logger.getInstance().addEventListener(LoggerEvent.INFO,addInfo)
			
			/*var testClient:BZClientTest = new BZClientTest();
			testClient.startTest("10.198.48.27", 443);
			
			var testClient2:BZClientTest = new BZClientTest();
			testClient2.startTest("10.198.48.27", 443);*/
			FrameTimerManager.getTimer().add(2, 1, sendCreateTest);
		
		}
		
		private function addInfo(e:LoggerEvent):void 
		{
			this.cmdPanel.addChatMsg(e.params.message, false);
		}
		
		private function executeCommand(e:BZEvent):void 
		{
			if (e.params.indexOf("start") == -1)
				return;
			
			var strArr:Array = e.params.split(":");
			BZClientTest.idgen = (Number)(strArr[1]);
			var numConnect:Number = (Number)(strArr[2]);
			
			for (var i:int = 0; i < numConnect; i++)
				this.sendCreateTest();
		}
		
		private function creatCmdPane():JPanel 
		{
			this.cmdPanel = new ChatPanel();
			this.cmdPanel.setLocationXY(0, 200 + 380);
			return this.cmdPanel;
		}
		
		private function sendCreateTest():void 
		{
			var testClient:BZClientTest = new BZClientTest();
			//testClient.startTest("120.138.76.50", 19127);
			testClient.startTest("127.0.0.1", 8001);
			listClient.push(testClient);
		}
	}
}