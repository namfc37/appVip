package cmd.send.chat;

import cmd.BaseMessage;
import cmd.ErrorConst;
import cmd.Message;
import data.CmdDefine;

public class ResponseChatOffline extends Message
{
    public ResponseChatOffline ()
    {
        super(CmdDefine.CHAT_OFFLINE, ErrorConst.SUCCESS);
    }

    public BaseMessage packData (int userId)
    {
        put(KEY_USER_ID, userId);

        return toBaseMessage();
    }
}
