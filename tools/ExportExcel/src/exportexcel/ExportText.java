package exportexcel;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;

public class ExportText
{
    private static String inputFile, outputFolder;
    private static Workbook workbook;
    private static Sheet    sheet;

    public static void main (String[] args)
    {
        export(args);
    }

    public static void export (String[] args)
    {
        try
        {
            inputFile = args[1];
            outputFolder = args[2];

            parse(inputFile, outputFolder);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    private static void parse (String inputFile, String outputFolder) throws Exception
    {
        Log.console("inputFile", inputFile);
        Log.console("outputFolder", outputFolder);

        workbook = new XSSFWorkbook(Files.newInputStream(Paths.get(inputFile)));
        sheet = workbook.getSheet("Texts");

        Map<String, Integer> mapLang = new LinkedHashMap<>();
        Row row = sheet.getRow(0);
        Cell cell;
        for (int col = row.getFirstCellNum(); col < row.getLastCellNum(); col++)
        {
            cell = row.getCell(col);
            if (cell != null && cell.getCellTypeEnum() == CellType.STRING)
                mapLang.put(cell.getStringCellValue(), col);
        }

        for (Map.Entry<String, Integer> e : mapLang.entrySet())
            parseLang(e.getKey(), e.getValue());
    }

    private static void parseLang (String lang, int col)
    {
        Log.console("export", lang, col);

        try (BufferedWriter w = Files.newBufferedWriter(Paths.get(outputFolder + "/" + lang + ".txt"));)
        {
            for (int r = 1, maxRow = sheet.getLastRowNum(); r <= maxRow; r++)
            {
                Row row = sheet.getRow(r);

                Cell cell = row.getCell(0);
                if (cell == null || cell.getCellTypeEnum() != CellType.STRING)
                    continue;
                String id = cell.getStringCellValue();

                cell = row.getCell(col);
                String text;
                if (cell == null)
                    text = "";
                else switch (cell.getCellTypeEnum())
                {
                    case BLANK:
                        text = "";
                        break;
                    case NUMERIC:
                        text = String.valueOf((long) cell.getNumericCellValue());
                        break;
                    default:
                        text = cell.getStringCellValue().trim();
                }
                w.write(id);
                w.write(" = \"");
                w.write(text);
                w.write("\"");
                w.newLine();
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
