package cmd.receive.authen;

import bitzero.server.extensions.data.DataCmd;
import cmd.Command;


public class RequestLogin extends Command
{
    public String sessionPortal;
    public String sessionFile;
    public String userId;

    public String clientVersion;
    public String osName;
    public String osVersion;
    public String deviceId;
    public String deviceName;
    public String connectionType;
    public String simOperator;
    public String socialType;
    public String packageName;
    public String country;
    public int    numSim;
    public int    statusLocalShop;
    public String phone;

    public String facebookId; //test convert

    public RequestLogin (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        sessionPortal = readString(KEY_SESSION_PORTAL);
        sessionFile = readString(KEY_SESSION_FILE);
        userId = readString(KEY_USER_ID);

        clientVersion = readString(KEY_CLIENT_VERSION);
        osName = readString(KEY_OS_NAME);
        osVersion = readString(KEY_OS_VERSION);
        deviceId = readString(KEY_DEVICE_ID);
        deviceName = readString(KEY_DEVICE_NAME);
        connectionType = readString(KEY_CONNECTION_TYPE);
        simOperator = readString(KEY_SIM_OPERATOR);
        socialType = readString(KEY_SOCIAL_TYPE);
        packageName = readString(KEY_PACKAGE_NAME);
        country = readString(KEY_COUNTRY);
        numSim = readInt(KEY_NUM);
        statusLocalShop = readInt(KEY_ACTIVE_LOCAL_PAYMENT);
        phone = readString(KEY_PHONE);

        facebookId = readString(KEY_FACEBOOK_ID);
    }

}
