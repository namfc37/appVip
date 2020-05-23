package payment.brazil;

import util.Json;
import util.Time;

public class EmbedData
{
    public String item;
    public String channel;
    public String offer;
    public int    level;

    public String appTrans;
    public int    gross;
    public int    net;
    public long   time;

    public String socialType;
    public int    platformID;

    public EmbedData (String item, Object channel, String offer, int level, String appTrans, int gross, int net, String socialType, int platformID)
    {
        this.item = item;
        this.channel = channel.toString();
        this.offer = (offer == null) ? "" : offer;
        this.level = level;

        this.appTrans = appTrans;
        this.gross = gross;
        this.net = net;
        this.time = Time.getTimeMillis();

        this.socialType = socialType;
        this.platformID = platformID;
    }


    @Override
    public String toString ()
    {
        return Json.toJson(this);
    }
}
