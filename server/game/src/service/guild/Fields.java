package service.guild;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import util.Database;

class Fields extends HashMap<String, String>
{
	private HashMap<String, Boolean> isChanged;
	private String mainKey;
	private boolean readonly;
	
	private Fields () {}

	public static Fields create (String key)
	{
		Fields fields = new Fields ();
		fields.mainKey = key;
		fields.readonly = true;
		fields.isChanged = null;
		fields.loadAll();
		return fields;
	}
	
	public static Fields create (String key, String ...keys)
	{
		Fields fields = new Fields ();
		fields.mainKey = key;
		fields.readonly = true;
		fields.isChanged = null;
		fields.load(keys);
		return fields;
	}

	public static Fields create (String key, boolean readonly)
	{
		Fields fields = new Fields ();
		fields.mainKey = key;
		fields.readonly = readonly;
		fields.isChanged = readonly ? null : new HashMap<String, Boolean> ();
		fields.loadAll();
		return fields;
	}
	
	public static Fields create (String key, boolean readonly, String ...keys)
	{
		Fields fields = new Fields ();
		fields.mainKey = key;
		fields.readonly = readonly;
		fields.isChanged = readonly ? null : new HashMap<String, Boolean> ();
		fields.load(keys);
		return fields;
	}
	
	@Override
	public String put (String key, String val)
	{
		if (readonly)
			return null;
		
		if (this.containsKey(key) && this.get(key) == val)
			return val;
		
		this.isChanged.put(key, true);
		return super.put(key, val);
	}
	
	public void save ()
	{
		if (readonly)
			return;
		
		if (this.isChanged == null)
			return;
		
		HashMap<String, String> temp = new HashMap<>();
		for (String key : this.keySet())
		{
			if (!this.isChanged.containsKey (key) || this.isChanged.get (key) != true)
				continue;
			
			String val = this.get(key);
			temp.put (key, val);
		}
		
		if (!temp.isEmpty())
			Database.ranking().hmset(mainKey, temp);
	}
	
	public void loadAll ()
	{
		Map<String, String> temp = Database.ranking().hgetAll(mainKey);
		this.clear();
		this.putAll(temp);
	}
	
	public void load (String ... keys)
	{
		if (keys.length == 0)
		{
			this.loadAll();
			return;
		}
		
		List<String> temp = Database.ranking().hmget(mainKey, keys);
		if (temp == null || temp.isEmpty())
			return;
		
		for (int i = 0; i < keys.length; i++)
		{
			String k = keys [i];
			String v = temp.get(i);
			
			if (v != null)
				this.put(k, v);
		}
	}
	
	public String put (String key, boolean val)
	{
		return this.put(key, val ? "true" : "false"); 
	}
	
	public Boolean getBoolean (String key)
	{
		String temp = this.get(key);
		if (temp == null || temp.isEmpty())
			return null;
		
		Boolean v = null;
		try { v = Boolean.valueOf(temp); } catch (Exception e) {}
		
		return v;
	}
	
	public String put (String key, int val)
	{
		return this.put(key, "" + val); 
	} 
	
	public Integer getInt (String key)
	{
		String temp = this.get(key);
		if (temp == null || temp.isEmpty())
			return null;
		
		Integer v = null;
		try { v = Integer.valueOf(temp); } catch (Exception e) {}
		
		return v;
	}
	
	public List<Integer> getListInt (String key)
	{
		String temp = this.get(key);
		if (temp == null || temp.isEmpty())
			return null;
		
		List<Integer> l = null;
		try
		{
			l = new ArrayList<> ();
			String[] t = temp.split(",");
			for (int i = 0; i < t.length; i++)
			{
				Integer v = Integer.valueOf(t [i]); 
				l.add(v);
			}
		}
		catch (Exception e)
		{
			
		}
		
		return l;
	}

	public void put(String key, List<Integer> list)
	{
		String t = "";
		if (list != null && !list.isEmpty())
		{
			t += list.get(0);
			for (int i = 1; i < list.size(); i++)
				t += "," + list.get(i);
		}
		
		this.put(key, t);
	}
}
