package cmd;

import bitzero.server.extensions.data.BaseMsg;
import util.pool.DataBuffer;
import util.pool.PoolDataBuffer;

public class BinaryMessage
{
    private final static PoolDataBuffer POOL = new PoolDataBuffer(64000);

    private final short      cmd;
    private final byte       error;
    protected     DataBuffer buf;

    public BinaryMessage (short cmd, byte error)
    {
        super();

        this.cmd = cmd;
        this.error = error;

        buf = POOL.get();
        buf.putByte(error);
    }

    public byte[] toByteArray ()
    {
        return buf.toByteArray();
    }

    public void release ()
    {
        POOL.add(buf);
        buf = null;
    }

    public BaseMessage toBaseMessage ()
    {
        BaseMessage msg = new BaseMessage(cmd, error, toByteArray());
        release();

        return msg;
    }

    public void putByte (int v)
    {
        buf.putByte(v);
    }

    public void putShort (int v)
    {
        buf.putShort(v);
    }

    public void putInt (int v)
    {
        buf.putInt(v);
    }

    public void putLong (long v)
    {
        buf.putLong(v);
    }

    public void putFloat (float v)
    {
        buf.putFloat(v);
    }

    public void putDouble (double v)
    {
        buf.putDouble(v);
    }

    public void putString (String v)
    {
        buf.putString(v);
    }
}
