package util.collection;

import java.util.Arrays;
import java.util.Iterator;
import java.util.NoSuchElementException;

public class MapItem implements Iterable<MapItem.Entry>
{
    public final static MapItem EMPTY = new MapItem(0).toUnmodifiableMapItem();

    /**
     * Default initial capacity. Used if not specified in the constructor
     */
    private static final int DEFAULT_CAPACITY = 8;

    /**
     * Default load factor. Used if not specified in the constructor
     */
    private static final float DEFAULT_LOAD_FACTOR = 0.5f;

    /**
     * The maximum number of elements allowed without allocating more space.
     */
    protected int maxSize;

    /**
     * The load factor for the map. Used to calculate {@link #maxSize}.
     */
    private final float loadFactor;

    private boolean autoTrim;

    protected String[] keys;
    protected int[]    values;
    protected int      size;
    protected int      mask;

    public MapItem ()
    {
        this(false, DEFAULT_CAPACITY, DEFAULT_LOAD_FACTOR);
    }

    public MapItem (boolean autoTrim)
    {
        this(autoTrim, DEFAULT_CAPACITY, DEFAULT_LOAD_FACTOR);
    }

    public MapItem (int initialCapacity)
    {
        this(false, initialCapacity, DEFAULT_LOAD_FACTOR);
    }

    public MapItem (boolean autoTrim, int initialCapacity)
    {
        this(autoTrim, initialCapacity, DEFAULT_LOAD_FACTOR);
    }

    public MapItem (boolean autoTrim, int initialCapacity, float loadFactor)
    {
        if (loadFactor <= 0.0f || loadFactor > 1.0f)
        {
            // Cannot exceed 1 because we can never store more than capacity elements;
            // using a bigger loadFactor would trigger rehashing before the desired load is reached.
            throw new IllegalArgumentException("loadFactor must be > 0 and <= 1");
        }

        this.loadFactor = loadFactor;
        this.autoTrim = autoTrim;

        // Adjust the initial capacity if necessary.
        int capacity = safeFindNextPositivePowerOfTwo(initialCapacity);
        mask = capacity - 1;

        // Allocate the arrays.
        keys = new String[capacity];
        values = new int[capacity];

        // Initialize the maximum size value.
        maxSize = calcMaxSize(capacity);
    }

	public MapItem (String itemID, int itemNum)
	{
        this(false, DEFAULT_CAPACITY, DEFAULT_LOAD_FACTOR);
        this.increase(itemID, itemNum);
	}
	
    private final static int TYPE_PUT      = 0;
    private final static int TYPE_INCREASE = 1;
    private final static int TYPE_DECREASE = -1;

    public int get (String key)
    {
        int index = indexOf(key);
        return index == -1 ? 0 : values[index];
    }

    public boolean contains (String key)
    {
        return indexOf(key) >= 0;
    }

    public int put (String key, int value)
    {
        return updateVal(key, value, TYPE_PUT);
    }

    public void put (MapItem source)
    {
        updateVal(source, TYPE_PUT);
    }

    public int increase (String key, int value)
    {
        return updateVal(key, value, TYPE_INCREASE);
    }

    public void increase (MapItem source)
    {
        updateVal(source, TYPE_INCREASE);
    }

    public int decrease (String key, int value)
    {
        return updateVal(key, value, TYPE_DECREASE);
    }

    public void decrease (MapItem source)
    {
        updateVal(source, TYPE_DECREASE);
    }

    public int remove (String key)
    {
        int index = indexOf(key);
        if (index == -1)
            return 0;

        int prev = values[index];
        removeAt(index);
        return prev;
    }

    public boolean isEnough (String key, int value)
    {
        if (value <= 0)
            return false;
        return get(key) >= value;
    }

    public boolean isEnough (MapItem source)
    {
        if (source == null || source.size == 0 || source.size > size)
            return false;
        String key;
        int value;
        int index;
        for (int sourceIndex = 0, len = source.keys.length; sourceIndex < len; sourceIndex++)
        {
            key = source.keys[sourceIndex];
            if (key == null)
                continue;
            value = source.values[sourceIndex];
            if (value <= 0)
                return false;
            index = indexOf(key);
            if (index < 0 || value > values[index])
                return false;
        }
        return true;
    }

    @Override
    public boolean equals (Object obj)
    {
        if (this == obj)
        {
            return true;
        }
        if (!(obj instanceof MapItem))
        {
            return false;
        }
        @SuppressWarnings("rawtypes")
        MapItem other = (MapItem) obj;
        if (size != other.size)
        {
            return false;
        }
        String key;
        int index;
        for (int i = 0; i < keys.length; ++i)
        {
            key = keys[i];
            if (key == null)
                continue;
            index = other.indexOf(key);
            if (index < 0)
                return false;
            if (values[i] != other.values[index])
                return false;
        }
        return true;
    }

    private int updateVal (String key, int value, int type)
    {
        if (key == null)
            throw new NullPointerException();
        int startIndex = hashIndex(key);
        int index = startIndex;
        int previousValue;

        for (; ; )
        {
            if (keys[index] == null)
            {
                previousValue = 0;
                // Found empty slot, use it.
                keys[index] = key;
                if (type == TYPE_DECREASE)
                    values[index] = -value;
                else
                    values[index] = value;

                if (autoTrim && values[index] == 0)
                    removeAt(index);

                growSize();
                break;
            }
            if (keys[index].equals(key))
            {
                // Found existing entry with this key, just replace the value.
                previousValue = values[index];
                if (type == TYPE_PUT)
                    values[index] = value;
                else if (type == TYPE_INCREASE)
                    values[index] += value;
                else
                    values[index] -= value;

                if (autoTrim && values[index] == 0)
                    removeAt(index);
                break;
            }

            // Conflict, keep probing ...
            if ((index = probeNext(index)) == startIndex)
            {
                // Can only happen if the map was full at MAX_ARRAY_SIZE and couldn't grow.
                throw new IllegalStateException("Unable to insert");
            }
        }
        return previousValue;
    }

    private void updateVal (MapItem source, int type)
    {
        if (source == null || source.size == 0)
            return;
        for (int i = 0, len = source.keys.length; i < len; ++i)
        {
            String sourceKey = source.keys[i];
            if (sourceKey != null)
            {
                updateVal(sourceKey, source.values[i], type);
            }
        }
    }

    public void trim ()
    {
        for (int i = keys.length - 1; i >= 0; --i)
        {
            if (keys[i] != null && values[i] == 0)
                removeAt(i);
        }
    }

    public int size ()
    {
        return size;
    }

    public boolean isEmpty ()
    {
        return size == 0;
    }

    public void clear ()
    {
        Arrays.fill(keys, null);
        Arrays.fill(values, (int) 0);
        size = 0;
    }

    /**
     * Locates the index for the given key. This method probes using double hashing.
     *
     * @param key the key for an entry in the map.
     * @return the index where the key was found, or {@code -1} if no entry is found for that key.
     */
    private int indexOf (String key)
    {
        int startIndex = hashIndex(key);
        int index = startIndex;

        for (; ; )
        {
            if (keys[index] == null)
            {
                // It's available, so no chance that this value exists anywhere in the map.
                return -1;
            }
            if (keys[index].equals(key))
            {
                return index;
            }

            // Conflict, keep probing ...
            if ((index = probeNext(index)) == startIndex)
            {
                return -1;
            }
        }
    }

    /**
     * Returns the hashed index for the given key.
     */
    private int hashIndex (String key)
    {
        // The array lengths are always a power of two, so we can use a bitmask to stay inside the array bounds.
        return hashCode(key) & mask;
    }

    /**
     * Returns the hash code for the key.
     */
    private static int hashCode (String key)
    {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

    /**
     * Get the next sequential index after {@code index} and wraps if necessary.
     */
    private int probeNext (int index)
    {
        // The array lengths are always a power of two, so we can use a bitmask to stay inside the array bounds.
        return (index + 1) & mask;
    }

    /**
     * Grows the map size after an insertion. If necessary, performs a rehash of the map.
     */
    private void growSize ()
    {
        size++;

        if (size > maxSize)
        {
            if (keys.length == Integer.MAX_VALUE)
            {
                throw new IllegalStateException("Max capacity reached at size=" + size);
            }

            // Double the capacity.
            rehash(keys.length << 1);
        }
    }

    /**
     * Removes entry at the given index position. Also performs opportunistic, incremental rehashing
     * if necessary to not break conflict chains.
     *
     * @param index the index position of the element to remove.
     * @return {@code true} if the next item was moved back. {@code false} otherwise.
     */
    private boolean removeAt (final int index)
    {
        --size;
        // Clearing the key is not strictly necessary (for GC like in a regular collection),
        // but recommended for security. The memory location is still fresh in the cache anyway.
        keys[index] = null;
        values[index] = 0;

        // In the interval from index to the next available entry, the arrays may have entries
        // that are displaced from their base position due to prior conflicts. Iterate these
        // entries and move them back if possible, optimizing future lookups.
        // Knuth Section 6.4 Algorithm R, also used by the JDK's IdentityHashMap.

        int nextFree = index;
        int i = probeNext(index);
        for (String key = keys[i]; key != null; key = keys[i = probeNext(i)])
        {
            int bucket = hashIndex(key);
            if (i < bucket && (bucket <= nextFree || nextFree <= i) ||
                    bucket <= nextFree && nextFree <= i)
            {
                // Move the displaced entry "back" to the first available position.
                keys[nextFree] = key;
                values[nextFree] = values[i];
                // Put the first entry after the displaced entry
                keys[i] = null;
                values[i] = 0;
                nextFree = i;
            }
        }
        return nextFree != index;
    }

    /**
     * Calculates the maximum size allowed before rehashing.
     */
    private int calcMaxSize (int capacity)
    {
        // Clip the upper bound so that there will always be at least one available slot.
        int upperBound = capacity - 1;
        return Math.min(upperBound, (int) (capacity * loadFactor));
    }

    /**
     * Rehashes the map for the given capacity.
     *
     * @param newCapacity the new capacity for the map.
     */
    private void rehash (int newCapacity)
    {
        String[] oldKeys = keys;
        int[] oldVals = values;

        keys = new String[newCapacity];
        values = new int[newCapacity];

        maxSize = calcMaxSize(newCapacity);
        mask = newCapacity - 1;

        // Insert to the new arrays.
        for (int i = 0; i < oldKeys.length; ++i)
        {
            String oldKey = oldKeys[i];
            if (oldKey != null)
            {
                // Inlined put(), but much simpler: we don't need to worry about
                // duplicated keys, growing/rehashing, or failing to insert.

                int index = hashIndex(oldKey);

                for (; ; )
                {
                    if (keys[index] == null)
                    {
                        keys[index] = oldKey;
                        values[index] = oldVals[i];
                        break;
                    }

                    // Conflict, keep probing. Can wrap around, but never reaches startIndex again.
                    index = probeNext(index);
                }
            }
        }
    }

    @Override
    public String toString ()
    {
        if (isEmpty())
            return "{}";

        StringBuilder sb = new StringBuilder(4 * size);
        sb.append('{');
        boolean first = true;
        for (int i = 0; i < values.length; ++i)
        {
            String key = keys[i];
            if (key != null)
            {
                if (!first)
                    sb.append(',');
                sb.append('"').append(key).append("\":").append(values[i]);
                first = false;
            }
        }
        return sb.append('}').toString();
    }

    /**
     * Fast method of finding the next power of 2 greater than or equal to the supplied value.
     * <p>
     * <p>If the value is {@code <= 0} then 1 will be returned.
     * This method is not suitable for {@link Integer#MIN_VALUE} or numbers greater than 2^30.
     *
     * @param value from which to search for next power of 2
     * @return The next power of 2 or the value itself if it is a power of 2
     */
    public static int findNextPositivePowerOfTwo (final int value)
    {
        assert value > Integer.MIN_VALUE && value < 0x40000000;
        return 1 << (32 - Integer.numberOfLeadingZeros(value - 1));
    }

    /**
     * Fast method of finding the next power of 2 greater than or equal to the supplied value.
     * <p>This method will do runtime bounds checking and call {@link #findNextPositivePowerOfTwo(int)} if within a
     * valid range.
     *
     * @param value from which to search for next power of 2
     * @return The next power of 2 or the value itself if it is a power of 2.
     * <p>Special cases for return values are as follows:
     * <ul>
     * <li>{@code <= 0} -> 1</li>
     * <li>{@code >= 2^30} -> 2^30</li>
     * </ul>
     */
    public static int safeFindNextPositivePowerOfTwo (final int value)
    {
        return value <= 0 ? 1 : value >= 0x40000000 ? 0x40000000 : findNextPositivePowerOfTwo(value);
    }

    @Override
    public Iterator<Entry> iterator ()
    {
        return new ItemIterator();
    }

    private final class ItemIterator implements Iterator<Entry>, Entry
    {
        private int prevIndex  = -1;
        private int nextIndex  = -1;
        private int entryIndex = -1;

        private void scanNext ()
        {
            while (++nextIndex != keys.length && keys[nextIndex] == null)
            {
            }
        }

        @Override
        public boolean hasNext ()
        {
            if (nextIndex == -1)
            {
                scanNext();
            }
            return nextIndex != keys.length;
        }

        @Override
        public Entry next ()
        {
            if (!hasNext())
            {
                throw new NoSuchElementException();
            }

            prevIndex = nextIndex;
            scanNext();

            // Always return the same Entry object, just change its index each time.
            entryIndex = prevIndex;
            return this;
        }

        @Override
        public String key ()
        {
            return keys[entryIndex];
        }

        @Override
        public int value ()
        {
            return values[entryIndex];
        }
    }

    public interface Entry
    {
        String key ();

        int value ();
    }

    public void setAutoTrim (boolean value)
    {
        autoTrim = value;
    }

    @Override
    protected MapItem clone ()
    {
        return clone(false);
    }

    private MapItem clone (boolean isUnmodifiable)
    {
        MapItem m;
        if (isUnmodifiable)
            m = new UnmodifiableMapItem(false, keys.length, loadFactor);
        else
            m = new MapItem(autoTrim, keys.length, loadFactor);

        System.arraycopy(keys, 0, m.keys, 0, keys.length);
        System.arraycopy(values, 0, m.values, 0, values.length);
        m.size = size;
        m.maxSize = maxSize;
        m.mask = mask;

        return m;
    }

    public UnmodifiableMapItem toUnmodifiableMapItem ()
    {
        return (UnmodifiableMapItem) clone(true);
    }
}
