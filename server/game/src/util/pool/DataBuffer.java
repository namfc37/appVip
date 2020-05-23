package util.pool;

import util.collection.MapItem;

import java.util.Arrays;
import java.util.Collection;

public class DataBuffer
{
    private boolean isWrap;
    private byte[]  buf;
    private int     readerIndex;
    private int     writerIndex;

    private DataBuffer ()
    {
    }

    public DataBuffer (int capacity)
    {
        buf = new byte[capacity];
    }

    public static DataBuffer wrap (byte[] data)
    {
        DataBuffer o = new DataBuffer();
        o.buf = data;
        o.isWrap = true;
        return o;
    }

    public boolean isWrap ()
    {
        return isWrap;
    }

    public void putByte (int index, int v)
    {
        buf[index] = (byte) v;
    }

    public void putByte (int v)
    {
        putByte(writerIndex, v);
        writerIndex++;
    }

    public void putShort (int index, int v)
    {
        buf[index++] = (byte) (v >>> 8);
        buf[index] = (byte) (v);
    }

    public void putShort (int v)
    {
        putShort(writerIndex, v);
        writerIndex += 2;
    }

    public void putInt (int index, int v)
    {
        buf[index++] = (byte) (v >>> 24);
        buf[index++] = (byte) (v >>> 16);
        buf[index++] = (byte) (v >>> 8);
        buf[index] = (byte) v;
    }

    public void putInt (int v)
    {
        putInt(writerIndex, v);
        writerIndex += 4;
    }

    public void putLong (int index, long v)
    {
        buf[index++] = (byte) (v >>> 56);
        buf[index++] = (byte) (v >>> 48);
        buf[index++] = (byte) (v >>> 40);
        buf[index++] = (byte) (v >>> 32);
        buf[index++] = (byte) (v >>> 24);
        buf[index++] = (byte) (v >>> 16);
        buf[index++] = (byte) (v >>> 8);
        buf[index] = (byte) v;
    }

    public void putLong (long v)
    {
        putLong(writerIndex, v);
        writerIndex += 8;
    }

    public void putFloat (int index, float v)
    {
        putInt(index, Float.floatToIntBits(v));
    }

    public void putFloat (float v)
    {
        putFloat(writerIndex, v);
        writerIndex += 4;
    }

    public void putDouble (int index, double v)
    {
        putLong(index, Double.doubleToLongBits(v));
    }

    public void putDouble (double v)
    {
        putDouble(writerIndex, v);
        writerIndex += 8;
    }

    public void putBoolean (int index, boolean v)
    {
        putByte(index, v ? 1 : 0);
    }

    public void putBoolean (boolean v)
    {
        putBoolean(writerIndex, v);
        writerIndex++;
    }

    public void putString (String v)
    {
        if (v == null || v.isEmpty())
        {
            putShort(0); //Add empty string
            return;
        }

        //mark size position
        int dataPos = writerIndex;
        writerIndex += 2;

        int i;
        char c;
        int strLen = v.length();

        for (i = 0; i < strLen; i++)
        {
            c = v.charAt(i);
            if (!((c >= 0x0001) && (c <= 0x007F)))
                break;
            buf[writerIndex++] = (byte) c;
        }

        for (; i < strLen; i++)
        {
            c = v.charAt(i);
            if ((c >= 0x0001) && (c <= 0x007F))
            {
                buf[writerIndex++] = (byte) c;

            }
            else if (c > 0x07FF)
            {
                buf[writerIndex++] = (byte) (0xE0 | ((c >> 12) & 0x0F));
                buf[writerIndex++] = (byte) (0x80 | ((c >> 6) & 0x3F));
                buf[writerIndex++] = (byte) (0x80 | (c & 0x3F));
            }
            else
            {
                buf[writerIndex++] = (byte) (0xC0 | ((c >> 6) & 0x1F));
                buf[writerIndex++] = (byte) (0x80 | (c & 0x3F));
            }
        }

        //update size
        putShort(dataPos, writerIndex - dataPos - 2);
    }

    public byte[] toByteArray ()
    {
        return Arrays.copyOf(buf, writerIndex);
    }

    public void clear ()
    {
        readerIndex = 0;
        writerIndex = 0;
    }

    public void putMapItem (MapItem map)
    {
        int len = (map == null) ? 0 : map.size();

        putShort(len);
        if (len > 0)
        {
            for (MapItem.Entry entry : map)
            {
                putString(entry.key());
                putInt(entry.value());
            }
        }
    }

    public void putByteArray (byte[] data)
    {
        int len = (data == null) ? 0 : data.length;

        putShort(len);
        if (len > 0)
        {
            System.arraycopy(data, 0, buf, writerIndex, data.length);
            writerIndex += data.length;
        }
    }

    public void putByteArray (Collection<Byte> data)
    {
        int len = (data == null) ? 0 : data.size();

        putShort(len);
        if (len > 0)
        {
            for (Byte v : data)
                putByte(v == null ? 0 : v.byteValue());
        }
    }

    public void putShortArray (short[] data)
    {
        int len = (data == null) ? 0 : data.length;

        putShort(len);
        if (len > 0)
        {
            for (short v : data)
                putShort(v);
        }
    }

    public void putShortArray (Collection<Short> data)
    {
        int len = (data == null) ? 0 : data.size();

        putShort(len);
        if (len > 0)
        {
            for (Short v : data)
                putShort(v == null ? 0 : v.shortValue());
        }
    }

    public void putIntArray (int[] data)
    {
        int len = (data == null) ? 0 : data.length;

        putShort(len);
        if (len > 0)
        {
            for (int v : data)
                putInt(v);
        }
    }

    public void putIntArray (Collection<Integer> data)
    {
        int len = (data == null) ? 0 : data.size();

        putShort(len);
        if (len > 0)
        {
            for (Integer v : data)
                putInt(v == null ? 0 : v.intValue());
        }
    }

    public void putStringArray (String[] strings)
    {
        int len = (strings == null) ? 0 : strings.length;

        putShort(len);
        if (len > 0)
        {
            for (String s : strings)
                putString(s);
        }
    }

    public void putStringArray (Collection<String> strings)
    {
        int len = (strings == null) ? 0 : strings.size();

        putShort(len);
        if (len > 0)
        {
            for (String s : strings)
                putString(s);
        }
    }

    public byte readByte ()
    {
        return buf[readerIndex++];
    }

    public short readShort ()
    {
        return (short) ((readByte() << 8) | (readByte() & 0xFF));
    }

    public int readInt ()
    {
        return readByte() << 24
                | (readByte() & 0xFF) << 16
                | (readByte() & 0xFF) << 8
                | (readByte() & 0xFF);
    }

    public long readLong ()
    {
        return (readByte() & 0xFFL) << 56
                | (readByte() & 0xFFL) << 48
                | (readByte() & 0xFFL) << 40
                | (readByte() & 0xFFL) << 32
                | (readByte() & 0xFFL) << 24
                | (readByte() & 0xFFL) << 16
                | (readByte() & 0xFFL) << 8
                | (readByte() & 0xFFL);
    }

    public float readFloat ()
    {
        return Float.intBitsToFloat(readInt());
    }

    public double readDouble ()
    {
        return Double.longBitsToDouble(readLong());
    }

    public String readString ()
    {
        int len = readShort();
        if (len <= 0)
            return "";

        char[] chars = new char[len];

        int c, char2, char3;
        int count = 0;
        int numChar = 0;

        while (count < len)
        {
            c = (int) readByte() & 0xff;
            if (c > 127)
            {
                readerIndex--;
                break;
            }
            count++;
            chars[numChar++] = (char) c;
        }

        while (count < len)
        {
            c = (int) readByte() & 0xff;
            switch (c >> 4)
            {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    /* 0xxxxxxx*/
                    count++;
                    chars[numChar++] = (char) c;
                    break;
                case 12:
                case 13:
                    /* 110x xxxx   10xx xxxx*/
                    count += 2;
                    if (count > len)
                        throw new RuntimeException("malformed input: partial character at end");

                    char2 = (int) readByte();
                    if ((char2 & 0xC0) != 0x80)
                        throw new RuntimeException("malformed input around byte " + count);

                    chars[numChar++] = (char) (((c & 0x1F) << 6) |
                            (char2 & 0x3F));
                    break;
                case 14:
                    /* 1110 xxxx  10xx xxxx  10xx xxxx */
                    count += 3;
                    if (count > len)
                        throw new RuntimeException("malformed input: partial character at end");

                    char2 = (int) readByte();
                    char3 = (int) readByte();
                    if (((char2 & 0xC0) != 0x80) || ((char3 & 0xC0) != 0x80))
                        throw new RuntimeException("malformed input around byte " + (count - 1));

                    chars[numChar++] = (char) (((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | (char3 & 0x3F));
                    break;
                default:
                    /* 10xx xxxx,  1111 xxxx */
                    throw new RuntimeException("malformed input around byte " + count);
            }
        }
        // The number of chars produced may be less than utflen
        return new String(chars, 0, numChar);
    }

    public MapItem readMapItem ()
    {
        short len = readShort();
        if (len <= 0)
            return null;

        MapItem map = new MapItem(len);
        String key;
        int value;
        for (int i = len; i > 0; i--)
        {
            key = readString();
            value = readInt();
            map.put(key, value);
        }
        return map;
    }

    public byte[] readByteArray ()
    {
        short len = readShort();
        if (len <= 0)
            return null;

        byte[] v = Arrays.copyOfRange(buf, readerIndex, readerIndex + len);
        readerIndex += len;
        return v;
    }

    public int[] readIntArray ()
    {
        short len = readShort();
        if (len <= 0)
            return null;

        int[] v = new int[len];
        for (int i = 0; i < len; i++)
            v[i] = readInt();
        return v;
    }

    public int readableBytes ()
    {
        return (isWrap ? buf.length : writerIndex) - readerIndex;
    }
}
