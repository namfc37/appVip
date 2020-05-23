package util.serialize.value;

import util.collection.MapItem;

public class MapItemValue implements IValue
{
    private MapItem value;

    public MapItemValue (MapItem value)
    {
        this.value = value;
    }

    @Override
    public MapItem mapItem ()
    {
        return value;
    }
}
