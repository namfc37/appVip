package payment.billing;

import data.CmdDefine;
import data.CmdName;
import data.ItemInfo;
import data.MachineInfo;
import data.TruckInfo;
import util.collection.MapItem;

public class PurchaseInfo extends bitzero.util.payment.ItemInfo
{
    public final short  cmd;
    public final String action;

    public PurchaseInfo (short cmd)
    {
        this.cmd = cmd;
        action = CmdName.get(cmd);
    }

    public PurchaseInfo (String action)
    {
        this.cmd = 0;
        this.action = action;
    }

    private static int gmAction (short cmd)
    {
        return 2_140_000_000 + cmd;
    }

    private static int uidAction (short cmd)
    {
        return 1_000_000_000 + cmd * 100_000;
    }

    public static PurchaseInfo skipTime (short cmd, int time)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd);
        p.quantity = time;

        return p;
    }

    public static PurchaseInfo buyItem (short cmd, MapItem items)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = "Item";
        for (MapItem.Entry e : items)
            p.name += "." + e.key();
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo buyIbShop (short cmd, ItemInfo info, int num, boolean isSaleOff)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = info.UID();
        if (isSaleOff)
            p.name = "Item." + info.ID();
        else
            p.name = "Item_SALE." + info.ID();
        p.quantity = num;

        return p;
    }

    public static PurchaseInfo machine (short cmd, MachineInfo info, int x)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + info.ID() + "." + x;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo action (short cmd)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd);
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo privateShopUnlock (short cmd, int x)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + x;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo fishingHireSlot (short cmd, int slotIndex)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + slotIndex;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo privateShopPut (short cmd, ItemInfo info)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + info.ID();
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo tomHire (short cmd, byte type, boolean isSaleOff)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + type;
        if (isSaleOff)
            p.name += ".SALE";
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo luckySpin (short cmd, int spin)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + spin;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo deleteOldUser ()
    {
        PurchaseInfo p = new PurchaseInfo("System");
        p.id = gmAction((short) 0);
        p.name = "DeleteOldUser";
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo gmAction (String name)
    {
        PurchaseInfo p = new PurchaseInfo("GM");
        p.id = gmAction((short) 0);
        p.name = name;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo gacha (short cmd, String id, int turn)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = CmdName.get(cmd) + "." + id + "." + turn;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo payment (short cmd, String item)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        p.name = "Payment." + item;
        p.quantity = 1;

        return p;
    }

    public static PurchaseInfo questbook (short cmd, String action, String target)
    {
        PurchaseInfo p = new PurchaseInfo(cmd);
        p.id = uidAction(cmd);
        if (target == null || target.isEmpty())
            p.name = "qb." + action;
        else
            p.name = "qb." + action + "." + target;
        p.quantity = 1;

        return p;
    }

	public static PurchaseInfo guildCreate()
	{
        PurchaseInfo p = new PurchaseInfo(CmdDefine.GUILD_CREATE);
        p.id = uidAction(CmdDefine.GUILD_CREATE);
        p.name = "Guild.create";
        p.quantity = 1;
        
        return p;
	}

	public static PurchaseInfo derbyTaskExtra()
	{
        PurchaseInfo p = new PurchaseInfo(CmdDefine.GUILD_DERBY_TASK_ACCEPT);
        p.id = uidAction(CmdDefine.GUILD_DERBY_TASK_ACCEPT);
        p.name = "Derby.extraTask";
        p.quantity = 1;
        
        return p;
	}
}
