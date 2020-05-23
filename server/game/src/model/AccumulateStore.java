package model;

import java.util.HashMap;
import java.util.Map;

import cmd.ErrorConst;
import data.ConstInfo;
import data.KeyDefine;
import data.MiscDefine;
import data.PaymentAccumulateInfo;
import data.PaymentAccumulateInfo.Package;
import extension.EnvConfig;
import model.key.InfoKeyData;
import net.spy.memcached.CASValue;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

public class AccumulateStore extends Encoder.IObject implements KeyDefine
{
	private String id;
	private Map<String, Item> store;
	private int time_update;
	private int time_start;
	private int time_end;
	
	private AccumulateStore () {}
	
	private static AccumulateStore create ()
	{
		int current = Time.getUnixTime();
		PaymentAccumulateInfo info = ConstInfo.getAccumulate();
		
        if (info == null)
        	return null;
        
        AccumulateStore newData = new AccumulateStore ();
        newData.id = info.ID();
        newData.time_start = info.UNIX_TIME_START();
        newData.time_end = info.UNIX_TIME_END();
        newData.time_update = info.UNIX_TIME_START();
        newData.store = new HashMap<String, Item> ();

        for (Package packageInfo : info.SHOP_ITEMS().values())
        {
            if (packageInfo.IS_VIETNAM_ONLY() && !EnvConfig.isZone(MiscDefine.COUNTRY_VIETNAM))
                continue;
        	Item item = new Item ();
        	item.id = packageInfo.ID();
    		item.sold = 0;
    		item.total = packageInfo.LIMIT() == 0 ? -1 : 0;
        	newData.store.put (item.id, item);
        }
        
        newData.import_items(newData.time_start, current);
        return newData;
	}
	
	public static void checkAndCreate ()
	{
		PaymentAccumulateInfo info = ConstInfo.getAccumulate();
		AccumulateStore store = AccumulateStore.get(info.ID());
		if (store == null)
			store = create ();
		
		if (store != null)
			AccumulateStore.set (store);
	}

    public boolean isActive ()
    {
        int currentTime = Time.getUnixTime();
        return this.isActive(currentTime);
    }
    
    public boolean isActive (int time)
    {
        return time_start < time && time < time_end;
    }
	
	public void update ()
	{
		int current = Time.getUnixTime();
        if (!isActive(current) || time_update + Time.SECOND_IN_MINUTE * 10 > current)
        	return;

        this.import_items (time_update, current);
        time_update = current + Time.SECOND_IN_MINUTE * 10;
	}
	
	public byte item_sell (String itemID)
	{
		if (!this.isActive())
			return ErrorConst.LIMIT_TIME;
		
		Item item = this.store.get(itemID);
		if (item == null)
			return ErrorConst.INVALID_ITEM;
		
		if (item.total != -1 && item.sold >= item.total)
			return ErrorConst.EMPTY;
		
		item.sold += 1;
		return ErrorConst.SUCCESS;
	}
	
	private void import_items (int unix_last_update, int unix_current)
	{
		PaymentAccumulateInfo info = ConstInfo.getAccumulate();
        for (Package packageInfo : info.SHOP_ITEMS().values())
        {
            if (!store.containsKey(packageInfo.ID())) continue;
        	Item item = store.get (packageInfo.ID());
    		
        	if (packageInfo.LIMIT() == 0)
        	{
        		item.total = -1;
        		continue;
        	}
        	
    		int last_day = Time.getHourOfDay(unix_last_update, 0);
    		int current_day = Time.getHourOfDay(unix_current, 0);
    		do
    		{
            	for (int open_minute : packageInfo.OPEN_MINUTES())
        		{
        			int atSecond = last_day + open_minute * 60;
        			if (unix_last_update <= atSecond && atSecond <= unix_current)
        				item.total += packageInfo.QUANTITY_PER_TURN();
        		}
            	
        		last_day += Time.SECOND_IN_DAY;
    		}
    		while (last_day <= current_day);
    		
    		if (item.total > packageInfo.LIMIT())
    			item.total = packageInfo.LIMIT();
        }
	}

    @Override
    public void putData (Encoder msg)
    {
        msg.put(ACCUMULATE_STORE_ID, id);
        msg.put(ACCUMULATE_STORE_START, time_start);
        msg.put(ACCUMULATE_STORE_END, time_end);
        msg.put(ACCUMULATE_STORE_ITEMS, store.values());
    }
    
    //-----------------------------------------------------------------------
    private final static InfoKeyData INFO_KEY = InfoKeyData.ACCUMULATE_STORE;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }
    
    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static AccumulateStore decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
            	AccumulateStore obj = Json.fromJson((String) raw, AccumulateStore.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static Object getRaw (String keyname)
    {
        return db().get(keyname);
    }

    public static boolean set (AccumulateStore object)
    {
        return db().set(object.id, object.encode(), expire());
    }

    public static AccumulateStore get (String keyname)
    {
        return decode(getRaw(keyname));
    }
    
    public static CasValue<AccumulateStore> gets (String keyname)
    {
        CASValue<Object> raw = db().gets(keyname);
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(raw.getValue()));
    }

    public static boolean cas (String keyname, long cas, AccumulateStore object)
    {
        return db().cas(keyname, cas, object.encode(), expire());
    }
    
    //-----------------------------------------------------------------------
	
	private static class Item extends Encoder.IObject implements KeyDefine
	{
		private String id;
		private int sold;
		private int total;
		
	    @Override
	    public void putData (Encoder msg)
	    {
	        msg.put(ACCUMULATE_STORE_ITEM_ID, id);
	        msg.put(ACCUMULATE_STORE_ITEM_SOLD, sold);
	        msg.put(ACCUMULATE_STORE_ITEM_TOTAL, total);
	    }
	}
}