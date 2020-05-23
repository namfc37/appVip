package data.ranking;

import java.util.Collections;
import java.util.NavigableSet;

public class TopAppraisal
{
    private NavigableSet<Integer> LEVELS;

    public void init ()
    {
        LEVELS = Collections.unmodifiableNavigableSet(LEVELS);
    }

    public int getGroup (int lv)
    {
        return LEVELS.ceiling(lv);
    }

    public NavigableSet<Integer> getGroups ()
    {
        return LEVELS;
    }
}