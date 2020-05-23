package cmd.send.user;

import cmd.Message;
import model.Payment;
import model.mail.MailBox;
import model.object.PigBank;
import model.object.VIP;

public class ResponseUpdateCoin extends Message
{
    public ResponseUpdateCoin (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseUpdateCoin packData (long coin, long gold, Payment payment, MailBox mailBox, PigBank pigBank, VIP vip)
    {
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_PAYMENT, payment);
        put(KEY_MAIL_BOX, mailBox);
        put(KEY_PIG_BANK, pigBank);
        put(KEY_VIP, vip);

        return this;
    }
}
