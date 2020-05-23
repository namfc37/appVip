package cmd;

import bitzero.server.extensions.data.DataCmd;
import util.pool.DataBuffer;

public abstract class BinaryCommand
{
    private DataBuffer buffer;

    public BinaryCommand (DataCmd dataCmd)
    {
        buffer = DataBuffer.wrap(dataCmd.getRawData());
        unpackData();
    }

    protected abstract void unpackData ();

    public byte readByte ()
    {
        return buffer.readByte();
    }

    public short readShort ()
    {
        return buffer.readShort();
    }

    public int readInt ()
    {
        return buffer.readInt();
    }

    public long readLong ()
    {
        return buffer.readLong();
    }

    public float readFloat ()
    {
        return buffer.readFloat();
    }

    public double readDouble ()
    {
        return buffer.readDouble();
    }

    public String readString ()
    {
        return buffer.readString();
    }
}
