package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestRankingClaimRewardDefault extends Command
{
    public String rankingID;

    public RequestRankingClaimRewardDefault (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        rankingID = readString(KEY_UID);
    }
}
