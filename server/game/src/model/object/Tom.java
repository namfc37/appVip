package model.object;

import cmd.ErrorConst;
import data.*;
import util.Time;
import util.serialize.Encoder;

import java.util.concurrent.ThreadLocalRandom;

public class Tom extends Encoder.IObject implements KeyDefine
{
    private int    status;
    private int    typeHire;
    private int    timeHire;
    private int    timeRest;
    private int    timeRestDuration;
    private String item;
    private Pack[] packs;

    public class Pack extends Encoder.IObject implements KeyDefine
    {
        private int num;
        private int price;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(TOM_PACK_NUM, num);
            msg.put(TOM_PACK_PRICE, price);
        }

        public int getNum ()
        {
            return num;
        }

        public int getPrice ()
        {
            return price;
        }
    }

    private Tom ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Tom create ()
    {
        Tom o = new Tom();

        return o;
    }

    public void update ()
    {
        int curTime = Time.getUnixTime();
        if ((status != MiscDefine.TOM_STATUS_LOCK) && (timeHire + MiscInfo.TOM_HIRE_DAY(typeHire) * Time.SECOND_IN_DAY < curTime))
        {
            status = MiscDefine.TOM_STATUS_IDLE;
            typeHire = 0;
            timeHire = 0;
            resetPack();
        }
        else if (isRest() && (timeRest + timeRestDuration <= curTime))
        {
            status = MiscDefine.TOM_STATUS_WAIT;
            resetPack();
        }
    }

    private void resetPack ()
    {
        timeRest = 0;
        timeRestDuration = 0;
        item = null;
        packs = null;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(TOM_STATUS, status);
        msg.put(TOM_TYPE_HIRE, typeHire);
        msg.put(TOM_TIME_HIRE, timeHire);
        msg.put(TOM_TIME_REST, timeRest);
        msg.put(TOM_TIME_REST_DURATION, timeRestDuration);
        msg.put(TOM_ITEM, item);
        msg.put(TOM_PACKS, packs);
    }

    public byte checkHire (int type)
    {
        if (status == MiscDefine.TOM_STATUS_LOCK)
        {
            if (type != 0)
                return ErrorConst.INVALID_STATUS;
        }
        else if (status == MiscDefine.TOM_STATUS_IDLE)
        {
            if (type == 0)
                return ErrorConst.INVALID_STATUS;
        }
        else
        {
            return ErrorConst.INVALID_STATUS;
        }
        return ErrorConst.SUCCESS;
    }

    public void hire (int type)
    {
        timeHire = Time.getUnixTime();
        typeHire = type;
        status = MiscDefine.TOM_STATUS_WAIT;
    }

    public boolean canFind ()
    {
        return status == MiscDefine.TOM_STATUS_WAIT;
    }

    public void find (ItemInfo info, int multiple)
    {
        status = MiscDefine.TOM_STATUS_FOUND;
        ThreadLocalRandom random = ThreadLocalRandom.current();
        TomInfo tomInfo = info.getTomInfo();

        item = info.ID();
        packs = new Pack[tomInfo.getNumPackInfo()];
        for (int i = 0; i < packs.length; i++)
        {
            TomInfo.PackInfo packInfo = tomInfo.getPackInfo(i);
            Pack pack = new Pack();
            pack.num = random.nextInt(packInfo.MIN_NUM(), packInfo.MAX_NUM() + 1) * multiple;
            pack.price = Math.max(1, (int) Math.ceil(pack.num * tomInfo.GOLD_BASIC() * random.nextInt(packInfo.MIN_GOLD_RATIO(), packInfo.MAX_GOLD_RATIO() + 1) / 100));

            packs[i] = pack;
        }
    }

    public Pack getPack (int slot)
    {
        if (status != MiscDefine.TOM_STATUS_FOUND || slot < 0 || slot >= packs.length)
            return null;
        return packs[slot];
    }

    public String getItem ()
    {
        return item;
    }

    public void buy ()
    {
        status = MiscDefine.TOM_STATUS_LONG_REST;
        resetPack();
        timeRest = Time.getUnixTime();
        timeRestDuration = MiscInfo.TOM_LONG_REST_DURATION();
    }

    public boolean canCancel ()
    {
        return status == MiscDefine.TOM_STATUS_FOUND;
    }

    public void cancel ()
    {
        status = MiscDefine.TOM_STATUS_SHORT_REST;
        resetPack();
        timeRest = Time.getUnixTime();
        timeRestDuration = MiscInfo.TOM_SHORT_REST_DURATION();
    }

    private boolean isRest ()
    {
        return status == MiscDefine.TOM_STATUS_SHORT_REST || status == MiscDefine.TOM_STATUS_LONG_REST;
    }

    public boolean canReduceTime ()
    {
        return isRest() && (timeRest + timeRestDuration - Time.getUnixTime() > MiscInfo.TOM_LIMIT_REST_DURATION());
    }

    public void reduceTime (int reduceTime)
    {
        timeRest = Math.max(Time.getUnixTime() - timeRestDuration + MiscInfo.TOM_LIMIT_REST_DURATION(), timeRest - reduceTime);
    }
}
