package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestOpenBuildingGame extends Command
{
    public RequestOpenBuildingGame (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {

    }
}
