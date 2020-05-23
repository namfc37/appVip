package util.collection;

import com.google.gson.*;

import java.lang.reflect.Type;
import java.util.Map;

public class TypeAdapterMapItem implements JsonSerializer<MapItem>, JsonDeserializer<MapItem>
{
    private boolean isUnmodifiable;

    public TypeAdapterMapItem (boolean isUnmodifiable)
    {
        this.isUnmodifiable = isUnmodifiable;
    }

    @Override
    public MapItem deserialize (JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException
    {
        JsonObject o = jsonElement.getAsJsonObject();
        MapItem items = new MapItem(o.size());
        for (Map.Entry<String, JsonElement> e : o.entrySet())
            items.put(e.getKey(), e.getValue().getAsInt());
        return isUnmodifiable ? items.toUnmodifiableMapItem() : items;
    }

    @Override
    public JsonElement serialize (MapItem items, Type type, JsonSerializationContext jsonSerializationContext)
    {
        JsonObject o = new JsonObject();
        for (MapItem.Entry e : items)
            o.addProperty(e.key(), e.value());
        return o;
    }
}
