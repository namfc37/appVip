package util.serialize.value;

public class DoubleValue implements IValue
{
    private double value;

    public DoubleValue (double value)
    {
        this.value = value;
    }

    @Override
    public double doubleValue ()
    {
        return value;
    }
}
