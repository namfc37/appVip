package data;

import java.util.*;

public class ConsumeEventInfo {

    public Map<String, ConsumeEventTypeInfo> types = new LinkedHashMap<>();

    public static class ConsumeEventTypeInfo {
      //  public String NAME;
        public int CONSUME_CONVERT;
        public int POINT_CONVERT;

        public TreeMap<Integer, List<HashMap<String,Integer>>> GROUPS = new TreeMap<>();
        public TreeMap<Integer, Rate> RATES = new TreeMap<>();


    }

    public static class Item {
        public String id;
        public int num;

        public Item(String id, int num) {
            this.id = id;
            this.num = num;
        }
    }

    public static class Rate {
        public List<Integer> group = new ArrayList<>();
        public List<Integer> rate = new ArrayList<>();
    }
}