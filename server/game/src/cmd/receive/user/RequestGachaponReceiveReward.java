package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestGachaponReceiveReward extends Command
{
    public RequestGachaponReceiveReward (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    }
}
