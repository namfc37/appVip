package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseStockUpgrade extends Message
{
    public ResponseStockUpgrade (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseStockUpgrade packData (byte stockId, int stockLevel, long coin, MapItem updateItem)
    {
        put(KEY_STOCK_ID, stockId);
        put(KEY_STOCK_LEVEL, stockLevel);
        put(KEY_COIN, coin);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
