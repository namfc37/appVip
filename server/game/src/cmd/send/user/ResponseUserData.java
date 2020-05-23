package cmd.send.user;

import cmd.Message;
import model.AirShip;
import model.PrivateShop;
import model.UserGame;
import model.mail.MailBox;
import model.object.UserGuild;
import util.Time;

public class ResponseUserData extends Message
{
    public ResponseUserData (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseUserData packData (String userName, UserGame game, long coin, PrivateShop privateShop, AirShip airShip, MailBox mailBox, UserGuild userGuild, boolean userLocalPayment)
    {
        put(KEY_COIN, coin);
        put(KEY_GAME, game);
        put(KEY_PRIVATE_SHOP, privateShop);
        put(KEY_AIRSHIP, airShip);
        put(KEY_MAIL_BOX, mailBox);
        put(KEY_USER_ID, game.getUserId());
        put(KEY_USER_NAME, userName);
        put(KEY_TIME_MILLIS, Time.getTimeMillis());
        put(KEY_USE_LOCAL_PAYMENT, userLocalPayment);
        put(KEY_JACK_SHOP, game.getJackShop());
        put(KEY_JACK_MACHINE, game.getJackMachine());
        put(KEY_GUILD, userGuild);

        return this;
    }
}
