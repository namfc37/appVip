package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAirshipFriendPack extends Command
{
    public int  friendId;
    public byte idSlot;

    public RequestAirshipFriendPack (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        friendId = readInt(KEY_FRIEND_ID);
        idSlot = readByte(KEY_SLOT_ID);
    }
}
