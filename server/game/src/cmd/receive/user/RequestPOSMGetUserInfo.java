package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPOSMGetUserInfo extends Command
{
    public String itemId;
    public RequestPOSMGetUserInfo(Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        this.itemId = readString(POSM_USER_INFO_ITEM);
    }
}
