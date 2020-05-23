package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildSendMail extends Command
{
    public String msg;

    public RequestGuildSendMail (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        msg = readString(KEY_TXT);
    }
}
