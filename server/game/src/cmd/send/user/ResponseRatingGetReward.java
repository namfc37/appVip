package cmd.send.user;

import cmd.Message;

public class ResponseRatingGetReward extends Message
{
    public ResponseRatingGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseRatingGetReward packData ()
    {
        return this;
    }
}
