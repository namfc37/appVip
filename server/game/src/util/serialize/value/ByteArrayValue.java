package util.serialize.value;

public class ByteArrayValue implements IValue
{
    private byte[] value;

    public ByteArrayValue (byte[] value)
    {
        this.value = value;
    }

    @Override
    public byte[] byteArray ()
    {
        return value;
    }
}
