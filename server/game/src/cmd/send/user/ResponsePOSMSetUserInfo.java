package cmd.send.user;

import cmd.Message;
import model.object.POSMUserInfoData;

public class ResponsePOSMSetUserInfo extends Message
{
    public ResponsePOSMSetUserInfo(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePOSMSetUserInfo packData (POSMUserInfoData.POSMUserInfo posmUserInfo)
    {
        put(KEY_POSM_USER_DATA, posmUserInfo);
        return this;
    }
}
