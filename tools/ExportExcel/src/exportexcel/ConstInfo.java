package exportexcel;

import java.time.LocalDateTime;
import java.util.HashMap;

public class ConstInfo
{
    public String                time;
    public HashMap<String, Info> mapInfo;

    public ConstInfo ()
    {
        time = LocalDateTime.now().toString();
        mapInfo = new HashMap<>();
    }

    public static class Info
    {
        public transient String id;

        public String filename;
        public int    size;
        public String hash;

        public Info (String id, String filename, int size, String hash)
        {
            this.id = id;
            this.filename = filename;
            this.size = size;
            this.hash = hash;
        }
    }

    public void addInfo (String id, String filename, int size, String hash)
    {
        mapInfo.put(id, new Info(id, filename, size, hash));
    }
}
