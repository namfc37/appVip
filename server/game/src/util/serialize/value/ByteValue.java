package util.serialize.value;

public class ByteValue implements IValue
{
    public final static ByteValue ZERO = new ByteValue((byte) 0);

    private byte value;

    public ByteValue (byte value)
    {
        this.value = value;
    }

    @Override
    public byte byteValue ()
    {
        return value;
    }

    @Override
    public short shortValue ()
    {
        return value;
    }

    @Override
    public int intValue ()
    {
        return value;
    }

    @Override
    public long longValue ()
    {
        return value;
    }
}
