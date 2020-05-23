package cmd.receive.chat;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestChatPrivate extends Command
{
    public int friendId;
    public String data;

    public RequestChatPrivate (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        friendId = readInt(KEY_FRIEND_ID);
        data = readString(KEY_DATA);
    }
}
