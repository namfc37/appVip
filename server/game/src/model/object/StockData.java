package model.object;

public class StockData
{
    public int capacity;
    public int used;
    public int check;

    private StockData ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static StockData create ()
    {
        return new StockData();
    }
}
