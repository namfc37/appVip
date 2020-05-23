package cmd.send.user;

import cmd.Message;
import model.mail.MailBox;

public class ResponseMailNotify extends Message
{
    public ResponseMailNotify (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMailNotify packData (MailBox mailBox)
    {
        put(KEY_MAIL_BOX, mailBox);

        return this;
    }
}
