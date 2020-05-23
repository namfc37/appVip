package service.old;

import java.lang.reflect.Method;

public class Parser extends Collector
{
    public Parser ()
    {
        super();
    }

    public Object parse (BucketId baseId, String key, String parserName, Class<?> paramType) throws Exception
    {
//		Debug.info("parse " + baseId + "[" + key + "]: " + parserName + ", " + paramType);
        Object bin = OldServer.instance.get(baseId, key);
        if (bin == null)
//		{
//			Debug.info("	bin is null");
            bin = new Object();
//		}

        Method method = this.getClass().getMethod(parserName, paramType);
        if (method == null)
//		{
//			Debug.info("	method is null");
            return null;
//		}

        Class<?> returnType = method.getReturnType();
        Class<?>[] paramTypes = method.getParameterTypes();

        if (paramTypes.length != 1)
            return null;

        Class<?> input = bin.getClass();
        Class<?> require = paramTypes[0];

//		Debug.info("	input is " + input.getName());
//		Debug.info("	require is " + require.getName());
        if (require != input)
        {
            if (input == String.class)
            {
                String vStr = (String) bin;
                if (require == Byte.class) bin = Byte.valueOf(vStr);
                else if (require == Short.class) bin = Short.valueOf(vStr);
                else if (require == Integer.class) bin = Integer.valueOf(vStr);
                else if (require == Long.class) bin = Long.valueOf(vStr);
                else if (require == Float.class) bin = Float.valueOf(vStr);
                else if (require == Double.class) bin = Double.valueOf(vStr);
            }
            else if (input == byte[].class)
            {
                if (require == FBJson.class)
                    bin = new FBJson((byte[]) bin);
            }

            input = bin.getClass();
        }

        if (require != input)
            return getDefault(returnType);

//		Debug.info("	recheck input " + bin.getClass().getName());

        Object obj = method.invoke(this, bin);
        if (obj == null)
//		{
//			Debug.info("	obj is null");
            return getDefault(returnType);
//		}

//		Debug.info("	parse done!");
        OldServer.instance.put(baseId, key, obj);

        put(key, obj);
        return obj;
    }

    public Object parseObject (Object value)
    {
        return value;
    }

    public String parseString (String value)
    {
        return value;
    }

    public Byte parseByte (Byte value)
    {
        return value;
    }

    public Integer parseInt (Integer value)
    {
        return value;
    }

    public Short parseShort (Short value)
    {
        return value;
    }

    public Long parseLong (Long value)
    {
        return value;
    }

    private static Object getDefault (Class<?> classname)
    {
        if (classname == FBJson.class) return new FBJson();
        if (classname == String.class) return "";
        if (classname == Boolean.class) return false;
        if (classname == Byte.class) return (byte) 0;
        if (classname == Short.class) return (short) 0;
        if (classname == Integer.class) return 0;
        if (classname == Long.class) return (long) 0;
        if (classname == Float.class) return (float) 0;
        if (classname == Double.class) return (double) 0;

        return new Object();
    }
}
