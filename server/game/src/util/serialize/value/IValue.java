package util.serialize.value;

import util.collection.MapItem;

public interface IValue
{
    default boolean booleanValue ()
    {
        return false;
    }

    default byte byteValue ()
    {
        return (byte) intValue();
    }

    default short shortValue ()
    {
        return (short) intValue();
    }

    default int intValue ()
    {
        return 0;
    }

    default long longValue ()
    {
        return 0;
    }

    default float floatValue ()
    {
        return 0;
    }

    default double doubleValue ()
    {
        return 0;
    }

    default String stringValue ()
    {
        return "";
    }

    default byte[] byteArray ()
    {
        return null;
    }

    default int[] intArray ()
    {
        return null;
    }

    default MapItem mapItem ()
    {
        return null;
    }
}
