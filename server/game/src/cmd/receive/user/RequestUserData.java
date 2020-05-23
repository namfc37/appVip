package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;

public class RequestUserData extends Command
{
    public RequestUserData (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {

    }
}
