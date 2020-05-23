package service.old;

import com.google.gson.JsonElement;
import util.Json;

import java.util.LinkedHashMap;
import java.util.Map;

class Collector extends LinkedHashMap<String, Object>
{
    public Collector ()
    {
        super();
    }

    public JsonElement toJson () throws Exception
    {
        JsonElement copy = Json.toJsonTree(this.export());
        return copy;
    }

    public Map<String, Object> export () throws Exception
    {
        LinkedHashMap<String, Object> map = new LinkedHashMap<String, Object>();
        for (String key : keySet())
        {
            Object value = get(key);
            if (value == null)
            {
                map.put(key, "null");
                continue;
            }

            if (value instanceof Collector)
            {
                map.put(key, ((Collector) value).export());
                continue;
            }

            map.put(key, value);
        }

        return map;
    }
}
