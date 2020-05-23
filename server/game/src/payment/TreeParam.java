package payment;

import com.google.common.hash.HashFunction;
import com.google.common.hash.Hasher;
import com.google.common.hash.Hashing;
import com.google.gson.JsonObject;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

public class TreeParam
{
    private final static HashFunction HASH = Hashing.md5();

    private JsonObject              json = new JsonObject();
    private TreeMap<String, String> map  = new TreeMap<>();

    public void put (String key, String value)
    {
        json.addProperty(key, value);
        map.put(key, value);
    }

    public void put (String key, Number value)
    {
        json.addProperty(key, value);
        map.put(key, value.toString());
    }

    public void put (String key, Boolean value)
    {
        json.addProperty(key, value);
        map.put(key, value.toString());
    }

    public void put (String key, Character value)
    {
        json.addProperty(key, value);
        map.put(key, value.toString());
    }

    public String hash (String key)
    {
        //Debug.info("TreeParam.hash", Json.toJsonPretty(map));
        Hasher hasher = HASH.newHasher();
        for (Map.Entry<String, String> e : map.entrySet())
        {
            //Debug.info(e.getKey(), e.getValue());
            hasher.putString(e.getValue(), StandardCharsets.UTF_8);
        }
        //Debug.info("key", key);
        hasher.putString(key, StandardCharsets.UTF_8);

        return hasher.hash().toString();
    }

    public JsonObject getJson ()
    {
        return json;
    }
}
