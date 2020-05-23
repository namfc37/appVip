package data;

public class SkipTimeInfo
{
    private int   TIME_RANGE;
    private float RATIO;
    private int   DIAMOND_DEFAULT;

    public int calcPrice (float timeRemain)
    {
        if (timeRemain <= 0)
            return 0;

        int price = (int) Math.ceil((timeRemain - TIME_RANGE) * RATIO / 100 + DIAMOND_DEFAULT);

        return Math.max(1, price);
    }
}
