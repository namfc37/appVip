package util.collection;

public class UnmodifiableMapItem extends MapItem
{
    protected UnmodifiableMapItem (boolean autoTrim, int initialCapacity, float loadFactor)
    {
        super(autoTrim, initialCapacity, loadFactor);
    }

    @Override
    public int put (String key, int value)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public void put (MapItem source)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public int increase (String key, int value)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public void increase (MapItem source)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public int decrease (String key, int value)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public void decrease (MapItem source)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public int remove (String key)
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public void clear ()
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public void trim ()
    {
        throw new UnsupportedOperationException();
    }

    @Override
    public void setAutoTrim (boolean value)
    {
        throw new UnsupportedOperationException();
    }


}
