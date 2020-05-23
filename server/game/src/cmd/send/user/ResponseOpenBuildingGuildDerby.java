package cmd.send.user;

import cmd.Message;

public class ResponseOpenBuildingGuildDerby extends Message
{
    public ResponseOpenBuildingGuildDerby(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOpenBuildingGuildDerby packData ()
    {
        return this;
    }
}
