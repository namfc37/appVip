package model;

import cmd.ErrorConst;
import data.*;
import model.key.InfoKeyUser;
import model.mail.MailBox;
import model.object.PigBank;
import model.object.VIP;
import net.spy.memcached.CASValue;
import payment.billing.Card;
import payment.billing.PurchaseInfo;
import service.UdpHandler;
import user.UserControl;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class BillingProcessing
{
    public final static String SEPARATOR = "\n";

    private int        userId;
    private String     raw;
    private List<Card> items;

    public BillingProcessing (int userId, String raw)
    {
        this.userId = userId;
        this.raw = raw;
        items = new ArrayList<>();
        if (raw != null)
        {
            for (String line : raw.split("\n"))
            {
                line = line.trim();
                if (line.isEmpty())
                    continue;
                items.add(Json.fromJson(line, Card.class));
            }
        }
    }

    public static boolean process (UserControl userControl, Card card)
    {
        if (userControl == null)
            return false;
        byte result;
        UserGame game = userControl.game;
        Payment payment = game.getPayment();

        short cmd = CmdDefine.PAYMENT_PROCESS;
        String trans = card.appTrans;
        boolean isFirstCharge = false;
        boolean isPromotion = false;
        int promoPercent = 0;
        MapItem removeItems = new MapItem();
        MapItem receivedItems = new MapItem();
        int coinChange = 0;
        int goldChange = 0;
        String note = "";
        try
        {
            PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
            PaymentInfo.Item info = paymentInfo.getItem(card.item);
            if (info != null)
            {
                isFirstCharge = payment.isFirstCharge(card.item);
                if (isFirstCharge)
                    promoPercent += info.FIRST_CHARGE_PERCENT();

                isPromotion = info.isPromotion((int) (card.appTime / 1000));
                if (isPromotion)
                    promoPercent += info.PROMOTION_PERCENT();

                if (info.TYPE() == ItemType.TAB_COIN)
                {
                    note += "Tab coin.";
                    int promo = info.BONUS_QUANTITY();
                    if (promoPercent > 0)
                        promo += card.coinConvert * promoPercent / 100;
                    if (promo > 0)
                    {
                        note += "Has promo.";
                        result = userControl.addCoinPromo(cmd, trans, card.payTrans, promo, true, card.type, card.description);
                        if (result == ErrorConst.SUCCESS)
                        {
                            note += "Add promo.";
                            payment.addItem(card, info);
                    		game.paymentAccumulate (cmd, trans, card, receivedItems);
                            userControl.markFlagSaveGame();
                            receivedItems.increase(ItemId.COIN, promo);
                            coinChange += promo;
                        }
                    }
                    else
                    {
                        payment.addItem(card, info);
                		game.paymentAccumulate (cmd, trans, card, receivedItems);
                        userControl.markFlagSaveGame();
                        result = ErrorConst.SUCCESS;
                    }

                    if (paymentInfo.FIRST_CHARGE_ITEM_ACTIVE() && payment.setFirstChargeItem(info.SUB_TYPE()))
                    {
                        note += "Add mail first charge item";
                        MailBox mailBox = userControl.loadAndUpdateMailBox();
                        addFirstChargeItem(mailBox, info.SUB_TYPE(), paymentInfo);
                        MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                    }
                }
                else if (info.TYPE() == ItemType.TAB_GOLD)
                {
                    note += "Tab gold.";

                    int gold = (card.coinConvert * paymentInfo.RATE_COIN_TO_GOLD() * (100 + promoPercent) / 100) + info.BONUS_QUANTITY();

                    //VIP
                    VIPInfo.VIPItem currentUserVIPItem = game.getVIP().getCurrentActiveVIPItem();
                    int bonusVIPRate = currentUserVIPItem.CONVERT_GOLD_BONUS();
                    gold += card.coinConvert * paymentInfo.RATE_COIN_TO_GOLD() * bonusVIPRate / 100;

                    result = userControl.purchase(trans, card.coinConvert, PurchaseInfo.payment(cmd, card.item));
                    if (result == ErrorConst.SUCCESS)
                    {
                        note += "Purchased.";
                        game.addItem(cmd, trans, ItemId.GOLD, gold);
                        payment.addItem(card, info);
                		game.paymentAccumulate (cmd, trans, card, receivedItems);
                        userControl.markFlagSaveGame();

                        removeItems.increase(ItemId.COIN, card.coinConvert);
                        receivedItems.increase(ItemId.GOLD, gold);
                        
                        coinChange -= card.coinConvert;
                        goldChange += gold;

                        if (paymentInfo.FIRST_CHARGE_ITEM_ACTIVE() && payment.setFirstChargeItem(info.SUB_TYPE()))
                        {
                            note += "Add mail first charge item";
                            MailBox mailBox = userControl.loadAndUpdateMailBox();
                            addFirstChargeItem(mailBox, info.SUB_TYPE(), paymentInfo);
                            MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                        }
                    }
                }
                else if (info.TYPE() == ItemType.TAB_OFFER)
                {
                    note += "Tab Offer.";

                    PaymentInfo.Offer offerInfo = paymentInfo.getOffer(card.offer);
                    if (offerInfo == null)
                    {
                        result = ErrorConst.SUCCESS;
                        note += "Invalid offer.";
                    }
                    else if (!payment.canProcessOffer(card.offer))
                    {
                        result = ErrorConst.SUCCESS;
                        note += "Check fail";
                    }
                    else if (info.SUB_TYPE() == ItemSubType.SMS && card.coinConvert < offerInfo.PRICE_COIN() * paymentInfo.RATE_SMS_PERCENT() / 100) //số coin convert nhỏ hơn giá của offer thì ko được mua offer
                    {
                        result = ErrorConst.SUCCESS;
                        note += "SMS: gross < PRICE_VND";
                    }
                    else if (info.SUB_TYPE() != ItemSubType.SMS && card.coinConvert < offerInfo.PRICE_COIN()) //số coin convert nhỏ hơn giá của offer thì ko được mua offer
                    {
                        result = ErrorConst.SUCCESS;
                        note += "NonSMS: gross < PRICE_VND";
                    }
                    else
                    {
                        int price = Math.min(offerInfo.PRICE_COIN(), card.coinConvert);

                        if (offerInfo.ID().equals(MiscDefine.OFFER_PIG_BANK))
                        {
                            note += "Pig bank.";
                            PigBank pigBank = game.getPigBank();

                            int promo = Math.min(pigBank.getDiamond(), MiscInfo.PIG_MILESTONE_MAX()) - Math.min(offerInfo.PRICE_COIN(), card.coinConvert);

                            if (promo > 0)
                            {
                                result = userControl.addCoinPromo(cmd, trans, card.payTrans, promo, false, card.type, card.description);
                                if (result == ErrorConst.SUCCESS)
                                {
                                    note += "Add promo.";
                                    payment.addItem(card, info);
                                    pigBank.reset();
                                    pigBank.setTimeGetReward(Time.getUnixTime());
                                    
                            		game.paymentAccumulate (cmd, trans, card, receivedItems);
                                    userControl.markFlagSaveGame();
                                    receivedItems.increase(ItemId.COIN, promo);
                                    
                                    coinChange += promo;
                                }
                            }


                            else
                            {
                                result = ErrorConst.SUCCESS;
                                note += "Empty promo";
                            }
                        }
                        else if (offerInfo.ID().equals(MiscDefine.OFFER_VIP_0)
                                || offerInfo.ID().equals(MiscDefine.OFFER_VIP_1)
                                || offerInfo.ID().equals(MiscDefine.OFFER_VIP_2)
                                || offerInfo.ID().equals(MiscDefine.OFFER_VIP_3)
                                || offerInfo.ID().equals(MiscDefine.OFFER_VIP_4)
                                || offerInfo.ID().equals(MiscDefine.OFFER_VIP_5)
                                )
                        {
                            note += "VIP.";
                            result = userControl.purchase(trans, price, PurchaseInfo.payment(cmd, card.item));
                            if (result == ErrorConst.SUCCESS)
                            {
                                VIP userVIP = game.getVIP();
                                if (userVIP.setCurrentActive(offerInfo.ID()))
                                {
                                    note += "Success." + userVIP.getCurrentActive();
                                    MailBox mailBox = userControl.loadAndUpdateMailBox();
                                    mailBox.addMailPrivate(MiscDefine.MAIL_OFFER, offerInfo.ID(), "", offerInfo.REWARDS());
                                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

                                    userControl.markFlagSaveGame();
                                    game.paymentAccumulate (cmd, trans, card, receivedItems);
                                    UdpHandler.sendFriendUpdate(game.toFriendInfo());
                                }
                                else
                                {
                                    note += "Fail." + userVIP.getCurrentActive();
                                }
                            }
                        }
                        else if (offerInfo.REWARDS() != null)
                        {
                            note += "Reward.";
                            result = userControl.purchase(trans, price, PurchaseInfo.payment(cmd, card.item));
                            if (result == ErrorConst.SUCCESS)
                            {
                                note += "Purchased.";
                                MailBox mailBox = userControl.loadAndUpdateMailBox();
                                mailBox.addMailPrivate(MiscDefine.MAIL_OFFER, card.offer, "", offerInfo.REWARDS());
                                MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

                                payment.addItem(card, info);
                                payment.finishPurchaseOffer(paymentInfo, offerInfo, trans, game);

                        		game.paymentAccumulate (cmd, trans, card, receivedItems);
                                userControl.markFlagSaveGame();

                                removeItems.increase(ItemId.COIN, price);

                                coinChange -= price;
                            }
                        }
                        else
                        {
                            result = ErrorConst.SUCCESS;
                            note += "Empty reward";
                        }
                    }
                }
                else
                {
                    note += "Invalid type";
                    result = ErrorConst.INVALID_TYPE;
                }
            }
            else
            {
                note += "Null PaymentInfo.Item";
                result = ErrorConst.SUCCESS;
            }
            
            if (result != ErrorConst.SUCCESS || receivedItems.isEmpty())
            	receivedItems = null;
        }
        catch (Exception e)
        {
            result = ErrorConst.EXCEPTION;
            MetricLog.exception(e, Json.toJson(card));
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             trans,
                             removeItems,
                             receivedItems,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             goldChange,
                             card.item,
                             card.payTrans,
                             card.coinConvert,
                             card.appTime,
                             isFirstCharge,
                             isPromotion,
                             promoPercent,
                             card.offer,
                             card.gross,
                             note
                            );

        if (result == ErrorConst.SUCCESS)
            payment.addProcessed(card, note);
        
        return result == ErrorConst.SUCCESS;
    }

    public void process (UserControl control)
    {
        for (Iterator<Card> it = items.iterator(); it.hasNext(); )
        {
            Card item = it.next();
            if (process(control, item))
                it.remove();
        }

        if (items.size() > 0)
        {
            appendItem(userId, items);
        }
    }

    public static void appendItem (int userId, List<Card> items)
    {
        BillingProcessing n = BillingProcessing.get(userId);
        if (n == null)
            n = new BillingProcessing(userId, null);
        n.items.addAll(items);
        BillingProcessing.set(userId, n);
    }

    public static void appendItem (int userId, Card item)
    {
        BillingProcessing n = BillingProcessing.get(userId);
        if (n == null)
            n = new BillingProcessing(userId, null);
        n.items.add(item);
        BillingProcessing.set(userId, n);
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.BILLING_PROCESSING;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    public static Object getRaw (int userId)
    {
        return db().get(keyName(userId));
    }

    public static String encode (BillingProcessing o)
    {
        StringBuilder sb = new StringBuilder();
        for (Card item : o.items)
            sb.append(Json.toJson(item)).append(SEPARATOR);
        return sb.toString();
    }

    public static BillingProcessing decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                BillingProcessing obj = new BillingProcessing(userId, (String) raw);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static BillingProcessing get (int userId)
    {
        return decode(userId, getRaw(userId));
    }

    public static boolean set (int userId, BillingProcessing o)
    {
        return db().set(keyName(userId), encode(o));
    }

    public static CasValue<BillingProcessing> gets (int userId)
    {
        CASValue<Object> raw = db().gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(userId, raw.getValue()));
    }

    public static boolean cas (int userId, long cas)
    {
        return db().cas(keyName(userId), cas, SEPARATOR);
    }
    //-----------------------------------------------------------------------

    private static void addFirstChargeItem (MailBox mailBox, int channel, PaymentInfo paymentInfo)
    {
        MapItem rewards = null;
        switch (channel)
        {
            case ItemSubType.IAP:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_IAP();
                break;
            case ItemSubType.SMS:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_SMS();
                break;
            case ItemSubType.ZING:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_ZING();
                break;
            case ItemSubType.CARD:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_CARD();
                break;
            case ItemSubType.ATM:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_ATM();
                break;
            case ItemSubType.BANKING:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_BANKING();
                break;
            case ItemSubType.WALLET:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_WALLET();
                break;
            case ItemSubType.CREDIT:
                rewards = paymentInfo.FIRST_CHARGE_ITEM_CREDIT();
                break;
        }
        if (rewards != null)
            mailBox.addMailPrivate(MiscDefine.MAIL_FIRST_CHARGE_ITEM, Integer.toString(channel), "", rewards);
    }
}
