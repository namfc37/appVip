package view.components.chatSystem
{
	import com.libs.controls.*;
	import flash.display.*;
	import flash.events.*;
	import org.aswing.*;
	import org.aswing.border.*;
	import view.components.ui.ChatPanel;
	
	
	/**
	 * Chứa bảng mặt cười hiện lên cho User Chọn
	 */
	
	public class ChatFaceBoard extends JPopup
	{
		private var isAddEvent:Boolean = false;
		private var total:Array;
		private var isCreate:Boolean = false;
		private var isRoll:Boolean = false;

		public function ChatFaceBoard(layout:LayoutManager = null)
		{
			super(layout);
			var lnBodr:LineBorder = new LineBorder();
			lnBodr.setColor(new ASColor(16777215, 0.3));
			this.setSizeWH(240, 90);
			this.setOpaque(true);
			this.setBorder(lnBodr);
			this.setBackgroundDecorator(new SolidBackground(new ASColor(3355443, 0.75)));
			return;
		}

		public function destroy(): void
		{
			if (this.isAddEvent)
			{
				FrameTimerManager.getTimer().remove(this.checkIsOver);
				this.removeEventListener(MouseEvent.MOUSE_OUT, this.onMouseOut);
				this.removeEventListener(MouseEvent.MOUSE_OVER, this.onMouseOver);
				this.isAddEvent = false;
			}
			hide();
			this.isRoll = false;
			this.facePlayControl(false);
			dispose();
			return;
		}

		private function checkRollout(): void
		{
			if (!this.isAddEvent)
			{
				FrameTimerManager.getTimer().add(2, 0, this.checkIsOver);
				this.addEventListener(MouseEvent.MOUSE_OUT, this.onMouseOut);
				this.addEventListener(MouseEvent.MOUSE_OVER, this.onMouseOver);
				this.isAddEvent = true;
			}
			return;
		}

		private function insertSmiley(event:MouseEvent): void
		{
			var sml:Sprite = event.target as Sprite;
			if (!sml)
			{
				return;
			}
			var name:String = sml.name;
			if (!name)
			{
				return;
			}
			var fname:String = name.replace("f", "/");
			ChatPanel.getInstance().insertFaceToInput(fname);
			if (this.isShowing())
			{
				this.destroy();
			}
			return;
		}

		private function onMouseOut(event:MouseEvent): void
		{
			this.isRoll = false;
			return;
		}

		private function checkIsOver(): void
		{
			if (!this.isRoll)
			{
				this.destroy();
			}
			return;
		}

		public function ThisBusy(isLoad:Boolean, loadContent:String): void
		{
		   
			return;
		}

		private function onMouseOver(event:MouseEvent): void
		{
			this.isRoll = true;
			return;
		}

		private function facePlayControl(isPlay:Boolean): void
		{
			var sml:Sprite = null;
			var mvSml:MovieClip = null;
			var idx:uint = 0;
			while (idx < this.total.length)
			{
				
				sml = this.total[idx] as Sprite;
				if (!sml)
				{
				}
				else
				{
					if (sml is MovieClip)
					{
						mvSml = sml as MovieClip;
					}
					else
					{
						mvSml = sml.getChildAt(0) as MovieClip;
						if (!mvSml)
						{
						}
					}
					if (isPlay)
					{
						mvSml.play();
					}
					else
					{
						mvSml.stop();
					}
				}
				idx = idx + 1;
			}
			return;
		}

		public function create(): void
		{
			var sml:Sprite = null;
			this.show();
			this.checkRollout();
			if (this.isCreate)
			{
				this.facePlayControl(true);
				return;
			}
			this.ThisBusy(true, "load");
			this.isCreate = true;
			this.total = [];
			var idx:int = 0;
			while (idx < ChatFaceUtil.Smileys_Names.length)
			{
				//trace("getChatFaceUtil");
				sml = ChatFaceUtil.getFace(ChatFaceUtil.Smileys_Names[idx]);
				addChild(sml);
				this.total.push(sml);
				sml.x = idx % 9 * 25 + 8;
				sml.y = Math.floor(idx / 9) * 25 + 10;
				sml.buttonMode = true;
				sml.addEventListener(MouseEvent.CLICK, this.insertSmiley);
				idx += 1;
			}
			this.ThisBusy(false, "get");
			return;
		}

	}
}
