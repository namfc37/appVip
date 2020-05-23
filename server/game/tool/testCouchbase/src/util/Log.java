package util;

public class Log
{
    public final static String SEPARATOR_GAME = " | ";

    public static StringBuilder getCharSequence (StringBuilder sb, String separator, Object... acs)
    {
        for (Object o : acs)
            sb.append(o).append(separator);
        return sb;
    }

    public static void console (Object... ao)
    {
        System.out.println(getCharSequence(new StringBuilder(), SEPARATOR_GAME, ao));
    }

    public static void info (Object... ao)
    {
        System.out.println(getCharSequence(new StringBuilder(), SEPARATOR_GAME, ao));
    }

    public static void trace (Object... ao)
    {
        System.out.println(getCharSequence(new StringBuilder(), SEPARATOR_GAME, ao));
    }

    public static void exception (Throwable cause, Object... acs)
    {
        StringBuilder sb = new StringBuilder();
        getCharSequence(sb, SEPARATOR_GAME, acs);

        sb.append(cause.toString()).append('\n');
        for (StackTraceElement ste : cause.getStackTrace())
            sb.append(ste.toString()).append('\n');

        System.out.println(sb.toString());
    }
}
