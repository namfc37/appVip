package model.object;

import data.*;
import model.mail.MailBox;
import user.UserControl;
import util.Time;
import util.serialize.Encoder;

public class VIP extends Encoder.IObject implements KeyDefine
{
    private String currentActive;
    private int    timeExpire;
    private int    timeActive;

    public int getTimeActive ()
    {
        return timeActive;
    }

    public void setTimeActive (int timeActive)
    {
        this.timeActive = timeActive;
    }

    private VIP ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }


    public static VIP create ()
    {
        VIP s = new VIP();
        s.currentActive = MiscDefine.VIP_INACTIVE;
        return s;
    }

    public boolean isActive (int userLevel)
    {
        return userLevel >= MiscInfo.VIP_UNLOCK_LEVEL() && MiscInfo.VIP_ACTIVE();
    }

    public String getCurrentActive ()
    {
        return currentActive;
    }

    public VIPInfo.VIPItem getCurrentActiveVIPItem ()
    {
        if (!currentActive.equals(MiscDefine.VIP_INACTIVE) && timeExpire < Time.getUnixTime())
            currentActive = MiscDefine.VIP_INACTIVE;
        return ConstInfo.getVIPInfo().getVIPItem(currentActive);
    }

    public boolean setCurrentActive (String currentActive)
    {
        VIPInfo.VIPItem itemInfo = ConstInfo.getVIPInfo().getVIPItem(currentActive);
        if (itemInfo == null)
            return false;

        if (!this.currentActive.equals(currentActive))
        {
            this.currentActive = currentActive;
            timeExpire = Time.getUnixTime() + itemInfo.DURATION() * Time.SECOND_IN_DAY;
            timeActive = Time.getUnixTime();
        }
        else
        {
            if (Time.getUnixTime() > timeExpire)
                timeActive = Time.getUnixTime();
            timeExpire = Math.max(timeExpire, Time.getUnixTime()) + itemInfo.DURATION() * Time.SECOND_IN_DAY;
        }
        return true;
    }

    public int getTimeExpire ()
    {
        return timeExpire;
    }

    public void setTimeExpire (int timeExpire)
    {
        this.timeExpire = timeExpire;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(VIP_CURRENT_ACTIVE, currentActive);
        msg.put(VIP_CURRENT_ACTIVE_TIME_EXPIRE, timeExpire);
        msg.put(VIP_CURRENT_ACTIVE_TIME_ACTIVE, timeActive);

    }

    public void resetDaily (UserControl userControl)
    {

        if (getCurrentActiveVIPItem().DAILY_LOGIN_REWARD().size() == 0)

            return;

        MailBox mailBox = userControl.loadAndUpdateMailBox();
        mailBox.addMailPrivate(MiscDefine.MAIL_OFFER, "VIP_DAILY_REWARDS", "", getCurrentActiveVIPItem().DAILY_LOGIN_REWARD());
        MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

        userControl.markFlagSaveGame();


    }
}
