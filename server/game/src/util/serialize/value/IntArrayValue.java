package util.serialize.value;

public class IntArrayValue implements IValue
{
    private int[] value;

    public IntArrayValue (int[] value)
    {
        this.value = value;
    }

    @Override
    public int[] intArray ()
    {
        return value;
    }
}
