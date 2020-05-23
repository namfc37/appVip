package util.redis;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Tuple;
import util.metric.MetricLog;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

public class Redis
{
    private final String    id;
    private final JedisPool pool;

    public Redis (String id, JedisPool pool)
    {
        this.id = id;
        this.pool = pool;
    }

    public long zrank (String key, String member)
    {
        try (Jedis j = pool.getResource())
        {
            Long rank = j.zrank(key, member);
            return rank == null ? -1 : rank.intValue();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return -2;
    }

    public Set<Tuple> zrevrangeWithScores (String key, long start, long stop)
    {
        try (Jedis j = pool.getResource())
        {
            return j.zrevrangeWithScores(key, start, stop);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public Long zrem (String key, String... members)
    {
        try (Jedis j = pool.getResource())
        {
            return j.zrem(key, members);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public Long zrem (String key, List<String> members, int expireSeconds)
    {
        Long result = null;
        try (Jedis j = pool.getResource())
        {
            result = j.zrem(key, members.toArray(new String[members.size()]));
            if (expireSeconds > 0)
                j.expire(key, expireSeconds);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return result;
    }

    public Long expire (String key, int seconds)
    {
        try (Jedis j = pool.getResource())
        {
            return j.expire(key, seconds);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public Long zadd (String key, Map<String, Double> scoreMembers, int expireSeconds)
    {
        Long result = null;
        try (Jedis j = pool.getResource())
        {
            result = j.zadd(key, scoreMembers);
            if (expireSeconds > 0)
                j.expire(key, expireSeconds);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return result;
    }

	public String set(String key, String data)
	{
        try (Jedis j = pool.getResource())
        {
            return j.set(key, data);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Long setnx(String key, String data)
	{
        try (Jedis j = pool.getResource())
        {
            return j.setnx(key, data);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Long incr(String key)
	{
        try (Jedis j = pool.getResource())
        {
            return j.incr(key);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Boolean exists(String key)
	{
        try (Jedis j = pool.getResource())
        {
            return j.exists(key);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public String hmset(String key, Map<String, String> data)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hmset(key, data);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Long hset(String key, String field, String value)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hset(key, field, value);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public String hget(String key, String field)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hget(key, field);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public List<String> hmget(String key, String ... fields)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hmget(key, fields);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Map<String, String> hgetAll(String key)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hgetAll(key);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public String get(String key)
	{
        try (Jedis j = pool.getResource())
        {
            return j.get(key);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Boolean hexists(String key, String field)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hexists(key, field);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Long hlen (String key)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hlen(key);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Long hdel(String key, String ... fields)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hdel(key, fields);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}

	public Long del(String ... keys)
	{
        try (Jedis j = pool.getResource())
        {
            return j.del(keys);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}
	
	public void action (Consumer<Jedis> func)
	{
        try (Jedis j = pool.getResource())
        {
            func.accept(j);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
	}

    public void zincrby (String key, double increment, String member)
    {
        try (Jedis j = pool.getResource())
        {
            j.zincrby(key, increment, member);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public Jedis getResource ()
    {
        return pool.getResource();
    }

	public Set<String> hkeys (String key)
	{
        try (Jedis j = pool.getResource())
        {
            return j.hkeys(key);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
	}
}
