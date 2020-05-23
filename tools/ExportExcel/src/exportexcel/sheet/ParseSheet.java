package exportexcel.sheet;

import exportexcel.Util;
import org.apache.poi.ss.usermodel.*;

import java.util.HashMap;

public abstract class ParseSheet
{
    protected final FormulaEvaluator         evaluator;
    protected final Sheet                    sheet;
    protected final HashMap<String, Integer> mapName;

    ParseSheet (FormulaEvaluator evaluator, Sheet sheet)
    {
        this.evaluator = evaluator;
        this.sheet = sheet;
        this.mapName = parse();
    }

    protected abstract HashMap<String, Integer> parse ();

    public int getIdCol (String name)
    {
        return mapName.get(name);
    }

    protected String getString (int idRow, int idCol)
    {
        Row row = sheet.getRow(idRow);
        if (row == null)
            return null;
        Cell cell = row.getCell(idCol);
        if (cell == null)
            return null;
        switch (cell.getCellTypeEnum())
        {
            case BLANK:
                return null;
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return cell.getStringCellValue().trim();
        }
    }

    protected boolean getBoolean (int idRow, int idCol)
    {
        Row row = sheet.getRow(idRow);
        if (row == null)
            return false;
        Cell cell = row.getCell(idCol);
        if (cell == null)
            return false;
        switch (cell.getCellTypeEnum())
        {
            case BLANK:
                return false;
            case BOOLEAN:
                return cell.getBooleanCellValue();
            default:
                return cell.getStringCellValue().trim().equalsIgnoreCase("true");
        }
    }

    protected int getInt (int idRow, int idCol)
    {
        return (int) getNumeric(idRow, idCol);
    }

    protected double getNumeric (int idRow, int idCol)
    {
        Row row = sheet.getRow(idRow);
        Cell cell = row.getCell(idCol);
        if (cell == null)
            return 0;

        switch (cell.getCellTypeEnum())
        {
            case STRING:
                return Double.parseDouble(cell.getStringCellValue());
            case NUMERIC:
                return cell.getNumericCellValue();
            case BLANK:
                return 0;
            case FORMULA:
                return evaluator.evaluate(cell).getNumberValue();
            default:
                throw new RuntimeException("Not support type: " + cell.getCellTypeEnum());
        }
    }

    protected HashMap<String, Integer> getMapItemNum (int idRow, int idCol)
    {
        Row row = sheet.getRow(idRow);
        Cell cell = row.getCell(idCol);

        return Util.getMapItemNum(idRow, idCol, cell.getStringCellValue());
    }


    public boolean containsName (String name)
    {
        return mapName.containsKey(name);
    }

    public Sheet getSheet ()
    {
        return sheet;
    }
}
