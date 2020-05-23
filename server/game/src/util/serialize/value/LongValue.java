package util.serialize.value;

public class LongValue implements IValue
{
    private long value;

    public LongValue (long value)
    {
        this.value = value;
    }

    @Override
    public long longValue ()
    {
        return value;
    }
}
