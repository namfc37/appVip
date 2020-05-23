package view.components.chatSystem
{
	import com.libs.utils.Color;
	import flash.text.*;
	import flash.utils.*;
	import view.components.ui.ChatVO;

	import org.aswing.*;
	import org.aswing.geom.*;

	public class ChatContainer extends JScrollPane
	{
		private var lastY:int = 0;
		private var currScreenHeight:int;
		private var _dicEndIndex:int = 0; 
		private var _dicStarIndex:int = 0;
		private var isFirst:Boolean = false;
		private var _isShowing:Boolean = false;
		private var _Widht:int = 0;
		private var needAdjust:Boolean = false;
		private var _Height:int = 0;
		private var isAdjusting:Boolean = false;
		private var _width:int = 0;
		
		
		private var _container:Container;
		private var scrollBar:JScrollBar;
		private var textWordFormat:TextFormat;
		private var _defaultTF:TextFormat;
		private var _childs:Dictionary;
		
		private var chatFacePool:ChatFacePool;
		private var tmpChild:ChatFaceField;
		
		private var removeList:Array;
		private var addList:Array;		
	   	
		private const MAX_SCREEN_HEIGHT:int = 1280;
		private const PRE_CLEAN_HEIGHT:int = 960;
		
		private var _id:int;
		
		public static var instanceDic:Dictionary = new Dictionary();

		public function ChatContainer(width:int = 500 , height:int = 500)
		{
			this.removeList = [];
			this.addList = [];
			
			this.textWordFormat = new TextFormat();
			this.textWordFormat.size = 12;
			this.textWordFormat.leading = 4;
			this.textWordFormat.align = TextFormatAlign.JUSTIFY;
			this.textWordFormat.font = "Arial";
			this.textWordFormat.color = 0x00FF00;
			
			this._Widht = width - 15;
			ChatFacePool.width = this._Widht;
			this._container = new Container();
			this._container.setWidth(this._Widht);
			
			var vPort:JViewport= new JViewport(null);
			vPort.setVerticalAlignment(AsWingConstants.TOP);
			super(vPort, JScrollPane.SCROLLBAR_ALWAYS, JScrollPane.SCROLLBAR_NEVER);
			this._width = width;
			this.setSize(new IntDimension(width, height));
			
			this.chatFacePool = ChatFacePool.getInstance();
			
			var spLayout:ScrollPaneLayout = new ScrollPaneLayout(ScrollPaneLayout.BOTTOM_LEFT);
			this.setLayout(spLayout);
			this.append(this._container);
			this.scrollBar = this.getVerticalScrollBar();
			this._childs = new Dictionary();
			return;
		}

		override public function setSize(dimens:IntDimension): void
		{
			super.setSize(dimens);
			this._Height = dimens.height;
			return;
		}

		public function appendMessage(chatVo:ChatVO): void
		{
			var cff:ChatFaceField = this.getCFF(chatVo.msg, chatVo.face);
			//cff.visible = true;
			this._container.addChild(cff);
			this._childs[this._dicEndIndex] = cff;
			this.addList.push(this._dicEndIndex);
			this.needAdjust = true;
  
			this._dicEndIndex ++;
			this.adjustLocat();
		   this.checkOver(this._dicStarIndex);
			return;
		}

		private function adjustLocat(): void
		{
			var cff:ChatFaceField = null;
			var iy:int = 0;
			var ih:int = 0;
			if (!this.needAdjust || this.isAdjusting)
			{
				return;
			}
			//trace("adj");
			var scVlue:int = this.scrollBar.getValue();
			var scHei:Boolean = scVlue >= this.scrollBar.getMaximum() - this._Height - 80;
			this.isAdjusting = true;
			var rmIdx:int = 0;
			var tpIdx:int = -1;
			while (this.removeList.length)
			{
				
				rmIdx = this.removeList.shift();
				cff = this._childs[rmIdx];
				if (cff)
				{
					this._container.removeChild(cff);
					cff.setText("");
					this.chatFacePool.returnFaceField(cff);
					this._childs[rmIdx] = null;
					if (tpIdx == -1 || rmIdx < tpIdx)
					{
						tpIdx = rmIdx;
					}
					if (this._dicStarIndex > rmIdx)
					{
						continue;
					}
					this._dicStarIndex = rmIdx + 1;
				}
			}
			if (tpIdx != -1)
			{
				iy = 0;
				ih = 0;
				while (tpIdx < this._dicEndIndex)
				{
					
					cff = this._childs[tpIdx];
					if (cff)
					{
						cff.y = iy;
						ih = cff.getTextHeight();
						iy = iy + ih;
						cff.visible = true;
					}
					tpIdx += 1;
				}
				this.lastY = iy - ih;
			}
			var leng:uint = this.addList.length;
			var i:uint = 0;
			while (i < leng)
			{
				
				rmIdx = this.addList.shift();
				cff = this._childs[rmIdx];
				if (cff)
				{
					cff.y = this.lastY;
					cff.visible = true;
					this.lastY = this.lastY + cff.getTextHeight();
				}
				i = i + 1;
			}
			this._container.setHeight(this.lastY + 10);
			this.updateUI();
			if (scVlue != 0 && scHei)
			{
				AsWingManager.callLater(this.synNextFun, 50);
			}
			if (this._dicEndIndex > 100 && this._childs[100] == null)
			{
				this.replaceChild();
			}
			this.needAdjust = false;
			this.isAdjusting = false;
			return;
		}

		private function synNextFun(): void
		{
			this.scrollBar.setValue(this.scrollBar.getMaximum());
			return;
		}

		private function getCFF(msg:String, smil:Boolean): ChatFaceField
		{
			var cff:ChatFaceField = this.chatFacePool.getFaceField();
			cff.getTextField().defaultTextFormat = this.textWordFormat;
			cff.isHaveFace = smil;
			cff.setHtmlText(msg);
			//trace("get" + msg);
			return cff;
		}

		private function replaceChild(): void
		{
			var start:int = this._dicStarIndex;
			var i:int = this._dicStarIndex;
			while (i < this._dicEndIndex)
			{
				
				this._childs[i - start] = this._childs[i];
				i += 1;
			}
			this._dicEndIndex = this._dicEndIndex - this._dicStarIndex;
			this._dicStarIndex = 0;
			return;
		}

		public function appendMessageList(msgLst:Array): void
		{
			var cff:ChatFaceField = null;
			var chatVo:ChatVO = null;
			var leng:uint = msgLst.length;
			var iH:int = this._container.getHeight();
			var idx:uint = 0;
			while (idx < leng)
			{
				
				chatVo = msgLst[idx];
				cff = this.getCFF(chatVo.msg, chatVo.face);
				this._container.addChild(cff);
				this._childs[this._dicEndIndex] = cff;
				this.addList.push(this._dicEndIndex);
				this._dicEndIndex ++;
				idx = idx + 1;
			}
			this.needAdjust = true;
			this.adjustLocat();
			this.checkOver(this._dicStarIndex);
			return;
		}

		private function firstTimeScorll(): void
		{
			if (this.currScreenHeight > 150 && !this.isFirst)
			{
				this.isFirst = true;
				AsWingManager.callLater(this.synNextFun, 50);
			}
			else
			{
				return;
			}
			return;
		}

		private function checkOver(idx:int, over:Boolean = false): void
		{
			this.tmpChild = this._childs[idx];
			if (this.tmpChild)
			{
				this.currScreenHeight = this.lastY - this.tmpChild.y;
				if (this.currScreenHeight > this.MAX_SCREEN_HEIGHT || over && this.currScreenHeight > this.PRE_CLEAN_HEIGHT)
				{
					this.removeList.push(idx);
					this.checkOver((idx + 1), true);
					this.needAdjust = true;
				}
			}
			this.firstTimeScorll();
			return;
		}
		
		public function get id():int 
		{
			return _id;
		}
		
		public function set id(value:int):void 
		{
			_id = value;
			instanceDic[_id] = this;
		}
		
		public static function getChat(id:int):ChatContainer
		{
			if (instanceDic.hasOwnProperty(id))
			 return instanceDic[id] as ChatContainer;
			return null;
		}
	}
}
