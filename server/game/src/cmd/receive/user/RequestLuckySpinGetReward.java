package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestLuckySpinGetReward extends Command
{
    public RequestLuckySpinGetReward (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    }
}
