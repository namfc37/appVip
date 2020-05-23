package util.serialize.value;

public class FloatValue implements IValue
{
    private float value;

    public FloatValue (float value)
    {
        this.value = value;
    }

    @Override
    public float floatValue ()
    {
        return value;
    }

    @Override
    public double doubleValue ()
    {
        return value;
    }
}
