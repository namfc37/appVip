package cmd.send.user;

import cmd.Message;

import java.util.List;

public class ResponseFriendAdd extends Message
{
    public ResponseFriendAdd (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendAdd packData (List<Integer> listSuccess)
    {
        putInts(KEY_UID, listSuccess);

        return this;
    }
}
