package model.object;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

import cmd.ErrorConst;
import data.CmdDefine;
import data.ConstInfo;
import data.ItemId;
import data.KeyDefine;
import data.MiscInfo;
import model.UserGame;
import user.UserControl;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

public class FlippingCards extends Encoder.IObject implements KeyDefine
{
	private transient int ticket;
	private int ticketLastTime;
	
	private int points;
	private List<Integer> checkpoint;
	
	private boolean gamePlaying;
	private int gameLevel;
	
	private FlippingCards () {}
	
	public static FlippingCards create ()
	{
		FlippingCards flippingCard = new FlippingCards ();
		flippingCard.ticketLastTime = -1;

		flippingCard.resetDaily ();
		flippingCard.resetGame ();
		
		return flippingCard;
	}
	
	private void resetGame()
	{
		this.gamePlaying = false;
		this.gameLevel = -1;
	}
	
	public void resetDaily()
	{
		this.points = 0;
		this.checkpoint = new ArrayList<Integer> ();
	}
	
	public int updateTicket(UserGame game)
	{
		int ticket = game.numStockItem(MiscInfo.FLIPPINGCARDS_TICKET());
		
		if (ticket >= MiscInfo.FLIPPINGCARDS_TICKET_LIMIT_NUM ())
			return 0;
		
		int current = Time.getUnixTime();
		if (this.ticketLastTime < 0 || this.ticketLastTime > current)
		{
			this.ticketLastTime = current;
			return 0;
		}
		
		int offset = current - this.ticketLastTime;
		int newTicket = offset / MiscInfo.FLIPPINGCARDS_TICKET_COOLDOWN();
		if (newTicket < 1)
			return 0;
		
		if (newTicket + ticket > MiscInfo.FLIPPINGCARDS_TICKET_LIMIT_NUM ())
		{
			newTicket = MiscInfo.FLIPPINGCARDS_TICKET_LIMIT_NUM () - ticket;
			this.ticketLastTime = -1;
		}
		else
		{
			this.ticketLastTime += newTicket * MiscInfo.FLIPPINGCARDS_TICKET_COOLDOWN();
		}
		
		return newTicket;
	}
	
	public void setTicket (int value)
	{
		this.ticket = value;
	}
	
	public void newgame ()
	{
		this.gamePlaying = true;
		
		ThreadLocalRandom random = ThreadLocalRandom.current();
		this.gameLevel = random.nextInt(MiscInfo.FLIPPINGCARDS_BOARD_LEVEL_MIN(), MiscInfo.FLIPPINGCARDS_BOARD_LEVEL_MAX() + 1);
	}
	
	public Result endgame (int start, int end, int match, int miss)
	{
		if (!this.gamePlaying ())
			return null;

		this.gamePlaying = false;

		int matchPoint = match * MiscInfo.FLIPPINGCARDS_BOARD_MATCH_POINT();
		int missPoint = miss * MiscInfo.FLIPPINGCARDS_BOARD_MISS_POINT();
		int playTime = end - start;
		if (playTime < 0)
			playTime = 0;
//		if (playTime > MiscInfo.FLIPPINGCARDS_BOARD_PLAY_DURATION())
//			playTime = MiscInfo.FLIPPINGCARDS_BOARD_PLAY_DURATION();
		
		float ratio = ConstInfo.getFlippingCardsInfo().getRatio(playTime);
		
		Result gameResult = new Result ();
		gameResult.level = this.gameLevel ();
		gameResult.point = (int) Math.ceil((matchPoint - missPoint) * ratio);
		
		if (gameResult.point < 1)
			gameResult.point = 0;
		
		gameResult.victory = match == this.gameLevel() && gameResult.point > 0 && playTime <= MiscInfo.FLIPPINGCARDS_BOARD_PLAY_DURATION();
		
		if (gameResult.victory)
		{
			gameResult.reward = new MapItem ();
			float base = gameResult.point / 100.0f;
			int exp = (int) Math.ceil(base * MiscInfo.FLIPPINGCARDS_BOARD_EXP_REWARD());
			int gold = (int) Math.ceil(base * MiscInfo.FLIPPINGCARDS_BOARD_GOLD_REWARD());
			
			gameResult.reward.increase(ItemId.EXP, exp);
			gameResult.reward.increase(ItemId.GOLD, gold);
		}
		
		this.points += gameResult.point;
		
		return gameResult;
	}
	
	public boolean isCheckpointReceived(int checkpoint)
	{
		return this.checkpoint.indexOf(checkpoint) > -1;
	}
	
	public boolean checkpointReceive (int checkpoint)
	{
		if (this.checkpoint.indexOf(checkpoint) == -1)
		{
			this.checkpoint.add (checkpoint);
			return true;
		}
		
		return false;
	}

	public boolean gamePlaying()
	{
		return gamePlaying;
	}
	
	public int gameLevel()
	{
		return this.gameLevel;
	}

	@Override
	public void putData(Encoder msg)
	{
		msg.put(FLIPPINGCARDS_TICKETS, this.ticket);
		msg.put(FLIPPINGCARDS_TICKET_LAST_TIME, this.ticketLastTime);
		
		msg.put(FLIPPINGCARDS_POINTS, this.points);
		msg.putInts(FLIPPINGCARDS_CHECKPOINTS, this.checkpoint);
		
		msg.put(FLIPPINGCARDS_GAME_PLAYING, this.gamePlaying);
		if (this.gamePlaying ())
			msg.put(FLIPPINGCARDS_GAME_LEVEL, this.gameLevel);
	}

	public static class Result extends Encoder.IObject implements KeyDefine
	{
		private int level;
		private int point;
		private boolean victory;
		private MapItem reward;
		
		private Result () {}

		public int level()
		{
			return level;
		}
		
		public boolean victory()
		{
			return victory;
		}
		
		public int point()
		{
			return point;
		}

		public MapItem reward()
		{
			return reward;
		}

		@Override
		public void putData(Encoder msg)
		{
			msg.put(FLIPPINGCARDS_GAME_VICTORY, this.victory);
			if (this.victory)
			{
				msg.put(FLIPPINGCARDS_GAME_POINTS, this.point);
				msg.put(FLIPPINGCARDS_GAME_REWARD, this.reward);
			}
		}
	}
}