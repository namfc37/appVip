package exportexcel.sheet;

public class Rating extends ParseWorkbook
{
    public Rating(String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));
    }
}
