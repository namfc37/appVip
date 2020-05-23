package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTutorialSave extends Command
{
    public String data;
    public int    skipId;
    public int tutorialFlow;

    public RequestTutorialSave (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        data = readString(KEY_DATA);
        skipId = readInt(KEY_UID);
        tutorialFlow = readInt(KEY_TUTORIAL_FLOW);
    }
}
