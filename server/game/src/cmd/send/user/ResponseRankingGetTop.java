package cmd.send.user;

import cmd.Message;
import data.ranking.RankingBoard;

public class ResponseRankingGetTop extends Message
{
    public ResponseRankingGetTop (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseRankingGetTop packData (RankingBoard.Board[] rankingBoard)
    {
        put(KEY_ITEMS, rankingBoard);
        return this;
    }
}