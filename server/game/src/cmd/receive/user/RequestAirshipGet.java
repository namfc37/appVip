package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestAirshipGet extends Command
{
    public RequestAirshipGet (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    }
}
