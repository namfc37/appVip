package util.serialize;

import bitzero.util.common.business.Debug;
import extension.EnvConfig;
import util.collection.MapItem;
import util.metric.MetricLog;
import util.pool.DataBuffer;
import util.serialize.value.*;

import java.util.HashMap;
import java.util.Map;

public class Decoder implements Type
{
    private transient final Map<Byte, IValue> map;

    public Decoder (byte[] data)
    {
        map = parseObject(DataBuffer.wrap(data));
    }

    public Decoder (Decoder decoder)
    {
        map = decoder.map;
    }

    public boolean readBoolean (byte key)
    {
        IValue v = map.get(key);
        return v == null ? false : v.booleanValue();
    }

    public byte readByte (byte key)
    {
        IValue v = map.get(key);
        return v == null ? 0 : v.byteValue();
    }

    public short readShort (byte key)
    {
        IValue v = map.get(key);
        return v == null ? 0 : v.shortValue();
    }

    public int readInt (byte key)
    {
        IValue v = map.get(key);
        return v == null ? 0 : v.intValue();
    }

    public long readLong (byte key)
    {
        IValue v = map.get(key);
        return v == null ? 0 : v.longValue();
    }

    public float readFloat (byte key)
    {
        IValue v = map.get(key);
        return v == null ? 0 : v.floatValue();
    }

    public double readDouble (byte key)
    {
        IValue v = map.get(key);
        return v == null ? 0 : v.doubleValue();
    }

    public String readString (byte key)
    {
        IValue v = map.get(key);
        return v == null ? "" : v.stringValue();
    }

    public MapItem readMapItem (byte key)
    {
        IValue v = map.get(key);
        return v == null ? MapItem.EMPTY : v.mapItem();
    }

    public final static byte[] EMPTY_BYTE_ARRAY = new byte[0];

    public byte[] readByteArray (byte key)
    {
        IValue v = map.get(key);
        return v == null ? EMPTY_BYTE_ARRAY : v.byteArray();
    }

    public final static int[] EMPTY_INT_ARRAY = new int[0];

    public int[] readIntArray (byte key)
    {
        IValue v = map.get(key);
        return v == null ? EMPTY_INT_ARRAY : v.intArray();
    }

    private Map<Byte, IValue> parseObject (DataBuffer buf)
    {
        HashMap<Byte, IValue> object = new HashMap<>();
        try
        {
            byte key, type;

            FOR_LOOP:
            for (; ; )
            {
                if (buf.readableBytes() <= 0)
                    break;

                type = buf.readByte();
                if (type == TYPE_END_OBJECT)
                    break;

                key = buf.readByte();

                switch (type)
                {
                    case TYPE_BOOLEAN_TRUE:
                        object.put(key, BooleanValue.TRUE);
                        break;
                    case TYPE_BOOLEAN_FALSE:
                        object.put(key, BooleanValue.FALSE);
                        break;
                    case TYPE_ZERO:
                        object.put(key, ByteValue.ZERO);
                        break;
                    case TYPE_BYTE:
                        object.put(key, new ByteValue(buf.readByte()));
                        break;
                    case TYPE_SHORT:
                        object.put(key, new ShortValue(buf.readShort()));
                        break;
                    case TYPE_INT:
                        object.put(key, new IntValue(buf.readInt()));
                        break;
                    case TYPE_LONG:
                        object.put(key, new LongValue(buf.readLong()));
                        break;
                    case TYPE_FLOAT:
                        object.put(key, new FloatValue(buf.readFloat()));
                        break;
                    case TYPE_DOUBLE:
                        object.put(key, new DoubleValue(buf.readDouble()));
                        break;
                    case TYPE_STRING:
                        object.put(key, new StringValue(buf.readString()));
                        break;
                    case TYPE_ARRAY_BYTE:
                        object.put(key, new ByteArrayValue(buf.readByteArray()));
                        break;
                    case TYPE_ARRAY_INT:
                        object.put(key, new IntArrayValue(buf.readIntArray()));
                        break;
                    case TYPE_MAP_ITEM:
                        object.put(key, new MapItemValue(buf.readMapItem()));
                        break;
                    default:
                        Debug.warn("!!!WARNING!!! Unknown type: " + type);
                        break FOR_LOOP;
                }
            }
        }
        catch (Exception e)
        {
            if (EnvConfig.environment() != EnvConfig.Environment.SERVER_LIVE)
                MetricLog.exception(e);
        }

        return object;
    }
}
