package cmd.send.chat;

import cmd.BaseMessage;
import cmd.ErrorConst;
import cmd.Message;
import data.CmdDefine;
import util.Time;

import java.util.List;

public class ResponseChatOnline extends Message
{
    public ResponseChatOnline ()
    {
        super(CmdDefine.CHAT_ONLINE, ErrorConst.SUCCESS);
    }

    public BaseMessage packData (List<Integer> users)
    {
        putInts(KEY_USER_ID, users);

        return toBaseMessage();
    }

    public BaseMessage packData (int userId)
    {
        int[] users = new int[1];
        users[0] = userId;
        put(KEY_USER_ID, users);

        return toBaseMessage();
    }
}
