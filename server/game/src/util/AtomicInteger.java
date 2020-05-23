package util;

public class AtomicInteger extends java.util.concurrent.atomic.AtomicInteger
{
    public AtomicInteger (int initialValue)
    {
        super(initialValue);
    }

    public AtomicInteger ()
    {
    }

    public int orAndGet (int mask)
    {
        int prev, next;
        do
        {
            prev = get();
            next = prev | mask;
        } while (!compareAndSet(prev, next));
        return next;
    }

    public int getAndOr (int mask)
    {
        int prev, next;
        do
        {
            prev = get();
            next = prev | mask;
        } while (!compareAndSet(prev, next));
        return prev;
    }

    public int andAndGet (int mask)
    {
        int prev, next;
        do
        {
            prev = get();
            next = prev & mask;
        } while (!compareAndSet(prev, next));
        return next;
    }

    public int getAndAnd (int mask)
    {
        int prev, next;
        do
        {
            prev = get();
            next = prev & mask;
        } while (!compareAndSet(prev, next));
        return prev;
    }
}
