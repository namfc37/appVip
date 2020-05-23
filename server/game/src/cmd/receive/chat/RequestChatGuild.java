package cmd.receive.chat;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestChatGuild extends Command
{
    public int type;
    public String data;

    public RequestChatGuild (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        type = readInt(KEY_TYPE);
        data = readString(KEY_DATA);
    }
}
