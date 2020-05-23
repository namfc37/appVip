package exportexcel.sheet;

public class Newsboard extends ParseWorkbook
{
    public Newsboard (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));
    }
}
