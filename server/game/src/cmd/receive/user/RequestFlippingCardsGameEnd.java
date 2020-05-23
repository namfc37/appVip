package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFlippingCardsGameEnd extends Command
{
    public int start;
    public int end;
    public int match;
    public int miss;

    public RequestFlippingCardsGameEnd (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        int[] temp = readIntArray(KEY_DATA);
        if (temp.length == 4)
        {
            start = temp[0];
            end = temp[1];
            match = temp[2];
            miss = temp[3];
        }
        else
        {
            start = -1;
            end = -1;
            match = -1;
            miss = -1;
        }
    }
}