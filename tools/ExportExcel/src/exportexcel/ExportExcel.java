package exportexcel;


import data.ItemInfo;
import exportexcel.sheet.*;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.text.WordUtils;

import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Map;

public class ExportExcel
{
    public static String inputData, outputData, outputSource;
    public static boolean isServer;

    public static void main (String[] args) throws Exception
    {
        switch (args[0])
        {
            case "const":
                exportConst(args);
                break;
            case "text":
                ExportText.export(args);
                break;
        }
    }

    public static void exportConst (String[] args) throws Exception
    {
        inputData = args[1];
        outputData = args[2];
        isServer = args[3].equalsIgnoreCase("server");
        if (args.length >= 5)
            outputSource = args[4];

        ArrayList<ParseWorkbook> sheets = new ArrayList<>();
        sheets.add(new Define("01. Define.xlsx"));
        sheets.add(new Action("54. Actions.xlsx"));
        sheets.add(new Stock("07. Stock.xlsx"));
        sheets.add(new CommonItem("00. Common_item.xlsx"));
        sheets.add(new Pest("04. Pest.xlsx"));
        sheets.add(new Plant("03. Plant.xlsx"));
        sheets.add(new Pot("05. Pot.xlsx"));
        sheets.add(new Floor("06. Floor.xlsx"));
        sheets.add(new Machine("10. Machine.xlsx"));
        sheets.add(new Product("14. Product.xlsx"));
        sheets.add(new Material("15. Material.xlsx"));
        sheets.add(new Decor("16. Decor.xlsx"));
        sheets.add(new Skin("40. Skin Item.xlsx"));
        sheets.add(new UserLevel("02. User_level.xlsx"));
        sheets.add(new SkipTime("09. Diamon_skip_time.xlsx"));
        sheets.add(new ItemDropRate("17. Item_Drop_Rate.xlsx"));
        sheets.add(new DailyPaidOrder("19. Daily_Paid_Order.xlsx"));
        sheets.add(new IBShop("20. IBshop.xls"));
        sheets.add(new PrivateShop("21. PrivateShop.xlsx"));
        sheets.add(new Newsboard("22. Newsboard.xlsx"));
        sheets.add(new AirShip("23. AirShip.xlsx"));
        sheets.add(new HireTom("24. Hire Tom.xlsx"));
        sheets.add(new LuckySpin("27. LuckySpin.xlsx"));
        sheets.add(new Combo("29. Combo.xlsx"));
        sheets.add(new Blacksmith("30. Blacksmith.xlsx"));
        sheets.add(new Dice("28. Dice.xlsx"));
        sheets.add(new Chest("32. Gacha Chest.xlsx"));
        sheets.add(new Mine("33. Mine.xlsx"));
        sheets.add(new DailyGift("31. Daily Gift.xlsx"));
        sheets.add(new Event01("37. Event 01.xlsx"));
        sheets.add(new Event02("51. Event 02.xlsx"));
        sheets.add(new EventItems("36. Event Items.xlsx"));//load tất cả event info trước khi load event items
        sheets.add(new FriendBug("35. Friend's Bug.xlsx"));
        sheets.add(new JackGarden("38. Jack's Garden.xlsx"));
        sheets.add(new Achievement("26. Achievement.xlsx"));
        sheets.add(new GiftCode("39. Gift code.xlsx"));
        sheets.add(new QuestBook("41. Quest Book.xlsx"));
        sheets.add(new Rating("42. Rating.xlsx"));
        sheets.add(new RankingBoard("43. Ranking.xlsx"));
        sheets.add(new FlippingCards("44. Flipping Cards.xlsx"));
        sheets.add(new QuestMission("46. Quest Mission.xlsx"));
        sheets.add(new ConsumeEvent("48. Consume Event.xlsx"));
        sheets.add(new Guild("50. Guild.xlsx"));
        sheets.add(new GuildDerby("51. Guild Derby.xlsx"));
        sheets.add(new Gachapon("52. Gachapon.xlsx"));
        sheets.add(new FishingItems("49. Fishing Items.xlsx"));
        sheets.add(new Fishing("52. Fishing.xlsx"));
        sheets.add(new Event03("53. Event 03.xlsx"));
        final String HEADER_PAYMENT = "25. Payment ";
        Files.list(Paths.get(ExportExcel.inputData))
             .filter(Files::isRegularFile)
             .filter(path -> path.getFileName().toString().contains(HEADER_PAYMENT))
             .filter(path -> !path.getFileName().toString().contains("~"))
             .forEach(path -> {
                    try
                    {
                        String filename = path.getFileName().toString();
                        String country = filename.substring(HEADER_PAYMENT.length(), filename.indexOf(".xlsx"));
                        sheets.add(new Payment(filename, country));
                    }
                    catch (Exception e)
                    {
                        e.printStackTrace();
                    }
              });

        sheets.add(new PigBank("45. Pig Bank.xlsx"));
        sheets.add(new VIP("44. VIP.xlsx"));
        sheets.add(new Truck("47. Truck.xlsx"));
        sheets.add(new PaymentAccumulate ("54. Payment_Accumulate.xlsx"));
//        Log.debug();
//        Log.debug("setItemId", ParseWorkbook.setItemId);
//        Log.debug("mapNameToItemId", ParseWorkbook.mapNameToItemId);

        for (ParseWorkbook sheet : sheets)
            sheet.handle();

        ParseWorkbook.exportAllConstInfo();

        if (ParseWorkbook.defineMap != null)
        {
            String filename = "defineHelper.js";
            Files.write(Paths.get(ExportExcel.outputData + "\\" + filename), ParseWorkbook.defineMap.toString().getBytes(StandardCharsets.UTF_8));
        }

        exportSource();
    }

    public static void exportSource () throws Exception
    {
        if (isServer)
        {
            writeItemTypeJava();
            writeItemSubTypeJava();
            writeItemIdJava();

//          GM TOOLS: create map items 
//          writeItemIdJson ();
//          writeItemSubTypeJson ();
//          writeItemTypeJson ();

            writeMiscInfoServer();
            writeCmdDefineServer();
            writeInterfaceServer(outputSource, "KeyDefine", Define.keyDefine);
            writeInterfaceServer(outputSource, "MiscDefine", Define.miscDefine);
        }
        else
        {
            writeCmdDefineClient();
            writeDefineClient(outputData, "KeyDefine", Define.keyDefine);
            writeDefineClient(outputData, "MiscDefine", Define.miscDefine);

            PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputData + "\\defineConstants.js")));
            w.println("var defineTypes = {};");

            for (Map.Entry<String, Integer> e : Define.mapType.entrySet())
                w.println("defineTypes.TYPE_" + e.getKey() + " = " + e.getValue() + ";");
            for (Map.Entry<String, Integer> e : Define.mapSubType.entrySet())
                w.println("defineTypes.SUB_TYPE_" + e.getKey() + " = " + e.getValue() + ";");
            w.close();
        }
    }

    private static void writeInterfaceServer (String folder, String filename, Map<String, Define.Info> mapInfo) throws Exception
    {
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(folder + "/" + filename + ".java")));
        w.println("package data;");
        w.println();
        w.println("public interface " + filename);
        w.println("{");

        for (Define.Info info : mapInfo.values())
        {
            switch (info.type)
            {
                case "String":
                    w.print("  " + info.type + " " + nameToDefine(info.key) + " = \"" + info.value + "\";");
                    break;
                default:
                    w.print("  " + info.type + " " + nameToDefine(info.key) + " = " + info.value + ";");
            }

            if (info.note != null)
                w.print(" //" + info.note);
            w.println();
        }

        w.println("}");
        w.close();
    }

    private static void writeDefineClient (String folder, String filename, Map<String, Define.Info> mapInfo) throws Exception
    {
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(folder + "/" + filename + ".js")));

        for (Define.Info info : mapInfo.values())
        {
            if (info == null)
            {
                w.println();
                continue;
            }

            switch (info.type)
            {
                case "String":
                    w.println("const " + nameToDefine(info.key) + " = '" + info.value + "';");
                    break;
                default:
                    w.println("const " + nameToDefine(info.key) + " = " + info.value + ";");
            }
        }

        w.close();
    }

    private static void writeCmdDefineServer () throws Exception
    {
        writeInterfaceServer(outputSource, "CmdDefine", Define.cmdDefine);

        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "/CmdName.java")));
        w.println("package data;");
        w.println();
        w.println("import java.util.Map;");
        w.println("import java.util.HashMap;");
        w.println();
        w.println("public class CmdName");
        w.println("{");

        w.println("  public static String get (short id)");
        w.println("  {");
        w.println("    return mapName.get(id);");
        w.println("  }");
        w.println();
        w.println("  private final static Map<Short,String> mapName;");
        w.println("  static");
        w.println("  {");
        w.println("    mapName = new HashMap<>();");

        for (Define.Info info : Define.cmdDefine.values())
            w.println("    mapName.put(CmdDefine." + info.key + ", \"" + info.key + "\");");
        w.println("  }");

        w.println("}");
        w.close();
    }

    private static void writeCmdDefineClient () throws Exception
    {
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputData + "\\CmdDefine.js")));
        w.println("gv.CMD = gv.CMD || {};");

        for (Define.Info info : Define.cmdDefine.values())
            w.println("gv.CMD." + nameToDefine(info.key) + " = " + info.value + ";");

        w.close();
    }

    private static void writeMiscInfoServer () throws Exception
    {
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(ExportExcel.outputSource + "\\MiscInfo.java")));
        w.println("package data;");
        w.println("import java.util.*;");
        w.println("import util.collection.*;");
        w.println("import util.Time;");
        w.println("import java.util.concurrent.ThreadLocalRandom;");
        w.println();
        w.println("public class MiscInfo");
        w.println("{");
        w.println("  public static MiscInfo instance;");
        w.println();

        for (Define.Info info : Define.miscInfo.values())
        {
            Define.Type type = Define.toType(info.type);
            w.print("  private " + type.getObject() + " " + info.key + ";");
            if (info.note != null)
                w.write(" //" + info.note);
            w.println();

            String camel = StringUtils.remove(WordUtils.capitalizeFully(info.key, '_'), "_");

            switch (type)
            {
                case SET_STRING:
                    w.println("  public static boolean " + info.key + "(String id) { return instance." + info.key + ".contains(id); }");
                    w.println("  public static int " + info.key + "_SIZE() { return instance." + info.key + ".size(); }");
                    break;
                case INTS:
                    w.println("  public static int " + info.key + "_SIZE() { return instance." + info.key + ".length; }");
                    w.println("  public static int " + info.key + "(int index) { return instance." + info.key + "[index]; }");
                    w.println("  public static int " + info.key + "(int index, int defaultValue) { return (index < 0 || index >= instance." + info.key + ".length) ? defaultValue : instance." + info.key + "[index]; }");
                    break;
                case DURATIONS:
                    w.println("  public static boolean isIn" + camel + "() { return Time.isInDuration(instance." + info.key + "); }");
                    w.println("  public static boolean isFinish" + camel + "(int timeStart) { return Time.isFinish(instance." + info.key + ", timeStart); }");
                    w.println("  public static int getTimeOpen" + camel + "() { return Time.getTimeOpenDuration(instance." + info.key + "); }");
                    w.println("  public static int getTimeEnd" + camel + "(int timeStart) { return Time.getTimeEndDuration(instance." + info.key + ", timeStart); }");
                    break;
                case MAP_RATE:
                    w.println("  public static " + type.getObject() + " " + info.key + "() { return instance." + info.key + "; }");
                    w.println("  public static String " + info.key + "_RANDOM_FLOOR(int max) { return instance." + info.key + ".floorEntry(ThreadLocalRandom.current().nextInt(max)).getValue(); }");
                    break;
                default:
                    w.println("  public static " + type.getObject() + " " + info.key + "() { return instance." + info.key + "; }");
                    break;
            }
            w.println();
        }

        w.println("}");
        w.close();
    }

    private static void writeItemIdJava () throws Exception
    {
        try (PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "\\ItemId.java"))))
        {
            w.println("package data;");
            w.println();
            w.println("public interface ItemId");
            w.println("{");

            for (ItemInfo info : ParseWorkbook.mapItemInfo.values())
            {
                if (info.TYPE == 0) //type common
                    w.println("  String " + info.ID + " = \"" + info.ID + "\"; //" + info.NAME);

                if (info.TYPE == 1) //type cây trồng
                    w.println("  String CAY_" + nameToDefine(info.NAME) + " = \"" + info.ID + "\"; //" + info.NAME);
                else
                    w.println("  String " + nameToDefine(info.NAME) + " = \"" + info.ID + "\"; //" + info.NAME);
            }

            w.println("}");
        }
    }

    private static void writeItemSubTypeJava () throws Exception
    {
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "\\ItemSubType.java")));
        w.println("package data;");
        w.println();
        w.println("public interface ItemSubType");
        w.println("{");

        for (Map.Entry<String, Integer> e : Define.mapSubType.entrySet())
            w.println("  byte " + e.getKey() + " = " + e.getValue() + ";");

        w.println();
        w.println("  String[] NAME = {");
        for (Map.Entry<String, Integer> e : Define.mapSubType.entrySet())
            w.println("    \"" + e.getKey() + "\", ");
        w.println("  };");

        w.println("}");
        w.close();
    }

    private static void writeItemTypeJava () throws Exception
    {
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "\\ItemType.java")));
        w.println("package data;");
        w.println();
        w.println("public interface ItemType");
        w.println("{");

        for (Map.Entry<String, Integer> e : Define.mapType.entrySet())
            w.println("  byte " + e.getKey() + " = " + e.getValue() + ";");

        w.println();
        w.println("  String[] NAME = {");
        for (Map.Entry<String, Integer> e : Define.mapType.entrySet())
            w.println("    \"" + e.getKey() + "\", ");
        w.println("  };");

        w.println("}");
        w.close();
    }
    
    private static void writeItemIdJson () throws Exception
    {
    	String bj = Util.gsonPretty.toJson(ParseWorkbook.mapItemInfo);
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "\\ItemId.json")));
        w.println(bj);
        w.close();
    }

    private static void writeItemSubTypeJson () throws Exception
    {
    	String bj = Util.gsonPretty.toJson(Define.mapSubType);
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "\\ItemSubType.json")));
        w.println(bj);
        w.close();
    }

    private static void writeItemTypeJson () throws Exception
    {
    	String bj = Util.gsonPretty.toJson(Define.mapSubType);
        PrintWriter w = new PrintWriter(Files.newBufferedWriter(Paths.get(outputSource + "\\ItemType.json")));
        w.println(bj);
        w.close();
    }

    static String nameToDefine (String name)
    {
        String v = name.toUpperCase();
        v = v.replaceAll("DỨA", "THOM");
        v = v.replaceAll(" & ", "_");
        v = v.replaceAll(" ", "_");
        v = v.replaceAll("\\x2B", "");
        v = v.replaceAll("\\x2E", "");

        v = v.replaceAll("A|Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ", "A");
        v = v.replaceAll("Đ", "D");
        v = v.replaceAll("É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ", "E");
        v = v.replaceAll("Í|Ì|Ỉ|Ĩ|Ị", "I");
        v = v.replaceAll("Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ", "O");
        v = v.replaceAll("Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự", "U");
        v = v.replaceAll("Ý|Ỳ|Ỷ|Ỹ|Ỵ", "Y");


        return v;
    }
}
