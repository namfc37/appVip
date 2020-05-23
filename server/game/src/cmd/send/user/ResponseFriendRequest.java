package cmd.send.user;

import cmd.Message;

import java.util.List;

public class ResponseFriendRequest extends Message
{
    public ResponseFriendRequest (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendRequest packData (List<Integer> listSuccess)
    {
        putInts(KEY_UID, listSuccess);

        return this;
    }
}
