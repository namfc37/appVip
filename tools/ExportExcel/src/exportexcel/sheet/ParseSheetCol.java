package exportexcel.sheet;

import data.ItemInfo;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.*;

import java.util.*;

public class ParseSheetCol extends ParseSheet
{
    private final static int DEFAULT_COLUMN = 1;

    public ParseSheetCol (FormulaEvaluator evaluator, Sheet sheet)
    {
        super(evaluator, sheet);
    }

    protected HashMap<String, Integer> parse ()
    {
        HashMap<String, Integer> map = new HashMap<>();

        for (int r = 1, maxRow = sheet.getLastRowNum(); r <= maxRow; r++)
        {
            String name = getString(r, 0);
            map.put(name, r);
        }
        return map;
    }

    public String getString (String rowName, int colId)
    {
        Integer row = mapName.get(rowName);
        if (row == null)
            return null;
        return getString(row, colId);
    }

    public String getString (String rowName)
    {
        return getString(rowName, DEFAULT_COLUMN);
    }

    public boolean getBoolean (String rowName, int colId)
    {
        return getBoolean(mapName.get(rowName), colId);
    }

    public boolean getBoolean (String rowName)
    {
        return getBoolean(rowName, DEFAULT_COLUMN);
    }

    public byte getByte (String rowName, int colId)
    {
        return (byte) getNumeric(rowName, colId);
    }

    public byte getByte (String rowName)
    {
        return getByte(rowName, DEFAULT_COLUMN);
    }

    public short getShort (String rowName, int colId)
    {
        return (short) getNumeric(rowName, colId);
    }

    public short getShort (String rowName)
    {
        return getShort(rowName, DEFAULT_COLUMN);
    }

    public int getInt (String rowName, int colId)
    {
        return (int) getNumeric(rowName, colId);
    }

    public int getInt (String rowName)
    {
        return getInt(rowName, DEFAULT_COLUMN);
    }

    public long getLong (String rowName, int colId)
    {
        return (long) getNumeric(rowName, colId);
    }

    public long getLong (String rowName)
    {
        return getLong(rowName, DEFAULT_COLUMN);
    }

    public float getFloat (String rowName, int colId)
    {
        return (float) getNumeric(rowName, colId);
    }

    public float getFloat (String rowName)
    {
        return getFloat(rowName, DEFAULT_COLUMN);
    }

    public double getDouble (String rowName, int colId)
    {
        return getNumeric(rowName, colId);
    }

    public double getDouble (String rowName)
    {
        return getDouble(rowName, DEFAULT_COLUMN);
    }

    protected double getNumeric (String rowName, int colId)
    {
        return getNumeric(mapName.get(rowName), colId);
    }

    public boolean isEmptyCell (String rowName, int colId)
    {
        int rowId = mapName.get(rowName);
        Row row = sheet.getRow(rowId);
        if (row == null)
            return true;
        Cell cell = row.getCell(colId);
        return cell.getCellTypeEnum() == CellType.BLANK;
    }

    public Map<String, Integer> getMapItemNum (String rowName, int colId)
    {
        return getMapItemNum(mapName.get(rowName), colId);
    }

    public Map<String, Integer> getMapItemNum (String rowName)
    {
        return getMapItemNum(rowName, DEFAULT_COLUMN);
    }

    public String getItemId (String rowName, int colId)
    {
        return Util.toItemId(getString(rowName, colId));
    }

    public String[] toArrayItemId (String rowName, int colId)
    {
        return Util.toArrayItemId(getString(rowName, colId));
    }

    public String[] toArrayItemId (String rowName)
    {
        return toArrayItemId(rowName, DEFAULT_COLUMN);
    }

    public Collection<String> getCollectionString (String rowName, int colId)
    {
        return Util.getCollectionString(getString(rowName, colId));
    }

    public Collection<String> getCollectionString (String rowName)
    {
        return getCollectionString(rowName, DEFAULT_COLUMN);
    }

    public String[] getArrayString (String rowName, int colId)
    {
        return Util.getArrayString(getString(rowName, colId));
    }

    public String[] getArrayString (String rowName)
    {
        return getArrayString(rowName, DEFAULT_COLUMN);
    }

    public int[] getArrayInt (String rowName, int colId)
    {
        return Util.getArrayInt(getString(rowName, colId));
    }

    public ItemInfo nameToItemInfo (String name)
    {
        String id = Util.toItemId(name);
        return ParseWorkbook.mapItemInfo.get(id);
    }

    public byte defineToByte (String rowName, int colId)
    {
        String define = getString(rowName, colId);
        return Define.defineToByte(define);
    }

    public TreeMap<Integer,String> getMapRate (String rowName)
    {
        return getMapRate(rowName, DEFAULT_COLUMN);
    }

    public TreeMap<Integer,String> getMapRate (String rowName, int colId)
    {
        return Util.toMapRate(getString(rowName, colId));
    }
}
