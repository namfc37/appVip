package service.old;

import util.memcached.AbstractDbKeyValue;
import util.memcached.BucketManager;

import java.util.HashMap;
import java.util.Map;

class OldBucket extends Collector
{
    private String              name;
    private AbstractDbKeyValue  read;
    private AbstractDbKeyValue  write;
    private Map<String, Object> raw;

    public OldBucket (String membase_name)
    {
        super();

        this.name = membase_name;
        this.read = BucketManager.get(membase_name);
        this.write = BucketManager.get(membase_name);
        this.raw = new HashMap<String, Object>();
    }

    public Object read (String key)
    {
        Object obj = read.get(key);
        if (obj == null)
            return null;

        raw.put(key, obj);
//		Debug.info("	Database::parse: put raw");
        return obj;
    }

    public void write () throws Exception
    {
        if (write == null)
            return;

        for (String key : raw.keySet())
        {
            Object value = raw.get(key);
            write.set(key, value);
        }
    }

    public String getName ()
    {
        return name;
    }
}