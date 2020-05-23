package service.old;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.util.*;

public class FBEncrypt
{
    public static final int                   MAX_LEN_INPUT = 1024 * 20;
    private             ByteArrayOutputStream baos          = null;
    private             DataOutputStream      dos           = null;

    private ByteArrayInputStream     bais      = null;
    private DataInputStream          dis       = null;
    private HashMap<Integer, Object> set       = null;
    private LinkedList<Integer>      list_keys = null;

    private int _max_input_len = MAX_LEN_INPUT;

    // data type
    private static final int STRING_UTF8    = 1;
    private static final int BYTE           = 2;
    private static final int SHORT          = 3;
    private static final int INT            = 4;
    private static final int LONG           = 5;
    private static final int FLOAT          = 6;
    private static final int DOUBLE         = 7;
    private static final int BINARY         = 8;
    private static final int STRING_ANSI    = 9;
    private static final int STRING_UNICODE = 10;
    private static final int ARRAY          = 11;

    public FBEncrypt ()
    {
        // decode
        set = new HashMap<Integer, Object>();

        // encode
        baos = new ByteArrayOutputStream(_max_input_len);
        dos = new DataOutputStream(baos);
        list_keys = new LinkedList<Integer>();
    }

    public FBEncrypt (int max_input_len)
    {
        // decode
        _max_input_len = max_input_len;
        set = new HashMap<Integer, Object>();

        // encode
        baos = new ByteArrayOutputStream(_max_input_len);
        dos = new DataOutputStream(baos);
        list_keys = new LinkedList<Integer>();
    }

    public FBEncrypt (byte[] bin)
    {
        // decode
        _max_input_len = bin.length;
        set = new HashMap<Integer, Object>();

        // encode
        baos = new ByteArrayOutputStream(_max_input_len);
        dos = new DataOutputStream(baos);
        list_keys = new LinkedList<Integer>();

        if (decode(bin) == false)
        {
//			Debug.info("Decode failed!");
        }
    }

    public FBEncrypt (byte[] bin, boolean reuse_bin)
    {
//		decode
        _max_input_len = bin.length;
        set = new HashMap<Integer, Object>();

//		encode
        baos = new ByteArrayOutputStream(_max_input_len);
        dos = new DataOutputStream(baos);
        list_keys = new LinkedList<Integer>();

        if (decode(bin) == false)
        {
//			Debug.info("Decode failed!");
        }

        if (reuse_bin)
        {
            if (updateByteArrayData() == false)
            {
//				Debug.info("updateByteArrayData failed!");
            }
        }
    }

    public LinkedList<Integer> getKeys ()
    {
        return list_keys;
    }

    public boolean decode (byte[] bin, boolean reuse_bin)
    {
        boolean decode_ok = decode(bin);

        if (decode_ok)
        {
            if (reuse_bin)
            {
                return updateByteArrayData();
            }
        }

        return decode_ok;
    }

    public boolean decode (byte[] bin)
    {
        if (bin == null || bin.length > _max_input_len)
        {
            if (bin != null && bin.length > _max_input_len)
            {
//				Debug.info (": bin.length=" + bin.length + ". _max_input_len=" + _max_input_len, new Exception("FBEncrypt decode"));
            }
            return false;
        }

        bais = new ByteArrayInputStream(bin);
        dis = new DataInputStream(bais);
        set.clear();

        try
        {
            while (dis.available() > 0)
            {
                // read key
                int k = dis.readInt();
                Integer key = new Integer(k);

                // read type len
                int type = dis.readByte() & 0xFF;

                // read value
                switch (type)
                {
                    case BYTE:
                        set.put(key, Byte.valueOf(dis.readByte()));
                        break;

                    case SHORT:
                        set.put(key, Short.valueOf(dis.readShort()));
                        break;

                    case INT:
                        set.put(key, Integer.valueOf(dis.readInt()));
                        break;

                    case LONG:
                        set.put(key, Long.valueOf(dis.readLong()));
                        break;

                    case FLOAT:
                        set.put(key, Float.valueOf(dis.readFloat()));
                        break;

                    case DOUBLE:
                        set.put(key, Double.valueOf(dis.readDouble()));
                        break;

                    case STRING_UTF8:
                        int s_len = dis.readShort() & 0xffff;
                        String s_str = "";
                        if (s_len > 0 && s_len < _max_input_len) // max str len < _max_input_len
                        {
                            byte[] data = new byte[s_len];
                            dis.read(data);
                            s_str = new String(data, java.nio.charset.StandardCharsets.UTF_8);
                        }
                        set.put(key, s_str);
                        break;

                    case BINARY:
                        int b_len = readVarInt(dis);

                        if (b_len > 0 && b_len < _max_input_len) // max binary len < _max_input_len
                        {
                            byte[] val = new byte[b_len];
                            dis.read(val);
                            set.put(key, val);
                        }
                        else
                        {
                            set.put(key, null);
                        }

                        break;

                    case STRING_ANSI:
                        int sa_len = readVarInt(dis);
                        String sa_str = "";
                        if (sa_len > 0 && sa_len < _max_input_len) // max str len < _max_input_len
                        {
                            byte[] data = new byte[sa_len];
                            dis.read(data);
                            sa_str = new String(data, java.nio.charset.StandardCharsets.US_ASCII);
                        }
                        set.put(key, sa_str);
                        break;

                    case STRING_UNICODE:
                        int su_len = readVarInt(dis) * 2;
                        String su_str = "";
                        if (su_len > 0 && su_len < _max_input_len) // max str len < _max_input_len
                        {
                            byte[] data = new byte[su_len];
                            dis.read(data);
                            su_str = new String(data, java.nio.charset.StandardCharsets.UTF_16BE);
                        }
                        set.put(key, su_str);
                        break;

                    case ARRAY:
                        if (decodeArray(key, dis) == false)
                        {
                            return false;
                        }
                        break;

                    default:
                        return false;
                }
            }
        }
        catch (Exception ex)
        {
//			Debug.info ("FBDecode", ex);

            return false;
        }

        return true;
    }

    private boolean decodeArray (Integer key, DataInputStream dis)
    {
        try
        {
            int type = dis.readByte() & 0xFF;

            switch (type)
            {
                case BYTE:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        byte[] value = new byte[len];

                        for (int i = 0; i < len; i++)
                        {
                            value[i] = dis.readByte();
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                case SHORT:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        short[] value = new short[len];

                        for (int i = 0; i < len; i++)
                        {
                            value[i] = dis.readShort();
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                case INT:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        int[] value = new int[len];

                        for (int i = 0; i < len; i++)
                        {
                            value[i] = dis.readInt();
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                case LONG:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        long[] value = new long[len];

                        for (int i = 0; i < len; i++)
                        {
                            value[i] = dis.readLong();
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                case FLOAT:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        float[] value = new float[len];

                        for (int i = 0; i < len; i++)
                        {
                            value[i] = dis.readFloat();
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                case STRING_UTF8:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        String[] value = new String[len];

                        for (int i = 0; i < len; i++)
                        {
                            int s_len = dis.readShort() & 0xffff;

                            if (s_len == 0)
                            {
                                value[i] = "";
                            }
                            else if (s_len > 0 && s_len < _max_input_len) // max str len < _max_input_len
                            {
                                byte[] data = new byte[s_len];
                                dis.read(data);
                                String s_str = new String(data, java.nio.charset.StandardCharsets.UTF_8);
                                value[i] = s_str;
                            }
                            else
                            {
                                return false;
                            }
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                case BINARY:
                {
                    int len = readVarInt(dis);

                    if (len > 0 && len < _max_input_len)
                    {
                        byte[][] value = new byte[len][];

                        for (int i = 0; i < len; i++)
                        {
                            int s_len = readVarInt(dis);

                            if (s_len > 0 && s_len < _max_input_len) // max str len < _max_input_len
                            {
                                byte[] data = new byte[s_len];
                                dis.read(data);
                                value[i] = data;
                            }
                            else
                            {
                                return false;
                            }
                        }

                        set.put(key, value);
                    }
                    else
                    {
                        return false;
                    }

                    break;
                }

                default:
                    return false;
            }
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean hasKey (String key)
    {
        int k = MurmurHash(key);

        return set.containsKey(new Integer(k));
    }

    public Object getValue (String key)
    {
        int k = MurmurHash(key);

        return set.get(new Integer(k));
    }

    public String getString (String key)
    {
        int k = MurmurHash(key);

        Object val = set.get(new Integer(k));

        if (val instanceof String)
        {
            return (String) val;
        }

        return "";
    }

    public byte[] getBinary (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val != null && val instanceof byte[])
        {
            return (byte[]) val;
        }
        return null;

    }

    public byte[][] getBinaryArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val != null && val instanceof byte[][])
        {
            return (byte[][]) val;
        }
        return null;
    }

    public byte getByte (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof Byte)
        {
            return ((Byte) val).byteValue();
        }
        return -1;
    }

    public byte[] getByteArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof byte[])
        {
            return ((byte[]) val);
        }
        return null;
    }

    public boolean getBoolean (String key)
    {
        return (getByte(key) == 1);
    }

    public short getShort (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof Short)
        {
            return ((Short) val).shortValue();
        }
        return -1;
    }

    public short[] getShortArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof short[])
        {
            return ((short[]) val);
        }
        return null;
    }

    public int getInt (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof Integer)
        {
            return ((Integer) val).intValue();
        }
        return -1;
    }

    public int[] getIntArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof int[])
        {
            return ((int[]) val);
        }
        return null;
    }

    public long getLong (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof Long)
        {
            return ((Long) val).longValue();
        }
        return -1;
    }

    public long[] getLongArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof long[])
        {
            return ((long[]) val);
        }
        return null;
    }

    public float getFloat (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof Float)
        {
            return ((Float) val).floatValue();
        }
        return -1;
    }

    public float[] getFloatArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof float[])
        {
            return ((float[]) val);
        }
        return null;
    }

    public double getDouble (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof Double)
        {
            return ((Double) val).doubleValue();
        }
        return -1;
    }

    public String[] getStringArray (String key)
    {
        int k = MurmurHash(key);
        Object val = set.get(new Integer(k));
        if (val instanceof String[])
        {
            return ((String[]) val);
        }
        return null;
    }

    public HashMap<Integer, Object> getHashMap ()
    {
        return set;
    }

    public void addField (Integer key, Object value)
    {
        set.put(key, value);
    }

    public void removeField (String key)
    {
        int k = MurmurHash(key);
        set.remove(k);

        updateByteArrayData();
    }

    public void displayDataPackage ()
    {
        if (set.size() != 0)
        {
            if (toByteArray() == null)
            {
//				Debug.info("Byte array is null");
            }

            display();
        }
        else if (toByteArray() != null)
        {
            if (set.size() == 0)
            {
//				Debug.info("Hashmap is empty");
            }

            FBEncrypt enc = new FBEncrypt(toByteArray());
            enc.display();
        }
    }

    public void display ()
    {
//		Debug.info("");

        // if (set.size() == 0)
        // {
        // Debug.info("Data is empty!");
        // return;
        // }

        Set _set = set.entrySet();
        Iterator i = _set.iterator();

        while (i.hasNext())
        {
            Map.Entry me = (Map.Entry) i.next();
//			Debug.info(me.getKey() + ": " + me.getValue());
        }
    }

    public String logValues ()
    {
        StringBuilder log = new StringBuilder();

        Set _set = set.entrySet();
        Iterator i = _set.iterator();

        while (i.hasNext())
        {
            Map.Entry me = (Map.Entry) i.next();
            log.append(me.getValue()).append('\t');
        }

        return log.toString();
    }

    public boolean updateField (String key, Object _val, boolean _force_add)
    {
        int _key = MurmurHash(key);

        boolean updated = false;

        if (_force_add)
        {
            if (set.containsKey(_key))
            {
                set.remove(_key);
            }

            set.put(_key, _val);
            updated = true;
        }
        else
        {
            if (set.containsKey(_key))
            {
                set.remove(_key);
                set.put(_key, _val);
                updated = true;
            }
        }

        return updated;
    }

    public void updateValue (HashMap<String, Object> _set_new)
    {
        Set _set = _set_new.entrySet();
        Iterator i = _set.iterator();

        while (i.hasNext())
        {
            Map.Entry me = (Map.Entry) i.next();

            String key = (String) me.getKey();
            Object val = (Object) me.getValue();

            if (updateField(key, val, false) == false)
            {
//				Debug.info("Update " + key + " failed!");
            }
        }

        updateByteArrayData();
    }

    public void updateValue (String _key, Object _val, boolean _force_add)
    {
        if (updateField(_key, _val, _force_add) == false)
        {
//			Debug.info("Update " + _key + " failed!");
            return;
        }

        updateByteArrayData();
    }

    public void updateValue (String _key, Object _val)
    {
        if (updateField(_key, _val, false) == false)
        {
//			Debug.info("Update " + _key + " failed!");
            return;
        }

        updateByteArrayData();
    }

    public boolean updateByteArrayData ()
    {
        resetByteArray();

        Set _set = set.entrySet();
        Iterator i = _set.iterator();

        while (i.hasNext())
        {
            Map.Entry me = (Map.Entry) i.next();

            int k = (int) me.getKey();
            Object val = (Object) me.getValue();

            if (val instanceof String)
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type
                    dos.writeByte(STRING_UTF8);
                    // write UTF-8 string
                    dos.writeUTF((String) val);
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else if (val instanceof byte[])
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type
                    dos.writeByte(BINARY);
                    // write str value len
                    byte[] value = (byte[]) val;
                    if (value == null || value.length == 0)
                    {
                        writeVarInt(dos, 0);
                    }
                    else
                    {
                        writeVarInt(dos, value.length);
                        // write str value
                        dos.write(value, 0, value.length);
                    }
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else if (val instanceof Byte)
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type
                    dos.writeByte(BYTE);
                    // write value
                    dos.writeByte((Byte) val);
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else if (val instanceof Short)
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type
                    dos.writeByte(SHORT);
                    // write value
                    dos.writeShort((short) val);
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else if (val instanceof Integer)
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type
                    dos.writeByte(INT);
                    // write value
                    dos.writeInt((int) val);
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else if (val instanceof Long)
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type len
                    dos.writeByte(LONG);
                    // write value
                    dos.writeLong((long) val);
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else if (val instanceof Float)
            {
                // addFloat((String)me.getKey(), ((Float)val).floatValue());
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type len
                    dos.writeByte(FLOAT);
                    // write value
                    dos.writeFloat((float) val);
                }
                catch (Exception ex)
                {
                    return false;
                }

            }
            else if (val instanceof Double)
            {
                try
                {
                    // write key
                    dos.writeInt(k);
                    // write type len
                    dos.writeByte(DOUBLE);
                    // write value
                    dos.writeDouble((double) val);
                }
                catch (Exception ex)
                {
                    return false;
                }
            }
            else
            {
//				Debug.info("updateByteArrayData.. unknown type.");
                return false;
            }
        }

        return true;
    }

    // ****************************************************************************************************************************************************************

    // FBEncode

    private void resetByteArray ()
    {
        if (baos != null)
            baos.reset();
    }

    public byte[] toByteArray ()
    {
        return baos.toByteArray();
    }

    public String toString ()
    {
        String val = "";

        try
        {
            val = baos.toString("US-ASCII");
        }
        catch (Exception ex)
        {
        }
        return val;
    }

    public boolean appendBinary (byte[] bin, LinkedList<Integer> keys)
    {
        for (Integer i : keys)
        {
            if (list_keys.contains(i))
            {
                return false;
            }
        }

        try
        {
            dos.write(bin, 0, bin.length);
        }
        catch (Exception ex)
        {
            return false;
        }

        list_keys.addAll(keys);

        return true;
    }

    public boolean addString (String key, String value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(STRING_UTF8);
            // write UTF-8 string
            dos.writeUTF(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addStringANSI (String key, String value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(STRING_ANSI);
            // write value len
            writeVarInt(dos, value.length());
            // write ANSI string
            dos.writeBytes(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addStringUNICODE (String key, String value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(STRING_UNICODE);
            // write value len
            writeVarInt(dos, value.length());
            // write UNICODE string
            dos.writeChars(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addBinary (String key, byte[] value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(BINARY);
            // write str value len
            if (value == null || value.length == 0)
            {
                writeVarInt(dos, 0);
            }
            else
            {
                writeVarInt(dos, value.length);
                // write str value
                dos.write(value, 0, value.length);
            }
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addByte (String key, int value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(BYTE);
            // write value
            dos.writeByte(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addBoolean (String key, boolean value)
    {
        return addByte(key, value ? 1 : 0);
    }

    public boolean addShort (String key, int value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(SHORT);
            // write value
            dos.writeShort(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addInt (String key, int value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(INT);
            // write value
            dos.writeInt(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addInt (int k, int value)
    {
        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + k + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(INT);
            // write value
            dos.writeInt(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addLong (String key, long value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type len
            dos.writeByte(LONG);
            // write value
            dos.writeLong(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addFloat (String key, float value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type len
            dos.writeByte(FLOAT);
            // write value
            dos.writeFloat(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addDouble (String key, double value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type len
            dos.writeByte(DOUBLE);
            // write value
            dos.writeDouble(value);
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addBinaryArray (String key, List<byte[]> value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(ARRAY);
            // write sub type
            dos.writeByte(BINARY);

            // write len
            writeVarInt(dos, value.size());
            // write array
            for (byte[] v : value)
            {
                writeVarInt(dos, v.length);
                dos.write(v, 0, v.length);
            }
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addStringArray (String key, List<String> value)
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        try
        {
            // write key
            dos.writeInt(k);
            // write type
            dos.writeByte(ARRAY);
            // write sub type
            dos.writeByte(STRING_UTF8);

            // write len
            writeVarInt(dos, value.size());
            // write array
            for (String v : value)
            {
                dos.writeUTF(v);
            }
        }
        catch (Exception ex)
        {
            return false;
        }

        return true;
    }

    public boolean addArray (String key, Object value) throws Exception
    {
        int k = MurmurHash(key);

        if (addKey(k) == false)
        {
            // System.out.println("FBENCODE ERROR: Key \"" + key + "\" has one duplicate !");

            return false;
        }

        // write key
        dos.writeInt(k);
        // write type
        dos.writeByte(ARRAY);

        switch (value.getClass().getName())
        {
            case "[B":
            {
                dos.writeByte(BYTE);
                byte[] v = (byte[]) value;
                writeVarInt(dos, v.length);
                dos.write(v, 0, v.length);
                break;
            }

            case "[[B":
            {
                dos.writeByte(BINARY);
                byte[][] v = (byte[][]) value;
                writeVarInt(dos, v.length);
                for (byte[] d : v)
                {
                    writeVarInt(dos, d.length);
                    dos.write(d, 0, d.length);
                }
                break;
            }

            case "[S":
            {
                dos.writeByte(SHORT);
                short[] v = (short[]) value;
                writeVarInt(dos, v.length);

                for (short s : v)
                {
                    dos.writeShort(s);
                }
                break;
            }

            case "[I":
            {
                dos.writeByte(INT);
                int[] v = (int[]) value;
                writeVarInt(dos, v.length);

                for (int i : v)
                {
                    dos.writeInt(i);
                }
                break;
            }

            case "[J":
            {
                dos.writeByte(LONG);
                long[] v = (long[]) value;
                writeVarInt(dos, v.length);

                for (long l : v)
                {
                    dos.writeLong(l);
                }
                break;
            }

            case "[F":
            {
                dos.writeByte(FLOAT);
                float[] v = (float[]) value;
                writeVarInt(dos, v.length);

                for (float f : v)
                {
                    dos.writeFloat(f);
                }
                break;
            }

            case "[Ljava.lang.String;":
            {
                dos.writeByte(STRING_UTF8);
                String[] v = (String[]) value;
                writeVarInt(dos, v.length);

                for (String s : v)
                {
                    dos.writeUTF(s);
                }
                break;
            }

            default:
            {
                throw new Exception("Dont support array type: " + value.getClass().getName());
            }
        }

        return true;
    }

    private void writeVarInt (DataOutputStream dos, int i) throws Exception
    {
        do
        {
            int a = i & 0x7F;
            i >>>= 7;

            if (i > 0)
            {
                a |= 0x80;
            }

            dos.writeByte(a);
        } while (i > 0);
    }

    private boolean addKey (int key)
    {
        Integer k = new Integer(key);

        if (list_keys.contains(k))
        {
            return false;
        }

        list_keys.add(k);

        return true;
    }

    private int readVarInt (DataInputStream dis) throws Exception
    {
        int v = 0;
        int i = 0;
        int b = 0;

        do
        {
            b = dis.readByte() & 0xFF;

            v |= (b & 0x7F) << i;

            i += 7;
        } while (b > 127);

        return v;
    }

    public static int MurmurHash (String key)
    {
        byte[] data = key.getBytes(java.nio.charset.StandardCharsets.US_ASCII);

        int len = data.length;

        final int c1 = 0xcc9e2d51;
        final int c2 = 0x1b873593;

        int h1 = 123456;
        int roundedEnd = (len & 0xfffffffc); // round down to 4 byte block

        for (int i = 0; i < roundedEnd; i += 4)
        {
            // little endian load order
            int k1 = (data[i] & 0xff) | ((data[i + 1] & 0xff) << 8) | ((data[i + 2] & 0xff) << 16) | (data[i + 3] << 24);
            k1 *= c1;
            k1 = (k1 << 15) | (k1 >>> 17); // ROTL32(k1,15);
            k1 *= c2;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19); // ROTL32(h1,13);
            h1 = h1 * 5 + 0xe6546b64;
        }

        // tail
        int k1 = 0;

        switch (len & 0x03)
        {
            case 3:
                k1 = (data[roundedEnd + 2] & 0xff) << 16;
                // fallthrough
            case 2:
                k1 |= (data[roundedEnd + 1] & 0xff) << 8;
                // fallthrough
            case 1:
                k1 |= (data[roundedEnd] & 0xff);
                k1 *= c1;
                k1 = (k1 << 15) | (k1 >>> 17); // ROTL32(k1,15);
                k1 *= c2;
                h1 ^= k1;
        }

        // finalization
        h1 ^= len;

        // fmix(h1);
        h1 ^= h1 >>> 16;
        h1 *= 0x85ebca6b;
        h1 ^= h1 >>> 13;
        h1 *= 0xc2b2ae35;
        h1 ^= h1 >>> 16;

        return h1;
    }
}