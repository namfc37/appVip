package exportexcel.sheet;

public class PigBank extends ParseWorkbook
{
    public PigBank(String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("Misc Info"));
    }
}
