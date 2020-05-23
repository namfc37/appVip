package util.serialize;

import util.collection.MapItem;
import util.pool.DataBuffer;
import util.pool.PoolDataBuffer;

import java.util.Collection;

public abstract class Encoder implements Type
{
    private final static PoolDataBuffer POOL = new PoolDataBuffer(128000);

    protected transient DataBuffer buf;

    protected Encoder ()
    {
        buf = POOL.get();
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

    public static abstract class IObject
    {
        public abstract void putData (Encoder msg);
    }

    private void putKey (byte key, byte type)
    {
        buf.putByte(type);
        buf.putByte(key);
    }

    public void put (byte key, byte v)
    {
        putKey(key, TYPE_BYTE);
        buf.putByte(v);
    }

    public void put (byte key, boolean v)
    {
        if (v)
            putKey(key, TYPE_BOOLEAN_TRUE);
        else
            putKey(key, TYPE_BOOLEAN_FALSE);
    }

    public void put (byte key, short v)
    {
        if (v == 0)
        {
            putKey(key, TYPE_ZERO);
        }
        else
        {
            putKey(key, TYPE_SHORT);
            buf.putShort(v);
        }
    }

    public void put (byte key, int v)
    {
        if (v == 0)
        {
            putKey(key, TYPE_ZERO);
        }
        else
        {
            putKey(key, TYPE_INT);
            buf.putInt(v);
        }
    }

    public void put (byte key, long v)
    {
        if (v == 0)
        {
            putKey(key, TYPE_ZERO);
        }
        else
        {
            putKey(key, TYPE_LONG);
            buf.putLong(v);
        }
    }

    public void put (byte key, float v)
    {
        if (v == 0)
        {
            putKey(key, TYPE_ZERO);
        }
        else
        {
            putKey(key, TYPE_FLOAT);
            buf.putFloat(v);
        }
    }

    public void put (byte key, double v)
    {
        if (v == 0)
        {
            putKey(key, TYPE_ZERO);
        }
        else
        {
            putKey(key, TYPE_DOUBLE);
            buf.putDouble(v);
        }
    }

    public void put (byte key, String v)
    {
        putKey(key, TYPE_STRING);
        buf.putString(v);
    }

    public void put (byte key, MapItem v)
    {
        putKey(key, TYPE_MAP_ITEM);
        buf.putMapItem(v);
    }

    public void put (byte key, MapItem[] am)
    {
        putKey(key, TYPE_ARRAY_MAP_ITEM);
        int len = (am == null) ? 0 : am.length;
        buf.putShort(len);
        if (len > 0)
        {
            for (MapItem m : am)
                buf.putMapItem(m);
        }
    }

    public void putMapItem (byte key, Collection<MapItem> am)
    {
        putKey(key, TYPE_ARRAY_MAP_ITEM);
        int len = (am == null) ? 0 : am.size();
        buf.putShort(len);
        if (len > 0)
        {
            for (MapItem m : am)
                buf.putMapItem(m);
        }
    }

    public void put (byte key, byte[] v)
    {
        putKey(key, TYPE_ARRAY_BYTE);
        buf.putByteArray(v);
    }

    public void putBytes (byte key, Collection<Byte> v)
    {
        putKey(key, TYPE_ARRAY_BYTE);
        buf.putByteArray(v);
    }

    public void put (byte key, short[] v)
    {
        putKey(key, TYPE_ARRAY_SHORT);
        buf.putShortArray(v);
    }

    public void putShorts (byte key, Collection<Short> v)
    {
        putKey(key, TYPE_ARRAY_SHORT);
        buf.putShortArray(v);
    }

    public void put (byte key, int[] v)
    {
        putKey(key, TYPE_ARRAY_INT);
        buf.putIntArray(v);
    }

    public void putInts (byte key, Collection<Integer> v)
    {
        putKey(key, TYPE_ARRAY_INT);
        buf.putIntArray(v);
    }

    public void put (byte key, String[] v)
    {
        putKey(key, TYPE_ARRAY_STRING);
        buf.putStringArray(v);
    }

    public void putStrings (byte key, Collection<String> v)
    {
        putKey(key, TYPE_ARRAY_STRING);
        buf.putStringArray(v);
    }

    protected void markEndObject ()
    {
        buf.putByte(TYPE_END_OBJECT);
    }

    public void put (byte key, IObject v)
    {
        putKey(key, TYPE_OBJECT);
        if (v != null)
            v.putData(this);
        markEndObject();
    }

    public void put (byte key, IObject[] ao)
    {
        int len = (ao == null) ? 0 : ao.length;

        putKey(key, TYPE_ARRAY_OBJECT);
        buf.putShort(len);
        if (len > 0)
        {
            for (IObject o : ao)
            {
                if (o != null)
                    o.putData(this);
                markEndObject();
            }
        }
    }

    public <T extends IObject> void put (byte key, Collection<T> ao)
    {
        int len = (ao == null) ? 0 : ao.size();

        putKey(key, TYPE_ARRAY_OBJECT);
        buf.putShort(len);
        if (len > 0)
        {
            for (T o : ao)
            {
                if (o != null)
                    o.putData(this);
                markEndObject();
            }
        }
    }
}
