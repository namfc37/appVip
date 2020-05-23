package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendRepairMachine extends Command
{
    public int  friendId;
    public byte iFloor;
    public int  num;

    public RequestFriendRepairMachine (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        friendId = readInt(KEY_FRIEND_ID);
        iFloor = readByte(KEY_FLOOR);
        num = readInt(KEY_NUM);
    }
}
