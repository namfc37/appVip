package data;

import java.util.List;

public class ComboInfo
{
    public String         ID;
    public String         NAME;
    public String[]       CHILDREN;
    public byte           INIT;
    public byte           STEP;
    public List<BuffInfo> BUFF_INFO;

    public static class BuffInfo
    {
        public byte type;
        public byte area;
        public byte unit;
        public int  value;
        public int  bonus;
    }
}
