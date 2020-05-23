package model.object;

public class Setting
{
    public boolean sound;
    public boolean music;
    public boolean notify;

    private Setting ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Setting create ()
    {
        Setting o = new Setting();
        o.sound = true;
        o.music = true;
        o.notify = true;

        return o;
    }
}
