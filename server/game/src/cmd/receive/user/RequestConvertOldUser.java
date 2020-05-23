package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestConvertOldUser extends Command
{
    public String facebookId;

    public RequestConvertOldUser (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        facebookId = readString(KEY_UID);
    }
}
