package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyTaskSkipCooldown extends Command
{
	public int taskId;
	public int price;
	public int coin;
	public int time;

	public RequestGuildDerbyTaskSkipCooldown (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	taskId = readInt(KEY_SLOT_ID);
    	price = readInt(KEY_PRICE_COIN);
    	coin = readInt(KEY_CLIENT_COIN);
    }
}
