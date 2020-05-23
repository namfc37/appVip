package cmd.send.user;

import cmd.Message;
import model.object.RankingPR;

public class ResponseRankingGetPR extends Message
{
    public ResponseRankingGetPR (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseRankingGetPR packData (RankingPR pr)
    {
        put(KEY_ITEMS, pr);
        return this;
    }
}