package data;

import util.collection.UnmodifiableMapItem;

import java.util.TreeMap;

public class DailyGiftInfo
{
    private TreeMap<Integer, UnmodifiableMapItem[]> NEW_USER;
    private TreeMap<Integer, UnmodifiableMapItem[]> EVENT;

    public UnmodifiableMapItem[] rewards (boolean isNewUser, int level)
    {
        return (isNewUser ? NEW_USER : EVENT).floorEntry(level).getValue();
    }
}
