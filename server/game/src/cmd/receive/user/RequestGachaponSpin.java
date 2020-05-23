package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGachaponSpin extends Command
{
    public int numTurn;

    public RequestGachaponSpin (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        numTurn = readInt(KEY_GACHAPON_NUM_TURN);
    }
}
