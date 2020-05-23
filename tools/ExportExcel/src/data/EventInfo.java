package data;

import java.util.HashMap;

import exportexcel.Util;

public class EventInfo
{
	private static HashMap<String, int[]> duration = new HashMap<String, int[]> ();
	
	public static void setEventDuration (String eventId, String start, String end)
	{
		setEventDuration (eventId, Util.toUnixTime(start), Util.toUnixTime(end));
	}
	
	public static void setEventDuration (String eventId, int start, int end)
	{
		duration.put(eventId, new int [] {start, end});
	}
	
	public static int[] eventDuration (String eventId)
	{
		return duration.get(eventId);
	}
}
