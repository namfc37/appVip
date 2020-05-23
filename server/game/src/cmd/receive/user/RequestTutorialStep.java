package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTutorialStep extends Command
{
    public int     step;
    public boolean isStart;
    public int tutorialFlow;

    public RequestTutorialStep (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        step = readInt(KEY_DATA);
        isStart = readBoolean(KEY_STATUS);
        tutorialFlow = readInt(KEY_TUTORIAL_FLOW);
    }
}
