package view.components.chatSystem
{
	public class ChatFacePool
	{
		private var fieldPools:Array;
		private var length:int = 0;
		private var _width:int;
		private static var instance:ChatFacePool;
		public static var width:int;

		public function ChatFacePool()
		{
			this.fieldPools = [];
			return;
		}

		public function getFaceField(): ChatFaceField
		{
			if (this.length > 0)
			{
				this.length --;
				return this.fieldPools.pop();
			}
			var cff:ChatFaceField = new ChatFaceField();
			cff.getTextField().width = width;
			cff.setWordWrap(true);
			cff.getTextField().selectable = true;
			cff.getTextField().mouseWheelEnabled = false;
			cff.filters = [ChatFaceField.CHAT_FILTER];
			cff.x = 0;
			cff.visible = false;
			cff.y = 0;
			return cff;
		}

		public function returnFaceField(cff:ChatFaceField): void
		{
			this.length ++;
			this.fieldPools[this.length] = cff;
			return;
		}

		public static function getInstance(): ChatFacePool
		{
			if (!instance)
			{
				instance = new ChatFacePool;
			}
			return instance;
		}

	}
}
