package cmd.send.user;

import cmd.Message;
import model.object.POSMUserInfoData;

public class ResponsePOSMGetUserInfo extends Message
{
    public ResponsePOSMGetUserInfo(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePOSMGetUserInfo packData (POSMUserInfoData.POSMUserInfo info)
    {
        put(KEY_POSM_USER_DATA, info);
        return this;
    }
}
