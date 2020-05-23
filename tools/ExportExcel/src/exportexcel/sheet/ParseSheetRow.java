package exportexcel.sheet;

import data.ItemInfo;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.*;

import java.util.HashMap;

public class ParseSheetRow extends ParseSheet
{
    public ParseSheetRow (FormulaEvaluator evaluator, Sheet sheet)
    {
        super(evaluator, sheet);
    }

    protected HashMap<String, Integer> parse ()
    {
        HashMap<String, Integer> map = new HashMap<>();

        Row row = sheet.getRow(0);
        for (int col = row.getFirstCellNum(); col <= row.getLastCellNum(); col++)
        {
            Cell cell = row.getCell(col);
            if (cell != null && cell.getCellTypeEnum() == CellType.STRING)
            {
                String v = cell.getStringCellValue();
                if (v != null && v.length() > 0)
                {
                    if (map.put(v, col) != null)
                        throw new RuntimeException("Duplicate column name: " + v);
                }
            }
        }

        return map;
    }

    public String getString (int rowId, String colName)
    {
        Integer col = mapName.get(colName);
        if (col == null)
            return null;
        return getString(rowId, col);
    }

    public boolean getBoolean (int rowId, String colName)
    {
        return getBoolean(rowId, mapName.get(colName));
    }

    public byte getByte (int rowId, String colName)
    {
        return (byte) getNumeric(rowId, colName);
    }

    public short getShort (int rowId, String colName)
    {
        return (short) getNumeric(rowId, colName);
    }

    public int getInt (int rowId, String colName)
    {
        return (int) getNumeric(rowId, colName);
    }

    public long getLong (int rowId, String colName)
    {
        return (long) getNumeric(rowId, colName);
    }

    public float getFloat (int rowId, String colName)
    {
        return (float) getNumeric(rowId, colName);
    }

    public double getDouble (int rowId, String colName)
    {
        return getNumeric(rowId, colName);
    }

    protected double getNumeric (int rowId, String colName)
    {
        return getNumeric(rowId, mapName.get(colName));
    }

    public boolean isEmptyCell (int rowId, String colName)
    {
        Row row = sheet.getRow(rowId);
        if (row == null)
            return true;
        int col = mapName.get(colName);
        Cell cell = row.getCell(col);
        return cell.getCellTypeEnum() == CellType.BLANK;
    }

    public HashMap<String, Integer> getMapItemNum (int rowId, String colName)
    {
        return getMapItemNum(rowId, mapName.get(colName));
    }

    public String getItemId (int rowId, String idCol)
    {
        return Util.toItemId(getString(rowId, idCol));
    }

    public String[] toArrayItemId (int rowId, String colName)
    {
        return Util.toArrayItemId(getString(rowId, colName));
    }

    public int[] getArrayInt (int rowId, String colName)
    {
        return Util.getArrayInt(getString(rowId, colName));
    }

    public ItemInfo nameToItemInfo (String name)
    {
        String id = Util.toItemId(name);
        return ParseWorkbook.mapItemInfo.get(id);
    }

    public byte defineToByte (int rowId, String colName)
    {
        String define = getString(rowId, colName);
        return Define.defineToByte(define);
    }
}
