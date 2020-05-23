package game.utils;


import bitzero.util.logcontroller.business.ILogController;
import bitzero.util.logcontroller.business.LogController;
import com.gsn.broker.Broker;

public class MetricLog {
    //------------------------------------------------------------------------------------------------------------------
    // Common functions

    /**
     * Write action log - User id
     * @param timestamps    Timestamp
     * @param uId           User id
     * @param username      name
     * @param socialType    Social ma user dang nhap lan dau tien
     * @param partner       Partner
     * @param refCode       Ref code
     * @param platformId    Platform id: 0 -> Web, 1 -> iOS, 2 -> old Android, 3 -> new android, 4 -> Windows Phone
     * @param source        Tracking source danh dau user lan dau tien vao game tu social nao
     * @param groupId       Action group
     * @param actionId      Action id
     * @param gold          User gold
     * @param xu            User coin
     * @param dGold         User gold change
     * @param dXu           User coin change
     * @param arg           Addition params
     */
    public static void writeActionLogNew(long timestamps, int uId, String username, String socialType, String partner,
                                         String refCode, int platformId, String source, String groupId, String actionId,
                                         long gold, long xu, long dGold, long dXu, Object... arg) {
        StringBuilder data = new StringBuilder();
        data.append(timestamps).append("|");
        data.append(uId).append("|");
        data.append(username).append("|");
        data.append(socialType).append("|");
        data.append(partner).append("|");
        data.append(refCode).append("|");
        data.append(platformId).append("|");
        data.append(source).append("|");
        data.append(groupId).append("|");
        data.append(actionId).append("|");
        data.append(gold).append("|");
        data.append(xu).append("|");
        data.append(dGold).append("|");
        data.append(dXu);

        int i = 0;
        if (arg != null) {
            for (i = 0; i < arg.length; i++) {
                data.append("|").append(arg[i]);
            }
        }

        for (; i < 10; i++) {
            data.append("|");
        }
        // write log to scribe log
        LogController.GetController().writeLog(ILogController.LogMode.ACTION, data.toString());

        // push log to payment lib
        Broker.getInstance().sendLog(data.toString());
    }

}
