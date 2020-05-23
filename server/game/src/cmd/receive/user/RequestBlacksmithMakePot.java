package cmd.receive.user;

import cmd.Command;
import util.collection.MapItem;
import util.serialize.Decoder;

public class RequestBlacksmithMakePot extends Command
{
    //	target pot id
    public String pot;

    //	pot, gloves, grass
    public MapItem items;

    public RequestBlacksmithMakePot (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        pot = readString(KEY_POT);
        items = readMapItem(KEY_ITEMS);
    }
}
