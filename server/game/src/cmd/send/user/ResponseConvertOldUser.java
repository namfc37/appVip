package cmd.send.user;

import cmd.Message;

public class ResponseConvertOldUser extends Message
{
    public ResponseConvertOldUser (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseConvertOldUser packData (int uid)
    {
        put(KEY_UID, uid);
        return this;
    }
}
