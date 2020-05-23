package data;

import java.util.List;
import java.util.Map;

public class DiceInfo
{
    public Map<Integer, Slot[][]> DAILY;
    public Map<Integer, Slot[][]> EVENT;

    public static class Slot
    {
        public String id;
        public int num;
        public int rate;
    }
}
