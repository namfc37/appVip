package cmd;

import bitzero.server.extensions.data.BaseMsg;

public class BaseMessage extends BaseMsg
{
    private byte[] data;

    public BaseMessage (short cmd, byte error, byte[] data)
    {
        super(cmd, error);
        this.data = data;
    }

    @Override
    public byte[] createData ()
    {
        return data;
    }

    public short getCmd ()
    {
        return Id;
    }

    public byte getError ()
    {
        return Error;
    }
}
