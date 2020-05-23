package util.serialize.value;

public class StringValue implements IValue
{
    private String value;

    public StringValue (String value)
    {
        this.value = value;
    }

    @Override
    public String stringValue ()
    {
        return value;
    }
}
