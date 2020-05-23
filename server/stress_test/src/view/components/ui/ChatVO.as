package view.components.ui
{
	public class ChatVO
	{
		public var msg:String;
		public var face:Boolean;

		public function ChatVO(msg:String, useFace:Boolean = true)
		{
			this.msg = msg;
			if (ChatGlobalVar.chatFace)
			{
				this.face = useFace;
			}
			else
		    {
                this.face = false;
            }
            return;
        }

    }
}
