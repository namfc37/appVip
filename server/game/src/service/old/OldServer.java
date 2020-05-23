package service.old;

import bitzero.util.common.business.Debug;
import com.google.gson.JsonObject;
import model.object.ConvertInfo;

import java.util.LinkedHashMap;
import java.util.Map;

public class OldServer
{
    public static  OldServer  instance        = null;
    private static BucketId[] indexTodatabase = {
            null, null, null, null, null
            , BucketId.usergroup_5
            , BucketId.usergroup_6
            , BucketId.usergroup_7
            , BucketId.usergroup_8
            , BucketId.usergroup_9
            , BucketId.usergroup_10
            , BucketId.usergroup_11
            , BucketId.usergroup_12
    };

    private Map<BucketId, OldBucket> database;

    public OldServer ()
    {
        this.database = new LinkedHashMap<BucketId, OldBucket>();
        database.put(BucketId.usergroup_5, new OldBucket("old_usergroup_5"));
        database.put(BucketId.usergroup_6, new OldBucket("old_usergroup_6"));
        database.put(BucketId.usergroup_7, new OldBucket("old_usergroup_7"));
        database.put(BucketId.usergroup_8, new OldBucket("old_usergroup_8"));
        database.put(BucketId.usergroup_9, new OldBucket("old_usergroup_9"));
        database.put(BucketId.usergroup_10, new OldBucket("old_usergroup_10"));
        database.put(BucketId.usergroup_11, new OldBucket("old_usergroup_11"));
        database.put(BucketId.usergroup_12, new OldBucket("old_usergroup_12"));
        database.put(BucketId.temp, new OldBucket("old_temp"));
        database.put(BucketId.general, new OldBucket("old_general"));
        database.put(BucketId.freestyle, new OldBucket("old_happy"));
        database.put(BucketId.backup, new OldBucket("old_backup"));
        database.put(BucketId.guild, new OldBucket("old_guild"));
        database.put(BucketId.indexer, new OldBucket("old_indexer"));
        database.put(BucketId.money, new OldBucket("old_money"));
        database.put(BucketId.money_replicas, new OldBucket("old_money_rep"));
    }

    public Object get (BucketId baseId, String key)
    {
        OldBucket base = database.get(baseId);
        if (base == null)
            return null;

        Object obj = base.read(key);
        return obj;
    }

    public void put (BucketId baseId, String key, Object obj)
    {
        OldBucket base = database.get(baseId);
        if (base == null)
            return;

        base.put(key, obj);
    }

    public void print () throws Exception
    {
        JsonObject copy = new JsonObject();
        for (BucketId key : database.keySet())
        {
            OldBucket db = database.get(key);
            copy.add("" + key, db.toJson());
        }

        Debug.info("OldServer: \n" + copy.toString());
    }

    public void write () throws Exception
    {
        for (OldBucket db : database.values())
            db.write();
    }

    public static void test () throws Exception
    {
//    	OldServer.init();
//    	UserConverter converter = OldServer.getUserById(4231223);
//    	UserGame.Builder userBuilder = converter.getUserGame();
//    	PrivateShop.Builder privateShopBuilder = converter.getPrivateShop();
    }

    public static void test2 ()
    {
        try
        {
            UserConverter user = getUserById(4231223);
            user.check(ConvertInfo.createEmpty());
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public static void init ()
    {
        instance = new OldServer();
    }

    public static BucketId indexTodatabase (int index)
    {
        return indexTodatabase[index];
    }

    public static UserConverter getUserById (long userId, String session) throws Exception
    {
        UserConverter user = getUserById(userId);
        if (user.userSession().equalsIgnoreCase(session))
            return user;

        return null;
    }

    public static UserConverter getUserById (long userId) throws Exception
    {
        UserConverter user = new UserConverter(userId);
        return user;
    }

    public static UserConverter getUserByFacebookId (String facebookId) throws Exception
    {
        String key = "fb_" + facebookId + "_u";
        String value = (String) instance.get(BucketId.general, key);

        if (value == null)
            return null;

        long userId = Long.valueOf(value);
        return getUserById(userId);
    }
}