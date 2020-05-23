package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineBuyWorkingTime extends Message
{
    public ResponseMachineBuyWorkingTime (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineBuyWorkingTime packData (byte iFloor, long coin, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_COIN, coin);
        put(KEY_MACHINE, machine);

        return this;
    }
}
