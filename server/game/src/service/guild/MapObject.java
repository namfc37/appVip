package service.guild;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import util.Database;
import util.Json;

public class MapObject<K, V>
{
	private boolean readonly;
	private Map<String, V> core;
	private String redis_key;
	private Function<String, V> convertor;
	
	public MapObject (String key, Function<String, V> convertor, boolean readonly)
	{
		this.readonly = readonly;
		this.core = new HashMap<String, V> ();
		this.redis_key = key;
		this.convertor = convertor;
	}

	public boolean load ()
	{
		Map<String, String> data = Database.ranking().hgetAll(redis_key);
		if (data == null || data.isEmpty())
			return false;
		
		Map<String, V> temp = new HashMap<String, V> ();
		for (String key : data.keySet())
		{
			try
			{
				String j = data.get(key);
				V value = this.convertor.apply(j);
				temp.put(key, value);
			}
			catch (Exception e)
			{
				continue;
			}
		}

		if (temp.size() > 0)
			this.core.putAll (temp);
		
		return true;
	}
	
	public boolean load (K ... ids)
	{
		String [] keys = new String [ids.length];
		for (int i = 0; i < ids.length; i++)
			keys [i] = String.valueOf(ids [i]);
		
		List<String> data = Database.ranking().hmget (redis_key, keys);
		if (data == null || data.isEmpty())
			return false;
		
		Map<String, V> temp = new HashMap<String, V> ();
		for (int i = 0; i < data.size (); i++)
		{
			try
			{
				String key = keys [i];
				String j = data.get(i);
				V value = this.convertor.apply(j);
				temp.put(key, value);
			}
			catch (Exception e)
			{
				continue;
			}
		}

		if (temp.size() > 0)
			this.core.putAll (temp);
		
		return true;
	}
	
	public boolean save ()
	{
		if (readonly)
			return false;
		
		if (core.size() == 0)
			return false;
		
		Map<String, String> data = new HashMap<String, String>();
		for (String k : core.keySet())
		{
			String j = Json.toJson(core.get(k));
			data.put(k, j);
		}

		Database.ranking().hmset(this.redis_key, data);
		return true;
	}
	
	public boolean save (K ... ids)
	{
		if (readonly)
			return false;
		
		if (core.size() == 0)
			return false;
		
		Map<String, String> data = new HashMap<String, String>();
		for (int i = 0; i < ids.length; i++)
		{
			String k = String.valueOf(ids [i]);
			V v = core.get(k);
			if (v == null)
				continue;
			
			String j = Json.toJson(v);
			data.put(k, j);
		}
		
		if (data.isEmpty())
			return false;

		Database.ranking().hmset(this.redis_key, data);
		return true;
	}
	
	public boolean containsKey (K key)
	{
		return this.core.containsKey(String.valueOf(key));
	}
	
//	public Set<K> keySet(Class<K> kClass)
//	{
//		return null;
//	}
	
	public int sizeInDatabase ()
	{
		Long value = Database.ranking().hlen(redis_key);
		return value == null ? 0 : value.intValue();
	}
	
	public int size ()
	{
		return this.core.size();
	}

	public Collection<V> values()
	{
		return this.core.values();
	}

	public Set<String> keySet()
	{
		return this.core.keySet();
	}
	
	public void put (K key, V value)
	{
		if (readonly)
			return;
		
		if (key != null && value != null)
			this.core.put(String.valueOf(key), value);
	}
	
	public V get (K key)
	{
		return this.core.get(String.valueOf(key));
	}
	
	public void remove (K key)
	{
		if (readonly)
			return;
		
		String sKey = String.valueOf(key);
		
		this.core.remove(sKey);
		Database.ranking().hdel(this.redis_key, sKey);
	}
	
	public boolean isEmpty()
	{
		return this.core.isEmpty();
	}

	public void clear()
	{
		if (readonly)
			return;
		
		this.core.clear();
		Database.ranking().del(redis_key);
	}
}