package cmd.send.chat;

import cmd.BaseMessage;
import cmd.Message;
import model.AirShip;
import util.Time;

public class ResponseChatPrivate extends Message
{
    public ResponseChatPrivate (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int fromUser, int toUser, String data)
    {
        put(KEY_USER_ID, fromUser);
        put(KEY_FRIEND_ID, toUser);
        put(KEY_DATA, data);
        put(KEY_TIME, Time.getUnixTime());

        return toBaseMessage();
    }
}
