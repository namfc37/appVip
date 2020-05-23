package cmd.send.user;

import cmd.Message;
import model.mail.MailBox;

public class ResponseMailDelete extends Message
{
    public ResponseMailDelete (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMailDelete packData (MailBox mailBox)
    {
        put(KEY_MAIL_BOX, mailBox);

        return this;
    }
}
