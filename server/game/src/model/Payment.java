package model;

import cmd.ErrorConst;
import data.*;
import model.mail.MailBox;
import payment.billing.Card;
import user.UserControl;
import util.Time;
import util.collection.MapItem;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class Payment extends Encoder.IObject implements KeyDefine
{
    public static final String RESET = "RESET";

    private HashMap<String, Item> map;

    private long                   totalConvert;
    private HashMap<Integer, Long> lastConvert;

    //Đổi tên biến để reset offer
    private int                    levelOfferA;
    private int                    timeOfferA;
    private HashMap<String, Offer> offersA;
    private MapItem                repeatOffers;

    private HashMap<String, Offer> offersExpired;

    private HashSet<Integer> setFirstChargeItem;
    private int              numTransaction;
    private boolean          activeLocal;
    private MapItem          purchaseOffers;
    private int              flowOffer;
    private int              dayCheckRareOffer;

    private ArrayList<Card>  lastProcess;

    private boolean useTestPayment;

    private transient String country;

    private Payment ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Payment create (int userId, String country)
    {
        Payment o = new Payment();
        o.map = new HashMap<>();
        o.lastConvert = new HashMap<>();
        o.init(userId, country);
        return o;
    }

    public void init (int userId, String country)
    {
        this.country = country;

        if (purchaseOffers == null)
            purchaseOffers = new MapItem();
        if (offersA == null)
            offersA = new HashMap<>();
        if (repeatOffers == null)
            repeatOffers = new MapItem();
        if (lastConvert == null)
            lastConvert = new HashMap<>();
        if (offersExpired == null)
            offersExpired = new HashMap<>();

        //hot fix bug add repeat offer in addOffer()
        /*if (repeatOffers.size() > 0)
        {
            PaymentInfo paymentInfo = PaymentInfo.get(country);
            for (MapItem.Entry e : repeatOffers)
            {
                String id = e.key();
                PaymentInfo.Offer info = paymentInfo.getOffer(id);
                if (info == null)
                    continue;

                int numPurchase = purchaseOffers.get(e.key());
                int maxRepeat = (info.REPEAT_DAY() - 1) * numPurchase;
                int numExist = e.value();
                if (numExist > maxRepeat)
                {
                    int remove = numExist - maxRepeat;
                    repeatOffers.decrease(id, remove);
                    
                    MetricLog.actionUser("PAYMENT_OFFER_REMOVE",
                                     userId,
                                     0,
                                     "",
                                     "",
                                     "",
                                     ErrorConst.SUCCESS,
                                     id,
                                     numExist,
                                     numPurchase,
                                     remove,
                                     repeatOffers.get(id)
                                    );
                }
            }
        }*/

    }

    public void resetDaily ()
    {
        for (Item i : map.values())
        {
            i.daily = 0;
        }
        if (lastConvert != null && lastConvert.size() > 0)
        {
            int lastDay = Time.curDay() - 30;
            for (Iterator<Integer> it = lastConvert.keySet().iterator(); it.hasNext(); )
            {
                int day = it.next();
                if (day < lastDay)
                    it.remove();
            }
        }
        if (lastProcess != null && lastProcess.size() > 0)
        {
            int lastTime = Time.getUnixTime() - Time.SECOND_IN_DAY * 10;
            for (Iterator<Card> it = lastProcess.iterator(); it.hasNext(); )
            {
                Card card = it.next();
                if (card == null || card.appTime < lastTime)
                    it.remove();
            }
        }
        checkOfferExpired();
    }

    public void resetDailyOffer (UserControl userControl)
    {
        if (repeatOffers != null && repeatOffers.size() > 0)
        {
            MailBox mailBox = userControl.getMailBox();
            MapItem newRepeat = new MapItem();
            for (MapItem.Entry entry : repeatOffers)
            {
                int value = entry.value();
                if (value <= 0)
                    continue;
                PaymentInfo paymentInfo = PaymentInfo.get(userControl.game.getCountry());
                PaymentInfo.Offer info = paymentInfo.getOffer(entry.key());
                if (info == null)
                    continue;
                mailBox.addMailPrivate(MiscDefine.MAIL_OFFER, info.ID(), "", info.REWARDS());
                value--;
                if (value > 0)
                    newRepeat.put(entry.key(), value);
            }
            repeatOffers = newRepeat;
            MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
        }

    }

    public void update (String transactionId, UserGame game)
    {
        int curTime = Time.getUnixTime();

        if (MiscInfo.OFFER_ACTIVE())
        {
            PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());

            //check old offer
            if (offersA.size() > 0)
            {
                ArrayList<Offer> expireOffers = new ArrayList<>();
                for (Iterator<Offer> it = offersA.values().iterator(); it.hasNext(); )
                {
                    Offer o = it.next();
                    if (o.timeFinish <= curTime)
                    {
                        it.remove();
                        expireOffers.add(o);

                        logOffer(transactionId, game, ErrorConst.EXPIRED, o.id, "Offer expired");
                    }
                }
                addOfferExpired(expireOffers);

                for (Offer o : expireOffers)
                {
                    PaymentInfo.Offer info = paymentInfo.getOffer(o.id);
                    if (info == null)
                        continue;
                    if (purchaseOffers.isEmpty())
                        addOffer(paymentInfo, info.DURATION_ACTIVE_NO_PURCHASE(), transactionId, game, "Expired " + o.id + " and countOffers is empty");
                    else
                        addOffer(paymentInfo, info.DURATION_ACTIVE_PURCHASE(), transactionId, game, "Expired " + o.id + " and countOffers is not empty");
                }
            }

            int dayFromRegister = (Time.getUnixTime() - game.userControl.brief.timeRegister) / Time.SECOND_IN_DAY;
            if (dayCheckRareOffer < paymentInfo.OFFER_RARE_PERIOD_DAY_MIN())
                dayCheckRareOffer = ThreadLocalRandom.current().nextInt(paymentInfo.OFFER_RARE_PERIOD_DAY_MIN(), paymentInfo.OFFER_RARE_PERIOD_DAY_MAX() + 1);
            long numConvertRarePeriod = numConvert(dayCheckRareOffer);

            //add new offer
            if (game.getLevel() >= paymentInfo.OFFER_SUPER_LEVEL())
            {
                if (levelOfferA != paymentInfo.OFFER_SUPER_LEVEL())
                    timeOfferA = 0;

                if (timeOfferA <= curTime)
                {
                    if (numConvertRarePeriod <= 0 && dayFromRegister >= dayCheckRareOffer)
                    {
                        flowOffer = MiscDefine.OFFER_FLOW_RARE;
                        resetOffer(curTime + ThreadLocalRandom.current()
                                                              .nextInt(paymentInfo.OFFER_RARE_SUPER_RESET_MIN(), paymentInfo.OFFER_RARE_SUPER_RESET_MAX() + 1),
                                   transactionId,
                                   game,
                                   "Reset for Rare Super Offer");
                        if (totalConvert <= 0)
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_SUPER_NO_PURCHASE_RANDOM(), transactionId, game, "Init Rare supper offer and convert D");
                        else if (totalConvert <= paymentInfo.OFFER_RARE_SUPER_PERIOD_PURCHASE())
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_SUPER_LOW_PURCHASE_RANDOM(), transactionId, game, "Init Rare supper offer and convert E");
                        else
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_SUPER_HIGH_PURCHASE_RANDOM(), transactionId, game, "Init Rare supper offer and convert F");
                    }
                    else
                    {
                        flowOffer = MiscDefine.OFFER_FLOW_NORMAL;
                        resetOffer(curTime + ThreadLocalRandom.current().nextInt(paymentInfo.OFFER_SUPER_RESET_MIN(), paymentInfo.OFFER_SUPER_RESET_MAX() + 1),
                                   transactionId,
                                   game,
                                   "Reset for Super Offer");
                        long convert = numConvert(paymentInfo.OFFER_SUPER_PERIOD_DAY());
                        if (convert <= 0)
                            addOffer(paymentInfo, paymentInfo.OFFER_SUPER_NO_PURCHASE_RANDOM(), transactionId, game, "Init supper offer and convert A");
                        else if (convert <= paymentInfo.OFFER_SUPER_PERIOD_PURCHASE())
                            addOffer(paymentInfo, paymentInfo.OFFER_SUPER_LOW_PURCHASE_RANDOM(), transactionId, game, "Init supper offer and convert B");
                        else
                            addOffer(paymentInfo, paymentInfo.OFFER_SUPER_HIGH_PURCHASE_RANDOM(), transactionId, game, "Init supper offer and convert C");
                    }
                    levelOfferA = paymentInfo.OFFER_SUPER_LEVEL();
                }
            }
            else if (game.getLevel() >= paymentInfo.OFFER_SPECIAL_LEVEL())
            {
                if (levelOfferA != paymentInfo.OFFER_SPECIAL_LEVEL())
                    timeOfferA = 0;

                if (timeOfferA <= curTime)
                {
                    if (numConvertRarePeriod <= 0 && dayFromRegister >= dayCheckRareOffer)
                    {
                        flowOffer = MiscDefine.OFFER_FLOW_RARE;
                        resetOffer(curTime + ThreadLocalRandom.current()
                                                              .nextInt(paymentInfo.OFFER_RARE_SPECIAL_RESET_MIN(), paymentInfo.OFFER_RARE_SPECIAL_RESET_MAX() + 1)
                                , transactionId, game, "Reset for Rare Special Offer");
                        if (totalConvert <= 0)
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_SPECIAL_NO_PURCHASE_RANDOM(), transactionId, game, "Init Rare special offer and convert A");
                        else if (totalConvert <= paymentInfo.OFFER_RARE_SPECIAL_PERIOD_PURCHASE())
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_SPECIAL_LOW_PURCHASE_RANDOM(), transactionId, game, "Init Rare special offer and convert B");
                        else
                            addOffer(paymentInfo,
                                     paymentInfo.OFFER_RARE_SPECIAL_HIGH_PURCHASE_RANDOM(),
                                     transactionId,
                                     game,
                                     "Init Rare special offer and convert C");
                    }
                    else
                    {
                        flowOffer = MiscDefine.OFFER_FLOW_NORMAL;
                        resetOffer(curTime + ThreadLocalRandom.current().nextInt(paymentInfo.OFFER_SPECIAL_RESET_MIN(), paymentInfo.OFFER_SPECIAL_RESET_MAX() + 1),
                                   transactionId, game, "Reset for Special Offer");
                        if (totalConvert <= 0)
                            addOffer(paymentInfo, paymentInfo.OFFER_SPECIAL_NO_PURCHASE_RANDOM(), transactionId, game, "Init special offer and convert A");
                        else if (totalConvert <= paymentInfo.OFFER_SPECIAL_TOTAL_PURCHASE())
                            addOffer(paymentInfo, paymentInfo.OFFER_SPECIAL_LOW_PURCHASE_RANDOM(), transactionId, game, "Init special offer and convert B");
                        else
                            addOffer(paymentInfo, paymentInfo.OFFER_SPECIAL_HIGH_PURCHASE_RANDOM(), transactionId, game, "Init special offer and convert C");
                    }
                    levelOfferA = paymentInfo.OFFER_SPECIAL_LEVEL();
                }
            }
            else if (game.getLevel() >= paymentInfo.OFFER_NEWBIE_LEVEL())
            {
                if (levelOfferA != paymentInfo.OFFER_NEWBIE_LEVEL())
                {
                    timeOfferA = 0;
                }
                if (numConvertRarePeriod <= 0 && dayFromRegister >= dayCheckRareOffer)
                {
                    //thỏa điều kiện rare offer
                    if (flowOffer == MiscDefine.OFFER_FLOW_NORMAL || (flowOffer == MiscDefine.OFFER_FLOW_RARE && timeOfferA < curTime))
                    {
                        flowOffer = MiscDefine.OFFER_FLOW_RARE;
                        resetOffer(curTime + ThreadLocalRandom.current()
                                                              .nextInt(paymentInfo.OFFER_RARE_NEWBIE_RESET_MIN(), paymentInfo.OFFER_RARE_NEWBIE_RESET_MAX() + 1),
                                   transactionId, game, "Reset for Rare newbie offer");
                        if (totalConvert <= 0)
                        {
                            resetOffer(Integer.MAX_VALUE, transactionId, game, "Reset for newbie offer");
                            addOffer(paymentInfo, paymentInfo.OFFER_NEWBIE_OFFER_RANDOM(), transactionId, game, "Init newbie offer");
                        }
                        else if (totalConvert <= paymentInfo.OFFER_RARE_NEWBIE_PERIOD_PURCHASE())
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_NEWBIE_LOW_PURCHASE_RANDOM(), transactionId, game, "Init rare newbie offer and convert B");
                        else
                            addOffer(paymentInfo, paymentInfo.OFFER_RARE_NEWBIE_HIGH_PURCHASE_RANDOM(), transactionId, game, "Init rare newbie offer and convert C");
                    }
                }
                else
                {
                    //offer normal
                    if (timeOfferA < curTime)
                    {
                        flowOffer = MiscDefine.OFFER_FLOW_NORMAL;
                        resetOffer(Integer.MAX_VALUE, transactionId, game, "Reset for Newbie offer");
                        addOffer(paymentInfo, paymentInfo.OFFER_NEWBIE_OFFER_RANDOM(), transactionId, game, "Init newbie offer");
                    }
                }
                levelOfferA = paymentInfo.OFFER_NEWBIE_LEVEL();
            }

        }
    }

    private void checkOfferExpired ()   //kiểm tra, xóa offer quá hạn lưu trữ
    {
        int curTime = Time.getUnixTime();
        PaymentInfo paymentInfo = PaymentInfo.get(country);
        if (offersExpired.size() > 0)
        {
            for (Iterator<Offer> it = offersExpired.values().iterator(); it.hasNext(); )
            {
                Offer o = it.next();
                if (o.timeFinish + paymentInfo.TIME_CHECK_OFFER_EXPIRE() <= curTime)
                {
                    it.remove();
                }
            }
        }
    }

    private void addOfferExpired (Collection<Offer> offers)
    {
        for (Offer offer : offers)
        {
            offersExpired.put(offer.id, offer);
        }

    }

    private void resetOffer (int nextTimeReset, String transactionId, UserGame game, String description)
    {
        levelOfferA = 0;
        timeOfferA = nextTimeReset;
        addOfferExpired(offersA.values());
        offersA.clear();
        logOffer(transactionId, game, ErrorConst.SUCCESS, RESET, description);
    }

    public void gmResetOffer (UserGame game)
    {
        resetOffer(0, "", game, "GM reset offer");
        purchaseOffers.clear();
        repeatOffers = null;
    }

    public boolean isFirstCharge (String id)
    {
        return !map.containsKey(id);
    }

    public void addItem (final Card card, final PaymentInfo.Item info)
    {
        Item item = map.get(card.item);
        if (item == null)
        {
            item = new Item();
            item.id = card.item;
            map.put(item.id, item);
        }
        item.total++;
        item.daily++;
        if (info.NEXT_PAY_COUNTDOWN() > 0)
        {
            item.timeStart = Time.getUnixTime();
            item.timeFinish = item.timeStart + info.NEXT_PAY_COUNTDOWN();
        }

        totalConvert += card.coinConvert;
        numTransaction++;
        int day = Time.curDay();

        lastConvert.compute(day, (k, v) -> v == null ? card.coinConvert : v + card.coinConvert);
    }

    public static class Item extends Encoder.IObject implements KeyDefine
    {
        private String id;
        private int    total;
        private int    daily;
        private int    timeStart;
        private int    timeFinish;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(PAYMENT_INFO_ID, id);
            msg.put(PAYMENT_INFO_TOTAL, total);
            msg.put(PAYMENT_INFO_DAILY, daily);
            msg.put(PAYMENT_INFO_TIME_START, timeStart);
            msg.put(PAYMENT_INFO_TIME_FINISH, timeFinish);
        }
    }

    public static class Offer extends Encoder.IObject implements KeyDefine
    {
        private String id;
        private int    timeStart;
        private int    timeFinish;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(PAYMENT_OFFER_ID, id);
            msg.put(PAYMENT_OFFER_TIME_START, timeStart);
            msg.put(PAYMENT_OFFER_TIME_FINISH, timeFinish <= 0 ? timeFinish : timeFinish - MiscInfo.OFFER_DURATION_BUFFER());
        }

        public Offer (String id)
        {
            this.id = id;
        }
    }

    public void addOffer (PaymentInfo paymentInfo, String id, String transactionId, UserGame game, String description)
    {
        addOffer(paymentInfo, id, transactionId, game, null, description);
    }

    private void addOffer (PaymentInfo paymentInfo, String id, String transactionId, UserGame game, PaymentInfo.Offer purchaseInfo, String description)
    {
        if (purchaseInfo != null)
            purchaseOffers.increase(purchaseInfo.ID(), 1);

        if (id == null || id.isEmpty())
            return;

        int result;
        PaymentInfo.Offer info;

        if (id.equalsIgnoreCase(RESET))
        {
            result = ErrorConst.SUCCESS;
            if (purchaseInfo == null)
                timeOfferA = 0;
            else
                timeOfferA = Time.getUnixTime() + ThreadLocalRandom.current().nextInt(purchaseInfo.COOLDOWN_MIN(), purchaseInfo.COOLDOWN_MAX() + 1);
        }
        else if ((info = paymentInfo.getOffer(id)) == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else
        {
            Offer add;
            if (purchaseInfo != null)
            {
                add = new Offer(info.ID());
                add.timeStart = Time.getUnixTime() + ThreadLocalRandom.current().nextInt(info.COOLDOWN_MIN(), info.COOLDOWN_MAX() + 1);
                add.timeFinish = add.timeStart + info.DURATION() + MiscInfo.OFFER_DURATION_BUFFER();
            }
            else
            {
                add = new Offer(info.ID());
                add.timeStart = Time.getUnixTime();
                add.timeFinish = add.timeStart + info.DURATION() + MiscInfo.OFFER_DURATION_BUFFER();
            }

            result = ErrorConst.SUCCESS;
            offersA.put(add.id, add);
        }

        logOffer(transactionId, game, result, id, description);
    }

    private void logOffer (String transactionId, UserGame game, int result, String id, String description)
    {
        MetricLog.actionUser(game.userControl.country,
                             CmdDefine.PAYMENT_OFFER_ADD,
                             game.userControl.platformID,
                             game.userControl.brief.getUserId(),
                             game.userControl.brief.getUsername(),
                             game.userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             ErrorConst.SUCCESS,
                             game.userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             id,
                             description
                            );

    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(PAYMENT_INFOS, map.values());
        msg.put(PAYMENT_OFFERS, offersA == null ? null : offersA.values());
        msg.put(PAYMENT_REPEAT_OFFERS, repeatOffers == null ? null : repeatOffers);
        msg.putInts(PAYMENT_FIRST_CHARGE_ITEM, setFirstChargeItem);
        msg.put(PAYMENT_TIME_OFFER, timeOfferA);
    }

    public boolean isActive (PaymentInfo.Item info, String id)
    {
        if (info == null)
            return false;
        Item item = map.get(id);
        if (item == null)
            return true;
        if (info.LIMIT_DAY() > 0 && item.daily >= info.LIMIT_DAY())
            return false;
        if (item.timeFinish > Time.getUnixTime())
            return false;
        return true;
    }

    public boolean isActiveOffer (PaymentInfo paymentInfo, String id, UserGame game)
    {
        PaymentInfo.Offer info = paymentInfo.getOffer(id);
        if (info == null)
            return false;
        if (info.ID().equals(MiscDefine.OFFER_PIG_BANK))
        {
            if (!MiscInfo.PIG_ACTIVE() || game.getPigBank().getDiamond() < MiscInfo.PIG_MILESTONE_MIN()
                    || !game.getPigBank().isActive(game.getLevel()))
                return false;
        }
        else if (info.ID().equals(MiscDefine.OFFER_VIP_0)
                || info.ID().equals(MiscDefine.OFFER_VIP_1)
                || info.ID().equals(MiscDefine.OFFER_VIP_2)
                || info.ID().equals(MiscDefine.OFFER_VIP_3)
                || info.ID().equals(MiscDefine.OFFER_VIP_4)
                || info.ID().equals(MiscDefine.OFFER_VIP_5)
                )
        {
            if (!MiscInfo.VIP_ACTIVE()
                    || MiscInfo.VIP_UNLOCK_LEVEL() > game.getLevel()
                    )
                return false;
        }
        else
        {
            if (!info.CHECK_ACTIVE())
                return true;
            Offer offer = offersA.get(id);
            if (offer == null)
                return false;
            int curTime = Time.getUnixTime();
            if (curTime < offer.timeStart || curTime > offer.timeFinish)
                return false;
        }
        return true;
    }

    public boolean canProcessOffer (String id)
    {
        if (id.equals(MiscDefine.OFFER_PIG_BANK))
            return true;

        if (id.equals(MiscDefine.OFFER_VIP_0)
                || id.equals(MiscDefine.OFFER_VIP_1)
                || id.equals(MiscDefine.OFFER_VIP_2)
                || id.equals(MiscDefine.OFFER_VIP_3)
                || id.equals(MiscDefine.OFFER_VIP_4)
                || id.equals(MiscDefine.OFFER_VIP_5))
            return true;

        Offer offer = offersA.get(id);
        if (offer != null)
            return true;

        Offer offer1 = offersExpired.get(id);
        return offer1 != null;
    }


    public void finishPurchaseOffer (PaymentInfo paymentInfo, PaymentInfo.Offer info, String transactionId, UserGame game)
    {
        if (offersA.remove(info.ID()) != null)
        {
            offersExpired.remove(info.ID());
            addOffer(paymentInfo, info.COOLDOWN_ACTIVE(), transactionId, game, info, "Add cooldown offer " + info.ID());
            dayCheckRareOffer = 0;
            if (info.REPEAT_DAY() > 1)
            {
                int newValue = info.REPEAT_DAY() - 1;
                Integer oldValue = repeatOffers.get(info.ID());
                if (oldValue != null)
                    newValue += oldValue;
                if (newValue > 0)
                    repeatOffers.put(info.ID(), newValue);
            }
        }
    }

    public long numConvert (int numDay)
    {
        int curDay = Time.curDay();
        long numConvert = 0;
        for (int day = curDay - numDay + 1; day <= curDay; day++)
        {
            Long convert = lastConvert.get(day);
            if (convert == null)
                continue;
            numConvert += convert;
        }
        return numConvert;
    }

    public boolean setFirstChargeItem (int channel)
    {
        if (setFirstChargeItem == null)
            setFirstChargeItem = new HashSet<>();
        return setFirstChargeItem.add(channel);
    }

    public int getNumTransaction ()
    {
        return numTransaction;
    }

    public boolean isActiveLocalPayment ()
    {
        return activeLocal;
    }

    public void setActiveLocalPayment (boolean enable)
    {
        activeLocal = enable;
    }

    public long getTotalConvert ()
    {
        return totalConvert;
    }

    public boolean useTestPayment() {
        return useTestPayment;
    }

    public void setUseTestPayment(boolean useTestPayment) {
        this.useTestPayment = useTestPayment;
    }

    public void addProcessed (Card card, String note)
    {
        if (lastProcess == null)
            lastProcess = new ArrayList<>();
        card.noteProcessing = note;
        lastProcess.add(card);
    }
}
