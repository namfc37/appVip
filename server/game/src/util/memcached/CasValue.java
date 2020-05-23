package util.memcached;

public class CasValue<T>
{
    public long   cas;
    public Object raw;
    public T      object;

    public CasValue (long cas, Object raw, T object)
    {
        this.cas = cas;
        this.raw = raw;
        this.object = object;
    }
}
