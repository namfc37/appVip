package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestEventMergePuzzle extends Command
{
    public String eventId;
    public String puzzleId;

    public RequestEventMergePuzzle (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        eventId = readString(KEY_EVENT_ID);
        puzzleId = readString(KEY_ITEM_ID);
    }
}
