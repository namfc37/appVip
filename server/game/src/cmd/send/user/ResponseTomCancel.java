package cmd.send.user;

import cmd.Message;
import model.object.Tom;

public class ResponseTomCancel extends Message
{
    public ResponseTomCancel (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTomCancel packData (Tom tom)
    {
        put(KEY_TOM, tom);

        return this;
    }
}
