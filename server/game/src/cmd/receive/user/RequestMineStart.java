package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestMineStart extends Command
{
    public RequestMineStart (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    }
}