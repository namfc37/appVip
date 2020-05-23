package model.object;

import data.ChestInfo;
import data.ConstInfo;
import data.KeyDefine;
import model.UserGame;
import util.serialize.Encoder;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class Gacha extends Encoder.IObject implements KeyDefine
{
    private Map<String, Chest> chests;

    private Gacha ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Gacha create ()
    {
        Gacha o = new Gacha();
        o.chests = new HashMap<>();
        return o;
    }

    public void update (UserGame game)
    {
        for (Chest c : chests.values())
            c.update();
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(GACHA_CHESTS, chests.values());
    }

    public void resetDaily ()
    {
        Map<String, ChestInfo> mapInfo = ConstInfo.getMapChestInfo();

        for (Iterator<Map.Entry<String, Chest>> it = chests.entrySet().iterator(); it.hasNext(); )
        {
            Map.Entry<String, Chest> e = it.next();
            ChestInfo info = mapInfo.get(e.getKey());
            if (info == null)
                it.remove(); //bỏ rương ko tồn tại
            else
                e.getValue().resetDaily(info); //reset hằng ngày
        }

        //thêm rương còn thiếu
        for (Map.Entry<String, ChestInfo> e : mapInfo.entrySet())
        {
            String id = e.getKey();
            ChestInfo info = e.getValue();
            if (!chests.containsKey(id))
                chests.put(id, Chest.create(info));
        }
    }

    public Chest getChest (String id)
    {
        return chests.get(id);
    }
}
