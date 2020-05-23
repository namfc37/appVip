package exportexcel.sheet;

import data.VIPInfo;

public class VIP extends ParseWorkbook
{
    public static VIPInfo vipInfo=new VIPInfo();
    public VIP(String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscDefine(parseSheetRow("Misc Define"));
        Define.parseMiscInfo(parseSheetRow("Misc Info"));
        parseVIPInfo(parseSheetRow("VIP Info"));
        addConstInfo(vipInfo,null);
    }

    private void parseVIPInfo(ParseSheetRow ps)
    {

        int maxRow = ps.sheet.getLastRowNum() + 1;
        for (int row = 1; row < maxRow; row++)
        {
            VIPInfo.VIPItem vipInfoItem = new VIPInfo.VIPItem();
            vipInfoItem.ID = ps.getString(row, "ID");
            vipInfoItem.DURATION = ps.getInt(row,"DURATION");
            vipInfoItem.CONVERT_GOLD_BONUS = ps.getInt(row,"CONVERT_GOLD_BONUS");
            vipInfoItem.DAILY_LOGIN_REWARD =ps.getMapItemNum(row, "DAILY_LOGIN_REWARD");
            vipInfoItem.UPGRADE_POT_RATE = ps.getInt(row, "UPGRADE_POT_RATE");
            vipInfoItem.BLACKSMITH_RATE = ps.getInt(row, "BLACKSMITH_RATE");
            vipInfoItem.AIRSHIP_GOLD_BONUS = ps.getInt(row, "AIRSHIP_GOLD_BONUS");
            vipInfoItem.BUG_RATE = ps.getInt(row, "BUG_RATE");
            vipInfoItem.IS_ACTIVE = ps.getBoolean(row,"IS_ACTIVE");

            vipInfo.VIP_ITEMS.put(vipInfoItem.ID,vipInfoItem);
        }

    }
}
