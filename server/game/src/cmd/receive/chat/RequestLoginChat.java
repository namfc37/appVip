package cmd.receive.chat;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;


public class RequestLoginChat extends Command
{
    public String sessionPortal;
    public String userId;
    public int guild;

    public String clientVersion;
    public String deviceId;
    public String packageName;
    public String country;

    public RequestLoginChat (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        sessionPortal = readString(KEY_SESSION_PORTAL);
        userId = readString(KEY_USER_ID);
        guild = readInt(KEY_GUILD);

        clientVersion = readString(KEY_CLIENT_VERSION);
        deviceId = readString(KEY_DEVICE_ID);
        packageName = readString(KEY_PACKAGE_NAME);
        country = readString(KEY_COUNTRY);
    }

}
