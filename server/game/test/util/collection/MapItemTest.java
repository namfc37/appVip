package util.collection;

import org.junit.Test;

import java.util.Iterator;

import static org.junit.Assert.*;
import static org.junit.Assert.assertTrue;

public class MapItemTest
{
    @Test
    public void put() {
        MapItem map = new MapItem();
        String k = "put";
        int v = 64;

        assertFalse(map.contains(k));
        assertEquals(0, map.put(k, v));
        assertTrue(map.contains(k));

        assertSame(v, map.get(k));
        assertEquals(v, map.get(k));

        assertEquals(v, map.increase(k, 1));
        assertEquals(v + 1, map.decrease(k, 1));
        assertSame(v, map.get(k));
        assertEquals(v, map.get(k));

        assertEquals(1, map.size());
        assertTrue(map.contains(k));
    }

    @Test
    public void autoTrimZero() {
        MapItem map = new MapItem(true);
        String k = "putObject";
        int v = 0;

        assertFalse(map.contains(k));
        assertEquals(0, map.put(k, v));
        assertFalse(map.contains(k));
        assertEquals(0, map.size());

        assertEquals(0, map.increase(k, 1));
        assertEquals(1, map.size());
        assertTrue(map.contains(k));

        assertEquals(1, map.decrease(k, 1));
        assertEquals(0, map.size());
        assertFalse(map.contains(k));
    }

    @Test
    public void increase() {
        MapItem map = new MapItem();
        String k = "increase";
        int v = 10;

        assertFalse(map.contains(k));
        assertEquals(0, map.increase(k, v));
        assertTrue(map.contains(k));

        assertSame(v, map.get(k));
        assertEquals(v, map.get(k));

        assertEquals(v, map.increase(k, 1));
        assertEquals(v + 1, map.decrease(k, 1));
        assertSame(v, map.get(k));
        assertEquals(v, map.get(k));

        assertEquals(1, map.size());
        assertTrue(map.contains(k));
    }

    @Test
    public void decrease() {
        MapItem map = new MapItem();
        String k = "decrease";
        int v = -10;

        assertFalse(map.contains(k));
        assertEquals(0, map.decrease(k, v));
        assertTrue(map.contains(k));

        assertEquals(10, map.get(k));

        assertEquals(10, map.increase(k, 1));
        assertEquals(11, map.decrease(k,  1));
        assertEquals(10, map.get(k));

        assertEquals(1, map.size());
        assertTrue(map.contains(k));
    }

    @Test
    public void remove() {
        MapItem map = new MapItem();

        assertEquals(0, map.size());
        assertTrue(map.isEmpty());

        map.put("A", 1);
        map.put("B", 2);

        assertTrue(map.contains("A"));
        assertEquals(1, map.remove("A"));
        assertFalse(map.contains("A"));
        assertEquals(1, map.size());

        assertTrue(map.contains("B"));
        assertEquals(2, map.remove("B"));
        assertFalse(map.contains("B"));
        assertEquals(0, map.size());
        assertTrue(map.isEmpty());
    }

    @Test
    public void clear() {
        MapItem map = new MapItem();

        assertEquals(0, map.size());
        assertTrue(map.isEmpty());

        map.put("X", 1);
        map.put("Y", 2);
        map.put("Z", 2);

        assertEquals(3, map.size());
        map.clear();

        assertEquals(0, map.size());
        assertTrue(map.isEmpty());
    }

    @Test
    public void putAll() {
        MapItem m1 = new MapItem();

        MapItem m2 = new MapItem();
        m2.put("X", 1);
        m2.put("Y", 2);
        m2.put("Z", 3);

        m1.put(m2);

        assertEquals(m1.get("X"), m2.get("X"));
        assertEquals(m1.get("Y"), m2.get("Y"));
        assertEquals(m1.get("Z"), m2.get("Z"));

        m1.put(m2);

        assertEquals(m1.get("X"), m2.get("X"));
        assertEquals(m1.get("Y"), m2.get("Y"));
        assertEquals(m1.get("Z"), m2.get("Z"));

        assertTrue(m1.equals(m2));
    }

    @Test
    public void increaseAll() {
        MapItem m1 = new MapItem();

        MapItem m2 = new MapItem();
        m2.put("X", 1);
        m2.put("Y", 2);
        m2.put("Z", 3);

        m1.increase(m2);

        assertEquals(m1.get("X"), m2.get("X"));
        assertEquals(m1.get("Y"), m2.get("Y"));
        assertEquals(m1.get("Z"), m2.get("Z"));

        assertTrue(m1.equals(m2));
        m1.increase(m2);

        assertEquals(m1.get("X"), m2.get("X") * 2);
        assertEquals(m1.get("Y"), m2.get("Y") * 2);
        assertEquals(m1.get("Z"), m2.get("Z") * 2);
    }

    @Test
    public void decreaseAll() {
        MapItem m1 = new MapItem();

        MapItem m2 = new MapItem();
        m2.put("X", 1);
        m2.put("Y", 2);
        m2.put("Z", 3);

        m1.decrease(m2);

        assertEquals(m1.get("X"), -m2.get("X"));
        assertEquals(m1.get("Y"), -m2.get("Y"));
        assertEquals(m1.get("Z"), -m2.get("Z"));

        m1.decrease(m2);

        assertEquals(m1.get("X"), -2 * m2.get("X"));
        assertEquals(m1.get("Y"), -2 * m2.get("Y"));
        assertEquals(m1.get("Z"), -2 * m2.get("Z"));
    }

    @Test
    public void primitiveEntry() {
        MapItem m1 = new MapItem();

        MapItem m2 = new MapItem();
        m2.put("X", 1);
        m2.put("Y", 2);
        m2.put("Z", 3);

        for (MapItem.Entry entry : m2)
            m1.put(entry.key(), entry.value());

        assertTrue(m1.equals(m2));
    }

    @Test
    public void removeZero() {
        MapItem m2 = new MapItem();
        m2.put("X", 1);
        m2.put("Y", 0);
        m2.put("Z", 3);
        m2.put("W", 0);

        assertEquals(4, m2.size());
        m2.trim();
        assertEquals(2, m2.size());

        assertTrue(m2.contains("X"));
        assertFalse(m2.contains("Y"));
        assertTrue(m2.contains("Z"));
        assertFalse(m2.contains("W"));

        assertEquals(m2.get("X"), 1);
        assertEquals(m2.get("Y"), 0);
        assertEquals(m2.get("Z"), 3);
        assertEquals(m2.get("W"), 0);
    }

    @Test
    public void iteartor() {
        MapItem map = new MapItem();
        map.put("X", 1);
        map.put("Y", 0);
        map.put("Z", 3);
        map.put("W", 0);
        map.remove("W");

        Iterator<MapItem.Entry> itr = map.iterator();
        while (itr.hasNext()) {
            MapItem.Entry entry = itr.next();
            assertNotNull(entry.key());
            assertNotNull(entry.value());
        }
        assertFalse(map.isEmpty());
        assertEquals(3, map.size());
    }

    @Test
    public void isEnough () {
        MapItem m = new MapItem();
        m.put("X", 1);
        m.put("Y", 2);
        m.put("Z", 3);

        assertFalse(m.isEnough("X", 0));
        assertTrue(m.isEnough("Y", 1));
        assertFalse(m.isEnough("Z", 100));

        MapItem a = new MapItem();
        assertFalse(m.isEnough(a));
        a.put("X", 0);
        assertFalse(m.isEnough(a));

        a.put("X", 1);
        a.put("Y", 2);
        a.put("Z", 3);

        assertTrue(m.isEnough(a));
        assertTrue(a.isEnough(m));

        MapItem b = new MapItem();
        b.put("X", 1);
        b.put("Y", 4);
        b.put("Z", 3);

        assertFalse(m.isEnough(b));
    }
}