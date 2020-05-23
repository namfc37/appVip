package view.components.chatSystem
{
	import flash.events.*;
	import flash.system.*;
	import flash.utils.*;

	import view.components.ui.ChatPanel;
 
	import org.aswing.*;


	public class MenuListWindow extends Box
	{
		private var btnInvite:JLabelButton;
			
		private var removeFun:Function;
		private var menuList:Array;
		private var list:Dictionary = new Dictionary();
		private var addFun:Function;
		
		private static var list:Dictionary = new Dictionary();
   
		private static const INVITE:String = "Mời nhóm";
		private static const FRIEND:String = "Bạn bè";
		private static const CHAT:String = "Chat riêng";
		private static const INFO:String = "Thông tin";
		private static const FIGHT:String = "Thách đấu";
		private static const MAIL:String = "Gửi mail";
				
		 
		public static const T_DEFAULT:Array = [INFO, CHAT, INVITE, MAIL, FRIEND];
		public static const T_CHAT:Array = [INFO, CHAT, INVITE, MAIL, FRIEND,FIGHT];

	   
		public function MenuListWindow(mnlist:Array)
		{
			super(BoxLayout.Y_AXIS);
			
			this.setSizeWH(64, mnlist.length * 18.5);
			this.menuList = mnlist;
			this.init();

			return;
		}

		private function addBlack(): void
		{			
			return;
		}

		private function dShow(): void
		{
			
			return;
		}

		public function hide(): void
		{
			if (!parent)
			{
				return;
			}
			if (this.removeFun == null)
			{
				ChatGlobalVar.rootSprite.removeChild(this);
			}
			else
			{
				this.removeFun(this);
			}
			AsWingManager.getStage().removeEventListener(MouseEvent.CLICK, this.onClick);
			return;
		}

		public function setAddRemove(addFun:Function, removeFun:Function): void
		{
			this.addFun = addFun;
			this.removeFun = removeFun;
			return;
		}

		private function invite(): void
		{
			
		}

		private function init(): void
		{
			var name:String = null;
			var lblButtion:JLabelButton = null;
			var i:int = 0;
			while (i < this.menuList.length)
			{
				
				name = this.menuList[i];
				lblButtion = new JLabelButton(name);
				lblButtion.addActionListener(this.onItemChange);
				lblButtion.setRollOverColor(ASColor.YELLOW);
				if (name == INVITE)
				{
					this.btnInvite = lblButtion;
				}
				lblButtion.setName(name);
				append(lblButtion);
				i += 1;
			}
			doLayout();
			return;
		}

		private function fight(): void
		{
			return;
		}

		private function addFriend(): void
		{
			return;
		}

	 
		private function onItemChange(event:Event): void
		{
			var name:String = event.currentTarget.getName();
			switch(name)
			{
				case INFO:
				{
					this.info();
					break;
				}
				case CHAT:
				{
					this.priChat();
					break;
				}
				case INVITE:
				{
					this.invite();
					break;
				}
				case MAIL:
				{
					this.sendMail();
					break;
				}
				case FRIEND:
				{
					this.addFriend();
					break;
				}
			   
				case FIGHT:
				{
					this.fight();
					break;
				}
				default:
				{
					break;
				}
			}
			this.hide();
			return;
		}

		private function priChat(): void
		{		   
			ChatPanel.getInstance().priChat(ChatPanel.getInstance().receiver);
			return;
		}

		private function onClick(event:Event): void
		{
			this.hide();
			return;
		}

		public function setData(data:Object): void
		{
			return;
		}

		private function info(): void
		{
			return;
		}

   
		private function sendMail(): void
		{
			return;
		}

		private function deal(): void
		{
			return;
		}

		public function show(): void
		{
			setTimeout(this.dShow, 50);
			return;
		}

		public static function getWindow(mnlist:Array): MenuListWindow
		{
			var mnWindow:MenuListWindow = list[mnlist];
			if (!mnWindow)
			{
				mnWindow = new MenuListWindow(mnlist);
				list[mnlist] = mnWindow;
			}
			return mnWindow;
		}

	}
}
