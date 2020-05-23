package view.components.chatSystem
{
	import flash.display.*;
	import flash.filters.GlowFilter;
	import flash.geom.*;
	import flash.text.*;

	/**
	 * thực thi dòng hiển chat hiển thị mặt cười
	 */
	public class ChatFaceField extends Sprite
	{
		private var isPainting:Boolean = false;
		protected var _tf:TextField;
		private var recordHeight:int = 0;
		private var _htmlText:String;
		protected var waitForPaint:Array;
		protected var facesContainer:Sprite;
		protected var _faces:Array;
		public var lineHeight:int = 0;
		public var isHaveFace:Boolean = true;
		
		public static const CHAT_FILTER:GlowFilter = new GlowFilter(1842204, 1, 2, 2, 5);

		public function ChatFaceField(width:int = 0, height:int = 0, type:String = "dynamic")
		{
			this.waitForPaint = [];
			this._tf = new TextField();
			this._tf.type = type;
			this._tf.multiline = true;
			if (width)
			{
				this._tf.width = width;
			}
			if (height)
			{
				this._tf.height = height;
			}
			this.addChild(this._tf);
			this.facesContainer = new Sprite();
			this.facesContainer.y = -5;
			this.addChild(this.facesContainer);
			return;
		}

		protected function _insertSprite(fname:String, idx:int = -1): Sprite
		{
			var fspr:Sprite = ChatFaceUtil.getFace(fname);
			fspr.cacheAsBitmap = true;
			if (idx < 0 || idx > this._tf.length)
			{
				idx = this._tf.length;
			}
			this._tf.setTextFormat(ChatFaceUtil.PlaceHolderFormat, idx, (idx + 1));
			var frec:Rectangle = this._tf.getCharBoundaries(idx);
			if (this._tf.getCharBoundaries(idx))
			{
				this.appendAndLocat(fspr, frec);
			}
			else
			{
				this.waitForPaint.push({s:fspr, i:idx});
			}
			return fspr;
		}

		public function setSelection(bgIdx:int, enIdx:int): void
		{
			this._tf.setSelection(bgIdx, enIdx);
			return;
		}

		private function getFacesAndMakeText(msg:String): void
		{
			var mStr:String = null;
			var mIdx:int = 0;
			var mLen:int = 0;
			this._faces = [];
			var mathArr:Array = msg.match(ChatFaceUtil.getRegExp);
			var idx:int = 0;
			if (mathArr)
			{
				mStr = "";
				mIdx = 0;
				mLen = mathArr.length > 5 ? (5): (mathArr.length);
				while (idx < mLen)
				{
					
					mStr = mathArr[idx];
					mIdx = msg.indexOf(mStr, mIdx);
					this._faces[idx] = {i:mIdx, f:mStr};
					msg = msg.replace(mStr, ChatFaceUtil.Placeholder);
					this._tf.replaceText(mIdx, mIdx + mStr.length, ChatFaceUtil.Placeholder);
					idx += 1;
				}
			}
			return;
		}

		public function getTextField(): TextField
		{
			return this._tf;
		}

		protected function doLaterPainter(): void
		{
			var pObj:Object = null;
			var prec:Rectangle = null;
			if (this.isPainting)
			{
				return;
			}
			this.isPainting = true;
			var plen:uint = this.waitForPaint.length;
			var idx:int = 0;
			while (idx < plen)
			{
				
				pObj = this.waitForPaint[idx];
				prec = this._tf.getCharBoundaries(pObj.i);
				if (prec)
				{
					this.appendAndLocat(pObj.s, prec);
					this.waitForPaint.splice(idx, 1);
					idx = idx - 1;
					plen = plen - 1;
				}
				idx += 1;
			}
			this.isPainting = false;
			return;
		}

		public function setMaxChars(maxChar:int): void
		{
			this._tf.maxChars = maxChar;
			return;
		}

		public function getLength(): int
		{
			return this._tf.length;
		}

		private function appendAndLocat(spr:Sprite, rec:Rectangle): void
		{
			spr.x = rec.x;
			spr.y = rec.y;
			if (this.recordHeight < spr.y)
			{
				this.recordHeight = spr.y;
			}
			this.facesContainer.addChild(spr);
			return;
		}

		public function getText(): String
		{
			return this._tf.text;
		}

		public function appendText(param1:String): void
		{
			this._tf.appendText(param1);
			return;
		}

		private function cleanFaces(): void
		{
			var fspr:Sprite = null;
			while (this.facesContainer.numChildren)
			{
				
				fspr = this.facesContainer.removeChildAt(0) as Sprite;
				ChatFaceUtil.returnFace(fspr);
			}
			this._faces = [];
			this.waitForPaint = [];
			this.recordHeight = 0;
			return;
		}

		public function getHtmlText(): String
		{
			return this._htmlText;
		}

		public function setText(param1:String): void
		{
			this._tf.text = param1;
			this.cleanFaces();
			return;
		}

		public function getTextHeight(): int
		{
			var tHeight:Number = this._tf.textHeight;
			if (tHeight > 18)
			{
				tHeight = tHeight + 4;
			}
			var rHei:int = 0;
			if (this.recordHeight > 0)
			{
				rHei = this.recordHeight + ChatFaceUtil.FACE_HEIGHT - 4;
			}
			return tHeight > rHei ? (tHeight): (rHei);
		}

		private function makeFace(): void
		{
			var idx:int = 0;
			if (!this._faces || this._faces.length <= 0)
			{
				return;
			}
			while (idx < this._faces.length)
			{
				
				this._insertSprite(this._faces[idx].f, this._faces[idx].i);
				idx += 1;
			}
			return;
		}

		public function setWordWrap(ww:Boolean): void
		{
			this._tf.wordWrap = ww;
			return;
		}

		public function setHtmlText(htmlTxt:String): void
		{
			this._tf.htmlText = htmlTxt;
			if (this.isHaveFace)
			{
				this.getFacesAndMakeText(this._tf.text);
				this.makeFace();
			}
			this._tf.height = this._tf.textHeight + 8;
			return;
		}

	}
}
