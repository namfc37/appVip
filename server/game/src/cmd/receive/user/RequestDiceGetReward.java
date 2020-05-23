package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestDiceGetReward extends Command
{
    public RequestDiceGetReward (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {

    }
}
