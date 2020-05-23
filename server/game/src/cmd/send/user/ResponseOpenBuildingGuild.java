package cmd.send.user;

import cmd.Message;

public class ResponseOpenBuildingGuild extends Message
{
    public ResponseOpenBuildingGuild(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOpenBuildingGuild packData ()
    {
        return this;
    }
}
