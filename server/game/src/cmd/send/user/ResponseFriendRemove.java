package cmd.send.user;

import cmd.Message;

import java.util.List;

public class ResponseFriendRemove extends Message
{
    public ResponseFriendRemove (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendRemove packData (List<Integer> listSuccess)
    {
        putInts(KEY_UID, listSuccess);

        return this;
    }
}
