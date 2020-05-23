package cmd;

import bitzero.server.extensions.data.DataCmd;
import data.KeyDefine;
import util.serialize.Decoder;

public abstract class Command extends Decoder implements KeyDefine
{
    protected Command (DataCmd dataCmd)
    {
        super(dataCmd.getRawData());
        unpackData();
    }

    protected Command (Decoder decoder)
    {
        super(decoder);
        unpackData();
    }

    protected abstract void unpackData ();
}
