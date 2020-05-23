package cmd.send.user;

import cmd.Message;

public class ResponseOpenBuildingGame extends Message
{
    public ResponseOpenBuildingGame (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOpenBuildingGame packData ()
    {
        return this;
    }
}
