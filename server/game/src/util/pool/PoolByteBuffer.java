package util.pool;

import java.nio.ByteBuffer;

public class PoolByteBuffer extends Pool<ByteBuffer>
{

    public PoolByteBuffer (int bufferCapacity)
    {
        super(0, 0, bufferCapacity);
    }

    public PoolByteBuffer (int poolInitSize, int poolCapacity, int bufferCapacity)
    {
        super(poolInitSize, poolCapacity, bufferCapacity);
    }

    @Override
    protected ByteBuffer newObject ()
    {
        return ByteBuffer.allocate(objectCapacity);
    }

    @Override
    public boolean add (ByteBuffer object)
    {
        object.clear();
        return super.add(object);
    }
}
