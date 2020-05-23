package util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Json
{
    public final static Gson minify = new GsonBuilder()
            .create();

    public final static Gson pretty = new GsonBuilder()
            .setPrettyPrinting()
            .create();


    public static <T> T fromJson (String json, Class<T> classOfT)
    {
        return minify.fromJson(json, classOfT);
    }

    public static <T> T fromJson (String json, Type type)
    {
        return minify.fromJson(json, type);
    }

    public static <T> T fromJson (JsonElement json, Class<T> classOfT)
    {
        return minify.fromJson(json, classOfT);
    }

    public static <T> T fromJson (JsonElement json, Type type)
    {
        return minify.fromJson(json, type);
    }

    public static <T> T fromFile (String filePath, Class<T> classOfT) throws Exception
    {
        return minify.fromJson(Files.newBufferedReader(Paths.get(filePath), StandardCharsets.UTF_8), classOfT);
    }

    public static <T> T fromFile (String filePath, Type type) throws Exception
    {
        return minify.fromJson(Files.newBufferedReader(Paths.get(filePath), StandardCharsets.UTF_8), type);
    }

    public static String toJson (Object src)
    {
        return minify.toJson(src);
    }

    public static String toJsonPretty (Object src)
    {
        return pretty.toJson(src);
    }

    public static JsonElement toJsonTree (Object src)
    {
        return minify.toJsonTree(src);
    }

    public static JsonElement parse (String json)
    {
        return new JsonParser().parse(json);
    }
}
