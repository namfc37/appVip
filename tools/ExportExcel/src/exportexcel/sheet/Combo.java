package exportexcel.sheet;

import data.ItemInfo;
import data.ComboInfo;

import java.util.*;

public class Combo extends ParseWorkbook
{
    private static Map<String, ComboInfo> mapId = new LinkedHashMap<>();
    private static Map<String, ComboInfo> mapName = new LinkedHashMap<>();

    public Combo (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        parse(parseSheetRow("Pot_combo"), false);
        parse(parseSheetRow("Decor_combo"), false);
        parse(parseSheetRow("Cloud_Skin"), true);

        addConstInfo(mapId, null);
    }

    private void parse (ParseSheetRow ps, boolean isCloudSkin)
    {
        int type;

        HashSet<Byte> setGlobal = new HashSet<>();
        setGlobal.add(Define.defineToByte("BUFF_ORDER_EXP"));
        setGlobal.add(Define.defineToByte("BUFF_ORDER_GOLD"));
        setGlobal.add(Define.defineToByte("BUFF_AIRSHIP_EXP"));
        setGlobal.add(Define.defineToByte("BUFF_AIRSHIP_GOLD"));

        byte typeGlobal = Define.defineToByte("GLOBAL");
        final byte NUM_SLOT = isCloudSkin ? (byte)1 : (byte)6;

        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            ComboInfo info = new ComboInfo();
            info.ID = ps.getString(row, "ID");
            info.NAME = ps.getString(row, "NAME");
            info.CHILDREN = ps.toArrayItemId(row, "CHILDREN");
            info.INIT = ps.getByte(row, "INIT");
            info.STEP = ps.getByte(row, "STEP");

            type = 0;
            for (String id : info.CHILDREN)
            {
                ItemInfo itemInfo = ParseWorkbook.mapItemInfo.get(id);
                if (type == 0)
                    type = itemInfo.TYPE;
                else if (type != itemInfo.TYPE)
                    throwRuntimeException(row, "Type not match: " + type + " != " + itemInfo.TYPE);

                if (itemInfo.COMBO_ID != null)
                    throwRuntimeException(row, "Pot " + id + " is in two set");
                itemInfo.COMBO_ID = info.ID;
            }

            info.BUFF_INFO = new ArrayList<>();
            for (int i = 1; i <= 3; i++)
            {
                if (ps.getString(row, "B" + i + "_TYPE") == null)
                    continue;

                ComboInfo.BuffInfo buff = new ComboInfo.BuffInfo();
                info.BUFF_INFO.add(buff);

                buff.type = ps.defineToByte(row, "B" + i + "_TYPE");
                buff.unit = ps.defineToByte(row, "B" + i + "_UNIT");

                if (setGlobal.contains(buff.type))
                    buff.area = typeGlobal;
                else
                    buff.area = ps.defineToByte(row, "B" + i + "_AREA");

                buff.value = ps.getInt(row, "B" + i + "_VALUE");
                if (buff.value <= 0)
                    throwRuntimeException(row, "buff.value <= 0");

                buff.bonus = ps.getInt(row, "B" + i + "_BONUS");
                if (buff.bonus < 0)
                    throwRuntimeException(row, "buff.bonus < 0");
            }
            
            if (info.INIT <= 0 || info.INIT > NUM_SLOT)
                throwRuntimeException(row, "Invalid INIT: " + info.INIT);

            HashSet<String> setPot = new HashSet<>(Arrays.asList(info.CHILDREN));
            if (info.CHILDREN.length != NUM_SLOT)
                throwRuntimeException(row, "Invalid CHILDREN size: " + info.CHILDREN.length);
            if (setPot.size() != NUM_SLOT)
                throwRuntimeException(row, "Duplicate pot in CHILDREN: " + setPot);
            if (info.STEP < 0)
                throwRuntimeException(row, "STEP < 0: " + info.STEP);
            else if (info.STEP > 0)
            {
                if (info.INIT + info.STEP * (info.BUFF_INFO.size() - 1) > NUM_SLOT)
                    throwRuntimeException(row, "Invalid STEP: " + info.STEP);
            }

            mapId.put(info.ID, info);
            mapName.put(info.NAME.toLowerCase(), info);
        }
    }

    public static ComboInfo getById (String id)
    {
        return mapId.get(id);
    }

    public static ComboInfo getByName (String id)
    {
        return mapName.get(id.toLowerCase());
    }
}
