package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberDonateGet extends Command
{
    public int targetId;

    public RequestGuildMemberDonateGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        targetId = this.readInt(KEY_USER_ID);
    }
}
