package data;

import java.util.HashMap;

public class ActionInfo
{
    public static HashMap<String, Action> actions = new HashMap<>();

    public static class Action
    {
        public String                   NAME;
        public int                      VALUE;
        public String                   GFX;
        public float                    SCALE;

        public String                   DESC;
        public String                   HINT;
    }

    public static int getActionIntValue(String actionName)
    {
        return actions.get(actionName).VALUE;
    }

    public static String getActionStringValue(String actionName)
    {
       // System.out.println("\nAction name:" + actionName);
        String actionId = actions.containsKey(actionName)? String.valueOf(actions.get(actionName).VALUE) : "";
        return actionId.equals("") ? null : actionId ;
    }

}
