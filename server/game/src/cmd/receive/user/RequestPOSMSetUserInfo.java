package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPOSMSetUserInfo extends Command
{
    public String name;
    public String phoneNumber;
    public String address;
    public String itemId;

    public RequestPOSMSetUserInfo(Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        this.name = readString(POSM_USER_INFO_NAME);
        this.phoneNumber = readString(POSM_USER_INFO_PHONE_NUMBER);
        this.address = readString(POSM_USER_INFO_ADDRESS);
        this.itemId = readString(POSM_USER_INFO_ITEM);
    }
}
