package cmd.send.user;

import cmd.Message;
import model.mail.MailBox;

public class ResponseMailMarkRead extends Message
{
    public ResponseMailMarkRead (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMailMarkRead packData (MailBox mailBox)
    {
        put(KEY_MAIL_BOX, mailBox);

        return this;
    }
}
