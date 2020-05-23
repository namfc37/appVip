package data;

import java.util.List;

public class ComboInfo
{
    private String         ID;
    private String[]       CHILDREN;
    private byte           INIT;
    private byte           STEP;
    private List<BuffInfo> BUFF_INFO;

    public static class BuffInfo
    {
        private byte type;
        private byte area;
        private byte unit;
        private int  value;
        private int  bonus;

        public byte getType ()
        {
            return type;
        }

        public byte getArea ()
        {
            return area;
        }

        public byte getUnit ()
        {
            return unit;
        }

        public int getValue ()
        {
            return value;
        }

        public int getBonus ()
        {
            return bonus;
        }
    }

    public void init ()
    {

    }

    public int NUM_BUFF_INFO ()
    {
        return BUFF_INFO.size();
    }

    public BuffInfo BUFF_INFO (int id)
    {
        return BUFF_INFO.get(id);
    }

    public byte INIT ()
    {
        return INIT;
    }

    public byte STEP ()
    {
        return STEP;
    }

    public int SIZE ()
    {
        return CHILDREN.length;
    }
}
