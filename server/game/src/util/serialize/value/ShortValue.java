package util.serialize.value;

public class ShortValue implements IValue
{
    private short value;

    public ShortValue (short value)
    {
        this.value = value;
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
