package service;

import bitzero.server.util.IDisconnectionReason;

public class DisconnectionReason implements IDisconnectionReason
{
    public final static DisconnectionReason KICK = new DisconnectionReason(1);

    private byte value;

    private DisconnectionReason (int value)
    {
        this.value = (byte) value;
    }

    @Override
    public int getValue ()
    {
        return value;
    }

    @Override
    public byte getByteValue ()
    {
        return value;
    }
}
