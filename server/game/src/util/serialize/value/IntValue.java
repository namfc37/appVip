package util.serialize.value;

public class IntValue implements IValue
{

    private int value;

    public IntValue (int value)
    {
        this.value = value;
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
