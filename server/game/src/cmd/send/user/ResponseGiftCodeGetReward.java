package cmd.send.user;

import cmd.Message;
import model.mail.MailBox;

public class ResponseGiftCodeGetReward extends Message
{
    public ResponseGiftCodeGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseGiftCodeGetReward packData (String id, MailBox mail)
    {
        put(KEY_UID, id);
        put(KEY_MAIL_BOX, mail);

        return this;
    }
}
