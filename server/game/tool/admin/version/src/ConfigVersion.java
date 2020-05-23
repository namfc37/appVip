import com.google.gson.*;

import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class ConfigVersion
{
    public final static Gson pretty = new GsonBuilder()
            .setPrettyPrinting()
            .create();

    public static void main (String[] args) throws Exception
    {
        String command = args[0];

        switch (command)
        {
            case "apkVersion":
                apkVersion(args);
                break;
            case "clientVersion":
                clientVersion(args);
                break;
            case "minClientCode":
                minClientCode(args);
                break;
            default:
                logError("Unknown command", command);
        }
    }

    public static void apkVersion (String[] args) throws Exception
    {
        String path = args[1];
        String build = args[2];
        String code = args[3];
        String name = args[4];

        JsonObject o = readJsonFile(path).getAsJsonObject();
        JsonObject jBuild = o.get(build).getAsJsonObject();
        replaceInt(jBuild, "version_code", code);
        replaceString(jBuild, "version_name", name);

        writeJsonFile(path, o);
    }

    public static void clientVersion (String[] args) throws Exception
    {
        String path = args[1];
        String newVersion = args[2];

        JsonObject o = readJsonFile(path).getAsJsonObject();
        replaceInt(o, "script_version", newVersion);

        writeJsonFile(path, o);
    }

    public static void minClientCode (String[] args) throws Exception
    {
        String path = args[1];
        String newVersion = args[2];

        JsonObject o = readJsonFile(path).getAsJsonObject();
        replaceInt(o, "minClientCode", newVersion);

        writeJsonFile(path, o);
    }

    static void replaceString (JsonObject o, String key, String newValue)
    {
        String oldValue = o.get(key).getAsString();
        o.addProperty(key, newValue);

        logInfo("replace", key, oldValue, newValue);
    }

    static void replaceInt (JsonObject o, String key, String value)
    {
        int newValue = Integer.parseInt(value);
        int oldValue = o.get(key).getAsInt();
        o.addProperty(key, newValue);

        logInfo("replace", key, oldValue, newValue);
    }

    public static JsonElement readJsonFile (String path) throws Exception
    {
        return JsonParser.parseReader(Files.newBufferedReader(Paths.get(path), StandardCharsets.UTF_8));
    }

    public static void writeJsonFile (String filePath, JsonElement data) throws Exception
    {
        String formatData = pretty.toJson(data);
        Files.write(Paths.get(filePath), formatData.getBytes(StandardCharsets.UTF_8));
    }

    public static void printLog (String tag, Object... acs)
    {
        final String separator = " | ";
        StringBuilder sb = new StringBuilder();
        sb.append(tag).append(separator);
        for (Object o : acs)
            sb.append(o).append(separator);
        System.out.println(sb);
    }

    public static void logInfo (Object... acs)
    {
        printLog ("INFO ", acs);
    }

    public static void logError (Object... acs)
    {
        printLog ("ERROR", acs);
    }
}
