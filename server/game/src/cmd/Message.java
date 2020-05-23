package cmd;

import data.KeyDefine;
import util.serialize.Encoder;

public class Message extends Encoder implements KeyDefine
{
    private final short cmd;
    private final byte  error;

    public Message (short cmd, byte error)
    {
        super();

        this.cmd = cmd;
        this.error = error;

        buf.putByte(error);
    }

    public BaseMessage toBaseMessage ()
    {
        markEndObject();

        BaseMessage msg = new BaseMessage(cmd, error, toByteArray());
        release();

        return msg;
    }
}
