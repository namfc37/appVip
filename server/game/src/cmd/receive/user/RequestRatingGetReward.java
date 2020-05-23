package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestRatingGetReward extends Command
{

    public RequestRatingGetReward (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {

    }
}
