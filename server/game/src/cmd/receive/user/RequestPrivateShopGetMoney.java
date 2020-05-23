package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPrivateShopGetMoney extends Command
{
    public int idSlot;

    public RequestPrivateShopGetMoney (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        idSlot = readByte(KEY_SLOT_ID);
    }
}
