package model.object;

import cmd.ErrorConst;
import data.*;
import model.key.InfoKeyPOSM;
import util.Database;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.redis.Redis;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by Thanh Tung on 4/10/2020.
 */
public class POSMUserInfoData extends Encoder.IObject implements KeyDefine {

    private  HashMap<String, POSMUserInfo> mapInfo;

    private transient int userID;
    private POSMUserInfoData ()
    {
        //DO NOT ADD CODE HERE
    }

    public static POSMUserInfoData create()
    {
        POSMUserInfoData s = new POSMUserInfoData();
        s.mapInfo = new HashMap<>();
        return s;
    }

    public void init(int userID)
    {
        this.userID = userID;
    }

    public void saves()
    {
        Redis redis = Database.ranking();
        for (Map.Entry<String, POSMUserInfo> entry : mapInfo.entrySet())
        {
            if (entry.getValue().isChanged())
            {
                redis.hset(entry.getKey(), "" + userID, Json.toJson(entry.getValue()));
                entry.getValue().isChanged = false;
            }
        }
    }

    public void update()
    {
        int  curTime = Time.getUnixTime();
        ArrayList<String> keyRemoves = new ArrayList<>();
        for (Map.Entry<String, POSMUserInfo> entry : mapInfo.entrySet())
        {
           if (entry.getValue().isExpired(curTime))
               keyRemoves.add(entry.getKey());
        }

        for (String key: keyRemoves)
        {
            mapInfo.remove(key);
        }
    }

    public byte addItemPosm(String itemId, int quantity)
    {
        String eventID = getEventId(itemId);
        String key = "";
        if (!eventID.equals("")) key = checkAndCreate(eventID);
        if (key.equals("")) return ErrorConst.INVALID_ITEM;
        POSMUserInfo posmUserInfo = mapInfo.get(key);
        return posmUserInfo.addItemPOSM(itemId, quantity);
    }

    public byte updatePOSMInfo(String itemId, String name, String phoneNumber, String address)
    {
        String eventID = getEventId(itemId);
        String key = "";
        if (!eventID.equals("")) key = checkAndCreate(eventID);
        if (key.equals("")) return ErrorConst.INVALID_ITEM;
        POSMUserInfo posmUserInfo = mapInfo.get(key);
        return posmUserInfo.updateInfo(name, phoneNumber, address);
    }

    public POSMUserInfo getPOSMUSerInfo(String itemId)
    {
        String eventID = getEventId(itemId);
        String key = "";
        if (!eventID.equals("")) key = checkAndCreate(eventID);
        if (key.equals("")) return null;
        return mapInfo.get(key);
    }

    public String getEventId(String itemId)
    {
        ItemInfo itemInfo = ConstInfo.getItemInfo(itemId);
        if (itemInfo.TYPE() != ItemType.EVENT)
            return "";
        EventItemInfo eventItemInfo = (EventItemInfo) itemInfo;
        if (eventItemInfo.SUB_TYPE() != ItemSubType.POSM)
            return "";
       return eventItemInfo.USE_IN();
    }

    public String checkAndCreate(String eventID)
    {
        int timeStartEvent = eventID.equals(ItemId.ACID) ? ConstInfo.getAccumulate().UNIX_TIME_START() : ConstInfo.getFestival().getAction(eventID).UNIX_START_TIME();
        int timeEndEvent = eventID.equals(ItemId.ACID) ? ConstInfo.getAccumulate().UNIX_TIME_END() : ConstInfo.getFestival().getAction(eventID).UNIX_END_TIME();

        String key = InfoKeyPOSM.POSM_USER_INFO.keyName(eventID, timeStartEvent);
        if (!mapInfo.containsKey(key)) mapInfo.put(key, POSMUserInfo.create(timeStartEvent, timeEndEvent));
        return key;
    }

    @Override
    public void putData(Encoder msg) {

    }

    public static class POSMUserInfo extends Encoder.IObject implements KeyDefine {
        private String name;
        private String phoneNumber;
        private String address;
        private MapItem posmReceived;
        private int timeEnd;
        private int timeExpired;
        private boolean isChanged;

        public POSMUserInfo() {
            //DO NOT ADD CODE IN CONSTRUCTOR

        }

       public boolean isChanged()
       {
           return this.isChanged;
       }

        public byte updateInfo(String name, String phoneNumber, String address)
        {
            if (Time.getUnixTime() > this.timeEnd + MiscInfo.POSM_TIME_EXPIRED_ITEM())
                return ErrorConst.TIMEOUT;
            this.name = name;
            this.phoneNumber = phoneNumber;
            this.address = address;
            isChanged = true;
            return ErrorConst.SUCCESS;
        }

        public boolean isExpired(int time)
        {
            return timeExpired < time;
        }

        public byte addItemPOSM(String itemId, int quantity)
        {
            if (Time.getUnixTime() > this.timeEnd + MiscInfo.POSM_TIME_EXPIRED_ITEM())
                return ErrorConst.TIMEOUT;
            posmReceived.increase(itemId,quantity);
            isChanged = true;
            return ErrorConst.SUCCESS;
        }

        public static POSMUserInfo create(int timeStart, int timeEnd) {
            POSMUserInfo s = new POSMUserInfo();
            s.name = "";
            s.phoneNumber = "";
            s.address = "";
            s.posmReceived = new MapItem();
            s.timeEnd = timeEnd;
            //s.timeStart = timeStart;
            s.timeExpired = timeEnd + MiscInfo.POSM_TIME_EXPIRED_IN_DATA_USER() * Time.SECOND_IN_DAY;
            return s;
        }

        public void setData(POSMUserInfo data) {
            this.name = data.name;
            this.phoneNumber = data.phoneNumber;
            this.address = data.address;
        }

        public String getName() {
            return name;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public String getAddress() {
            return address;
        }

        @Override
        public void putData(Encoder msg) {
            msg.put(POSM_USER_INFO_NAME, this.name);
            msg.put(POSM_USER_INFO_PHONE_NUMBER, this.phoneNumber);
            msg.put(POSM_USER_INFO_ADDRESS, this.address);
        }
    }
}
