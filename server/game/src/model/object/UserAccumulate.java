package model.object;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import data.ConstInfo;
import data.KeyDefine;
import util.collection.MapItem;
import util.serialize.Encoder;

public class UserAccumulate extends Encoder.IObject implements KeyDefine
{
    private String id;
    private int coin;
    private double money;
    private int tokenGain;
    private int tokenSpent;
    private MapItem history;
    private Map<Integer, Integer> checkpoints;

    private UserAccumulate () {}

    public static UserAccumulate create ()
    {
    	UserAccumulate accumulate = new UserAccumulate ();
    	accumulate.reset ();
    	
    	return accumulate;
    }
    
    public boolean isLimit (String storeItemID)
    {
    	int count = history.get(storeItemID);
    	if (count == 0)
    		return false;
    	
    	int total = ConstInfo.getAccumulate().storeLimitPerUser (storeItemID);
    	if (total <= 0)
    		return false;
    	
    	return total <= count;
    }
    
    public void addItem (String storeItemID)
    {
    	history.increase(storeItemID, 1);
    }

	public boolean isCheckpointClaim(int checkpoint)
	{
    	return checkpoints.containsKey(checkpoint);
	}
    
    public boolean addCheckpoint (int checkpoint, int rewardID)
    {
    	if (checkpoints.containsKey(checkpoint))
    		return false;
    	
    	checkpoints.put (checkpoint, rewardID);
    	return true;
    }

    public int getCoins ()
    {
        return coin;
    }

    public int addCoins (int addCoin)
    { 
        coin += addCoin;
        int oldToken = tokenGain;
        tokenGain = ConstInfo.getAccumulate().coinToToken(coin);
        return tokenGain - oldToken;
    }
    
    public void addTokenSpent (int token)
    {
    	tokenSpent += token;
    }
    
    public void addMoney (double gross)
    {
    	money += gross;
    }

	public boolean update()
	{
		if (ConstInfo.getAccumulate().isActive())
		{
			if (this.id.equalsIgnoreCase(ConstInfo.getAccumulate().ID()))
				return false;
			
			this.reset ();
			return true;
		}

		if (id.isEmpty())
			return false;

		this.reset ();
		return true;
	}
    
    private void reset ()
    {
    	id = ConstInfo.getAccumulate().isActive() ? ConstInfo.getAccumulate().ID() : "";
    	coin = 0;
    	money = 0;
    	tokenGain = 0;
    	tokenSpent = 0;
    	history = new MapItem ();
    	checkpoints = new HashMap<Integer, Integer> ();
    }
    
    @Override
    public void putData (Encoder msg)
    {
        msg.put(USER_ACCUMULATE_ID, id);
        msg.put(USER_ACCUMULATE_COIN, coin);
        msg.put(USER_ACCUMULATE_TOKEN_GAIN, tokenGain);
        msg.put(USER_ACCUMULATE_TOKEN_SPENT, tokenSpent);
        msg.put(USER_ACCUMULATE_HISTORY, history);

        List<Integer> temp = new ArrayList<Integer> ();
        for (Entry<Integer, Integer> entry : checkpoints.entrySet())
        {
        	temp.add(entry.getKey());
        	temp.add(entry.getValue());
        }
        msg.putInts(USER_ACCUMULATE_CHECKPOINTS, temp);
    }
}