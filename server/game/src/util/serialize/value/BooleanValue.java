package util.serialize.value;

public class BooleanValue implements IValue
{
    public final static BooleanValue TRUE  = new BooleanValue(true);
    public final static BooleanValue FALSE = new BooleanValue(false);

    private boolean value;

    public BooleanValue (boolean value)
    {
        this.value = value;
    }

    @Override
    public boolean booleanValue ()
    {
        return value;
    }
}
