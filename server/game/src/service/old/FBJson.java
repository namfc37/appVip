package service.old;

class FBJson extends Collector
{
    private transient FBEncrypt core;

    public FBJson ()
    {
        super();
        core = new FBEncrypt();
    }

    public FBJson (byte[] bin_db)
    {
        super();
        core = new FBEncrypt();

        if (bin_db != null && bin_db.length != 0)
            core.decode(bin_db, true);
    }

    public Object set (String property, Object value)
    {
        this.put(property, value);
        return value;
    }

    public Object set (String property, String key, FBType type, Object defaultValue)
    {
        if (core.hasKey(key))
            return set(property, key, type);

        return set(property, defaultValue);
    }

    public Object set (String property, String key, FBType type)
    {
        Object value = null;
        if (core.hasKey(key))
        {
            switch (type)
            {
                case BOOLEAN:
                    value = core.getBoolean(key);
                    break;
                case BYTE:
                    value = core.getByte(key);
                    break;
                case SHORT:
                    value = core.getShort(key);
                    break;
                case INT:
                    value = core.getInt(key);
                    break;
                case LONG:
                    value = core.getLong(key);
                    break;
                case FLOAT:
                    value = core.getFloat(key);
                    break;
                case DOUBLE:
                    value = core.getDouble(key);
                    break;
                case STRING:
                case STRING_UTF8:
                case STRING_ANSI:
                case STRING_UNICODE:
                    value = core.getString(key);
                    break;
                case ARRAY_BYTE:
                    value = core.getByteArray(key);
                    break;
                case ARRAY_SHORT:
                    value = core.getShortArray(key);
                    break;
                case ARRAY_INT:
                    value = core.getIntArray(key);
                    break;
                case ARRAY_LONG:
                    value = core.getLongArray(key);
                    break;
                case ARRAY_FLOAT:
                    value = core.getFloatArray(key);
                    break;
                case ARRAY_STRING:
                    value = core.getStringArray(key);
                    break;
                case BINARY:
                    value = core.getBinary(key);
                    break;
                case FBJSON:
                    value = new FBJson(core.getBinary(key));
                    break;
                default:
                    break;
            }

            this.put(property, value);
        }
        else
        {
            switch (type)
            {
                case BOOLEAN:
                    value = false;
                    break;
                case BYTE:
                    value = (byte) 0;
                    break;
                case SHORT:
                    value = (short) 0;
                    break;
                case INT:
                    value = (int) 0;
                    break;
                case LONG:
                    value = (long) 0;
                    break;
                case FLOAT:
                    value = (float) 0;
                    break;
                case DOUBLE:
                    value = (double) 0;
                    break;
                case STRING:
                case STRING_UTF8:
                case STRING_ANSI:
                case STRING_UNICODE:
                    value = "";
                    break;
                case ARRAY_BYTE:
                    value = new byte[0];
                    break;
                case ARRAY_SHORT:
                    value = new short[0];
                    break;
                case ARRAY_INT:
                    value = new int[0];
                    break;
                case ARRAY_LONG:
                    value = new long[0];
                    break;
                case ARRAY_FLOAT:
                    value = new float[0];
                    break;
                case ARRAY_STRING:
                    value = new String[0];
                    break;
                case BINARY:
                    value = new byte[0];
                    break;
                case FBJSON:
                    value = new FBJson();
                    break;
                default:
                    break;
            }
        }

        return value;
    }

    public boolean binaryContainsKey (String key)
    {
        return core != null && core.hasKey(key);
    }
}
