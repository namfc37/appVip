package cmd.send.user;

import cmd.ErrorConst;
import cmd.Message;
import data.CmdDefine;
import model.Payment;
import model.UserGame;
import model.object.OrderManager;
import util.collection.MapItem;

public class ResponseLevelUp extends Message
{
    public ResponseLevelUp ()
    {
        super(CmdDefine.LEVEL_UP, ErrorConst.SUCCESS);
    }

    public ResponseLevelUp packData (UserGame game, long coin, MapItem bonusItem, MapItem updateItem, OrderManager order, Payment payment)
    {
        put(KEY_LEVEL, game.getLevel());
        put(KEY_EXP, game.getExp());
        put(KEY_COIN, coin);
        put(KEY_GOLD, game.getGold());
        put(KEY_REPUTATION, game.getReputation());
        put(KEY_BONUS_ITEMS, bonusItem);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_ORDER, order);
        put(KEY_PAYMENT, payment);

        return this;
    }
}
