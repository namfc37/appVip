package util.pool;

public class PoolDataBuffer extends Pool<DataBuffer>
{
    public PoolDataBuffer (int bufferCapacity)
    {
        super(0, 0, bufferCapacity);
    }

    public PoolDataBuffer (int poolInitSize, int poolCapacity, int bufferCapacity)
    {
        super(poolInitSize, poolCapacity, bufferCapacity);
    }

    @Override
    protected DataBuffer newObject ()
    {
        return new DataBuffer(objectCapacity);
    }

    @Override
    public boolean add (DataBuffer object)
    {
        if (object.isWrap())
            return false;
        object.clear();
        return super.add(object);
    }
}
