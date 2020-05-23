package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberDonateStart extends Command
{
    public String itemId;

    public RequestGuildMemberDonateStart (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        itemId = this.readString(KEY_ITEM_ID);
    }
}
