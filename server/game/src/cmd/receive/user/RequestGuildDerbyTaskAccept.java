package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyTaskAccept extends Command
{
	public int taskId;
	public int clientPrice;
	public int clientCoin;
	
    public RequestGuildDerbyTaskAccept (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	taskId = readInt(KEY_SLOT_ID);
    	clientPrice = readInt(KEY_PRICE_COIN);
    	clientCoin = readInt(KEY_CLIENT_COIN);
    }
}
