package view.components.ui
{
	import bitzero.BZConnector;
	import bitzero.core.BZEvent;
	import com.libs.*;
	import com.libs.controls.*;
	import com.libs.utils.Color;
	import com.libs.utils.HtmlUtil;

	import view.components.chatSystem.ChatContainer;
	import view.components.chatSystem.ChatFaceBoard;
	import view.components.chatSystem.ChatUtil;
	import view.components.chatSystem.MenuListWindow;
  
	import flash.display.*;
	import flash.events.*;
	import flash.geom.*;
	import flash.text.*;
	import flash.ui.*;
  
	import org.aswing.*;
	import org.aswing.border.*;
	import org.aswing.event.*;
	import org.aswing.geom.*;
	import org.aswing.util.*;


	public class ChatPanel extends JPanel
	{
		private static const SPEAKER:int = 6;
		private static const PRIVATE:int = 5;
		private static const TEAM:int = 4;
		private static const FACTION:int = 3;
		private static const MAP:int = 2;	
		private static const NEAR:int = 1;
		private static const WORLD:int = 0;
		
		public static const SYNTHESIZE:int = 1;
		public static const ATTENTION:int = 2;
		
		public static const CHATTEXT:String = "chattext";
		public static const id:String = "chat";
		
		private static var instance:ChatPanel;	   
		
		private var idHash:HashMap;
		
		private var chatInfoArr:Array;
		private var lastPrivate:String;

		private var mouseStartY:Number;
		public var allTogleBtn:JToggleButton;
  
		private var startY:Number;
		private var isInserFace:Boolean = false;

		private var ccGeneral:ChatContainer;

	   
		private var topBtnPanel:JPanel;	   
		private var chatInfoPanel:JPanel;
		private var bottomBtnPanel:JPanel;
		
		private const Arrow_Pane_Height:Number = 20;
		
		private var isFlaunt:Boolean = false;
 
		private var lastChatTxtArr:Array;
		private var testLabel:JLabel;

		private var tabPane:JTabbedPane;
		private var chatInputText:JTextField;
		private var down:Boolean;
		private var isFirst:Boolean;
		private var chatHeight:Number;
		
		private var numHash:HashMap;

		private var faceBtn:JButton;
		private var sendBtn:JButton;
		private var currIndex:int;

		private var txtAlert:String;
		private var mouseIntPoint:IntPoint;
		
		private var channelBtn:JComboBox;
		
	   
		private var typeContent:Object;
		private var rFlaunt:Boolean = false;
		private var pY:Number;

		public var receiver:String = "toannobi";
   
		private var ccGroup:ChatContainer;
		private var ccWorld:ChatContainer;
		private var ccPerson:ChatContainer;
		
		private var worldBtn:JToggleButton;
		private var groupTogleBtn:JToggleButton;
		public var privateBtn:JToggleButton;
		
		private var ccSelected:ChatContainer;
		private var tggleSelected:JToggleButton;
		
		private var chatFaceBoard:ChatFaceBoard;
		
		private const MIN_HEIGHT:int = 70;
		private const MAX_HEIGHT:int = 285;
		private const NORMAL_HEIGHT:int = 200;
		
		private var menulist:MenuListWindow;

		public function ChatPanel()
		{
			cacheAsBitmap = true;
			lastChatTxtArr = new Array();
		   
			setSize(new IntDimension(ChatGlobalVar.WIDTH  , ChatGlobalVar.HEIGHT ));
		  
			this.init();
			
			AsWingManager.getStage().addEventListener(KeyboardEvent.KEY_DOWN, this.onKeyboard);
			instance = this;
		  
			return;
		}

		public function attChatInfoAppend(msg:ChatVO): void
		{
			this.ccPerson.appendMessage(msg);
			return;
		}

		private function changeNameStyle(name:String, style:int): String
		{
			return "<font color=\'#DFFB67\'>" + "<a href = \'event:" + style + "," + name + "\'>" + name + "</a>" + "</font>";
		}

		private function init(): void
		{	  
			this.initTypeContent();
			setLayout(new EmptyLayout());
			this.testLabel = new JLabel();
			this.testLabel.setSizeWH(303, 8);
			this.testLabel.setLocationXY(0, 15);
			append(this.testLabel);
			this.testLabel.addEventListener(MouseEvent.MOUSE_DOWN, this.onDown);
			this.testLabel.addEventListener(MouseEvent.MOUSE_OVER, this.onOver);
			
			this.topBtnPanel = new JPanel(new EmptyLayout());
			this.topBtnPanel.setSizeWH(ChatGlobalVar.WIDTH - 30 , 19);
			this.topBtnPanel.setLocationXY(15, 158);
	
			
			for (var i:int = 0; i < ChatUtil.CHANNEL.length; i ++)
			{
				this.topBtnPanel.appendAll(initChannel(ChatUtil.CHANNEL[i]));

			}
			
			this.bottomBtnPanel = new JPanel(new EmptyLayout());
			this.bottomBtnPanel.setSizeWH(ChatGlobalVar.WIDTH, 21);
			this.bottomBtnPanel.setLocationXY(0, ChatGlobalVar.HEIGHT - 18);
			
			
			this.txtAlert = "Enter command here ";
			this.chatInputText = new JTextField();
			this.chatInputText.setSizeWH(ChatGlobalVar.WIDTH - 120 , 21);
			this.chatInputText.x = 15;
			this.chatInputText.setMaxChars(80);
			this.chatInputText.setWordWrap(false);
			this.chatInputText.setText(this.txtAlert);
			this.chatInputText.getTextField().name = "TextField";
			this.chatInputText.addEventListener(KeyboardEvent.KEY_DOWN, this.onChatInput);
			this.chatInputText.addEventListener(MouseEvent.CLICK, this.onInputClick);
			
			if (ChatGlobalVar.chatFace)
			{
				this.faceBtn = new JButton("^^");
				this.faceBtn.name = "FaceBtn";
				this.faceBtn.setSizeWH(24, 24);
				this.faceBtn.setLocationXY(220, -2);
				this.faceBtn.addActionListener(this.openFaceBoard);
				this.faceBtn.setBackground(new ASColor(Color.DARK_GRAY,0.7));
				this.bottomBtnPanel.append(this.faceBtn);
			}
			
			this.chatFaceBoard = new ChatFaceBoard();
			this.chatFaceBoard.setLocationXY(15,85);
			
			this.sendBtn = new JButton("Gửi");
			this.sendBtn.setSizeWH(50, 21);
			this.sendBtn.setLocationXY(ChatGlobalVar.WIDTH - 70, 0);
			this.sendBtn.name = "Button";
			this.sendBtn.setBackground(new ASColor(Color.DARK_GRAY, 0.7));
			
			this.sendBtn.addActionListener(this.sendInformation);
			this.bottomBtnPanel.appendAll(this.channelBtn, this.chatInputText, this.sendBtn);
			appendAll(this.ccGeneral, this.bottomBtnPanel);
			
			ccGeneral = ChatContainer.getChat(0);
			append(ccGeneral);
			//tggleSelected.setBackground(new ASColor(Color.MAGENTA,0.7));			
			return;
		}
		
		public static var  initX:int = 0;
		private function initChannel(id:int):JToggleButton
		{
			var button:JToggleButton = new JToggleButton(ChatUtil.CHANNEL_NAME[id]);
			
			button.name = id.toString();
			button.setSizeWH(60, 19);
			button.setLocationXY(initX, 0);
			initX += 60 -3;
			button.setSelected(false);
			button.addEventListener(MouseEvent.CLICK, this.onToggleChannel);
			button.setBackground(new ASColor(Color.DARK_GRAY,0.7));
			//Style.setStyle(button, Style.btnChatStyle);
			initChatContainer(id);
			
			idHash.put(id, button);
			
			return button;
		}
		
		private function onToggleChannel(e:Event):void 
		{
			
		}
		
		private function initChatContainer(id:int):void
		{			
			 var lnBod:LineBorder = new LineBorder();
			lnBod.setColor(new ASColor(16777215, 0.3));
			
			var cc:ChatContainer = new ChatContainer(ChatGlobalVar.WIDTH  , ChatGlobalVar.HEIGHT - 20);
			cc.id = id;
			cc.setLocationXY(0, 0);
			cc.setBackground(new ASColor(3355443, 0.5));
			cc.setOpaque(true);
			cc.setBorder(lnBod);
			
			cc.addEventListener(TextEvent.LINK, this.onLink);
		}

		private function onInputClick(event:MouseEvent): void
		{
			AsWingManager.getStage().addEventListener(MouseEvent.CLICK, this.onClick);
			return;
		}

		private function onDown(event:MouseEvent): void
		{
			this.testLabel.removeEventListener(MouseEvent.MOUSE_OVER, this.onOver);
			this.testLabel.removeEventListener(MouseEvent.MOUSE_OUT, this.onOut);
			this.down = true;
			this.isFirst = true;
			this.mouseStartY = AsWingManager.getStage().mouseY;
			AsWingManager.getStage().addEventListener(MouseEvent.MOUSE_MOVE, this.onMove);
			AsWingManager.getStage().addEventListener(MouseEvent.MOUSE_UP, this.onUp);
			this.chatHeight = this.getHeight();
			var point:Point= new Point(0, 0);
			this.startY = this.localToGlobal(point).y;
		  
		}

		private function onChannel(event:InteractiveEvent): void
		{
		   
			return;
		}

		private function onSynCheck(event:MouseEvent): void
		{
			event.stopImmediatePropagation();
			return;
		}


		private function onOut(event:MouseEvent): void
		{  
			return;
		}
	   
		private function onMove(event:MouseEvent): void
		{
	   
			return;
		}

		private function onOver(event:MouseEvent): void
		{
		 
		}

		private function openFaceBoard(event:Event): void
		{
		   
		}

		private function reAppendSyn(msgList:Array): void
		{
			this.ccGeneral.appendMessageList(msgList);
			return;
		}

		private function onChatInput(event:KeyboardEvent): void
		{
			if (event.keyCode == Keyboard.ENTER)
			{
				if (this.chatInputText.getText() != "")
				{
					this.sendInformation(new AWEvent("ENTER"));
				}
				else
				{
					stage.focus = AsWingManager.getStage();
					this.chatInputText.setText(this.txtAlert);
					ChatGlobalVar.chatting = false;
				}
			}
			else if (event.ctrlKey && event.keyCode > 48  && event.keyCode < 58)
			{
				var button:JToggleButton = idHash.get(ChatUtil.MAP_CHANNEL[event.keyCode - 49]) as JToggleButton;
				if (button)
					button.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
					
				return;
			}
			else if (event.keyCode == Keyboard.DELETE || event.keyCode == Keyboard.BACKSPACE)
			{
				if (this.chatInputText.getLength() == 0)
				{
					ChatGlobalVar.flauntNum = 0;
				}
			}
			else if (event.keyCode == Keyboard.UP)
			{
				if (this.lastChatTxtArr.length == 0)
				{
					return;
				}

				this.currIndex --;
				
				if (this.currIndex < 0)
				{
					this.currIndex = 0;
				}
				this.chatInputText.setText(this.lastChatTxtArr[this.currIndex]);
				AsWingManager.callLater(this.nextChatTxtFun, 5);
			}
			else if (event.keyCode == Keyboard.DOWN)
			{
				if (this.lastChatTxtArr.length == 0)
				{
					return;
				}
				 this.currIndex ++;
				if (this.currIndex >= this.lastChatTxtArr.length)
				{
					this.currIndex = this.lastChatTxtArr.length - 1;
				}
				this.chatInputText.setText(this.lastChatTxtArr[this.currIndex]);
				AsWingManager.callLater(this.nextChatTxtFun, 5);
			}
			return;
		}

		private function onLink(event:TextEvent): void
		{
			trace("link: " + event.text);		
						
			receiver = event.text;
			
			if (!this.menulist)
			{
				this.menulist = MenuListWindow.getWindow(MenuListWindow.T_CHAT);
			}
			
			var point:Point = this.globalToLocal(new Point(stage.mouseX, stage.mouseY));
						
			if (point.y > 100)
			{
				this.menulist.setLocationXY(point.x, 100);
			}
			else
			 this.menulist.setLocationXY(point.x, point.y);
			
			this.menulist.show();
			
			return;
		}

		private function sendInformation(event:AWEvent): void
		{
					
			var chatInfo:Object = new Object();
			var msg:String = this.chatInputText.getText();
			chatInfo.chatType = ChatUtil.getChannel(msg.charAt(0));
			
			if (msg.charAt(0) == ChatUtil.getKey(PRIVATE))
			{
				chatInfo.receiver = this.receiver;
				var i:int = 0;
				while (i < msg.length)
				{
					
					if (msg.charAt(0) == "/" && msg.charAt(i) == " ")
					{
						this.receiver = msg.substring(1, i);
						chatInfo.receiver = this.receiver;
						msg = msg.substring((i + 1), msg.length);
					}
					i += 1;
				}
				if (chatInfo.receiver == "" || chatInfo.receiver == null)
				{
					this.attChatInfoAppend(new ChatVO(HtmlUtil.color("Chưa chọn người đối thoại riêng ! " + "<br/>", Color.YELLOW_S), false));
					this.chatInputText.setText("");
					return;
				}
			}
			else
			{
				 msg = msg.substring(2);
			}
			
			if (msg == "")
			 return;
			
			this.setLastChatTxtArr(this.chatInputText.getText());
			
			synChatInfoAppend(new ChatVO(msg , false));
			
			dispatchEvent(new BZEvent("command", msg));
			this.chatInputText.setText("% ");
			trace("send Cmd");
			return;
		}
		
		public function resetChatText():void
		{
			if (ChatUtil.chatType == PRIVATE)
			{
				this.chatInputText.setText(ChatUtil.getKey() + this.receiver + " ");
				this.chatInputText.setSelection(this.receiver.length + 2, this.receiver.length + 2);
			}
			else
			{
				this.chatInputText.setText(ChatUtil.getKey() + " ");
				this.chatInputText.setSelection( 2,2);
			}
			ChatGlobalVar.chatting = true;
		}

		private function setLastChatTxtArr(msg:String): void
		{
			if (this.lastChatTxtArr.length >= 3)
			{
				this.lastChatTxtArr[0] = this.lastChatTxtArr[1];
				this.lastChatTxtArr[1] = this.lastChatTxtArr[2];
				this.lastChatTxtArr[2] = msg;
			}
			else
			{
				this.lastChatTxtArr.push(msg);
			}
			this.currIndex = this.lastChatTxtArr.length;
			return;
		}

		private function getTypeContent(type:String): String
		{
			return this.typeContent[type];
		}

		private function nextChatTxtFun(): void
		{
			this.chatInputText.setSelection(this.chatInputText.getLength(), this.chatInputText.getLength());
			return;
		}

		public function chatFocus(): void
		{
			stage.focus = this.chatInputText.getTextField();
			ChatGlobalVar.chatting = true;
			AsWingManager.getStage().addEventListener(MouseEvent.CLICK, this.onClick);
			return;
		}

	

		private function initTypeContent(): void
		{
			this.typeContent = { };
			this.idHash = new HashMap();
			this.numHash = new HashMap();
			
			return;
		}

		public function synChatInfoAppend(chatVo:ChatVO): void
		{
			addChatMsg(chatVo.msg,true)
			return;
		}
		
		public function addChatMsg(msg:String , isCmd:Boolean):void
		{
		   var chatVo:ChatVO;
		   if (isCmd)
			{
				chatVo = new ChatVO(HtmlUtil.color("cmd: " + msg ,Color.YELLOW_S));
			}
			else
			{
				chatVo = new ChatVO(HtmlUtil.color(" .. " + msg , Color.CYAN_S));
			}
		   
		   ccGeneral.appendMessage(chatVo);
		}
		
		private function changeTypeStyle(sty:String): String
		{
			return "<a href = \'event:" + sty + "\'>" + "[" + sty + "]" + "</a>";
		}

		public function showLastPrivate(): void
		{
			if (this.lastPrivate == null)
			{
				return;
			}	   
			return;
		}

		public function recordInfo(channel:int, chatVo:ChatVO): void
		{
			return;
		}

		private function onUp(event:MouseEvent): void
		{
			AsWingManager.getStage().removeEventListener(MouseEvent.MOUSE_MOVE, this.onMove);
			this.down = false;
			var heigt:Number = this.height - this.topBtnPanel.height - this.bottomBtnPanel.height;
			this.ccGeneral.setSizeWH(303, heigt);
			this.ccGeneral.updateUI();
			this.ccPerson.setSizeWH(303, heigt);
			this.ccPerson.updateUI();
			AsWingManager.getStage().removeEventListener(MouseEvent.MOUSE_UP, this.onUp);
			this.testLabel.addEventListener(MouseEvent.MOUSE_OVER, this.onOver);
			return;
		}

		private function onKeyboard(event:KeyboardEvent): void
		{
			if (event.keyCode == Keyboard.ENTER)
			{
				if (event.target is TextField)
				{
					return;
				}
				if (this.chatInputText.getText() == "")
				{
					stage.focus = AsWingManager.getStage();
					return;
				}
				stage.focus = this.chatInputText.getTextField();
				if (this.chatInputText.getText() == this.txtAlert)
				{
					this.chatInputText.setText("");
				}
				ChatGlobalVar.chatting = true;
				AsWingManager.getStage().addEventListener(MouseEvent.CLICK, this.onClick);
			}
			return;
		}

		private function onClick(event:MouseEvent): void
		{
			AsWingManager.getStage().removeEventListener(MouseEvent.CLICK, this.onClick);
			this.currIndex = this.lastChatTxtArr.length;
			if (event.target.name == "Button" || event.target.name == "TextField" || event.target.name == "FaceBtn")
			{
				stage.focus = this.chatInputText.getTextField();
				AsWingManager.getStage().addEventListener(MouseEvent.CLICK, this.onClick);
				if (this.chatInputText.getText() == this.txtAlert)
				{
					this.resetChatText();
				}
				ChatGlobalVar.chatting = true;
				return;
			}
			else
			{
				if (!this.isInserFace)
				{
					stage.focus = AsWingManager.getStage();
				}
				this.isInserFace = false;
				if (this.chatInputText.getText() == "")
				{
					this.chatInputText.setText(this.txtAlert);
				}
				ChatGlobalVar.chatting = false;
				AsWingManager.getStage().removeEventListener(MouseEvent.CLICK, this.onClick);
			}
			return;
		}

		public static function getInstance(): ChatPanel
		{
			return instance;
		}
		
		public function insertFaceToInput(fname:String):void 
		{
			var idx:int = 0;
			idx = this.chatInputText.getTextField().caretIndex;
			this.chatInputText.replaceText(idx, idx, fname);
			stage.focus = this.chatInputText.getTextField();
			this.isInserFace = true;
			
			this.chatInputText.setSelection( this.chatInputText.getText().length, this.chatInputText.getText().length);
			
			return;
		}
		
		public function priChat(name:String): void
		{
			this.lastPrivate = name;		  
			this.receiver = name;
			stage.focus = this.chatInputText.getTextField();
			
			var button:JToggleButton = idHash.get(PRIVATE) as JToggleButton;
			if (button)
				button.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
						
			resetChatText();
			return;
		}

	}
}
