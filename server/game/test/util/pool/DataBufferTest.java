package util.pool;

import org.junit.Test;
import util.Json;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class DataBufferTest
{
    final static List<Byte> bytes = new ArrayList<>();
    final static List<Short> shorts = new ArrayList<>();
    final static List<Integer> ints = new ArrayList<>();
    final static List<Long> longs = new ArrayList<>();

    static
    {
        bytes.add((byte) 0);
        bytes.add((byte) 1);
        bytes.add((byte) -1);
        bytes.add(Byte.MIN_VALUE);
        bytes.add(Byte.MAX_VALUE);

        for (Byte v : bytes)
            shorts.add(v.shortValue());
        shorts.add(Short.MIN_VALUE);
        shorts.add(Short.MAX_VALUE);

        for (Short v : shorts)
            ints.add(v.intValue());
        ints.add(Integer.MIN_VALUE);
        ints.add(Integer.MAX_VALUE);

        for (Integer v : ints)
            longs.add(v.longValue());
        longs.add(Long.MIN_VALUE);
        longs.add(Long.MAX_VALUE);


    }

    @Test
    public void testByte ()
    {
        DataBuffer buf = new DataBuffer(1024);

        for (byte v : bytes)
            buf.putByte(v);

        byte[] data = buf.toByteArray();
        buf = DataBuffer.wrap(data);

        for (byte v : bytes)
            assertEquals(v, buf.readByte());
    }

    @Test
    public void testShort ()
    {
        DataBuffer buf = new DataBuffer(1024);

        for (short v : shorts)
            buf.putShort(v);

        byte[] data = buf.toByteArray();
        buf = DataBuffer.wrap(data);

        for (short v : shorts)
            assertEquals(v, buf.readShort());
    }

    @Test
    public void testInt ()
    {
        DataBuffer buf = new DataBuffer(1024);

        for (int v : ints)
            buf.putInt(v);

        byte[] data = buf.toByteArray();
        buf = DataBuffer.wrap(data);

        for (int v : ints)
            assertEquals(v, buf.readInt());
    }

    @Test
    public void testLong ()
    {
        DataBuffer buf = new DataBuffer(1024);

        for (long v : longs)
            buf.putLong(v);

        byte[] data = buf.toByteArray();
        buf = DataBuffer.wrap(data);

        for (long v : longs)
            assertEquals(v, buf.readLong());
    }
}