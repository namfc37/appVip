package exportexcel.sheet;

import com.google.gson.JsonArray;

public class PrivateShop extends ParseWorkbook
{
    public PrivateShop (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        int PS_NUM_FRIEND_SLOT = Define.miscJson.getAsJsonPrimitive("PS_NUM_FRIEND_SLOT").getAsInt();
        int PS_NUM_BUY_SLOT = Define.miscJson.getAsJsonPrimitive("PS_NUM_BUY_SLOT").getAsInt();
        JsonArray PS_REQUIRED_FRIEND = Define.miscJson.getAsJsonArray("PS_REQUIRED_FRIEND");
        JsonArray PS_PRICE_SLOTS = Define.miscJson.getAsJsonArray("PS_PRICE_SLOTS");

        if (PS_NUM_FRIEND_SLOT != PS_REQUIRED_FRIEND.size())
            throwRuntimeException("PS_NUM_FRIEND_SLOT != PS_REQUIRED_FRIEND.size() : " + PS_NUM_FRIEND_SLOT + ", " + PS_REQUIRED_FRIEND.size());

        if (PS_NUM_BUY_SLOT != PS_PRICE_SLOTS.size())
            throwRuntimeException("PS_NUM_BUY_SLOT != PS_REQUIRED_DIAMOND.size() : " + PS_NUM_BUY_SLOT + ", " + PS_PRICE_SLOTS.size());
    }
}
