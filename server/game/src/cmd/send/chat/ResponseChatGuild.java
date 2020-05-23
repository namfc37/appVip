package cmd.send.chat;

import cmd.BaseMessage;
import cmd.Message;
import util.Time;

public class ResponseChatGuild extends Message
{
    public ResponseChatGuild (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int fromUser)
    {
        put(KEY_USER_ID, fromUser);

        return toBaseMessage();
    }

    public BaseMessage packData (int fromUser, int type, String data, long uid)
    {
        put(KEY_USER_ID, fromUser);
        put(KEY_TYPE, type);
        put(KEY_DATA, data);
        put(KEY_TIME, Time.getUnixTime());
        put(KEY_UID, uid);

        return toBaseMessage();
    }
}
