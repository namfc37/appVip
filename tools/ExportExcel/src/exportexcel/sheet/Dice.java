package exportexcel.sheet;

import com.google.gson.JsonArray;
import data.DiceInfo;
import exportexcel.ExportExcel;

import java.util.Map;
import java.util.TreeMap;

public class Dice extends ParseWorkbook
{
    public Dice (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        checkLen("DICE_DAILY_PRICE", "DICE_DAILY_ADD");
        checkLen("DICE_EVENT_PRICE", "DICE_EVENT_ADD");
        int spinSize = Define.miscJson.get("DICE_SPIN_SIZE").getAsInt();
        if (spinSize <= 6)
            throwRuntimeException("Invalid spinSize: " + spinSize);

        if (ExportExcel.isServer)
        {
            DiceInfo info = new DiceInfo();

            info.DAILY = new TreeMap<>();
            parseSlot("DAILY", spinSize, info.DAILY);

            info.EVENT = new TreeMap<>();
            parseSlot("EVENT", spinSize, info.EVENT);

            addConstInfo(info, null);
        }
    }

    private void parseSlot (String sheetName, int spinSize, Map<Integer, DiceInfo.Slot[][]> map)
    {
        ParseSheetRow ps = parseSheetRow(sheetName);

        int numRound;
        for (numRound = 1; ; numRound++)
        {
            if (!ps.containsName("GIFT_" + numRound + "_NUM"))
                break;
        }

        int level, slotId;
        String prefix;
        for (int round = 0; round < numRound; round++)
        {
            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                level = ps.getInt(row, "LEVEL");
                slotId = ps.getInt(row, "SLOT_ID");
                prefix = "GIFT_" + round + "_";

                DiceInfo.Slot[][] slots = map.get(level);
                if (slots == null)
                {
                    slots = new DiceInfo.Slot[numRound][spinSize];
                    map.put(level, slots);
                }

                DiceInfo.Slot slot = new DiceInfo.Slot();
                slots[round][slotId] = slot;

                slot.id = ps.getItemId(row, prefix + "ID");
                slot.num = ps.getInt(row, prefix + "NUM");
                if (slot.num <= 0)
                    throwRuntimeException(row, "slot.num <= 0: " + slot.num);
                slot.rate = ps.getInt(row, prefix + "RATE");
                if (slot.rate < 0)
                    slot.rate = 0;
            }
        }
    }

    private void checkLen (String idPrice, String idAdd)
    {
        JsonArray price = Define.miscJson.get(idPrice).getAsJsonArray();
        int lenPrice = price.size();

        JsonArray add = Define.miscJson.get(idAdd).getAsJsonArray();
        int lenAdd = add.size();

        if (lenPrice <= 0)
            throwRuntimeException("Invalid len: " + idPrice);
        if (lenAdd <= 0)
            throwRuntimeException("Invalid len: " + idAdd);
        if (lenPrice != lenAdd)
            throwRuntimeException("Invalid len:: " + idPrice + "(" + lenPrice + ") != " + idAdd + "(" + lenAdd + ")");
    }
}
