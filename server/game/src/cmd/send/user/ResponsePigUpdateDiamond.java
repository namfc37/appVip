package cmd.send.user;

import cmd.Message;
import model.object.PigBank;

public class ResponsePigUpdateDiamond extends Message
{
    public ResponsePigUpdateDiamond (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePigUpdateDiamond packData (PigBank pigBank)
    {
        put(KEY_PIG_BANK, pigBank);
        return this;
    }
}
