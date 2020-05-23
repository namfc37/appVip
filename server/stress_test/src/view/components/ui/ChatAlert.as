package view.components.ui
{

	public class ChatAlert
	{
		public static const SYNATT:int = 4;
		public static const ALL:int = 0;
		public static const CURRENT:int = 5;
		public static const SYNTHESIZE:int = 1;
		public static const ATTENTION:int = 2;

		public function ChatAlert()
		{
			return;
		}

		public static function show(msg:String, importantLevel:int = 0): void
		{
			if (ChatPanel.getInstance() == null)
			{
				return;
			}
			var chatVo:ChatVO = new ChatVO(msg + "<br/>", false);
			switch(importantLevel)
			{
				case ALL:
				{
					if (ChatPanel.getInstance().allTogleBtn.isSelected() == true)
					{
						ChatPanel.getInstance().synChatInfoAppend(chatVo);
					}
					else if (ChatPanel.getInstance().privateBtn.isSelected() == true)
					{
						ChatPanel.getInstance().recordInfo(SYNTHESIZE, chatVo);
					}
					break;
				}
				case SYNTHESIZE:
				{
					if (ChatPanel.getInstance().allTogleBtn.isSelected() == true)
					{
						ChatPanel.getInstance().synChatInfoAppend(chatVo);
					}
					else if (ChatPanel.getInstance().privateBtn.isSelected() == true)
					{
						ChatPanel.getInstance().recordInfo(SYNTHESIZE, chatVo);
					}
					break;
				}
				case ATTENTION:
				{
					if (ChatPanel.getInstance().allTogleBtn.isSelected() == true)
					{
					}
					else if (ChatPanel.getInstance().privateBtn.isSelected() == true)
					{
					}
					break;
				}
				case SYNATT:
				{
					if (ChatPanel.getInstance().allTogleBtn.isSelected() == true)
					{
						ChatPanel.getInstance().synChatInfoAppend(chatVo);
					}
					else if (ChatPanel.getInstance().privateBtn.isSelected() == true)
					{
						ChatPanel.getInstance().recordInfo(SYNTHESIZE, chatVo);
					}
					break;
				}
				case CURRENT:
				{
					if (ChatPanel.getInstance().allTogleBtn.isSelected() == true)
					{
						ChatPanel.getInstance().synChatInfoAppend(chatVo);
					}
					else if (ChatPanel.getInstance().privateBtn.isSelected() == true)
					{
						ChatPanel.getInstance().attChatInfoAppend(chatVo);
					}
					break;
				}
				default:
				{
					break;
				}
			}
			return;
		}

	}
}
