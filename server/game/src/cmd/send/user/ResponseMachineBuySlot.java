package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineBuySlot extends Message
{
    public ResponseMachineBuySlot (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineBuySlot packData (byte iFloor, long coin, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_COIN, coin);
        put(KEY_MACHINE, machine);

        return this;
    }
}
