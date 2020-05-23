package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineSkipTimeProduce extends Message
{
    public ResponseMachineSkipTimeProduce (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineSkipTimeProduce packData (byte iFloor, long coin, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_COIN, coin);
        put(KEY_MACHINE, machine);

        return this;
    }
}
