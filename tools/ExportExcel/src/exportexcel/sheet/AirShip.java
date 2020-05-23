package exportexcel.sheet;

public class AirShip extends ParseWorkbook
{
    public AirShip (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));
    }
}
