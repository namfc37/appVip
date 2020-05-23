package cmd.send.user;

import cmd.Message;

import java.util.List;

public class ResponseFriendDenyRequest extends Message
{
    public ResponseFriendDenyRequest (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendDenyRequest packData (List<Integer> listSuccess)
    {
        putInts(KEY_UID, listSuccess);

        return this;
    }
}
