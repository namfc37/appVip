package exportexcel;

public class Log
{
    public static void debug (Object... ao)
    {
        console(ao);
    }

    public static void console (Object... ao)
    {
        StringBuilder sb = new StringBuilder();
        for (Object o : ao)
            sb.append(o).append(' ');
        System.out.println(sb);
    }
}
