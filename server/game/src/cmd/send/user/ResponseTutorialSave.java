package cmd.send.user;

import cmd.Message;

public class ResponseTutorialSave extends Message
{
    public ResponseTutorialSave (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTutorialSave packData ()
    {
        return this;
    }
}
