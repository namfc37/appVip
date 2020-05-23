package payment.direct;

import util.Json;

public class EmbedData
{
    public String item;
    public String channel;
    public String offer;
    public int    level;

    public String socialType;
    public int    platformID;

    public EmbedData (String item, Object channel, String offer, int level, String socialType, int platformID)
    {
        this.item = item;
        this.channel = channel.toString();
        this.offer = (offer == null) ? "" : offer;
        this.level = level;

        this.socialType = socialType;
        this.platformID = platformID;
    }

    @Override
    public String toString ()
    {
        return Json.toJson(this);
    }
}
