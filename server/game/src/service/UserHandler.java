package service;

import bitzero.server.core.BZEventParam;
import bitzero.server.core.BZEventType;
import bitzero.server.core.IBZEvent;
import bitzero.server.entities.User;
import bitzero.server.extensions.data.DataCmd;
import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.receive.user.*;
import cmd.send.user.*;
import com.google.gson.JsonObject;
import data.*;
import data.PaymentAccumulateInfo.Reward;
import data.festival.Event01Info;
import data.festival.Event02Info;
import data.festival.Event02RewardPack;
import data.festival.Event03Info;
import data.ranking.RankingBoard;
import data.ranking.RankingManager;
import extension.EnvConfig;
import model.*;
import model.key.InfoKeyPOSM;
import model.key.InfoKeyUser;
import model.mail.MailBox;
import model.mail.MailBox.Mail;
import model.object.*;
import org.apache.kafka.common.Metric;
import payment.GoogleSubmit;
import payment.billing.Card;
import payment.billing.PurchaseInfo;
import payment.brazil.CreateTransaction;
import payment.brazil.ProcessTransaction;
import payment.brazil.card.PaymentBrazilGetFlow;
import payment.brazil.card.PaymentBrazilGetTransaction;
import payment.direct.AtmReg;
import payment.direct.CardSubmit;
import payment.direct.SmsReg;
import payment.local.CheckLocalPayment;
import payment.sea.GetPhone;
import payment.sea.SeaGetTransaction;
import payment.sea.SeaVerifyOtp;
import service.friend.FriendInfo;
import service.newsboard.NewsBoardClient;
import service.newsboard.NewsBoardItem;
import service.old.OldServer;
import service.old.UserConverter;
import service.udp.MsgFriendNotifyAdd;
import service.udp.MsgFriendNotifyRemove;
import service.udp.MsgFriendNotifyRequest;
import service.udp.MsgNotifyRepairMachine;
import user.UserControl;
import util.*;
import util.collection.MapItem;
import util.giftcode.GenerateGiftCode;
import util.memcached.BucketManager;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.redis.Redis;
import util.serialize.Decoder;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

public class UserHandler extends ClientRequestHandler
{
    public static final UserHandler instance = new UserHandler();
    @Override
    public void init ()
    {
        getParentExtension().addEventListener(BZEventType.USER_LOGOUT, this);
        getParentExtension().addEventListener(BZEventType.USER_DISCONNECT, this);
        getParentExtension().addEventListener(BZEventType.XU_UPDATE, this);
    }

    @Override
    public void handleServerEvent (IBZEvent event)
    {
        User user = (User) event.getParameter(BZEventParam.USER);
        try
        {
            if (event.getType() == BZEventType.XU_UPDATE)
                handleCommand(user, CmdDefine.UPDATE_COIN);
            else if (event.getType() == BZEventType.USER_DISCONNECT)
                UserControl.logout(user);
        }
        catch (Exception e)
        {
            MetricLog.exception(e, user.getId(), event.getType());
        }
    }

    @Override
    public void handleSystemCommand (String transactionId, UserControl userControl, UserControl.QueueCommand action) throws Exception
    {
        short cmd = action.cmd;
        switch (cmd)
        {
            case CmdDefine.UPDATE_COIN:
                updateCoin(cmd, "", userControl);
                break;
            case CmdDefine.PRIVATE_SHOP_GET:
                privateShopGet(cmd, userControl);
                break;
            case CmdDefine.AIRSHIP_GET:
                airshipGet(cmd, userControl);
                break;
            case CmdDefine.FRIEND_NOTIFY_ADD:
                friendNotifyAdd(cmd, userControl, (MsgFriendNotifyAdd) action.obj);
                break;
            case CmdDefine.FRIEND_NOTIFY_REMOVE:
                friendNotifyRemove(cmd, userControl, (MsgFriendNotifyRemove) action.obj);
                break;
            case CmdDefine.FRIEND_NOTIFY_REQUEST:
                friendNotifyRequest(cmd, userControl, (MsgFriendNotifyRequest) action.obj);
                break;
            case CmdDefine.NOTIFY_REPAIR_MACHINE:
                notifyRepairMachine(cmd, userControl, (MsgNotifyRepairMachine) action.obj);
                break;
        }
    }

    @Override
    public void handleUserCommand (String transactionId, UserControl userControl, UserControl.QueueCommand action) throws Exception
    {
        Decoder decoder = action.decoder;
        short cmd = action.cmd;
        switch (cmd)
        {
            case CmdDefine.GET_USER_DATA:
                getUserData(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.STOCK_UPGRADE:
                stockUpgrade(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.BUY_ITEM:
                buyItem(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FLOOR_UPGRADE:
                floorUpgrade(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.POT_PUT:
                potPut(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.POT_STORE:
                potStore(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.POT_MOVE:
                potMove(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.POT_UPGRADE:
                potUpgrade(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PLANT:
                plant(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PLANT_SKIP_TIME:
                plantSkipTime(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PLANT_CATCH_BUG:
                plantCatchBug(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PLANT_HARVEST:
                plantHarvest(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_UNLOCK:
                machineUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_SKIP_TIME_UNLOCK:
                machineSkipTimeUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_FINISH_UNLOCK:
                machineFinishUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_REPAIR:
                machineRepair(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_UPGRADE:
                machineUpgrade(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_BUY_SLOT:
                machineBuySlot(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_BUY_WORKING_TIME:
                machineBuyWorkingTime(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_PRODUCE:
                machineProduce(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_HARVEST:
                machineHarvest(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_SKIP_TIME_PRODUCE:
                machineSkipTimeProduce(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_GET:
                machineGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ORDER_DELIVERY:
                orderDelivery(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ORDER_GET_REWARD:
                orderGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ORDER_CANCEL:
                orderCancel(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ORDER_ACTIVE:
                orderActive(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ORDER_SKIP_TIME:
                orderSkipTime(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.BUY_IBSHOP:
                buyIBShop(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.SELL_FOR_JACK:
                sellForJack(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_GET:
                privateShopGet(cmd, userControl);
                break;
            case CmdDefine.PRIVATE_SHOP_PUT:
                privateShopPut(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_AD:
                privateShopAd(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_SKIP_TIME:
                privateShopSkipTime(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_CANCEL:
                privateShopCancel(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_GET_MONEY:
                privateShopGetMoney(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_UNLOCK_COIN:
                privateShopUnlockCoin(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_NEWS_BOARD:
                privateShopNewsBoard(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_FRIEND_GET:
                privateShopFriendGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_FRIEND_BUY:
                privateShopFriendBuy(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_UNLOCK:
                airshipUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_SKIP_TIME_UNLOCK:
                airshipSkipTimeUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_SKIP_TIME_INACTIVE:
                airshipSkipTimeInactive(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_PACK:
                airshipPack(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_DELIVERY:
                airshipDelivery(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_CANCEL:
                airshipCancel(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_REQUEST_HELP:
                airshipRequestHelp(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_FRIEND_GET:
                airshipFriendGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_GET:
                airshipGet(cmd, userControl);
                break;
            case CmdDefine.AIRSHIP_FRIEND_PACK:
                airshipFriendPack(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.AIRSHIP_NEWS_BOARD:
                airshipNewsBoard(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TOM_HIRE:
                tomHire(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TOM_FIND:
                tomFind(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TOM_BUY:
                tomBuy(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TOM_CANCEL:
                tomCancel(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TOM_REDUCE_TIME:
                tomReduceTime(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.LUCKY_SPIN:
                luckySpin(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.LUCKY_SPIN_GET_REWARD:
                luckySpinGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MAIL_MARK_READ:
                mailMarkRead(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MAIL_DELETE:
                mailDelete(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MAIL_GET_REWARD:
                mailGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.BLACKSMITH_MAKE_POT:
                blacksmithMakePot(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.OPEN_BUILDING_GAME:
                openBuildingGame(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.DICE_SPIN:
                diceSpin(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.DICE_GET_REWARD:
                diceGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.DECOR_PUT:
                decorPut(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.DECOR_STORE:
                decorStore(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.DAILY_GIFT_GET_REWARD:
                dailyGiftGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MINE_GET_INFO:
                mineGetInfo(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MINE_START:
                mineStart(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MINE_SKIP_TIME:
                mineSkipTime(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MINE_RECEIVE_REWARDS:
                mineReceiveRewards(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.GACHA_OPEN:
                gachaOpen(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.GACHA_GET_REWARD:
                gachaGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.EVENT_MERGE_PUZZLE:
                eventMergePuzzle(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.EVENT_01_RECEIVE_REWARDS:
                event01ReceiveRewards(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_CARD_SUBMIT:
                paymentCardSubmit(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_SMS_REG:
                paymentSmsReg(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_ATM_REG:
                paymentAtmReg(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_GOOGLE_CHECK:
                paymentGoogleCheck(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_GOOGLE_SUBMIT:
                paymentGoogleSubmit(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TUTORIAL_SAVE:
                tutorialSave(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TUTORIAL_STEP:
                tutorialStep(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_BUG_GET:
                friendBugGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_BUG_CATCH:
                friendBugCatch(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.JACK_PRIVATE_SHOP_BUY:
                jackPrivateShopBuy(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.JACK_MACHINE_REPAIR:
                jackMachineRepair(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_GET:
                friendGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_ADD:
                friendAdd(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_REMOVE:
                friendRemove(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_SEND_REQUEST:
                friendSendRequest(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_DENY_REQUEST:
                friendDenyRequest(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_VISIT:
                friendVisit(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FRIEND_REPAIR_MACHINE:
                friendRepairMachine(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.MACHINE_UPDATE_FRIEND_REPAIR:
                machineUpdateFriendRepair(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PRIVATE_SHOP_UNLOCK_FRIEND:
                privateShopUnlockFriend(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ACHIEVEMENT_SAVE:
                achievementSave(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ACHIEVEMENT_FINISH:
                achievementFinish(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.ACHIEVEMENT_TROPHY_REWARD:
                achievementTrophyReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.GIFTCODE_GET_REWARD:
                giftCodeGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_GET:
                paymentGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.CLOUD_SKIN_APPLY:
                cloudSkinApply(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.CLOUD_SKIN_CLEAR:
                cloudSkinClear(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_BOOK_GET:
                questBookGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_BOOK_SAVE_PROGRESS:
                questBookSave(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_BOOK_SKIP:
                questBookSkip(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_BOOK_CLAIM_REWARD:
                questBookClaimReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.CONVERT_OLD_USER:
                convertOldUser(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_BRAZIL_CREATE:
                paymentBrazilCreate(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_BRAZIL_PROCESS:
                paymentBrazilProcess(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.RATING_GET_REWARD:
                ratingGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.RANKING_GET_TOP:
                rankingGetTop(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.RANKING_GET_PR:
                rankingGetPR(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.RANKING_CLAIM_REWARD_DEFAULT:
                rankingClaimRewardDefault(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PIG_UPDATE_DIAMOND:
                pigUpdateDiamond(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_SEA_ASK_PHONE:
                paymentSeaAskPhone(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_SEA_CREATE:
                paymentSeaCreate(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_SEA_VERIFY:
                paymentSeaVerify(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FLIPPINGCARDS_GET:
                flippingCardsGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FLIPPINGCARDS_CLAIM_CHECKPOINT:
                flippingCardsCheckpointReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FLIPPINGCARDS_GAME_START:
                flippingCardsGameStart(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FLIPPINGCARDS_GAME_USE_ITEM:
                flippingCardsUseItem(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FLIPPINGCARDS_GAME_END:
                flippingCardsGameEnd(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_MISSION_GET:
                questMissionGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_MISSION_SAVE_PROGRESS:
                questMissionSave(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.QUEST_MISSION_CLAIM_REWARD:
                questMissionClaimReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_UNLOCK:
                truckUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_SKIP_TIME_UNLOCK:
                truckSkipTimeUnlock(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_GET:
                truckGet(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_CANCEL:
                truckCancelDelivery(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_PACK:
                truckPack(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_DELIVERY:
                truckDelivery(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_SKIP_TIME_INACTIVE:
                truckSkipTimeInactive(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.TRUCK_UPGRADE:
                truckUpgrade(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.EVENT02_EXCHANGE_PACK:
                event02ExchangePack(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.EVENT_02_RECEIVE_REWARDS:
                event02ReceiveRewards(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.CONSUME_SPIN:
                consumeEventSpin(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.CONSUME_CLAIM_REWARD:
                consumeEventClaimReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.CONSUME_GET:
                consumeEventGet(cmd, userControl);
                break;
            case CmdDefine.PAYMENT_BRAZIL_GET_FLOW:
                paymentBrazilGetFlow(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.PAYMENT_BRAZIL_GET_TRANSACTION:
                paymentBrazilGetTransaction(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.GACHAPON_SPIN:
                gachaponSpin(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.GACHAPON_RECEIVE_REWARD:
                gachaponGetReward(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_DROP_HOOK:
                fishingDropHook(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_FISH:
                fishingFish(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_COLLECT_FISH:
                fishingCollectFish(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_DROP_BAIT:
                fishingDropBait(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_GET:
                fishingGet(cmd, userControl);
                break;
            case CmdDefine.FISHING_HIRE_SLOT:
                fishingHireSlot(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_PRODUCE_HOOK:
                fishingProduceHook(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.FISHING_COLLECT_HOOK:
                fishingCollectHook(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.EVENT_03_RECEIVE_REWARDS:
                event03ReceiveRewards(cmd, transactionId, userControl, decoder);
                break;
			case CmdDefine.DAILY_GIFT_GET:
                dailyGiftGet(cmd, userControl);
                break;
			case CmdDefine.ACCUMULATE_GET:
				accumulateGet(cmd, transactionId, userControl, decoder);
                break;
			case CmdDefine.ACCUMULATE_MILESTONE_REWARD:
				accumulateMilstoneReward(cmd, transactionId, userControl, decoder);
                break;
			case CmdDefine.ACCUMULATE_STORE:
				accumulateStore(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.POSM_SET_USER_INFO:
                posmSetUserInfo(cmd, transactionId, userControl, decoder);
                break;
            case CmdDefine.POSM_GET_USER_INFO:
                posmGetUserInfo(cmd, transactionId, userControl, decoder);
                break;
        }
    }

    private static void getUserData (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestUserData request = new RequestUserData(dataCmd);

        byte result;
        UserGame game = null;
        PrivateShop privateShop = null;
        AirShip airShip = null;
        MailBox mailBox = null;
        UserGuild guild = null;

        if (userControl == null)
            result = ErrorConst.NULL_USER_CONTROL;
        else if ((game = userControl.game) == null)
            result = ErrorConst.NULL_USER_GAME;
        else if ((privateShop = userControl.privateShop) == null)
            result = ErrorConst.NULL_PRIVATE_SHOP;
        else if ((airShip = userControl.airShip) == null)
            result = ErrorConst.NULL_AIR_SHIP;
        else if ((mailBox = userControl.getMailBox()) == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            result = ErrorConst.SUCCESS;
            guild = userControl.loadUserGuild();
            airShip.update(game);
        }

        boolean useLocalPayment;
        if (EnvConfig.environment() == EnvConfig.Environment.LOCAL)
            useLocalPayment = true;
        else if (EnvConfig.useServiceCheckLocalPayment())
        {
            if (userControl.checkLocalPayment == null)
            {
                useLocalPayment = false;
                CheckLocalPayment.sendCheck(game.getUserId(), userControl.address);
            }
            else
            {
                useLocalPayment = userControl.checkLocalPayment;
            }
        }
        else
        {
            useLocalPayment = checkRuleLocalPayment(userControl, game);
            if (useLocalPayment && game.getPayment().isActiveLocalPayment() == false)
            {
                game.getPayment().setActiveLocalPayment(true);
                userControl.markFlagSaveGame();
            }
        }

        if (EnvConfig.environment() == EnvConfig.Environment.SERVER_DEV || EnvConfig.environment() == EnvConfig.Environment.SERVER_TEST)
        {
            if (!game.getPayment().useTestPayment())
                useLocalPayment = false;
        }
        Message msg = new ResponseUserData(cmd, result).packData(userControl.brief.getUsername(),
                                                                 game,
                                                                 userControl.getCoin(),
                                                                 privateShop,
                                                                 airShip,
                                                                 mailBox,
                                                                 guild,
                                                                 useLocalPayment);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             useLocalPayment,
                             guild == null ? "" : guild.getId()
                            );
    }

    private static boolean checkRuleLocalPayment (UserControl userControl, UserGame game)
    {
        if (game.getPayment().isActiveLocalPayment())
            return true;

        String packageName = game.userControl.packageName;
        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());

        if (paymentInfo.RULE_LOCAL_SKIP_PACKAGE_NAME(packageName))
        {
            Debug.info("checkRuleLocalPayment", "skip package name", packageName);
            return true;
        }

        User user = userControl.user;
        String address = user.getSession().getAddress();
        String country = Ip2Country.toCountry(address);
        if (!paymentInfo.RULE_LOCAL_ALLOW_COUNTRY(country))
        {
            Debug.info("checkRuleLocalPayment", "address", address, country);
            return false;
        }

        if (paymentInfo.RULE_LOCAL_SKIP_TYPE(game.userControl.socialType))
        {
            Debug.info("checkRuleLocalPayment", "socialType", game.userControl.socialType);
            return true;
        }

        if (game.getLevel() < paymentInfo.RULE_LOCAL_USER_LEVEL())
        {
            Debug.info("checkRuleLocalPayment", "level", game.getLevel());
            return false;
        }

        if (game.onlineSecond < paymentInfo.RULE_LOCAL_DAILY_PLAYING_TIME())
        {
            Debug.info("checkRuleLocalPayment", "onlineSecond", game.onlineSecond);
            return false;
        }
        return true;
    }

    private static void stockUpgrade (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestStockUpgrade request = new RequestStockUpgrade(dataCmd);

        byte result;
        UserGame game = userControl.game;

        int id = request.stockId;
        StockInfo info = ConstInfo.getStockInfo(id);
        StockInfo.Level levelInfo;
        MapItem removeItem = null;
        int curLevel = -1;

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.CAPACITY_INIT() < 0)
            result = ErrorConst.INVALID_ACTION;
        else if ((levelInfo = info.levelInfo(game.stockLevel(id) + 1)) == null)
            result = ErrorConst.MAX_LEVEL;
        else
        {
            //mua item còn thiếu
            if (request.priceCoin > 0)
            {
                MapItem missing = game.getMissingItem(levelInfo.REQUIRE_ITEM);
                result = game.buyItem(transactionId, missing, request.priceCoin, request.clientCoin);
                if (result == ErrorConst.SUCCESS)
                    userControl.markFlagSaveGame();
            }
            else
            {
                result = ErrorConst.SUCCESS;
            }

            //nâng cấp kho
            if (result == ErrorConst.SUCCESS)
            {
                result = game.removeItem(cmd, transactionId, levelInfo.REQUIRE_ITEM);
                if (result == ErrorConst.SUCCESS)
                {
                    removeItem = levelInfo.REQUIRE_ITEM;
                    game.upgradeStock(id);
                }
            }
            curLevel = game.stockLevel(id);
        }

        if (result == ErrorConst.SUCCESS)
            userControl.markFlagSaveGame();

        Message msg = new ResponseStockUpgrade(cmd, result).packData(request.stockId, curLevel, userControl.getCoin(), game.getMapItemNum(removeItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.stockId,
                             curLevel,
                             request.priceCoin,
                             request.clientCoin
                            );
    }

    private static void buyItem (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestBuyItem request = new RequestBuyItem(dataCmd);
        
        UserGame game = userControl.game;

        byte result = game.buyItem(transactionId, request.items, request.priceCoin, request.clientCoin);

        if (result == ErrorConst.SUCCESS)
            userControl.markFlagSaveGame();

        Message msg = new ResponseBuyItem(cmd, result).packData(userControl.getCoin(), game.getMapItemNum(request.items));
        userControl.send(msg);
    }

    private static void buyIBShop (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestBuyIBShop request = new RequestBuyIBShop(dataCmd);

        byte result;
        UserGame game = userControl.game;

        String idShop = IBShopInfo.getId(request.itemId, request.itemNum, request.priceType);
        IBShopInfo.Item shopInfo = ConstInfo.getIBShopInfo(idShop);
        int price = -1;
        boolean isSaleOff = false;
        MapItem removeItem = null;
        MapItem receiveItem = new MapItem();

        //VIP
        if (request.itemId.equals(ItemId.GOLD))
        {
            VIPInfo.VIPItem currentUserVIPItem = game.getVIP().getCurrentActiveVIPItem();
            int bonusVIPRate = currentUserVIPItem.CONVERT_GOLD_BONUS();
            request.itemNum += (request.itemNum * bonusVIPRate) / 100;
        }

        if (shopInfo == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (shopInfo.UNLOCK_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (shopInfo.LIMIT_DAY() > 0 && shopInfo.LIMIT_DAY() <= game.getIbShopCount(request.itemId))
            result = ErrorConst.LIMIT_DAY;
        else if (!MiscInfo.IBSHOP_ALLOW_PRICE_TYPE(request.priceType))
            result = ErrorConst.INVALID_PRICE_TYPE;
        else if (ConstInfo.getFestival().isExpire(shopInfo.USE_IN()))
            result = ErrorConst.INVALID_STATUS;
        else
        {
            isSaleOff = shopInfo.isSaleOff();
            if (isSaleOff)
                price = Common.priceSaleOff(shopInfo.PRICE_NUM(), shopInfo.SALE_OFF_PERCENT());
            else
                price = shopInfo.PRICE_NUM();

            if (price <= 0)
                result = ErrorConst.INVALID_PRICE;
            else if (request.priceType.equals(ItemId.COIN))
            {
                if (request.clientCoin != userControl.getCoin())
                    result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                else if (price > request.priceCoin)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else
                    result = userControl.purchase(transactionId,
                                                  price,
                                                  PurchaseInfo.buyIbShop(cmd, ConstInfo.getItemInfo(request.itemId), request.itemNum, isSaleOff),
                                                  MetricLog.toString(request.itemId, request.itemNum));
            }
            else
            {
                result = game.removeItem(cmd, transactionId, request.priceType, price);
            }

            if (result == ErrorConst.SUCCESS)
            {
                receiveItem.increase(request.itemId, request.itemNum);
                receiveItem.increase(shopInfo.GIFT_WHEN_BUY());

                game.addItem(cmd, transactionId, receiveItem);
                if (shopInfo.LIMIT_DAY() > 0)
                    game.addIbShopCount(request.itemId);

                userControl.markFlagSaveGame();
                removeItem = new MapItem (request.priceType, price);
            }
        }

        Message msg = new ResponseBuyIBShop(cmd, result).packData(userControl.getCoin(),
                                                                  game.getGold(),
                                                                  game.getReputation(),
                                                                  game.getMapItemNum(receiveItem),
                                                                  game.getIbShopCount());
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             game.getExp(),
                             isSaleOff,
                             request.itemId,
                             request.itemNum,
                             request.priceType,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void sellForJack (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestSellForJack request = new RequestSellForJack(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        MapItem removeItem = null;
        MapItem receiveItem = null;
        ItemInfo info = ConstInfo.getItemInfo(request.id);

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (!info.canSellForJack())
            result = ErrorConst.NOT_FOR_SELL;
        else
        {
            result = game.removeItem(cmd, transactionId, request.id, request.num);
            if (result == ErrorConst.SUCCESS)
            {
                int price = info.priceSellForJack() * request.num;
                game.addItem(cmd, transactionId, ItemId.GOLD, price);

                userControl.markFlagSaveGame();
                removeItem = new MapItem (request.id, request.num);
                receiveItem = new MapItem (ItemId.GOLD, price);
            }
        }

        int remain = game.numStockItem(request.id);

        Message msg = new ResponseSellForJack(cmd, result).packData(request, game.getGold(), remain);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.id,
                             request.num,
                             remain
                            );
    }

    private static void floorUpgrade (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestFloorUpgrade request = new RequestFloorUpgrade(dataCmd);

        byte result;
        UserGame game = userControl.game;

        byte nextLevel = game.numFloor();
        FloorInfo info = ConstInfo.getFloorInfo(nextLevel);
        MapItem removeItem = null;

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (nextLevel >= ConstInfo.maxFloor())
            result = ErrorConst.MAX_LEVEL;
        else if (info.USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
            removeItem = info.REQUIRE_ITEM();
            result = game.removeItem(cmd, transactionId, removeItem);
            if (result == ErrorConst.SUCCESS)
                game.addFloor();
        }

        if (result == ErrorConst.SUCCESS)
            userControl.markFlagSaveGame();

        Message msg = new ResponseFloorUpgrade(cmd, result).packData(nextLevel, game.getMapItemNum(removeItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             nextLevel
                            );
    }

    private static void potPut (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPotPut request = new RequestPotPut(dataCmd);

        byte result;
        UserGame game = userControl.game;

        PotInfo info = (PotInfo) ConstInfo.getItemInfo(request.pot, ItemType.POT);
        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        byte[] slotResult = new byte[slots.length];

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else
        {
            result = ErrorConst.SUCCESS;
            boolean updateCombo = false;
            Slot slot;
            for (int i = 0; i < slots.length; i++)
            {
                slot = slots[i];
                if (slot == null)
                {
                    slotResult[i] = ErrorConst.NULL_SLOT;
                    continue;
                }
                if (!slot.canPutPot())
                {
                    slotResult[i] = ErrorConst.INVALID_ACTION;
                    continue;
                }
                slotResult[i] = game.removeItem(cmd, transactionId, request.pot, 1);
                if (slotResult[i] == ErrorConst.SUCCESS)
                {
                    slot.putPot(request.pot);
                    userControl.markFlagSaveGame();
                    updateCombo = true;
                }
            }
            if (updateCombo)
                game.getComboManager().update();
        }

        Message msg = new ResponsePotPut(cmd, result).packData(request, slots, game.numStockItem(request.pot));
        userControl.send(msg);
        
        for (int i = 0; i < slotResult.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             slotResult [i],
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.pot,
                             request.iFloors [i],
                             request.iSlots [i]
                            );
    }

    private static void potStore (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPotStore request = new RequestPotStore(dataCmd);


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        HashSet<String> updatePot = new HashSet<>();
        String[] pots = new String[slots.length];
        byte[] slotResult = new byte[slots.length];

        boolean updateCombo = false;
        Slot slot;
        for (int i = 0; i < slots.length; i++)
        {
            slot = slots[i];
            if (slot == null)
            {
                slotResult[i] = ErrorConst.NULL_SLOT;
                continue;
            }
            if (!slot.isEmptyPot())
            {
                slotResult[i] = ErrorConst.INVALID_ACTION;
                continue;
            }
            slotResult[i] = game.checkAndAddItem(cmd, transactionId, slot.getPot(), 1);
            if (slotResult[i] == ErrorConst.SUCCESS)
            {
                pots[i] = slot.getPot();
                updatePot.add(slot.getPot());

                slot.removePot();
                userControl.markFlagSaveGame();
                updateCombo = true;
            }
        }

        if (updateCombo)
            game.getComboManager().update();

        Message msg = new ResponsePotStore(cmd, result).packData(request, slots, game.getMapItemNum(updatePot));
        userControl.send(msg);
        
        for (int i = 0; i < slotResult.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             slotResult [i],
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloors [i],
                             request.iSlots [i],
                             pots [i]
                            );
    }

    private static void potMove (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPotMove request = new RequestPotMove(dataCmd);


        byte result;
        UserGame game = userControl.game;

        Slot fromSlot = game.getSlot(request.fromFloor, request.fromSlot);
        Slot toSlot = game.getSlot(request.toFloor, request.toSlot);
        String idPot = null;

        if (fromSlot == null || toSlot == null)
            result = ErrorConst.NULL_SLOT;
        else if (!fromSlot.isEmptyPot())
            result = ErrorConst.BUSY_SLOT;
        else if (!toSlot.canPutPot())
            result = ErrorConst.BUSY_SLOT;
        else if (fromSlot == toSlot)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            idPot = fromSlot.getPot();
            toSlot.putPot(idPot);
            fromSlot.removePot();

            game.getComboManager().update();

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponsePotMove(cmd, result).packData(request, fromSlot, toSlot);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.fromFloor,
                             request.fromSlot,
                             request.toFloor,
                             request.toSlot,
                             idPot
                            );
    }

    private static void potUpgrade (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPotUpgrade request = new RequestPotUpgrade(dataCmd);

        byte result;
        UserGame game = userControl.game;

        MapItem requireItem;
        MapItem receiveItem = null;
        MapItem removeItem = null;
        String idOldPot = null;
        String idNewPot = null;

        Slot slot = game.getSlot(request.iFloor, request.iSlot);
        MaterialInfo infoGrass = (MaterialInfo) ConstInfo.getItemInfo(request.greenGrass, ItemType.MATERIAL, ItemSubType.GREEN_GRASS);
        PotInfo infoPot;

        if (slot == null)
            result = ErrorConst.NULL_SLOT;
        else if (!slot.canUpgradePot())
            result = ErrorConst.INVALID_ACTION;
        else if (request.greenGrass.length() > 0 && infoGrass == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if ((infoPot = (PotInfo) ConstInfo.getItemInfo(slot.getPot(), ItemType.POT)) == null)
            result = ErrorConst.NULL_POT_INFO;
        else if (!infoPot.canUpgrade())
            result = ErrorConst.INVALID_UPGRADE;
        else
        {
            idOldPot = slot.getPot();
            requireItem = infoPot.genRequireItem(request.greenGrass);

            //nâng cấp
            if ((result = game.removeItem(cmd, transactionId, requireItem)) == ErrorConst.SUCCESS)
            {
                removeItem = requireItem;

                //VIP
                VIPInfo.VIPItem currentUserVIPItem = game.getVIP().getCurrentActiveVIPItem();
                int bonusVIPRate = currentUserVIPItem.UPGRADE_POT_RATE();

                idNewPot = infoPot.upgrade(infoGrass, bonusVIPRate);

                //nâng cấp thành công
                //cheat nâng cấp chậu đất thành hồng ngọc Tutorial
                if (game.getLevel() <= MiscInfo.LEVEL_TUTORIAL_UPGRADE_POT() && !game.tutorialUpgradePot && idOldPot.equals(ItemId.CHAU_DAT)
                        && game.tutorialFlow == MiscDefine.TUTORIAL_FLOW_NEW) {
                    idNewPot = ItemId.CHAU_HONG_NGOC;
                    game.tutorialUpgradePot = true;
                }
                if (idNewPot != null)
                {
                    removeItem.put(idOldPot, 1);
                    receiveItem = new MapItem(idNewPot, 1);
                    slot.putPot(idNewPot);

                    game.getComboManager().update();
                }
            }
        }

        if (result == ErrorConst.SUCCESS)
        {
            game.updateActionRecord(MiscInfo.TOP_POT_UPGRADE(), 1);
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponsePotUpgrade(cmd, result).packData(request, slot, game.getMapItemNum(removeItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloor,
                             request.iSlot,
                             request.greenGrass,
                             idOldPot,
                             idNewPot
                            );
    }

    private static void plant (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPlant request = new RequestPlant(dataCmd);

        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        byte result;
        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        byte[] slotResult = new byte[slots.length];
        MapItem[] remove = new MapItem[slots.length];

        PlantInfo info = (PlantInfo) ConstInfo.getItemInfo(request.plant, ItemType.PLANT);

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (request.iTimes.length < slots.length)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            result = ErrorConst.SUCCESS;
            Slot slot;

            for (int i = 0; i < slots.length; i++)
            {
                slot = slots[i];
                if (slot == null)
                {
                    slotResult[i] = ErrorConst.NULL_SLOT;
                    continue;
                }
                if (!slot.isEmptyPot())
                {
                    slotResult[i] = ErrorConst.INVALID_ACTION;
                    continue;
                }

                //VIP
                VIPInfo.VIPItem currentUserVIPItem = game.getVIP().getCurrentActiveVIPItem();
                int bonusVIPBugRate = currentUserVIPItem.BUG_RATE();

                slotResult[i] = game.removeItem(cmd, transactionId, request.plant, 1);
                if (slotResult[i] == ErrorConst.SUCCESS)
                {
                	remove [i] = new MapItem (request.plant, 1);

                    slot.plant(request.plant, Time.adjustTime(request.iTimes[i]), bonusVIPBugRate);

//                  phải reset trước khi sử dụng để tránh cộng dồn khi lần thu hoạch trước có lỗi
                    slot.resetEventItems();
                    slot.addEventItems(festival.collectEP(game, CmdDefine.PLANT_HARVEST, slot.getPlant()));
                    slot.addEventItems(fishing.collectEP(game, CmdDefine.PLANT_HARVEST, slot.getPlant()));

                    userControl.markFlagSaveGame();
                }
            }
        }

        Message msg = new ResponsePlant(cmd, result).packData(request, slots, game.numStockItem(request.plant));
        userControl.send(msg);
        
        for (int i = 0; i < slotResult.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             remove [i],
                             null,
                             slotResult [i],
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.plant,
                             request.iFloors [i],
                             request.iSlots [i],
                             request.iTimes [i]
                            );
    }

    private static void plantSkipTime (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPlantSkipTime request = new RequestPlantSkipTime(dataCmd);
        
        byte result;
        UserGame game = userControl.game;
        Slot slot = game.getSlot(request.iFloor, request.iSlot);
        MapItem removeItem = null;
        int price = -1;
        int coinChange = 0;

        if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if (slot == null)
            result = ErrorConst.NULL_SLOT;
        else if (!slot.canSkipTime())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            int timeHarvest = slot.getTimeHarvest();
            int curTime = Time.getUnixTime();
            PlantInfo info = (PlantInfo) ConstInfo.getItemInfo(slot.getPlant());

            if (curTime >= timeHarvest)
                result = ErrorConst.FULL_GROWN;
            else if (info == null)
                result = ErrorConst.NULL_ITEM_INFO;
            else
            {
                int timeSkip = timeHarvest - curTime;
                SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.PLANT, info.GROW_TIME());
                price = skipTimeInfo.calcPrice(timeSkip);

                if (price <= 0)
                    result = ErrorConst.INVALID_PRICE;
                else if (price > request.priceCoin)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
                {
                    slot.skipTime();
                    userControl.markFlagSaveGame();
                    removeItem = new MapItem (ItemId.COIN, price);
                    coinChange = -price;
                }
            }
        }

        Message msg = new ResponsePlantSkipTime(cmd, result).packData(userControl.getCoin(), request.iFloor, request.iSlot, slot);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.iFloor,
                             request.iSlot,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void plantCatchBug (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPlantCatchBug request = new RequestPlantCatchBug(dataCmd);


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        byte[] slotResult = new byte[slots.length];

        MapItem totalRemove = new MapItem();
        MapItem totalReceive = new MapItem();
        MapItem[] bonusItems = new MapItem[slots.length];

        int record = 0;

        if (request.iTimes.length < slots.length)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            Slot slot;
            final String racketId = ItemId.VOT_TRANG;
            final int racketNum = 1;
            String pestId;
            final int pestNum = 1;

            MapItem remove = new MapItem();
            MapItem receive = new MapItem();

            for (int i = 0; i < slots.length; i++)
            {
                slot = slots[i];
                remove.clear();
                receive.clear();

                if (slot == null)
                {
                    slotResult[i] = ErrorConst.NULL_SLOT;
                    continue;
                }
                if (!slot.canCatchBug(Time.adjustTime(request.iTimes[i])))
                {
                    slotResult[i] = ErrorConst.INVALID_ACTION;
                    continue;
                }

                pestId = slot.getPest();
                PestInfo info = (PestInfo) ConstInfo.getItemInfo(pestId);
                if (info == null)
                {
                    slotResult[i] = ErrorConst.NULL_ITEM_INFO;
                    continue;
                }

                MapItem eventItems = festival.collectEP(game, cmd);
                eventItems.increase(fishing.collectEP(game, cmd));

                bonusItems[i] = eventItems;

                remove.increase(racketId, racketNum);
                receive.increase(pestId, pestNum);
                receive.increase(eventItems);
                if (info.CATCH_EXP() > 0)
                    receive.increase(ItemId.EXP, info.CATCH_EXP());

                slotResult[i] = game.removeAndAddItem(cmd, transactionId, remove, receive);
                if (slotResult[i] == ErrorConst.SUCCESS)
                {
                    slot.removePest();
                    userControl.markFlagSaveGame();

                    totalRemove.increase(remove);
                    totalReceive.increase(receive);
                    record += 1;
                }

                MetricLog.actionUser(userControl.country,
                                     cmd,
                                     userControl.platformID,
                                     userControl.brief.getUserId(),
                                     userControl.brief.getUsername(),
                                     userControl.socialType,
                                     game.getLevel(),
                                     transactionId,
                                     remove,
                                     receive,
                                     slotResult[i],
                                     userControl.getCoin(),
                                     0,
                                     game.getGold(),
                                     0,
                                     request.iFloors [i],
                                     request.iSlots [i],
                                     request.iTimes [i],
                                     game.getExp()
                                    );
            }
        }

        Message msg = new ResponsePlantCatchBug(cmd, result).packData(game.getLevel(),
                                                                      game.getExp(),
                                                                      request.iFloors,
                                                                      request.iSlots,
                                                                      slots,
                                                                      game.getMapItemNum(totalRemove, totalReceive),
                                                                      bonusItems);
        userControl.send(msg);

        if (record > 0 && game.updateActionRecord(MiscInfo.TOP_CATCH_BUG(), record))
            userControl.markFlagSaveGame();
    }

    private static void plantHarvest (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPlantHarvest request = new RequestPlantHarvest(dataCmd);

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        byte[] slotResult = new byte[slots.length];
        MapItem dropItems = new MapItem();
        Slot slot;
        int record = 0;

        for (int i = 0; i < slots.length; i++)
        {
            slot = slots[i];
            if (slot == null)
                slotResult[i] = ErrorConst.NULL_SLOT;
            
            if (!slot.canHarvest())
                slotResult[i] = ErrorConst.INVALID_ACTION;

            MapItem drop = null;
            if (slotResult[i] == ErrorConst.SUCCESS)
            {
	            drop = Common.merge(slot.getDropItems(), slot.getEventItems());
	            drop = game.skipAndAddItem(cmd, transactionId, drop);
	
	            PlantInfo plantInfo = (PlantInfo) ConstInfo.getItemInfo(slot.getPlant());
	            if (plantInfo != null && !plantInfo.isEventTree())
	                record += 1;
	
	            slot.harvest();
	            dropItems.increase(drop);
	            userControl.markFlagSaveGame();
            }
            
            MetricLog.actionUser(userControl.country,
                                 cmd,
                                 userControl.platformID,
                                 userControl.brief.getUserId(),
                                 userControl.brief.getUsername(),
                                 userControl.socialType,
                                 game.getLevel(),
                                 transactionId,
                                 null,
                                 drop,
                                 slotResult[i],
                                 userControl.getCoin(),
                                 0,
                                 game.getGold(),
                                 0,
                                 game.getExp(),
                                 request.iFloors [i],
                                 request.iSlots [i]
                                );
        }

        Message msg = new ResponsePlantHarvest(cmd, result).packData(request, slots, game.getMapItemNum(dropItems), game.getLevel(), game.getExp(), game.getGold());
        userControl.send(msg);

        if (record > 0 && game.updateActionRecord(MiscInfo.TOP_PLANT_HARVEST(), record))
            userControl.markFlagSaveGame();
    }

    private static void machineUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineUnlock request = new RequestMachineUnlock(dataCmd);

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.floor);
        MapItem removeItems = null;
        int goldChange = 0;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (machine.isUnlock())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < machine.info.LEVEL_UNLOCK())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
            String requireItem = ItemId.GOLD;
            int requireNum = machine.info.GOLD_START();
            if (game.removeItem(cmd, transactionId, requireItem, requireNum) == ErrorConst.SUCCESS)
            {
                machine.startUnlock(Time.getUnixTime());

                userControl.markFlagSaveGame();
                removeItems = new MapItem (requireItem, requireNum);
                goldChange = -requireNum;
            }
        }

        Message msg = new ResponseMachineUnlock(cmd, result).packData(request.floor, game.getGold(), machine);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.floor
                            );
    }

    private static void machineSkipTimeUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineSkipTimeUnlock request = new RequestMachineSkipTimeUnlock(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        int price = -1;
        int timeWait = -1;
        Machine machine = game.getMachine(request.iFloor);

        MapItem removeItems = null;
        int coinChange = 0;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (machine.isUnlock())
            result = ErrorConst.INVALID_ACTION;
        else if ((timeWait = machine.timeWaitUnlock()) <= 0)
            result = ErrorConst.TIME_WAIT;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if ((price = ConstInfo.getSkipTimeInfo(ItemType.MACHINE, machine.info.TIME_START()).calcPrice(timeWait)) <= 0)
            result = ErrorConst.INVALID_PRICE;
        else
        {
            if (request.priceCoin == 0 && game.getLevel() <= MiscInfo.LEVEL_FREE_SKIP_TIME())
            {
                price = 0;
                result = ErrorConst.SUCCESS;
            }
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else
                result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeWait));

            if (result == ErrorConst.SUCCESS)
            {
                machine.skipTimeUnlock();

                userControl.markFlagSaveGame();
                removeItems = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponseMachineSkipTimeUnlock(cmd, result).packData(request.iFloor, userControl.getCoin(), machine);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.iFloor,
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             timeWait
                            );
    }

    private static void machineFinishUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineFinishUnlock request = new RequestMachineFinishUnlock(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.isUnlock())
            result = ErrorConst.INVALID_ACTION;
        else if (!machine.canFinishUnlock())
            result = ErrorConst.NOT_ENOUGH_TIME;
        else
        {
            machine.finishUnlock();

            userControl.markFlagSaveGame();
            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseMachineFinishUnlock(cmd, result).packData(request.iFloor, machine);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloor
                            );
    }

    private static void machineRepair (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineRepair request = new RequestMachineRepair(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        int price = -1;
        MapItem removeItems = null;
        int goldChange = 0;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (machine.needRepair() <= 0)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            String requireItem = ItemId.GOLD;
            price = machine.calcPriceRepair();

            if ((result = game.removeItem(cmd, transactionId, requireItem, price)) == ErrorConst.SUCCESS)
            {
                machine.repair();

                userControl.markFlagSaveGame();
                removeItems = new MapItem (requireItem, price);
                goldChange = -price;
            }
        }

        Message msg = new ResponseMachineRepair(cmd, result).packData(request.iFloor, game.getGold(), machine);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_MACHINE_REPAIR(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.iFloor,
                             machine == null ? -1 : machine.getDurability(),
                             price
                            );
    }

    private static void machineUpgrade (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineUpgrade request = new RequestMachineUpgrade(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        String requireItem;
        int price = -1;
        int priceGold = -1;
        boolean isSuccess = false;
        MapItem removeItems = null;
        int coinChange = 0;
        int goldChange = 0;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if ((priceGold = machine.getPriceGoldUpgrade()) <= 0)
            result = ErrorConst.INVALID_PRICE;
        else if ((result = machine.checkUpgrade()) == ErrorConst.SUCCESS)
        {
            if (request.priceCoin > 0) //nâng cấp bằng coin
            {
                requireItem = ItemId.COIN;
                price = UserLevelInfo.priceGoldToCoin(game.getLevel(), priceGold);

                if (request.clientCoin != userControl.getCoin())
                    result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                else if (price <= 0)
                    result = ErrorConst.INVALID_PRICE;
                else if (price > request.priceCoin)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.machine(cmd, machine.info, machine.getLevel()))) == ErrorConst.SUCCESS)
                {
                    isSuccess = machine.upgrade();

                    userControl.markFlagSaveGame();
                    removeItems = new MapItem (requireItem, price);
                    coinChange = -price;
                }
            }
            else //nâng cấp bằng vàng
            {
                requireItem = ItemId.GOLD;
                price = priceGold;

                if ((result = game.removeItem(cmd, transactionId, requireItem, price)) == ErrorConst.SUCCESS)
                {
                    isSuccess = machine.upgrade();

                    userControl.markFlagSaveGame();
                    removeItems = new MapItem (requireItem, price);
                    goldChange = -price;
                }
            }
        }

        Message msg = new ResponseMachineUpgrade(cmd, result).packData(request.iFloor, userControl.getCoin(), game.getGold(), machine);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             goldChange,
                             request.iFloor,
                             isSuccess,
                             machine == null ? -1 : machine.getLevel(),
                             machine == null ? -1 : machine.getDurability(),
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             priceGold
                            );
    }

    private static void machineBuySlot (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineBuySlot request = new RequestMachineBuySlot(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        int price = -1;
        MapItem removeItems = null;
        int coinChange = 0;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (!machine.canBuySlot())
            result = ErrorConst.INVALID_ACTION;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if ((price = machine.priceBuySlot()) > request.priceCoin)
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.machine(cmd, machine.info, machine.getNumSlot()))) == ErrorConst.SUCCESS)
        {
            machine.addSlot();

            userControl.markFlagSaveGame();
            removeItems = new MapItem (ItemId.COIN, price);
            coinChange = -price;
        }

        Message msg = new ResponseMachineBuySlot(cmd, result).packData(request.iFloor, userControl.getCoin(), machine);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.iFloor,
                             machine == null ? -1 : machine.getNumSlot(),
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void machineBuyWorkingTime (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineBuyWorkingTime request = new RequestMachineBuyWorkingTime(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        int price = -1;
        int timeSkip = 0;
        MapItem removeItems = null;
        int coinChange = 0;
        
        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if ((result = machine.checkBuyWorkingTime()) == ErrorConst.SUCCESS)
        {
            timeSkip = machine.requireTimeWorking();
            SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.MACHINE, timeSkip);
            price = skipTimeInfo.calcPrice(timeSkip);

            if (request.clientCoin != userControl.getCoin())
                result = ErrorConst.CLIENT_COIN_NOT_MATCH;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
            {
                machine.addWorkingTime();

                userControl.markFlagSaveGame();
                removeItems = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponseMachineBuyWorkingTime(cmd, result).packData(request.iFloor, userControl.getCoin(), machine);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.iFloor,
                             machine == null ? -1 : machine.getWorkingTime(),
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             timeSkip
                            );
    }

    private static void machineProduce (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineProduce request = new RequestMachineProduce(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        ProductInfo info = ConstInfo.getProductInfo(request.product);
        MapItem removeItems = null;
        MapItem updateItems = null;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null || info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if ((result = machine.checkProduce(request.product, game.getLevel())) == ErrorConst.SUCCESS)
        {
            result = game.removeItem(cmd, transactionId, info.REQUIRE_ITEM());
            updateItems = game.getMapItemNum(info.REQUIRE_ITEM());
            if (result == ErrorConst.SUCCESS)
            {
                machine.produce(info);

                userControl.markFlagSaveGame();
                removeItems = info.REQUIRE_ITEM();
            }
        }

        Message msg = new ResponseMachineProduce(cmd, result).packData(request.iFloor, request.product, machine, updateItems);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloor,
                             request.product
                            );
    }

    private static void machineHarvest (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineHarvest request = new RequestMachineHarvest(dataCmd);

        byte result;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        Machine machine = game.getMachine(request.iFloor);
        MapItem receiveItems = null;
        MapItem harvestItems = null;
        MapItem eventItems = new MapItem();

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if ((harvestItems = machine.harvestItems()) == null)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            String productId = machine.getFirstItemStore();
            if (productId != null)
            {
                eventItems = festival.collectEP(game, cmd, productId);
                harvestItems.increase(eventItems);

                eventItems = fishing.collectEP(game, cmd, productId);
                harvestItems.increase(eventItems);

            }

            if ((result = game.checkAndAddItem(cmd, transactionId, harvestItems)) == ErrorConst.SUCCESS)
            {
                machine.harvest();

                userControl.markFlagSaveGame();
                receiveItems = harvestItems;
            }
        }

        Message msg = new ResponseMachineHarvest(cmd, result).packData(request.iFloor,
                                                                       machine,
                                                                       game.getMapItemNum(harvestItems),
                                                                       game.getLevel(),
                                                                       game.getExp(),
                                                                       eventItems);
        userControl.send(msg);

        if (harvestItems != null && harvestItems.size() > 0 && game.updateActionRecord(MiscInfo.TOP_MACHINE_HARVEST(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getExp(),
                             request.iFloor
                            );
    }

    private static void machineSkipTimeProduce (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineSkipTimeProduce request = new RequestMachineSkipTimeProduce(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        String productId = null;
        int price = -1;
        MapItem removeItems = null;
        int coinChange = 0;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if ((result = machine.checkSkipTimeProduce()) == ErrorConst.SUCCESS)
        {
            productId = machine.headProduceItem();
            int timeSkip = machine.timeSkip();
            ProductInfo productInfo = ConstInfo.getProductInfo(productId);
            SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.PRODUCT, productInfo.PRODUCTION_TIME());
            price = skipTimeInfo.calcPrice(timeSkip);

            if (request.priceCoin == 0 && game.getLevel() <= MiscInfo.LEVEL_FREE_SKIP_TIME())
            {
                price = 0;
                result = ErrorConst.SUCCESS;
            }
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else
                result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip));

            if (result == ErrorConst.SUCCESS)
            {
                machine.skipTimeProduce();

                userControl.markFlagSaveGame();
                removeItems = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponseMachineSkipTimeProduce(cmd, result).packData(request.iFloor, userControl.getCoin(), machine);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.iFloor,
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             productId
                            );
    }

    private static void machineGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineGet request = new RequestMachineGet(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else
            result = ErrorConst.SUCCESS;

        Message msg = new ResponseMachineGet(cmd, result).packData(request.iFloor, machine);
        userControl.send(msg);

        if (result != ErrorConst.SUCCESS)
            MetricLog.actionUser(userControl.country,
                                 cmd,
                                 userControl.platformID,
                                 userControl.brief.getUserId(),
                                 userControl.brief.getUsername(),
                                 userControl.socialType,
                                 game.getLevel(),
                                 transactionId,
                                 null,
                                 null,
                                 result,
                                 userControl.getCoin(),
                                 0,
                                 game.getGold(),
                                 0,
                                 request.iFloor
                                );
    }

    private static void orderDelivery (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestOrderDelivery request = new RequestOrderDelivery(dataCmd);


        byte result;
        UserGame game = userControl.game;

        OrderManager manager = game.getOrderManager();
        Order order = manager.getOrder(game, request.id);
        Order newOrder = null;
        MapItem removeItems = null;

        if (order == null)
            result = ErrorConst.NULL_SLOT;
        else if (manager.getDeliveryOrder() != null)
            result = ErrorConst.BUSY;
        else if (!order.isActive())
            result = ErrorConst.INVALID_ACTION;
        else if ((result = game.removeItem(cmd, transactionId, order.getRequireItems())) == ErrorConst.SUCCESS)
        {
            newOrder = manager.delivery(game, order);

            result = ErrorConst.SUCCESS;

            if (MiscInfo.PIG_ACTIVE() && game.getPigBank().isActive(game.getLevel()))
            {
                game.getPigBank().addDiamond(MiscInfo.PIG_ORDER_DELIVERY_DIAMOND());
                pigUpdateDiamond(CmdDefine.PIG_UPDATE_DIAMOND, transactionId, userControl, dataCmd);
            }

            userControl.markFlagSaveGame();

            removeItems = order.getRequireItems();
        }

        Message msg = new ResponseOrderDelivery(cmd, result).packData(request, order, newOrder, manager);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_ORDER_DELIVERY(), 1))
            userControl.markFlagSaveGame();

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             order == null ? -1 : order.getId(),
                             newOrder == null ? -1 : newOrder.getId(),
                             request.id,
                             order == null ? -1 : order.getSubType()
                            );
    }

    private static void orderGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestOrderGetReward request = new RequestOrderGetReward(dataCmd);

        byte result;
        UserGame game = userControl.game;

        OrderManager manager = game.getOrderManager();
        Order order = manager.getDeliveryOrder();
        MapItem rewards = null;

        if (order == null)
            result = ErrorConst.NULL_SLOT;
        else if (!order.canGetReward())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            rewards = Common.merge(true, order.getRewardItems(), order.getBonusItems());

            if ((result = game.checkAndAddItem(cmd, transactionId, rewards)) == ErrorConst.SUCCESS)
            {
                manager.resetDeliveryOrder();

                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseOrderGetReward(cmd, result).packData(order,
                                                                       game.getLevel(),
                                                                       game.getExp(),
                                                                       userControl.getCoin(),
                                                                       game.getGold(),
                                                                       game.getMapItemNum(rewards));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             rewards,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getExp(),
                             order == null ? -1 : order.getId()
                            );
    }

    private static void orderCancel (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestOrderCancel request = new RequestOrderCancel(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        OrderManager manager = game.getOrderManager();
        Order order = manager.getOrder(game, request.id);
        Order newOrder = null;

        if (order == null)
            result = ErrorConst.NULL_SLOT;
        else
        {
            newOrder = manager.cancel(game, order);

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseOrderCancel(cmd, result).packData(request, newOrder == null ? order : newOrder);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             order == null ? -1 : order.getId(),
                             newOrder == null ? -1 : newOrder.getId(),
                             request.id
                            );
    }

    private static void orderActive (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestOrderActive request = new RequestOrderActive(dataCmd);

        byte result;
        UserGame game = userControl.game;

        OrderManager manager = game.getOrderManager();
        Order order = manager.getOrder(game, request.id);
        MapItem removeItems = null;
        int coinChange = 0; 

        if (order == null)
            result = ErrorConst.NULL_SLOT;
        else if (!order.isInactive())
            result = ErrorConst.INVALID_ACTION;
        else if (order.getPrice() <= 0)
            result = ErrorConst.INVALID_PRICE;
        else if (order.getPrice() > request.priceCoin)
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if ((result = userControl.purchase(transactionId, order.getPrice(), PurchaseInfo.action(cmd))) == ErrorConst.SUCCESS)
        {
        	removeItems = new MapItem (ItemId.COIN, order.getPrice());
        	coinChange = -order.getPrice();
        	
            order.active();

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseOrderActive(cmd, result).packData(request, order, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             order == null ? -1 : order.getId(),
                             request.id
                            );
    }

    private static void orderSkipTime (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestOrderSkipTime request = new RequestOrderSkipTime(dataCmd);

        byte result;
        UserGame game = userControl.game;

        OrderManager manager = game.getOrderManager();
        Order order = manager.getOrder(game, request.id);
        MapItem removeItems = null;
        int coinChange = 0;

        if (order == null)
            result = ErrorConst.NULL_SLOT;
        else if (!order.isCancel())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            int timeSkip = order.getTimeFinish(game.getLevel()) - Time.getUnixTime();
            SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.ORDER, order.getTimeWait(game.getLevel()));
            int price = skipTimeInfo.calcPrice(timeSkip);

            if (price <= 0)
                result = ErrorConst.INVALID_PRICE;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
            {
            	removeItems = new MapItem (ItemId.COIN, price);
            	coinChange = -price;
            	
                if (order.getPrice() > 0)
                    order.inactive();
                else
                    order.active();

                result = ErrorConst.SUCCESS;
                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseOrderSkipTime(cmd, result).packData(request, order, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             order == null ? -1 : order.getId(),
                             request.id
                            );
    }

    private static void privateShopGet (short cmd, UserControl userControl)
    {

        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = null;

        if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if ((shop = userControl.loadPrivateShop()) == null)
            result = ErrorConst.NULL_OBJECT;
        else
            result = ErrorConst.SUCCESS;

        Message msg = new ResponsePrivateShopGet(cmd, result).packData(shop);
        userControl.send(msg);
    }

    private static void privateShopPut (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopPut request = new RequestPrivateShopPut(dataCmd);

        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = userControl.loadPrivateShop();

        ItemInfo info = ConstInfo.getItemInfo(request.item);
        boolean hasAd = request.useAd ? shop.hasFreeAd() : false;
        MapItem removeItems = null;
        int coinChange = 0;

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (!info.canPutInPrivateShop())
            result = ErrorConst.NOT_FOR_SELL;
        else if (request.num <= 0 || request.num > MiscInfo.PS_NUM_ITEM_PER_SLOT())
            result = ErrorConst.INVALID_NUM;
        else if (request.priceSell < info.GOLD_MIN() * request.num || request.priceSell > info.GOLD_MAX() * request.num)
            result = ErrorConst.INVALID_PRICE_SELL;
        else if (!shop.hasSlot(request.idSlot))
            result = ErrorConst.INVALID_SLOT_ID;
        else if (!shop.isEmptySlot(request.idSlot))
            result = ErrorConst.BUSY_SLOT;
        else if (game.numStockItem(request.item) < request.num)
            result = ErrorConst.NOT_ENOUGH_ITEM;
        else
        {
            int fee = info.SELL_FEE();
            if (fee > 0)
            {
                if (request.clientCoin != userControl.getCoin())
                    result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                else if (fee > request.fee)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else if (userControl.getCoin() < fee)
                    result = ErrorConst.NOT_ENOUGH_COIN;
                else if ((result = userControl.purchase(transactionId, fee, PurchaseInfo.privateShopPut(cmd, info))) == ErrorConst.SUCCESS)
                {
                	removeItems = new MapItem (ItemId.COIN, fee);
                    coinChange = -fee;
                }
            }
            else
            {
                if (request.fee > 0)
                    result = ErrorConst.INVALID_PRICE;
                else
                    result = ErrorConst.SUCCESS;
            }
        }

        if (result == ErrorConst.SUCCESS)
        {
            shop.put(request.idSlot, request.item, request.num, request.priceSell, hasAd, game.displayName, game.avatar, userControl.brief.getBucketId());
            userControl.savePrivateShop();

            game.removeItem(cmd, transactionId, request.item, request.num);
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponsePrivateShopPut(cmd, result).packData(request, shop, userControl.getCoin(), game.getGold(), game.numStockItem(request.item));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.idSlot,
                             request.clientCoin,
                             request.fee,
                             request.item,
                             request.num,
                             request.priceSell,
                             hasAd
                            );
    }

    private static void privateShopAd (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopAd request = new RequestPrivateShopAd(dataCmd);
        
        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = userControl.loadPrivateShop();

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!shop.hasSlot(request.idSlot))
            result = ErrorConst.INVALID_SLOT_ID;
        else if (shop.isEmptySlot(request.idSlot))
            result = ErrorConst.EMPTY;
        else if (!shop.hasFreeAd())
            result = ErrorConst.TIME_WAIT;
        else if (shop.hasAd(request.idSlot))
            result = ErrorConst.BUSY;
        else if (shop.isSold(request.idSlot))
            result = ErrorConst.INVALID_ACTION;
        else
        {
            shop.useAd(userControl.userId, game.displayName, game.avatar, userControl.brief.getBucketId(), request.idSlot);
            userControl.savePrivateShop();

            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponsePrivateShopAd(cmd, result).packData(request, shop);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.idSlot
                            );
    }

    private static void privateShopSkipTime (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopSkipTime request = new RequestPrivateShopSkipTime(dataCmd);

        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = userControl.loadPrivateShop();

        MapItem removeItems = null;
        int price = -1;
        int coinChange = 0;

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (shop.hasFreeAd())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            int timeSkip = shop.timeWaitFreeAd();
            SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.AD, MiscInfo.PS_COUNTDOWN_AD());
            price = skipTimeInfo.calcPrice(timeSkip);

            if (request.clientCoin != userControl.getCoin())
                result = ErrorConst.CLIENT_COIN_NOT_MATCH;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if (userControl.getCoin() < price)
                result = ErrorConst.NOT_ENOUGH_COIN;
            else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
            {
                shop.skipTimeAd();
                userControl.savePrivateShop();
                userControl.markFlagSaveGame();

                removeItems = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponsePrivateShopSkipTime(cmd, result).packData(request, shop, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void privateShopCancel (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopCancel request = new RequestPrivateShopCancel(dataCmd);
        
        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = userControl.loadPrivateShop();

        MapItem removeItems = new MapItem();
        int price = MiscInfo.PS_PRICE_CANCEL();
        int coinChange = 0;

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!shop.hasSlot(request.idSlot))
            result = ErrorConst.INVALID_SLOT_ID;
        else if (shop.isEmptySlot(request.idSlot))
            result = ErrorConst.EMPTY;
        else if (shop.isSold(request.idSlot))
            result = ErrorConst.INVALID_ACTION;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if (price > request.priceCoin)
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if (userControl.getCoin() < price)
            result = ErrorConst.NOT_ENOUGH_COIN;
        else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.action(cmd))) == ErrorConst.SUCCESS)
        {
            PrivateShop.Slot slot = shop.cancel(userControl.userId, request.idSlot);
            userControl.savePrivateShop();

            userControl.markFlagSaveGame();

            removeItems.put(ItemId.COIN, price);
            removeItems.put(slot.getItem(), slot.getNum());
            
            coinChange = -price;
        }

        Message msg = new ResponsePrivateShopCancel(cmd, result).packData(request, shop, userControl.getCoin());
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             request.idSlot
                            );
    }

    private static void privateShopGetMoney (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopGetMoney request = new RequestPrivateShopGetMoney(dataCmd);

        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = userControl.loadPrivateShop();

        MapItem removeItems = null;
        MapItem receiveItems = null;
        int goldChange = 0;

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!shop.hasSlot(request.idSlot))
            result = ErrorConst.INVALID_SLOT_ID;
        else if (shop.isEmptySlot(request.idSlot))
            result = ErrorConst.EMPTY;
        else if (!shop.isSold(request.idSlot))
            result = ErrorConst.INVALID_ACTION;
        else
        {
            PrivateShop.Slot slot = shop.close(request.idSlot);
            userControl.savePrivateShop();

            game.addItem(cmd, transactionId, ItemId.GOLD, slot.getPrice());

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();

            removeItems = new MapItem (slot.getItem(), slot.getNum());
            receiveItems = new MapItem (ItemId.GOLD, slot.getPrice());
            goldChange = slot.getPrice();
        }

        Message msg = new ResponsePrivateShopGetMoney(cmd, result).packData(request, shop, game.getGold());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.idSlot
                            );
    }

    private static void privateShopUnlockCoin (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopUnlockCoin request = new RequestPrivateShopUnlockCoin(dataCmd);
        
        byte result;
        UserGame game = userControl.game;
        PrivateShop shop = userControl.loadPrivateShop();

        MapItem removeItems = null;
        int price = -1;
        int coinChange = 0;

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (shop.getNumBuySlot() >= MiscInfo.PS_NUM_BUY_SLOT())
            result = ErrorConst.INVALID_ACTION;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if ((price = MiscInfo.PS_PRICE_SLOTS(shop.getNumBuySlot())) <= 0)
            result = ErrorConst.INVALID_PRICE;
        else if (price > request.priceCoin)
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if (userControl.getCoin() < price)
            result = ErrorConst.NOT_ENOUGH_COIN;
        else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.privateShopUnlock(cmd, shop.getNumBuySlot()))) == ErrorConst.SUCCESS)
        {
            shop.buySlotByCoin();
            userControl.savePrivateShop();
            userControl.markFlagSaveGame();

            removeItems = new MapItem (ItemId.COIN, price);
            coinChange = -price;
        }

        Message msg = new ResponsePrivateShopUnlockCoin(cmd, result).packData(request, shop, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void privateShopUnlockFriend (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestPrivateShopUnlockFriend request = new RequestPrivateShopUnlockFriend(dataCmd);

        byte result;
        UserGame game = userControl.game;
        FriendList friendList = userControl.getFriendList();
        PrivateShop shop = userControl.loadPrivateShop();

        int requireFriend = -1;

        if (shop == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.getLevel() < MiscInfo.PS_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (shop.getNumFriendSlot() >= MiscInfo.PS_NUM_FRIEND_SLOT())
            result = ErrorConst.INVALID_ACTION;
        else if ((requireFriend = MiscInfo.PS_REQUIRED_FRIEND(shop.getNumFriendSlot())) <= 0)
            result = ErrorConst.INVALID_PRICE;
        else if (friendList.numFriend() + 1 < requireFriend)
            result = ErrorConst.NOT_ENOUGH_ITEM;
        else
        {
            shop.buySlotByFriend();
            userControl.savePrivateShop();

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponsePrivateShopUnlockFriend(cmd, result).packData(shop);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             requireFriend
                            );
    }

    private static void privateShopNewsBoard (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopNewsBoard request = new RequestPrivateShopNewsBoard(dataCmd);

        byte result;
        UserGame game = userControl.game;

        HashSet<NewsBoardItem> newsBoard = null;
        MapItem removeItems = null;
        int price = -1;
        int coinChange = 0;

        if (game.getLevel() < MiscInfo.NB_PRIVATE_SHOP_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (userControl.isFirstPsNb || game.canResetNbPrivateShop()) //reset miễn phí
        {
            userControl.isFirstPsNb = false;
            price = 0;
            result = ErrorConst.SUCCESS;
        }
        else  //reset tính phí
        {
            price = MiscInfo.NB_PRICE_REFRESH();

            if (request.clientCoin != userControl.getCoin())
                result = ErrorConst.CLIENT_COIN_NOT_MATCH;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if (price <= 0)
                result = ErrorConst.INVALID_PRICE;
            else
                result = userControl.purchase(transactionId, price, PurchaseInfo.action(cmd));
        }

        if (result == ErrorConst.SUCCESS)
        {
            newsBoard = NewsBoardClient.privateShop.getItems(userControl.userId, game.getLevel());
            game.setTimeNbPrivateShop();

            userControl.markFlagSaveGame();
            if (price > 0)
            {
            	removeItems = new MapItem (ItemId.COIN, price);
            	coinChange = -price;
            }
        }

        Message msg = new ResponsePrivateShopNewsBoard(cmd, result).packData(userControl.getCoin(), newsBoard);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void privateShopFriendGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        RequestPrivateShopFriendGet request = new RequestPrivateShopFriendGet(dataCmd);

        UserGame game = userControl.game;
        byte result;

        String bucket = request.bucket;
        if (!BucketManager.containsBucket(bucket))
        {
            UserBrief brief = UserBrief.get(request.friendId);
            if (brief != null)
                bucket = brief.getBucketId();
        }

        PrivateShop shop = null;

        if (!BucketManager.containsBucket(bucket))
            result = ErrorConst.NULL_BUCKET;
        else if ((shop = PrivateShop.get(bucket, request.friendId)) == null)
            result = ErrorConst.NULL_OBJECT;
        else
            result = ErrorConst.SUCCESS;

        Message msg = new ResponsePrivateShopFriendGet(cmd, result).packData(request, shop);
        userControl.send(msg);

        if (result != ErrorConst.SUCCESS || EnvConfig.isLocal())
	        MetricLog.actionUser(userControl.country,
	                             cmd,
	                             userControl.platformID,
	                             userControl.brief.getUserId(),
	                             userControl.brief.getUsername(),
	                             userControl.socialType,
	                             game.getLevel(),
	                             transactionId,
	                             null,
	                             null,
	                             result,
	                             userControl.getCoin(),
	                             0,
	                             game.getGold(),
	                             0,
	                             request.friendId,
	                             request.bucket,
	                             bucket
	                            );
    }

    private static void privateShopFriendBuy (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestPrivateShopFriendBuy request = new RequestPrivateShopFriendBuy(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        String itemId = null;
        MapItem receiveItems = null;
        MapItem removeItems = null;
        int goldChange = 0;
        PrivateShop frShop = null;

        String frBucket = null;
        UserBrief brief = UserBrief.get(request.friendId);
        if (brief != null)
            frBucket = brief.getBucketId();

        if (frBucket == null)
            result = ErrorConst.NULL_BUCKET;
        else
        {
            CasValue<PrivateShop> cas = PrivateShop.gets(frBucket, request.friendId);
            PrivateShop.Slot slot;
            ItemInfo info;

            if (cas == null)
                result = ErrorConst.GETS_FAIL;
            else
            {
                frShop = cas.object;
                if (!frShop.hasSlot(request.idSlot))
                    result = ErrorConst.INVALID_SLOT_ID;
                else if ((slot = frShop.get(request.idSlot)) == null)
                    result = ErrorConst.EMPTY;
                else if (slot.isSold())
                    result = ErrorConst.INVALID_BUY;
                else if (game.getGold() < slot.getPrice())
                    result = ErrorConst.NOT_ENOUGH_GOLD;
                else if ((info = ConstInfo.getItemInfo(slot.getItem())) == null)
                    result = ErrorConst.NULL_ITEM_INFO;
                else if (info.LEVEL_UNLOCK() > game.getLevel())
                    result = ErrorConst.LIMIT_LEVEL;
                else if ((result = game.checkCapacity(slot.getItem(), slot.getNum())) == ErrorConst.SUCCESS)
                {
                    slot.setSold(game.getUserId(), game.avatar);

                    if (PrivateShop.cas(frBucket, request.friendId, cas.cas, frShop))
                    {
                        game.removeItem(cmd, transactionId, ItemId.GOLD, slot.getPrice());
                        game.addItem(cmd, transactionId, slot.getItem(), slot.getNum());

                        result = ErrorConst.SUCCESS;
                        userControl.markFlagSaveGame();

                        removeItems = new MapItem (ItemId.GOLD, slot.getPrice());
                        goldChange = -slot.getPrice();
                        
                        receiveItems = new MapItem (slot.getItem(), slot.getNum());
                        itemId = slot.getItem();
                    }
                    else
                    {
                        result = ErrorConst.CAS_FAIL;
                    }
                }
            }
        }

        Message msg = new ResponsePrivateShopFriendBuy(cmd, result).packData(request, frShop, game.getGold(), game.getMapItemNum(itemId));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.friendId,
                             request.idSlot
                            );

        if (result == ErrorConst.SUCCESS)
        {
            UdpHandler.sendPrivateShopBuy(request.friendId);
            UdpHandler.sendPrivateShopDelete(request.friendId, request.idSlot);
        }
    }

    private static void jackPrivateShopBuy (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestJackPrivateShopBuy request = new RequestJackPrivateShopBuy(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        MapItem receiveItems = null;
        MapItem removeItems = null;
        int goldChange = 0;
        
        MapItem updateItems = null;

        JackShop jackShop = game.getJackShop();
        JackShop.Slot slot = jackShop.getSlot(request.idSlot);

        if (slot == null)
            result = ErrorConst.NULL_SLOT;
        else if (slot.isSold())
            result = ErrorConst.INVALID_ACTION;
        else if ((result = game.removeAndAddItem(cmd, transactionId, ItemId.GOLD, slot.getPrice(), slot.getItem(), slot.getNum())) == ErrorConst.SUCCESS)
        {
            slot.setSold();
            userControl.markFlagSaveGame();

            removeItems = new MapItem (ItemId.GOLD, slot.getPrice());
            goldChange = -slot.getPrice();
            
            receiveItems = new MapItem (slot.getItem(), slot.getNum());
            updateItems = game.getMapItemNum(slot.getItem());
        }

        Message msg = new ResponseJackPrivateShopBuy(cmd, result).packData(jackShop, game.getGold(), updateItems);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.idSlot
                            );
    }

    private static void updateCoin (short cmd, String transactionId, UserControl userControl)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        userControl.inquiryBalanceDB();
        userControl.processBilling();
        userControl.markFlagSaveGame();

        Payment payment = game.getPayment();
        payment.update(transactionId, game);

        Message msg = new ResponseUpdateCoin(cmd, result).packData(userControl.getCoin(),
                                                                   game.getGold(),
                                                                   payment,
                                                                   userControl.getMailBox(),
                                                                   game.getPigBank(),
                                                                   game.getVIP());
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void airshipUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        //RequestAirshipUnlock request = new RequestAirshipUnlock(dataCmd);
        byte result;
        MapItem removeItem = null;
        int coinChange = 0;

        AirShip airShip = userControl.airShip;

        if (game.getLevel() < MiscInfo.AS_UNLOCK_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!airShip.isLock())
            result = ErrorConst.INVALID_ACTION;
        else if ((result = game.removeItem(cmd, transactionId, MiscInfo.AS_UNLOCK_REQUIRE_ITEMS())) == ErrorConst.SUCCESS)
        {
            airShip.unlock();
            AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

            removeItem = MiscInfo.AS_UNLOCK_REQUIRE_ITEMS();
            coinChange = -removeItem.get(ItemId.COIN);
        }

        Message msg = new ResponseAirshipUnlock(cmd, result).packData(airShip, game.getMapItemNum(MiscInfo.AS_UNLOCK_REQUIRE_ITEMS()));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0
                            );
    }

    private static void airshipSkipTimeUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        RequestAirshipSkipTimeUnlock request = new RequestAirshipSkipTimeUnlock(dataCmd);
        byte result;
        MapItem removeItem = null;
        int price = -1;
        int coinChange = 0;

        AirShip airShip = userControl.airShip;
        airShip.update(game);

        if (!airShip.canSkipTimeUnlock())
            result = ErrorConst.INVALID_ACTION;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else
        {
            int timeSkip = airShip.calcTimeSkip();
            SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.AIRSHIP, MiscInfo.AS_UNLOCK_TIME());
            price = skipTimeInfo.calcPrice(timeSkip);

            if (price <= 0)
                result = ErrorConst.INVALID_PRICE;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
            {
                airShip.skipTime();
                airShip.update(game);
                AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

                userControl.markFlagSaveGame();
                removeItem = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponseAirshipSkipTimeUnlock(cmd, result).packData(airShip, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );

    }

    private static void airshipSkipTimeInactive (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        RequestAirshipSkipTimeInactive request = new RequestAirshipSkipTimeInactive(dataCmd);
        byte result;
        AirShip airShip = userControl.loadAndUpdateAirShip();

        MapItem removeItems = null;
        int price = -1;
        int coinChange = 0;

        if (airShip == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!airShip.canSkipTimeInactive())
            result = ErrorConst.INVALID_ACTION;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else
        {
            int timeSkip = airShip.calcTimeSkip();
            SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.AIRSHIP, airShip.getTimeWait());
            price = skipTimeInfo.calcPrice(timeSkip);

            if (price <= 0)
                result = ErrorConst.INVALID_PRICE;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if (userControl.getCoin() < price)
                result = ErrorConst.NOT_ENOUGH_COIN;
            else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
            {
                airShip.skipTime();
                airShip.update(game);
                AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

                userControl.markFlagSaveGame();
                removeItems = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponseAirshipSkipTimeInactive(cmd, result).packData(airShip, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void airshipPack (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        RequestAirshipPack request = new RequestAirshipPack(dataCmd);
        byte result;
        AirShip airShip = userControl.loadAndUpdateAirShip();
        AirShip.Slot slot = null;
        MapItem receiveItem = null;
        MapItem requireItem = null;

        if (airShip == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!airShip.isActive())
            result = ErrorConst.INVALID_STATUS;
        else if ((slot = airShip.getSlot(request.idSlot)) == null)
            result = ErrorConst.NULL_SLOT;
        else if (slot.isPacked())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            requireItem = Common.toMap(slot.getItem(), slot.getNum());
            receiveItem = Common.merge(slot.getRewardItems(), slot.getEventItems());

            result = game.removeAndAddItem(cmd, transactionId, requireItem, receiveItem);
            if (result == ErrorConst.SUCCESS)
            {
                slot.pack();
                AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

                userControl.markFlagSaveGame();
            }
            else
            {
                receiveItem = null;
                requireItem = null;
            }
        }

        Message msg = new ResponseAirshipPack(cmd, result).packData(request.idSlot,
                                                                    airShip,
                                                                    game.getLevel(),
                                                                    game.getExp(),
                                                                    game.getGold(),
                                                                    game.getReputation(),
                                                                    game.getMapItemNum(receiveItem, requireItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             requireItem,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.idSlot
                            );

        if (result == ErrorConst.SUCCESS && slot != null && slot.isPacked() && slot.isRequest())
        {
            UdpHandler.sendAirshipDelete(userControl.userId, request.idSlot);
        }
    }

    private static void airshipDelivery (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        //RequestAirshipDelivery request = new RequestAirshipDelivery(dataCmd);
        byte result;
        AirShip airShip = userControl.loadAndUpdateAirShip();
        MapItem rewards = null;
        Fishing fishing = game.getFishing();


        if (airShip == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!airShip.canDelivery())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            rewards = new MapItem();
            rewards.increase(UserLevelInfo.AIRSHIP_REWARD(game.getLevel()));

            //Gachapon
            int quantity = MiscInfo.GACHAPON_AIRSHIP_DELIVERY_TICKET();
            if (quantity > 0) rewards.increase(ItemId.VE_GACHA, quantity);

            //VIP
            VIPInfo.VIPItem currentUserVIPItem = game.getVIP().getCurrentActiveVIPItem();
            int bonusVIPRate = currentUserVIPItem.AIRSHIP_GOLD_BONUS();
            rewards.increase(ItemId.GOLD, rewards.get(ItemId.GOLD) * bonusVIPRate / 100);

            rewards.increase(airShip.getEventItems());
            rewards.increase(fishing.collectEP(game,CmdDefine.AIRSHIP_DELIVERY));

            result = game.checkAndAddItem(cmd, transactionId, rewards);
            if (result == ErrorConst.SUCCESS)
            {
                airShip.inactive(game, Time.getUnixTime());
                AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

                //Pig Bank
                if (MiscInfo.PIG_ACTIVE() && game.getPigBank().isActive(game.getLevel()))
                {
                    game.getPigBank().addDiamond(MiscInfo.PIG_AIRSHIP_DELIVERY_DIAMOND());
                    pigUpdateDiamond(CmdDefine.PIG_UPDATE_DIAMOND, transactionId, userControl, dataCmd);
                }

                userControl.markFlagSaveGame();
            }
            else
            {
                rewards = null;
            }
        }

        Message msg = new ResponseAirshipDelivery(cmd, result).packData(airShip,
                                                                        game.getLevel(),
                                                                        game.getExp(),
                                                                        game.getGold(),
                                                                        game.getReputation(),
                                                                        game.getMapItemNum(rewards));
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_AIRSHIP_DELIVERY(), 1))
            userControl.markFlagSaveGame();

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             rewards,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation()
                            );
    }

    private static void airshipCancel (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        UserGame game = userControl.game;

        //RequestAirshipCancel request = new RequestAirshipCancel(dataCmd);
        byte result;
        AirShip airShip = userControl.loadAndUpdateAirShip();

        if (airShip == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!airShip.canCancel())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            for (int idSlot = 0; idSlot < airShip.numSlot(); idSlot++)
            {
                AirShip.Slot slot = airShip.getSlot(idSlot);
                if (slot != null && slot.isRequest())
                    UdpHandler.sendAirshipDelete(userControl.userId, idSlot);

            }
            airShip.inactive(game, Time.getUnixTime());
            AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseAirshipCancel(cmd, result).packData(airShip);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void airshipRequestHelp (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        UserGame game = userControl.game;

        RequestAirshipRequestHelp request = new RequestAirshipRequestHelp(dataCmd);
        byte result;
        AirShip airShip = userControl.loadAndUpdateAirShip();
        AirShip.Slot slot;

        if (airShip == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!airShip.isActive())
            result = ErrorConst.INVALID_STATUS;
        else if (!airShip.canRequestHelp())
            result = ErrorConst.LIMIT;
        else if ((slot = airShip.getSlot(request.idSlot)) == null)
            result = ErrorConst.NULL_SLOT;
        else if (slot.isPacked())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            //TODO: cache thông tin cần bạn giúp đỡ trong air ship
            airShip.increaseNumRequest();
            slot.requestHelp(userControl.userId, game.displayName, game.avatar, userControl.brief.getBucketId(), request.idSlot, airShip.getTimeFinish());
            AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseAirshipRequestHelp(cmd, result).packData(request.idSlot, airShip);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.idSlot
                            );
    }

    private static void airshipGet (short cmd, UserControl userControl)
    {
        UserGame game = userControl.game;

        byte result;
        AirShip airShip = AirShip.get(userControl.brief.getBucketId(), userControl.userId);

        if (airShip == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            if (airShip.update(game))
                AirShip.set(userControl.brief.getBucketId(), userControl.userId, airShip);

            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseAirshipGet(cmd, result).packData(airShip);
        userControl.send(msg);
    }

    private static void airshipFriendGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        RequestAirshipFriendGet request = new RequestAirshipFriendGet(dataCmd);

        UserGame game = userControl.game;

        byte result;

        String bucket = request.bucket;
        if (!BucketManager.containsBucket(bucket))
        {
            UserBrief brief = UserBrief.get(request.friendId);
            if (brief != null)
                bucket = brief.getBucketId();
        }

        AirShip airShip = null;

        if (!BucketManager.containsBucket(bucket))
            result = ErrorConst.NULL_BUCKET;
        else if ((airShip = AirShip.get(bucket, request.friendId)) == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            airShip.friendUpdate();
            airShip.replaceEventItems(userControl.game.getEventItemsFriendPack());
            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseAirshipFriendGet(cmd, result).packData(request.friendId, airShip);
        userControl.send(msg);

        if (result != ErrorConst.SUCCESS || EnvConfig.isLocal())
	        MetricLog.actionUser(userControl.country,
	                             cmd,
	                             userControl.platformID,
	                             userControl.brief.getUserId(),
	                             userControl.brief.getUsername(),
	                             userControl.socialType,
	                             game.getLevel(),
	                             transactionId,
	                             null,
	                             null,
	                             result,
	                             userControl.getCoin(),
	                             0,
	                             game.getGold(),
	                             0,
	                             request.friendId,
	                             request.bucket,
	                             bucket
	                            );
    }

    private static void airshipFriendPack (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestAirshipFriendPack request = new RequestAirshipFriendPack(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        MapItem rewards = null;
        MapItem require = null;
        AirShip frAirship = null;

        String frBucket = null;
        UserBrief brief = UserBrief.get(request.friendId);
        if (brief != null)
            frBucket = brief.getBucketId();

        if (frBucket == null)
            result = ErrorConst.NULL_BUCKET;
        else
        {
            CasValue<AirShip> cas = AirShip.gets(frBucket, request.friendId);
            AirShip.Slot slot;

            if (cas == null)
                result = ErrorConst.GETS_FAIL;
            else
            {
                frAirship = cas.object;
                frAirship.friendUpdate();
                if ((slot = frAirship.getSlot(request.idSlot)) == null)
                    result = ErrorConst.EMPTY;
                else if (!frAirship.isActive())
                    result = ErrorConst.INVALID_STATUS;
                else if (!slot.canHelp())
                    result = ErrorConst.INVALID_ACTION;
                else if (!frAirship.canHelp(userControl.userId))
                    result = ErrorConst.LIMIT;
                else
                {
                    rewards = Common.merge(slot.getRewardItems(), game.getEventItemsFriendPack());
                    require = Common.toMap(slot.getItem(), slot.getNum());

                    if (game.checkRequireItem(require) != ErrorConst.SUCCESS)
                        result = ErrorConst.NOT_ENOUGH_ITEM;
                    else if (game.checkCapacity(rewards) != ErrorConst.SUCCESS)
                        result = ErrorConst.OUT_OF_CAPACITY;
                    else
                    {
                        slot.pack(game.getUserId(), game.avatar);

                        if (AirShip.cas(frBucket, request.friendId, cas.cas, frAirship))
                        {
                            game.removeItem(cmd, transactionId, require);
                            game.addItem(cmd, transactionId, rewards);
                            game.resetEventItemsFriendPack();

                            result = ErrorConst.SUCCESS;
                            userControl.markFlagSaveGame();
                        }
                        else
                        {
                            result = ErrorConst.CAS_FAIL;
                        }
                    }
                }
            }
        }

        if (result != ErrorConst.SUCCESS)
            rewards = null;

        if (frAirship != null)
            frAirship.replaceEventItems(game.getEventItemsFriendPack());
        Message msg = new ResponseAirshipFriendPack(cmd, result).packData(request, frAirship, game.getLevel(),
                                                                          game.getExp(),
                                                                          game.getGold(),
                                                                          game.getReputation(),
                                                                          game.getMapItemNum(rewards));
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_AIRSHIP_FRIEND_PACK(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             require,
                             rewards,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.friendId,
                             request.idSlot
                            );

        if (result == ErrorConst.SUCCESS)
        {
            UdpHandler.sendAirshipPack(request.friendId);
            UdpHandler.sendAirshipDelete(request.friendId, request.idSlot);
        }
    }

    private static void airshipNewsBoard (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestAirshipNewsBoard request = new RequestAirshipNewsBoard(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        HashSet<NewsBoardItem> newsBoard = null;
        MapItem removeItems = null;
        int price = -1;
        int coinChange = 0;

        if (game.getLevel() < MiscInfo.NB_AIRSHIP_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (userControl.isFirstAsNb || game.canResetNbAirship()) //reset miễn phí
        {
            userControl.isFirstAsNb = false;
            price = 0;
            result = ErrorConst.SUCCESS;
        }
        else  //reset tính phí
        {
            price = MiscInfo.NB_PRICE_REFRESH();

            if (request.clientCoin != userControl.getCoin())
                result = ErrorConst.CLIENT_COIN_NOT_MATCH;
            else if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if (price <= 0)
                result = ErrorConst.INVALID_PRICE;
            else
                result = userControl.purchase(transactionId, price, PurchaseInfo.action(cmd));
        }

        if (result == ErrorConst.SUCCESS)
        {
            newsBoard = NewsBoardClient.airship.getItems(userControl.userId, game.getLevel());
            game.setTimeNbAirship();

            userControl.markFlagSaveGame();
            if (price > 0)
            {
            	removeItems = new MapItem (ItemId.COIN, price);
                coinChange = -price;
            }
        }

        Message msg = new ResponseAirshipNewsBoard(cmd, result).packData(userControl.getCoin(), newsBoard);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void tomHire (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        RequestTomHire request = new RequestTomHire(dataCmd);
        Tom tom = game.getTom();
        MapItem removeItems = null;
        MapItem receiveItems = null;
        int price = MiscInfo.TOM_HIRE_PRICE(request.type, -1);
        boolean isSaleOff = MiscInfo.isInTomSaleDuration();
        int coinChange = 0;

        if (price < 0)
            result = ErrorConst.INVALID_PRICE;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else
        {
            if (isSaleOff)
                price = Common.priceSaleOff(price, MiscInfo.TOM_SALE_OFF_PERCENT());

            if (price > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if ((result = tom.checkHire(request.type)) == ErrorConst.SUCCESS)
            {
                if (price > 0)
                    result = userControl.purchase(transactionId, price, PurchaseInfo.tomHire(cmd, request.type, isSaleOff));

                if (result == ErrorConst.SUCCESS)
                {
                    tom.hire(request.type);

                    if (price > 0)
                        removeItems = new MapItem (ItemId.COIN, price);

                    coinChange = -price;
                    
                    receiveItems = festival.collectEP(game, cmd, price);
                    receiveItems.increase(fishing.collectEP(game, cmd, price));

                    game.addItem(cmd, transactionId, receiveItems);

                    userControl.markFlagSaveGame();
                }
            }
        }

        Message msg = new ResponseTomHire(cmd, result).packData(userControl.getCoin(), tom, game.getMapItemNum(receiveItems), receiveItems);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.type,
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             isSaleOff
                            );
    }

    private static void tomFind (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.EMPTY;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();

        RequestTomFind request = new RequestTomFind(dataCmd);
        Tom tom = game.getTom();
        MapItem removeItems = null;
        MapItem receiveItems = null;
        MapItem updateItems = null;
        int multiple = request.support.equals(MiscInfo.TOM_X2_ITEM()) ? 2 : 1;
        ItemInfo info = ConstInfo.getItemInfo(request.item);

        if (multiple <= 0)
            result = ErrorConst.INVALID_NUM;
        else if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.getTomInfo() == null)
            result = ErrorConst.INVALID_ACTION;
        else if (!tom.canFind())
            result = ErrorConst.BUSY;
        else
        {
            updateItems = new MapItem();
            if (multiple > 1)
            {
                removeItems = Common.toMap(request.support, 1);
                result = game.removeItem(cmd, transactionId, removeItems);
                if (result == ErrorConst.SUCCESS)
                    updateItems.decrease(removeItems);
                else
                    tom = null;
            }

            if (tom != null)
            {
                tom.find(info, multiple);

                result = ErrorConst.SUCCESS;
                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseTomFind(cmd, result).packData(tom, game.getMapItemNum(updateItems));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.item,
                             request.support,
                             multiple
                            );
    }

    private static void tomBuy (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestTomBuy request = new RequestTomBuy(dataCmd);
        Tom tom = game.getTom();
        MapItem removeItems = null;
        MapItem receiveItems = null;
        String item = null;
        int goldChange = 0;
        Tom.Pack pack = tom.getPack(request.slot);

        if (pack == null)
            result = ErrorConst.NULL_SLOT;
        else
        {
            item = tom.getItem();
            if ((result = game.removeAndAddItem(cmd, transactionId, ItemId.GOLD, pack.getPrice(), item, pack.getNum())) == ErrorConst.SUCCESS)
            {
                tom.buy();

                result = ErrorConst.SUCCESS;
                userControl.markFlagSaveGame();

                removeItems = new MapItem (ItemId.GOLD, pack.getPrice());
                goldChange = -pack.getPrice();
                
                receiveItems = new MapItem (item, pack.getNum());
            }
        }

        Message msg = new ResponseTomBuy(cmd, result).packData(tom, game.getGold(), game.getMapItemNum(item));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.slot,
                             item
                            );
    }

    private static void tomCancel (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestTomCancel request = new RequestTomCancel(dataCmd);
        Tom tom = game.getTom();

        if (!tom.canCancel())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            tom.cancel();

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseTomCancel(cmd, result).packData(tom);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void tomReduceTime (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestTomReduceTime request = new RequestTomReduceTime(dataCmd);
        Tom tom = game.getTom();
        MapItem removeItems = null;
        int reduceTime = 0;
        if (request.support.equals(MiscInfo.TOM_REDUCE_TIME_ITEM()))
            reduceTime = MiscInfo.TOM_REDUCE_TIME_VALUE() * request.num;

        if (!tom.canReduceTime())
            result = ErrorConst.INVALID_ACTION;
        else if (request.num <= 0 || reduceTime <= 0)
            result = ErrorConst.INVALID_NUM;
        else if ((result = game.removeItem(cmd, transactionId, request.support, request.num)) == ErrorConst.SUCCESS)
        {
            tom.reduceTime(reduceTime);

            result = ErrorConst.SUCCESS;
            userControl.markFlagSaveGame();

            removeItems = new MapItem (request.support, request.num);
        }

        Message msg = new ResponseTomReduceTime(cmd, result).packData(tom, game.getMapItemNum(request.support));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.support,
                             request.num
                            );
    }

    private static void luckySpin (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestLuckySpin request = new RequestLuckySpin(dataCmd);
        LuckySpin spin = game.getLuckySpin();
        MapItem removeItems = null;
        int price = -1;
        int coinChange = 0;
        byte winSlot = -1;
        String winItem = "";
        int numSpin = spin.getNumSpin();

        if (game.getLevel() < MiscInfo.SPIN_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (numSpin >= MiscInfo.SPIN_PRICE_TURN_SIZE())
            result = ErrorConst.LIMIT;
        else if (spin.getIncomplete() >= 0)
            result = ErrorConst.INVALID_STATUS;
        else
        {
            price = MiscInfo.SPIN_PRICE_TURN(numSpin);
            if (price > 0)
            {
                if (request.clientCoin != userControl.getCoin())
                    result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                else if (price > request.priceCoin)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.luckySpin(cmd, numSpin))) == ErrorConst.SUCCESS)
                {
                	removeItems = new MapItem (ItemId.COIN, price);
                	coinChange = -price;
                }
            }
            else
            {
                result = ErrorConst.SUCCESS;
            }

            if (result == ErrorConst.SUCCESS)
            {
                LuckySpin.Slot slot = spin.spin();

                winSlot = spin.getIncomplete();
                winItem = slot.getItem();

                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseLuckySpin(cmd, result).packData(userControl.getCoin(), spin, winSlot, null);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             numSpin,
                             spin.isX2() ? 2 : 1,
                             winSlot,
                             winItem
                            );
    }

    private static void luckySpinGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        //RequestLuckySpin request = new RequestLuckySpin(dataCmd);
        LuckySpin spin = game.getLuckySpin();
        MapItem receivedItems = null;
        byte winSlot = spin.getIncomplete();
        LuckySpin.Slot slot = spin.getIncompleteSlot();
        String updateItem = null;

        if (winSlot < 0)
            result = ErrorConst.INVALID_STATUS;
        else if (slot == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            if (slot.getItem().equals(ItemId.X2))
            {
                receivedItems = spin.eventItems;
            }
            else
            {
//				WARNING: luôn để item của vòng quay ở đầu log receivedItems để thống kê
                receivedItems = Common.toMap(slot.getItem(), slot.getNum(spin.isX2()));
                receivedItems.increase(spin.eventItems);
            }

            if (receivedItems == null) //trường hợp x2 và ko có quà event
                result = ErrorConst.SUCCESS;
            else
                result = game.checkAndAddItem(cmd, transactionId, receivedItems);

            if (result == ErrorConst.SUCCESS)
            {
                spin.complete(game);

                userControl.markFlagSaveGame();
                updateItem = slot.getItem();
            }
            else
            {
                receivedItems = null;
            }
        }

        Message msg = new ResponseLuckySpinGetReward(cmd, result).packData(userControl.getCoin(), spin, winSlot, game.getMapItemNum(updateItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receivedItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             winSlot
                            );
    }

    private static void mailMarkRead (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestMailMarkRead request = new RequestMailMarkRead(dataCmd);
        MailBox mailBox = userControl.loadAndUpdateMailBox();

        if (mailBox == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            result = ErrorConst.SUCCESS;
            if (mailBox.markRead(request.uids))
                MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
        }

        Message msg = new ResponseMailMarkRead(cmd, result).packData(mailBox);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             MetricLog.toString(request.uids)
                            );
    }

    private static void mailDelete (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestMailDelete request = new RequestMailDelete(dataCmd);
        MailBox mailBox = null;

        if (request.uids == null || request.uids.length == 0)
            result = ErrorConst.EMPTY;
        else
        {
            mailBox = userControl.loadAndUpdateMailBox();
            if (mailBox == null)
                result = ErrorConst.NULL_OBJECT;
            else
            {
                result = ErrorConst.SUCCESS;
                if (mailBox.delete(request.uids, transactionId))
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
            }
        }

        Message msg = new ResponseMailDelete(cmd, result).packData(mailBox);
        userControl.send(msg);

        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             MetricLog.toString(request.uids),
                             "user", //type
                             "", //isRead
                             "", //title
                             "", //content
                             "" //items
                            );
    }

    private static void mailGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestMailGetReward request = new RequestMailGetReward(dataCmd);
        MailBox mailBox;
        boolean isChanged = false;
        int[] uidSuccess = null;
        MapItem receivedItems = null;
        
        MapItem[] logReceivedItems = null;
        byte[] logResultItems = null;

        if (request.uids == null || request.uids.length == 0)
        {
            result = ErrorConst.EMPTY;
            mailBox = userControl.getMailBox();
        }
        else
        {
            mailBox = userControl.loadAndUpdateMailBox();

            if (mailBox == null)
                result = ErrorConst.NULL_MAIL_BOX;
            else
            {
                receivedItems = new MapItem();
                uidSuccess = new int[request.uids.length];

                result = ErrorConst.SUCCESS;
                logReceivedItems = new MapItem[request.uids.length];
                logResultItems = new byte[request.uids.length];
                
                for (int i = 0; i < request.uids.length; i++)
                {
                    int uid = request.uids[i];
                    MailBox.Mail mail = mailBox.get(uid);
                    byte itemResult = ErrorConst.SUCCESS;
                    
                    if (mail == null)
                    	itemResult = ErrorConst.NULL_OBJECT;
                    else
                    {
                        if (mail.getType() == MiscDefine.MAIL_OFFER || mail.getType() == MiscDefine.MAIL_FIRST_CHARGE_ITEM)
                            game.addItem(cmd, transactionId, mail.getItems());
                        else
                        	itemResult = game.checkAndAddItem(cmd, transactionId, mail.getItems());
                    }

                    if (itemResult == ErrorConst.SUCCESS)
                    {
                        isChanged = true;
                        mailBox.delete(uid);
                        receivedItems.increase(mail.getItems());
                        logReceivedItems [i] = mail.getItems();
                        uidSuccess[i] = uid;
                    }
                    
                    logResultItems [i] = itemResult;
                }
            }
        }

        if (isChanged && MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox) == false)
        {
            result = ErrorConst.CAS_FAIL;
            receivedItems = null;
            uidSuccess = null;
        }

        Message msg = new ResponseMailGetReward(cmd, result).packData(mailBox,
                                                                      userControl.getCoin(),
                                                                      game.getGold(),
                                                                      game.getReputation(),
                                                                      game.getMapItemNum(receivedItems));
        userControl.send(msg);
        
        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids == null ? "" : MetricLog.toString(request.uids)
                            );
        else
        for (int i = 0; i < request.uids.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             logReceivedItems [i],
                             logResultItems [i],
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids [i]
                            );
    }

    private static void blacksmithMakePot (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        byte result = ErrorConst.SUCCESS;
        boolean isForgeSuccess = false;
        MapItem removeItems = null;
        MapItem receiveItems = null;
        MapItem updateItem = new MapItem();
        int goldChange = 0;
        RequestBlacksmithMakePot request = new RequestBlacksmithMakePot(dataCmd);

        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < MiscInfo.BLACKSMITH_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (game.checkCapacity(request.pot, 1) != ErrorConst.SUCCESS)
            result = ErrorConst.OUT_OF_CAPACITY;
        else
        {
            BlacksmithInfo.MakePotHelper helper = ConstInfo.getBlacksmithInfo().makePot(request.pot, request.items);
            if (helper.errorCode == -1)
            {
                ThreadLocalRandom random = ThreadLocalRandom.current();

                //VIP
                VIPInfo.VIPItem currentUserVIPItem = game.getVIP().getCurrentActiveVIPItem();
                int bonusVIPRate = currentUserVIPItem.BLACKSMITH_RATE();

                float rate = random.nextFloat();
                isForgeSuccess = rate <= helper.successRate + bonusVIPRate / 100.0f;
                removeItems = helper.materials;
                receiveItems = isForgeSuccess ? helper.successPot : helper.failPot;

                result = game.removeAndAddItem(cmd, transactionId, removeItems, receiveItems);
                if (result == ErrorConst.SUCCESS)
                {
                    userControl.markFlagSaveGame();
                    updateItem.decrease(removeItems);
                    updateItem.increase(receiveItems);
                    goldChange = -removeItems.get(ItemId.GOLD);
                }
                else
                    isForgeSuccess = false;
            }
            else
            {
                result = helper.errorCode;
            }
        }

        Message msg = new ResponseBlacksmithMakePot(cmd, result).packData(isForgeSuccess, game.getGold(), game.getMapItemNum(updateItem));
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_POT_UPGRADE(), 1))
            userControl.markFlagSaveGame();

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             request.pot,
                             isForgeSuccess
                            );
    }

    private static void openBuildingGame (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        if (game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < MiscInfo.BUILDING_GAME_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
            game.openBuildingGame();

            userControl.markFlagSaveGame();
            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseOpenBuildingGame(cmd, result).packData();
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.isOpenBuildingGame()
                            );
    }

    private static void diceSpin (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        Dice dice = game.getDice();
        int winSlot = -1;
        String winItem = "";
        int diceNum = -1;

        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (dice == null)
            result = ErrorConst.NULL_OBJECT;
        else if (dice.getNumTicket() <= 0)
            result = ErrorConst.INVALID_NUM;
        else if (dice.getIncomplete() >= 0)
            result = ErrorConst.INVALID_STATUS;
        else
        {
            result = ErrorConst.SUCCESS;
            diceNum = dice.getNumSpin();

            Dice.Slot slot = dice.spin(game.getLevel());
            winSlot = dice.getIncomplete();
            winItem = slot.getItem();

            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseDiceSpin(cmd, result).packData(userControl.getCoin(), dice, winSlot, null);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             diceNum,
                             dice.isX2() ? 2 : 1,
                             winSlot,
                             winItem
                            );
    }

    private static void diceGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        Dice dice = game.getDice();
        Dice.Slot slot;
        MapItem receivedItems = null;
        int winSlot = -1;
        String winItem = "";

        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (dice == null)
            result = ErrorConst.NULL_OBJECT;
        else if ((slot = dice.getIncompleteSlot()) == null)
            result = ErrorConst.INVALID_STATUS;
        else
        {
            winSlot = dice.getIncomplete();
            winItem = slot.getItem();

            receivedItems = new MapItem();
            receivedItems.increase(dice.eventItems);

            switch (winItem)
            {
                case ItemId.X2:
                case ItemId.DICE:
                    break;
                default:
                    receivedItems.increase(winItem, slot.getNum(dice.isX2()));
            }

            if (receivedItems.size() == 0 || (result = game.checkAndAddItem(cmd, transactionId, receivedItems)) == ErrorConst.SUCCESS)
            {
                dice.complete(game);
                result = ErrorConst.SUCCESS;

                userControl.markFlagSaveGame();
            }
            else
            {
                receivedItems = null;
            }
        }

        Message msg = new ResponseDiceGetReward(cmd, result).packData(userControl.getCoin(), dice, winSlot, game.getMapItemNum(winItem));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receivedItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             dice.isX2() ? 2 : 1,
                             winSlot,
                             winItem
                            );
    }

    private static void decorPut (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestDecorPut request = new RequestDecorPut(dataCmd);
        DecorInfo info = (DecorInfo) ConstInfo.getItemInfo(request.decor, ItemType.DECOR);
        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        byte[] slotResult = new byte[slots.length];

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else
        {
            result = ErrorConst.SUCCESS;
            boolean updateCombo = false;
            Slot slot;
            for (int i = 0; i < slots.length; i++)
            {
                slot = slots[i];
                if (slot == null)
                {
                    slotResult[i] = ErrorConst.NULL_SLOT;
                    continue;
                }
                if (slot.hasDecor())
                {
                    slotResult[i] = ErrorConst.INVALID_ACTION;
                    continue;
                }
                slotResult[i] = game.removeItem(cmd, transactionId, request.decor, 1);
                if (slotResult[i] == ErrorConst.SUCCESS)
                {
                    slot.putDecor(request.decor);
                    userControl.markFlagSaveGame();
                    updateCombo = true;
                }
            }
            if (updateCombo)
                game.getComboManager().update();
        }

        Message msg = new ResponseDecorPut(cmd, result).packData(request, slots, game.numStockItem(request.decor));
        userControl.send(msg);

        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.decor,
                             MetricLog.toString(request.iFloors),
                             MetricLog.toString(request.iSlots)
                            );
        else
        for (int i = 0; i < slots.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             slotResult [i],
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.decor,
                             request.iFloors [i],
                             request.iSlots [i]
                            );
    }

    private static void decorStore (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestDecorStore request = new RequestDecorStore(dataCmd);
        Slot[] slots = game.getSlots(request.iFloors, request.iSlots);
        HashSet<String> updateItems = new HashSet<>();
        String[] decors = new String[slots.length];
        byte[] slotResult = new byte[slots.length];

        boolean updateCombo = false;
        Slot slot;
        for (int i = 0; i < slots.length; i++)
        {
            slot = slots[i];
            if (slot == null)
            {
                slotResult[i] = ErrorConst.NULL_SLOT;
                continue;
            }
            if (!slot.hasDecor())
            {
                slotResult[i] = ErrorConst.INVALID_ACTION;
                continue;
            }
            slotResult[i] = game.checkAndAddItem(cmd, transactionId, slot.getDecor(), 1);
            if (slotResult[i] == ErrorConst.SUCCESS)
            {
                decors[i] = slot.getDecor();
                updateItems.add(slot.getDecor());

                slot.removeDecor();
                userControl.markFlagSaveGame();
                updateCombo = true;
            }
        }

        if (updateCombo)
            game.getComboManager().update();

        Message msg = new ResponseDecorStore(cmd, result).packData(request, slots, game.getMapItemNum(updateItems));
        userControl.send(msg);

        for (int i = 0; i < slots.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             slotResult [i],
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloors [i],
                             request.iSlots [i],
                             decors [i]
                            );
    }

    private static void dailyGiftGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        byte result;
        UserGame game = userControl.game;

        DailyGift dailyGift = game.getDailyGift();
        int mailId = -1;
        MailBox mailBox = userControl.loadAndUpdateMailBox();

        MapItem rewards = null;
        int pos = -1;

        if (game.getLevel() < MiscInfo.DAILY_GIFT_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (dailyGift == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!dailyGift.hasReward())
            result = ErrorConst.INVALID_ACTION;
        else if (mailBox == null && !dailyGift.isNewUser())
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            rewards= dailyGift.getReward();
            if (dailyGift.isNewUser())
            {
                game.addItem(cmd, transactionId, rewards);
                dailyGift.nextReward();
                pos = dailyGift.getCur();
                userControl.markFlagSaveGame();
                result = ErrorConst.SUCCESS;
            }
            else
            {
                if (!rewards.isEmpty())
                {
                    Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_DAILY_GIFT_CIRCLE, MiscInfo.DAILY_GIFT_CIRCLE_TITLE(), MiscInfo.DAILY_GIFT_CIRCLE_CONTENT(), rewards);
                    if (mail != null)
                    {
                        mailId = mail.getUid();
                        MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                        dailyGift.nextReward();
                        pos = dailyGift.getCur();
                        dailyGift.clearCircleRewards();
                        userControl.markFlagSaveGame();
                        userControl.notifyMail(false);
                        result = ErrorConst.SUCCESS;
                    }
                    else
                    {
                        result = ErrorConst.NULL_OBJECT;
                        rewards = null;
                    }
                }
                else
                result = ErrorConst.EMPTY;
            }
        }

        Message msg = new ResponseDailyGiftGetReward(cmd, result).packData(dailyGift,
                                                                           game.getLevel(),
                                                                           game.getExp(),
                                                                           game.getGold(),
                                                                           game.getReputation(),
                                                                           game.getMapItemNum(rewards),
                                                                           mailId);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                cmd,
                userControl.platformID,
                userControl.brief.getUserId(),
                userControl.brief.getUsername(),
                userControl.socialType,
                game.getLevel(),
                transactionId,
                null,
                rewards,
                result,
                userControl.getCoin(),
                0,
                game.getGold(),
                0,
                pos,
                mailId
        );
    }

    private static void mineGetInfo (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        Mine mine = game.getMine();

        byte result = ErrorConst.SUCCESS;
//      RequestMineGetInfo request = new RequestMineGetInfo(dataCmd);

        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < MiscInfo.MINE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (mine.isWorking())
            mine.checkFinish();
        else
            result = mine.refresh(game.getLevel());

        Message msg = new ResponseMineInfo(cmd, result).packData(mine.getStatus(), mine.getRequireItems(), mine.getReceiveItems(), mine.getFinishTime());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             mine.getStatus(),
                             mine.getFinishTime()
                            );

        MetricLog.items(mine.getRequireItems(), "MINE_REQUIRE", transactionId);
        MetricLog.items(mine.getReceiveItems(), "MINE_RECEIVE", transactionId);
    }

    private static void mineStart (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        Mine mine = game.getMine();
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        byte result = ErrorConst.SUCCESS;
//      RequestMineStart request = new RequestMineStart(dataCmd);

        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < MiscInfo.MINE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!mine.canStart())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            result = game.removeItem(cmd, transactionId, mine.getRequireItems());
            if (result == ErrorConst.SUCCESS)
            {
                result = mine.startWorking();
                if (festival != null)
                    mine.addEventReward(festival.collectEP(game, cmd));

                if (fishing != null)
                    mine.addEventReward(fishing.collectEP(game, cmd));

                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseMineStart(cmd, result).packData(mine.getStatus(), mine.getFinishTime(), game.getMapItemNum(mine.getRequireItems()));
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_MINE(), 1))
            userControl.markFlagSaveGame();

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             mine.getStatus(),
                             mine.getFinishTime()
                            );

        MetricLog.items(mine.getRequireItems(), "MINE_REQUIRE", transactionId);
        MetricLog.items(mine.getReceiveItems(), "MINE_RECEIVE", transactionId);
    }

    private static void mineSkipTime (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        Mine mine = game.getMine();

        byte result = ErrorConst.SUCCESS;
        int remainTime = mine.getRemainTime();
        int priceCoin = 0;
        MapItem removeItems = null;
        int coinChange = 0;

        RequestMineSkipTime request = new RequestMineSkipTime(dataCmd);
        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < MiscInfo.MINE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if (remainTime < 1)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            priceCoin = ConstInfo.getMineInfo().getGemSkipTime(remainTime);

            if (priceCoin < 1)
                result = ErrorConst.INVALID_PRICE;
            else if (priceCoin > request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else if (priceCoin > userControl.getCoin())
                result = ErrorConst.NOT_ENOUGH_COIN;
            else
            {
                result = userControl.purchase(transactionId, priceCoin, PurchaseInfo.skipTime(cmd, remainTime));
                if (result == ErrorConst.SUCCESS)
                {
                    mine.cutoffTime();
                    removeItems = new MapItem (ItemId.COIN, priceCoin);
                    coinChange = -priceCoin;
                }

                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseMineSkipTime(cmd, result).packData(mine.getStatus(), mine.getFinishTime(), userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             mine.getStatus(),
                             mine.getFinishTime()
                            );
    }

    private static void mineReceiveRewards (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        UserGame game = userControl.game;
        Mine mine = game.getMine();

        byte result = ErrorConst.SUCCESS;
//      RequestMineReceiveRewards request = new RequestMineReceiveRewards(dataCmd);

        MapItem reciveItems = null;

        if (!game.isOpenBuildingGame())
            result = ErrorConst.INVALID_ACTION;
        else if (game.getLevel() < MiscInfo.MINE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
            mine.checkFinish();
            if (mine.isFinish())
            {
                reciveItems = mine.getReceiveItems().toUnmodifiableMapItem();
                result = game.checkAndAddItem(cmd, transactionId, reciveItems);
                if (result == ErrorConst.SUCCESS)
                {
                    mine.receiveRewards();

                    if (MiscInfo.PIG_ACTIVE() && game.getPigBank().isActive(game.getLevel()))
                    {
                        game.getPigBank().addDiamond(MiscInfo.PIG_MINE_FINISH_DIAMOND());
                        pigUpdateDiamond(CmdDefine.PIG_UPDATE_DIAMOND, transactionId, userControl, dataCmd);
                    }

                    userControl.markFlagSaveGame();
                }
                else
                    reciveItems = null;
            }
            else
                result = ErrorConst.INVALID_STATUS;
        }

        Message msg = new ResponseMineReceiveRewards(cmd, result).packData(game.getMapItemNum(reciveItems));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             reciveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void gachaOpen (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestGachaOpenChest request = new RequestGachaOpenChest(dataCmd);
        Gacha gacha = game.getGacha();
        Chest chest = null;
        Chest.Slot slot = null;
        MapItem removeItem = new MapItem();
        int price = -1;
        boolean useStock = false;
        String note = "";

        if (game.getLevel() < MiscInfo.GACHA_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (gacha == null)
            result = ErrorConst.NULL_OBJECT;
        else if ((chest = gacha.getChest(request.id)) == null)
            result = ErrorConst.NULL_SLOT;
        else if (game.numStockItem(request.id) > 0) //ưu tiên mở rương bằng vật phẩm trong kho
        {
            note += "Stock.";
            if (chest.isStatusActive() || chest.isStatusInactive()) //chỉ có thể mở rương khi rương chưa được mở
            {
                if ((result = game.removeItem(cmd, transactionId, request.id, 1)) == ErrorConst.SUCCESS)
                {
                    removeItem.increase(request.id, 1);
                    useStock = true;
                }
            }
            else
                result = ErrorConst.BUSY;
        }
        else //mua rương đang active
        {
            note += "Active.";
            price = chest.getPriceTurn();

            if (!chest.isStatusActive())
                result = ErrorConst.NOT_ACTIVE;
            else if (chest.isWaiting())
                result = ErrorConst.TIME_WAIT;
            else if (price != request.priceCoin)
                result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
            else
            {
                if (chest.getPriceType() == null) //mở rương miễn phí
                {
                    note += "Free.";
                    ChestInfo info = ConstInfo.getMapChestInfo().get(request.id);
                    if (info == null)
                        result = ErrorConst.NULL_ITEM_INFO;
                    else if (info.getPriceType() != null)
                        result = ErrorConst.INVALID_PRICE;
                    else
                        result = ErrorConst.SUCCESS;
                }
                else if (chest.getPriceType().equals(ItemId.COIN)) //mở rương bằng xu
                {
                    note += "Coin.";
                    if (price <= 0)
                        result = ErrorConst.INVALID_PRICE;
                    else if (request.clientCoin != userControl.getCoin())
                        result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                        //else if (price > request.priceCoin)
                        //result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                    else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.gacha(cmd, chest.getId(), price))) == ErrorConst.SUCCESS)
                        removeItem.increase(ItemId.COIN, price);
                }
                else
                {
                    note += "Item.";
                    if ((result = game.removeItem(cmd, transactionId, chest.getPriceType(), price)) == ErrorConst.SUCCESS)  //mở rương bằng item
                        removeItem.increase(chest.getPriceType(), price);
                }
            }
        }

        if (result == ErrorConst.SUCCESS)
        {
            chest.open(useStock);
            slot = chest.getWinSlot();

            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseGachaOpenChest(cmd, result).packData(userControl.getCoin(),
                                                                       game.getGold(),
                                                                       game.getReputation(),
                                                                       game.getMapItemNum(removeItem),
                                                                       chest);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             game.getExp(),
                             request.id,
                             slot == null ? "" : slot.id,
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             note
                            );
    }

    private static void gachaGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result;
        UserGame game = userControl.game;

        RequestGachaGetReward request = new RequestGachaGetReward(dataCmd);
        Gacha gacha = game.getGacha();
        Chest chest = null;
        Chest.Slot slot = null;
        MapItem receiveItems = null;

        if (game.getLevel() < MiscInfo.GACHA_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (gacha == null)
            result = ErrorConst.NULL_OBJECT;
        else if ((chest = gacha.getChest(request.id)) == null)
            result = ErrorConst.NULL_SLOT;
        else if (!chest.isOpening())
            result = ErrorConst.INVALID_STATUS;
        else if ((slot = chest.getWinSlot()) == null)
            result = ErrorConst.NULL_SLOT;
        else
        {
            receiveItems = new MapItem();
            receiveItems.increase(slot.id, slot.num);

            if ((result = game.checkAndAddItem(cmd, transactionId, receiveItems)) == ErrorConst.SUCCESS)
            {
                chest.finish();

                userControl.markFlagSaveGame();
            }
            else
            {
                receiveItems = null;
            }
        }

        Message msg = new ResponseGachaGetReward(cmd, result).packData(userControl.getCoin(),
                                                                       game.getGold(),
                                                                       game.getReputation(),
                                                                       game.getMapItemNum(receiveItems),
                                                                       chest);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             game.getExp(),
                             request.id,
                             slot == null ? "" : slot.id
                            );
    }

    private static void eventMergePuzzle (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        UserGame game = userControl.game;

        RequestEventMergePuzzle request = new RequestEventMergePuzzle(dataCmd);
        String eventId = request.eventId;
        String puzzleId = request.puzzleId;

        MapItem removeItem = ConstInfo.getFestival().getPuzzleRequire(eventId, puzzleId);
        MapItem receiveItem = ConstInfo.getFestival().getPuzzleReward(eventId, puzzleId);

        int mailId = -1;
        byte result = ErrorConst.SUCCESS;

        if (removeItem == null || receiveItem == null || receiveItem.isEmpty())
            result = ErrorConst.NULL_OBJECT;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            result = game.removeItem(cmd, transactionId, removeItem);
            if (result == ErrorConst.SUCCESS)
            {
                Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.EV01_PUZ_REWARD_TITLE(), MiscInfo.EV01_PUZ_REWARD_CONTENT(), receiveItem);
                if (mail != null)
                {
                    mailId = mail.getUid();
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                    userControl.markFlagSaveGame();

                    userControl.notifyMail(false);
                }
                else
                {
                    result = ErrorConst.NULL_OBJECT;
                    receiveItem = null;
                }
            }
            else
            {
                removeItem = null;
                receiveItem = null;
            }
        }

        Message msg = new ResponseMergePuzzle(cmd, result).packData(mailId, receiveItem, game.getMapItemNum(removeItem));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             eventId,
                             puzzleId,
                             mailId
                            );
    }

    private static void event01ReceiveRewards (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        Festival festival = game.getFestival();

        final String eventId = ItemId.E1ID;
        Event01Info eventInfo = (Event01Info) ConstInfo.getFestival().getAction(eventId);

        RequestEvent01ReceiveRewards request = new RequestEvent01ReceiveRewards(dataCmd);
        int checkpoint = request.checkpoint;

        int mailId = -1;
        MapItem receiveItem = null;
        String eventPointId = "";
        int eventPointNum = 0;

        byte result = ErrorConst.SUCCESS;
        if (eventInfo == null || !eventInfo.isActive())
            result = ErrorConst.INVALID_ACTION;
        else if (festival.isCheckpointReceived(eventId, checkpoint))
            result = ErrorConst.EMPTY;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            eventPointId = eventInfo.POINT();
            eventPointNum = game.numStockItem(eventPointId);

            if (eventPointNum < checkpoint)
                result = ErrorConst.NOT_ENOUGH_ITEM;
            else
            {
                receiveItem = eventInfo.getRewards(checkpoint, game.getLevel());
                int rewardId = eventInfo.getRewardId(checkpoint, game.getLevel());
                if (rewardId > 0 && receiveItem != null && !receiveItem.isEmpty())
                {
                    Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.EV01_REWARD_TITLE(), MiscInfo.EV01_REWARD_CONTENT(), receiveItem);
                    if (mail != null)
                        mailId = mail.getUid();
                }

                if (mailId == -1)
                {
                    result = ErrorConst.NULL_OBJECT;
                    receiveItem = null;
                }
                else
                {
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                    festival.addRewardReceived(eventId, rewardId);
                    userControl.markFlagSaveGame();

                    userControl.notifyMail(false);
                }
            }
        }

        Message msg = new ResponseEvent01ReceiveRewards(cmd, result).packData(mailId, receiveItem);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             eventId,
                             (eventPointId.isEmpty() ? "unknow" : eventPointId) + ":" + checkpoint,
                             (eventPointId.isEmpty() ? "" : (eventPointId + ":" + eventPointNum)),
                             mailId
                            );
    }

    private final static Pattern PATTERN_MOBI_SERIAL    = Pattern.compile("^[\\d]{15}$");
    private final static Pattern PATTERN_MOBI_CODE      = Pattern.compile("^[\\d]{12,14}$");
    private final static Pattern PATTERN_VINA_SERIAL    = Pattern.compile("^[\\d]{9,14}$");
    private final static Pattern PATTERN_VINA_CODE      = Pattern.compile("^[\\d]{12,14}$");
    private final static Pattern PATTERN_VIETTEL_SERIAL = Pattern.compile("^[\\d]{11,15}$");
    private final static Pattern PATTERN_VIETTEL_CODE   = Pattern.compile("^[\\d]{13,15}$");

    private static void paymentCardSubmit (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        Payment payment = game.getPayment();

        RequestPaymentCardSubmit request = new RequestPaymentCardSubmit(dataCmd);

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(request.item);

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.TYPE() == ItemType.TAB_OFFER && payment.isActiveOffer(paymentInfo, request.offer, game) == false)
            result = ErrorConst.INVALID_OFFER;
        else if (info.SUB_TYPE() != ItemSubType.CARD && info.SUB_TYPE() != ItemSubType.ZING)
            result = ErrorConst.INVALID_ACTION;
        else if (!payment.isActive(info, request.item))
            result = ErrorConst.LIMIT;
        else
        {
            switch (request.channel)
            {
                case MiscDefine.VN_CARD_ZING:
                    if (request.serial.isEmpty())
                        result = ErrorConst.INVALID_SERIAL;
                    else if (request.code.isEmpty())
                        result = ErrorConst.INVALID_CODE;
                    break;
                case MiscDefine.VN_CARD_MOBI:
                    if (!PATTERN_MOBI_SERIAL.matcher(request.serial).matches())
                        result = ErrorConst.INVALID_SERIAL;
                    else if (!PATTERN_MOBI_CODE.matcher(request.code).matches())
                        result = ErrorConst.INVALID_CODE;
                    break;
                case MiscDefine.VN_CARD_VINA:
                    if (!PATTERN_VINA_SERIAL.matcher(request.serial).matches())
                        result = ErrorConst.INVALID_SERIAL;
                    else if (!PATTERN_VINA_CODE.matcher(request.code).matches())
                        result = ErrorConst.INVALID_CODE;
                    break;
                case MiscDefine.VN_CARD_VIETTEL:
                    if (!PATTERN_VIETTEL_SERIAL.matcher(request.serial).matches())
                        result = ErrorConst.INVALID_SERIAL;
                    else if (!PATTERN_VIETTEL_CODE.matcher(request.code).matches())
                        result = ErrorConst.INVALID_CODE;
                    break;
                default:
                    result = ErrorConst.INVALID_CHANNEL;
            }
        }

        if (result == ErrorConst.SUCCESS)
        {
            if (useTestPayment(payment))
            {
                int gross = Integer.parseInt(request.code);
                Card card = Card.createTestCard(brief.getUserId(),
                                                brief.getUsername(),
                                                transactionId,
                                                gross,
                                                gross / paymentInfo.RATE_VND_TO_COIN(),
                                                request.item,
                                                "PZingCard",
                                                Integer.toString(request.channel),
                                                request.offer,
                                                game.getLevel());
                userControl.addCashIAP(card);
                BillingProcessing.process(userControl, card);
                updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);

                CardSubmit.log(userControl.country,
                               cmd,
                               userControl.userId,
                               game.getLevel(),
                               transactionId,
                               result,
                               request.item,
                               request.channel,
                               request.serial,
                               request.code,
                               request.offer,
                               brief.getUsername(),
                               userControl.socialType,
                               userControl.platformID
                              );
            }
            else
            {
                CardSubmit.exec(userControl.country,
                                brief.getUsername(),
                                brief.getUserId(),
                                game.getLevel(),
                                cmd,
                                transactionId,
                                request.item,
                                request.channel,
                                request.serial,
                                request.code,
                                request.offer,
                                userControl.address,
                                userControl.socialType,
                                userControl.platformID);
            }
        }
        else
        {
            Message msg = new ResponsePaymentCardSubmit(cmd, result).packData(request.channel, request.item);
            userControl.send(msg);

            CardSubmit.log(userControl.country,
                           cmd,
                           userControl.userId,
                           game.getLevel(),
                           transactionId,
                           result,
                           request.item,
                           request.channel,
                           request.serial,
                           request.code,
                           request.offer,
                           brief.getUsername(),
                           userControl.socialType,
                           userControl.platformID
                          );
        }
    }

    private static void paymentSmsReg (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {

        byte result;
        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        Payment payment = game.getPayment();
        int amount = 0;

        RequestPaymentSmsReg request = new RequestPaymentSmsReg(dataCmd);

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(request.item);
        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.TYPE() == ItemType.TAB_OFFER && payment.isActiveOffer(paymentInfo, request.offer, game) == false)
            result = ErrorConst.INVALID_OFFER;
        else if (info.SUB_TYPE() != ItemSubType.SMS)
            result = ErrorConst.INVALID_ACTION;
        else if (!payment.isActive(info, request.item))
            result = ErrorConst.LIMIT;
        else
        {
            amount = info.PRICE_VND();
            switch (request.channel)
            {
                case MiscDefine.VN_SMS_MOBI:
                case MiscDefine.VN_SMS_VINA:
                case MiscDefine.VN_SMS_VIETTEL:
                    result = ErrorConst.SUCCESS;
                    break;
                default:
                    result = ErrorConst.INVALID_CHANNEL;
            }
        }

        if (result == ErrorConst.SUCCESS)
        {
            if (useTestPayment(payment))
            {
                Card card = Card.createTestCard(brief.getUserId(),
                                                brief.getUsername(),
                                                transactionId,
                                                amount,
                                                info.COIN(),
                                                request.item,
                                                "PSms",
                                                request.channel,
                                                request.offer,
                                                game.getLevel());
                userControl.addCashIAP(card);
                BillingProcessing.process(userControl, card);
                updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);

                SmsReg.log(userControl.country,
                           cmd,
                           userControl.userId,
                           game.getLevel(),
                           transactionId,
                           result,
                           request.item,
                           request.channel,
                           amount,
                           request.offer,
                           brief.getUsername(),
                           userControl.socialType,
                           userControl.platformID);
            }
            else
            {
                SmsReg.exec(userControl.country,
                            brief.getUsername(),
                            brief.getUserId(),
                            game.getLevel(),
                            cmd,
                            transactionId,
                            request.item,
                            request.channel,
                            amount,
                            request.offer,
                            userControl.address,
                            userControl.socialType,
                            userControl.platformID);
            }
        }
        else
        {
            Message msg = new ResponsePaymentSmsReg(cmd, result).packData(request.channel, request.item, "", "");
            userControl.send(msg);

            SmsReg.log(userControl.country,
                       cmd,
                       userControl.userId,
                       game.getLevel(),
                       transactionId,
                       result,
                       request.item,
                       request.channel,
                       amount,
                       request.offer,
                       brief.getUsername(),
                       userControl.socialType,
                       userControl.platformID
                      );
        }
    }

    private static void paymentAtmReg (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        Payment payment = game.getPayment();
        int amount = 0;

        RequestPaymentAtmReg request = new RequestPaymentAtmReg(dataCmd);

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(request.item);
        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.TYPE() == ItemType.TAB_OFFER && payment.isActiveOffer(paymentInfo, request.offer, game) == false)
            result = ErrorConst.INVALID_OFFER;
        else if (info.SUB_TYPE() != ItemSubType.ATM)
            result = ErrorConst.INVALID_ACTION;
        else if (!payment.isActive(info, request.item))
            result = ErrorConst.LIMIT;
        else
        {
            amount = info.PRICE_VND();
        }

        if (result == ErrorConst.SUCCESS)
        {
            if (useTestPayment(payment))
            {
                Card card = Card.createTestCard(brief.getUserId(),
                                                brief.getUsername(),
                                                transactionId,
                                                amount,
                                                info.COIN(),
                                                request.item,
                                                "PAtm",
                                                request.bankCode,
                                                request.offer,
                                                game.getLevel());
                userControl.addCashIAP(card);
                BillingProcessing.process(userControl, card);
                updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);

                AtmReg.log(userControl.country,
                           cmd,
                           userControl.userId,
                           game.getLevel(),
                           transactionId,
                           result,
                           request.item,
                           request.bankCode,
                           amount,
                           request.offer,
                           brief.getUsername(),
                           userControl.socialType,
                           userControl.platformID
                          );
            }
            else
            {
                AtmReg.exec(userControl.country,
                            brief.getUsername(),
                            brief.getUserId(),
                            game.getLevel(),
                            cmd,
                            transactionId,
                            request.item,
                            request.bankCode,
                            amount,
                            request.offer,
                            userControl.address,
                            userControl.socialType,
                            userControl.platformID);
            }
        }
        else
        {
            Message msg = new ResponsePaymentAtmReg(cmd, result).packData(request.bankCode, request.item, "");
            userControl.send(msg);

            AtmReg.log(userControl.country,
                       cmd,
                       userControl.userId,
                       game.getLevel(),
                       transactionId,
                       result,
                       request.item,
                       request.bankCode,
                       amount,
                       request.offer,
                       brief.getUsername(),
                       userControl.socialType,
                       userControl.platformID
                      );
        }
    }

    private static void paymentGoogleCheck (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;
        Payment payment = game.getPayment();

        RequestPaymentGoogleCheck request = new RequestPaymentGoogleCheck(dataCmd);

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(request.item);
        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.SUB_TYPE() != ItemSubType.IAP)
            result = ErrorConst.INVALID_ACTION;
        else if (!payment.isActive(info, request.item))
            result = ErrorConst.LIMIT;
        else
        {
            if (info.TYPE() == ItemType.TAB_OFFER)
            {
                if (payment.isActiveOffer(paymentInfo, request.offer, game))
                {
                    game.addCheckOffer(request.item, request.offer);
                    userControl.markFlagSaveGame();
                    result = ErrorConst.SUCCESS;
                }
                else
                    result = ErrorConst.INVALID_OFFER;
            }
            else
            {
                request.offer = null;
                result = ErrorConst.SUCCESS;
            }
        }

        Message msg = new ResponsePaymentGoogleCheck(cmd, result).packData(game.getPayment());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.item,
                             request.offer
                            );
    }

    private static void paymentGoogleSubmit (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        boolean isFinished = true;

        String orderId = null;
        long purchaseTime = -1;
        String productId = null;
        String packageName = null;

        RequestPaymentGoogleSubmit request = new RequestPaymentGoogleSubmit(dataCmd);
        if (request.data.isEmpty() || request.sign.isEmpty() || request.packageName.isEmpty())
            result = ErrorConst.EMPTY;
        else
        {
            try
            {
                JsonObject json = Json.parse(request.data).getAsJsonObject();

                productId = json.get("productId").getAsString();
                orderId = json.get("orderId").getAsString();
                packageName = json.get("packageName").getAsString();
                purchaseTime = json.get("purchaseTime").getAsLong() / 1000;

                int curTime = Time.getUnixTime();
                if (purchaseTime + EnvConfig.getIap().getExpireTime() < curTime)
                    result = ErrorConst.TIMEOUT;
                else if (!packageName.equals(request.packageName))
                    result = ErrorConst.INVALID_TYPE;
                else if (GoogleTransaction.exist(orderId))
                    result = ErrorConst.INVALID_STATUS;
                else
                {
                    result = ErrorConst.SUCCESS;

                    if (EnvConfig.environment() == EnvConfig.Environment.LOCAL)
                    {

                        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
                        PaymentInfo.Item itemInfo = paymentInfo.getItem(productId);

                        Card card = Card.createGoogle(brief.getUserId(),
                                                      brief.getUsername(),
                                                      purchaseTime,
                                                      transactionId,
                                                      orderId.substring(4),
                                                      itemInfo.PRICE_VND(),
                                                      itemInfo.COIN(),
                                                      productId,
                                                      request.offer,
                                                      game.getLevel(),
                                                      game.getCountry(),
                                                      userControl.socialType,
                                                      userControl.platformID);

                        userControl.addCashIAP(card);
                        BillingProcessing.process(userControl, card);
                        updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);

                        GoogleSubmit.log(userControl.country,
                                         cmd,
                                         userControl.userId,
                                         game.getLevel(),
                                         transactionId,
                                         result,
                                         request.packageName,
                                         request.data,
                                         request.sign,
                                         request.offer,
                                         isFinished,
                                         0,
                                         productId,
                                         orderId,
                                         productId,
                                         purchaseTime,
                                         "",
                                         "",
                                         request.offer,
                                         brief.getUsername(),
                                         userControl.socialType,
                                         userControl.platformID);
                    }
                    else
                    {
                        GoogleSubmit.exec(brief.getUsername(),
                                          brief.getUserId(),
                                          game.getLevel(),
                                          cmd,
                                          transactionId,
                                          request.packageName,
                                          request.data,
                                          request.sign,
                                          request.offer,
                                          game.getCountry(),
                                          userControl.socialType,
                                          userControl.platformID);
                    }
                }
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
                result = ErrorConst.EXCEPTION;
            }
        }

        if (result != ErrorConst.SUCCESS)
        {
            Message msg = new ResponsePaymentGoogleSubmit(cmd, result).packData(isFinished);
            userControl.send(msg);

            GoogleSubmit.log(userControl.country,
                             cmd,
                             userControl.userId,
                             game.getLevel(),
                             transactionId,
                             result,
                             request.packageName,
                             request.data,
                             request.sign,
                             request.offer,
                             isFinished,
                             orderId,
                             productId,
                             purchaseTime,
                             brief.getUsername(),
                             userControl.socialType,
                             userControl.platformID
                            );
        }
    }

    private static void tutorialSave (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestTutorialSave request = new RequestTutorialSave(dataCmd);
        int skipId = request.skipId;

        game.tutorial = request.data;
        game.tutorialFlow = request.tutorialFlow;
        userControl.markFlagSaveGame();

        Message msg = new ResponseTutorialSave(cmd, result).packData();
        userControl.send(msg);

//      TODO: add log
        if (skipId > 0)
            MetricLog.tutorial(userControl.country,
                               userControl.userId,
                               game.getLevel(),
                               skipId,
                               false,
                               -1,
                               game.tutorialFlow);
    }

    private static void tutorialStep (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        UserGame game = userControl.game;
        HashMap<Integer, Integer> tutorial_step = game.tutorial_step;

        RequestTutorialStep request = new RequestTutorialStep(dataCmd);

        int repeat = tutorial_step.containsKey(request.step) ? tutorial_step.get(request.step) : 0;
        repeat += 1;

        tutorial_step.put(request.step, repeat);
        game.tutorialFlow = request.tutorialFlow;
//      client can be crash and it may be spam this log
        if (repeat < 10)
            MetricLog.tutorial(userControl.country,
                               userControl.userId,
                               game.getLevel(),
                               request.step,
                               request.isStart,
                               repeat,
                               game.tutorialFlow);
    }

    private static void friendBugGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestFriendBugGet request = new RequestFriendBugGet(dataCmd);
        FriendBug friendBug = game.getFriendBug();
        friendBug.reset(game.getLevel(), request.friendId);

        if (friendBug.isChanged())
            userControl.markFlagSaveGame();

        Message msg = new ResponseFriendBugGet(cmd, result).packData(request.friendId, friendBug.getBugs());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             friendBug.getStatus(),
                             request.friendId,
                             friendBug.isChanged()
                            );
    }

    private static void friendBugCatch (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        RequestFriendBugCatch request = new RequestFriendBugCatch(dataCmd);
        FriendBug friendBug = game.getFriendBug();
        MapItem removeItems = null;
        MapItem receiveItems = null;

        if (!friendBug.hasBug(request.id))
            result = ErrorConst.INVALID_ACTION;
        else
        {
            if (!friendBug.catchBug(game.getLevel(), request.id))
                result = ErrorConst.FAIL;
            else
            {
                removeItems = new MapItem();
                removeItems.increase(ItemId.VOT_XANH, 1);

                if ((result = game.removeItem(cmd, transactionId, removeItems)) == ErrorConst.SUCCESS)
                {
                    receiveItems = new MapItem();
                    receiveItems.increase(request.id, 1);
                    receiveItems.increase(festival.collectEP(game, cmd, request.id));
                    receiveItems.increase(fishing.collectEP(game, cmd, request.id));

                    game.addItem(cmd, transactionId, receiveItems);
                }
                else
                {
                    removeItems = null;
                }
            }
            userControl.markFlagSaveGame();
        }

        userControl.markFlagSaveGame();

        if (friendBug.isChanged())
            userControl.markFlagSaveGame();

        Message msg = new ResponseFriendBugCatch(cmd, result).packData(request.id, friendBug.getBugs(), game.getMapItemNum(receiveItems, removeItems), receiveItems);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_CATCH_BUG(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             friendBug.getStatus(),
                             friendBug.getId(),
                             request.id
                            );
    }

    private static void jackMachineRepair (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        RequestJackMachineRepair request = new RequestJackMachineRepair(dataCmd);
        byte[] jackMachine = game.getJackMachine();
        MachineInfo mInfo = ConstInfo.getMachineInfo(request.iFloor);
        MachineInfo.Level lvInfo;
        MapItem receiveItems = null;
        MapItem removeItems = null;

        JackGardenInfo.Machine info = ConstInfo.getJackGardenInfo().getMachine(game.getLevel());

        if (mInfo == null)
            result = ErrorConst.NULL_OBJECT;
        else if (request.iFloor < 0 || request.iFloor >= jackMachine.length)
            result = ErrorConst.INVALID_SLOT_ID;
        else if (jackMachine[request.iFloor] > 0)
            result = ErrorConst.INVALID_STATUS;
        else if (request.num <= 0 || request.num > info.DURABILITY_MAX())
            result = ErrorConst.INVALID_NUM;
        else if ((lvInfo = mInfo.getLevel(request.level)) == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else
        {
            int price = Math.max(1, request.num * lvInfo.GOLD_MAINTAIN * MiscInfo.RATE_PRICE_REPAIR_FRIEND_MACHINE() / 100);
            int reputation = jackMachine[request.iFloor] < 0 ? request.num * 2 : request.num;

            if (game.getFriendReputation() + reputation > UserLevelInfo.FRIEND_REPU_DAILY_LIMIT(game.getLevel()))
                result = ErrorConst.LIMIT_DAY;
            else
            {
                receiveItems = new MapItem();
                receiveItems.increase(ItemId.REPU, reputation);
                receiveItems.increase(festival.collectEP(game, CmdDefine.FRIEND_REPAIR_MACHINE, request.iFloor));

                receiveItems.increase(fishing.collectEP(game, CmdDefine.FRIEND_REPAIR_MACHINE, request.iFloor));
                removeItems = new MapItem();
                removeItems.increase(ItemId.GOLD, price);

                if ((result = game.removeAndAddItem(cmd, transactionId, removeItems, receiveItems)) == ErrorConst.SUCCESS)
                {
                    jackMachine[request.iFloor] = 1;
                    game.addFriendReputation(reputation);
                    userControl.markFlagSaveGame();
                }
                else
                {
                    receiveItems = null;
                    removeItems = null;
                }
            }
        }

        Message msg = new ResponseJackMachineRepair(cmd, result).packData(game.getGold(),
                                                                          jackMachine,
                                                                          game.getReputation(),
                                                                          game.getMapItemNum(receiveItems),
                                                                          receiveItems);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_MACHINE_REPAIR(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloor,
                             request.level,
                             request.num
                            );
    }

    private static void friendGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        FriendList myFriends = userControl.getFriendList();
        myFriends.update();
        Message msg = new ResponseFriendGet(cmd, ErrorConst.SUCCESS).packData(myFriends);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             myFriends == null ? -1 : myFriends.getTimeSuggest(),
                             myFriends == null ? -1 : myFriends.numFriend(),
                             myFriends == null ? -1 : myFriends.numSuggest(),
                             myFriends == null ? -1 : myFriends.numRequest()
                            );
    }

    private static void friendAdd (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;

        RequestFriendAdd request = new RequestFriendAdd(dataCmd);
        FriendList myFriends;
        List<Byte> listResult = new ArrayList<>();
        List<Integer> listSuccess = new ArrayList<>();

        if (request.uids == null || request.uids.length == 0)
            result = ErrorConst.EMPTY;
        else if ((myFriends = userControl.loadFriendList()) == null)
            result = ErrorConst.NULL_OBJECT;
        else if (myFriends.numFriend() >= MiscInfo.FRIEND_LIMIT())
            result = ErrorConst.LIMIT;
        else
        {
            result = ErrorConst.SUCCESS;
            FriendInfo myInfo = game.toFriendInfo();
            for (int fId : request.uids)
            {
                FriendInfo fInfo = myFriends.getRequest(fId);
                if (fInfo == null)
                {
                	listResult.add (ErrorConst.INVALID_ID);
                    continue;
                }
                
                UserBrief fBrief = UserBrief.get(fId);
                if (fBrief == null)
                {
                	listResult.add (ErrorConst.NULL_USER);
                    continue;
                }
                
                CasValue<FriendList> frCas = FriendList.gets(fBrief.getBucketId(), fId);
                FriendList frFriends = frCas.object;
                frFriends.addFriend(myInfo);

                if (FriendList.cas(fBrief.getBucketId(), fId, frCas.cas, frFriends))
                {
                    myFriends.addFriend(fInfo);
                	listResult.add (ErrorConst.SUCCESS);
                    listSuccess.add(fId);
                }
                else
                	listResult.add (ErrorConst.CAS_FAIL);
            }

            if (listSuccess.size() > 0)
                FriendList.set(userControl.brief.getBucketId(), game.getUserId(), myFriends);
        }

        Message msg = new ResponseFriendAdd(cmd, result).packData(listSuccess);
        userControl.send(msg);


        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids == null ? "" : MetricLog.toString(request.uids)
                            );
        else
        for (int i = 0; i < request.uids.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             listResult.get(i).byteValue(),
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids [i]
                            );

        //send udp
        for (int fId : listSuccess)
            UdpHandler.sendFriendAdd(game.getUserId(), fId);
    }

    private static void friendRemove (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;

        RequestFriendRemove request = new RequestFriendRemove(dataCmd);
        FriendList myFriends;
        
        List<Byte> listResult = new ArrayList<>();
        List<Integer> listSuccess = new ArrayList<>();

        if (request.uids == null || request.uids.length == 0)
            result = ErrorConst.EMPTY;
        else if ((myFriends = userControl.loadFriendList()) == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            result = ErrorConst.SUCCESS;
            for (int fId : request.uids)
            {
                if (!myFriends.hasFriend(fId))
                {
                	listResult.add(ErrorConst.INVALID_ID);
                	continue;
                }
                
                UserBrief fBrief = UserBrief.get(fId);
                if (fBrief == null)
                {
                	listResult.add(ErrorConst.NULL_USER);
                	continue;
                }
                
                CasValue<FriendList> frCas = FriendList.gets(fBrief.getBucketId(), fId);
                FriendList fFriendList = frCas.object;
                fFriendList.removeFriend(game.getUserId());

                if (FriendList.cas(fBrief.getBucketId(), fId, frCas.cas, fFriendList))
                {
                    myFriends.removeFriend(fId);
                	listResult.add(ErrorConst.SUCCESS);
                    listSuccess.add(fId);
                }
                else
                	listResult.add(ErrorConst.CAS_FAIL);
            }

            if (listSuccess.size() > 0)
                FriendList.set(userControl.brief.getBucketId(), game.getUserId(), myFriends);
        }

        Message msg = new ResponseFriendRemove(cmd, result).packData(listSuccess);
        userControl.send(msg);
        
        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids == null ? "" : MetricLog.toString(request.uids)
                            );
        else
        for (int i = 0; i < request.uids.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             listResult.get(i).byteValue(),
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids [i]
                            );

        //send udp
        for (int fId : listSuccess)
            UdpHandler.sendFriendRemove(game.getUserId(), fId);
    }

    private static void friendSendRequest (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;

        RequestFriendSendRequest request = new RequestFriendSendRequest(dataCmd);
        FriendList myFriends;
        List<Byte> listResult = new ArrayList<>();
        List<Integer> listSuccess = new ArrayList<>();

        if (request.uids == null || request.uids.length == 0)
            result = ErrorConst.EMPTY;
        else if ((myFriends = userControl.loadFriendList()) == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            result = ErrorConst.SUCCESS;
            FriendInfo uFriendInfo = game.toFriendInfo();

            for (int i = 0; i < request.uids.length; i++)
            {
            	int id = request.uids [i];
                if (id <= 0 || id == game.getUserId() || myFriends.hasFriend(id))
                {
                	listResult.add (ErrorConst.INVALID_ID);
                    continue;
                }
                
                UserBrief frBrief = UserBrief.get(id);
                if (frBrief == null)
                {
                	listResult.add (ErrorConst.NULL_USER);
                    continue;
                }
                
                CasValue<FriendList> frCas = FriendList.gets(frBrief.getBucketId(), id);
                FriendList fFriendList = frCas.object;
                if (fFriendList == null)
                {
                	listResult.add (ErrorConst.GETS_FAIL);
                    continue;
                }
                
                fFriendList.addRequest(uFriendInfo);

                if (FriendList.cas(frBrief.getBucketId(), id, frCas.cas, fFriendList))
                {
                	listResult.add (ErrorConst.SUCCESS);
                    myFriends.removeSuggest(id);
                    listSuccess.add(id);
                }
                else
                	listResult.add (ErrorConst.CAS_FAIL);
            }

            if (listSuccess.size() > 0)
                FriendList.set(userControl.brief.getBucketId(), game.getUserId(), myFriends);
        }

        Message msg = new ResponseFriendRequest(cmd, result).packData(listSuccess);
        userControl.send(msg);

        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids == null ? "" : MetricLog.toString(request.uids)
                            );
        else
        for (int i = 0; i < request.uids.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             listResult.get(i).byteValue(),
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids [i]
                            );

        //send udp
        for (int fId : listSuccess)
            UdpHandler.sendFriendRequest(game.getUserId(), fId);
    }

    private static void friendDenyRequest (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;

        RequestFriendDenyRequest request = new RequestFriendDenyRequest(dataCmd);
        FriendList uFriendList;
        List<Integer> listSuccess = new ArrayList<>();
        List<Byte> listResult = new ArrayList<>();

        if (request.uids == null || request.uids.length == 0)
            result = ErrorConst.EMPTY;
        else if ((uFriendList = userControl.loadFriendList()) == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            result = ErrorConst.SUCCESS;
            for (int id : request.uids)
            {
                boolean isSuccess = uFriendList.removeRequest(id);
                if (isSuccess)
                	listSuccess.add(id);
                
                listResult.add(isSuccess ? ErrorConst.SUCCESS : ErrorConst.FAIL);
            }
            
            if (listSuccess.size() > 0)
                FriendList.set(userControl.brief.getBucketId(), game.getUserId(), uFriendList);
        }

        Message msg = new ResponseFriendDenyRequest(cmd, result).packData(listSuccess);
        userControl.send(msg);
        
        if (result != ErrorConst.SUCCESS)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids == null ? "" : MetricLog.toString(request.uids)
                            );
        else
        for (int i = 0; i < request.uids.length; i++)
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             listResult.get(i).byteValue(),
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.uids [i]
                            );
    }

    private static void friendNotifyAdd (short cmd, UserControl userControl, MsgFriendNotifyAdd notify) throws Exception
    {


        FriendList myFriends = userControl.loadFriendList();
        Message msg = new ResponseFriendNotifyAdd(cmd, ErrorConst.SUCCESS).packData(myFriends, notify.friendId);
        userControl.send(msg);
    }

    private static void friendNotifyRemove (short cmd, UserControl userControl, MsgFriendNotifyRemove notify) throws Exception
    {


        FriendList myFriends = userControl.loadFriendList();
        Message msg = new ResponseFriendNotifyRemove(cmd, ErrorConst.SUCCESS).packData(myFriends, notify.friendId);
        userControl.send(msg);
    }

    private static void friendNotifyRequest (short cmd, UserControl userControl, MsgFriendNotifyRequest notify) throws Exception
    {


        FriendList myFriends = userControl.loadFriendList();
        Message msg = new ResponseFriendNotifyRequest(cmd, ErrorConst.SUCCESS).packData(myFriends, notify.friendId);
        userControl.send(msg);
    }

    private static void friendVisit (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {

        byte result;
        UserGame game = userControl.game;

        RequestFriendVisit request = new RequestFriendVisit(dataCmd);
        Message msg = null;
        int friendId = request.friendId;
        String bucket = null;

        if (friendId <= 0 || friendId == game.getUserId())
            result = ErrorConst.INVALID_ID;
        else
        {
            bucket = userControl.getFriendList().getFriendBucket(friendId);
            if (!BucketManager.containsBucket(bucket))
            {
                UserBrief brief = UserBrief.get(friendId);
                if (brief != null)
                    bucket = brief.getBucketId();
            }

            if (!BucketManager.containsBucket(bucket))
                result = ErrorConst.INVALID_STATUS;
            else
            {
                ArrayList<String> keys = new ArrayList<>();
                keys.add(InfoKeyUser.GAME.keyName(friendId));
                keys.add(InfoKeyUser.GUILD.keyName(friendId));
                keys.add(InfoKeyUser.PRIVATE_SHOP.keyName(friendId));
                keys.add(InfoKeyUser.AIR_SHIP.keyName(friendId));
                keys.add(InfoKeyUser.INTERACTIVE.keyName(friendId));

                Map<String, Object> mapData = BucketManager.get(bucket).getMulti(keys);

                UserGame frGame = UserGame.get(bucket, friendId, mapData, null);
                UserGuild frGuild = UserGuild.get(bucket, friendId);
                PrivateShop frShop = PrivateShop.get(friendId, mapData);
                AirShip frShip = AirShip.get(friendId, mapData);

                if (frGame == null)
                    result = ErrorConst.NULL_USER_GAME;
                else if (frShop == null)
                    result = ErrorConst.NULL_PRIVATE_SHOP;
                else
                {
                    frGame.interactive = Interactive.get(friendId, mapData);
                    if (frShip == null)
                    {
                        frShip = AirShip.create(friendId);
                    }
                    else
                    {
                        frShip.friendUpdate();
                        frShip.replaceEventItems(game.getEventItemsFriendPack());
                    }

                    FriendBug friendBug = game.getFriendBug();
                    friendBug.reset(game.getLevel(), request.friendId);

                    if (friendBug.isChanged())
                        userControl.markFlagSaveGame();

                    int guildId = frGuild == null ? -1 : frGuild.getId();

                    result = ErrorConst.SUCCESS;
                    msg = new ResponseFriendVisit(cmd, result).packData(frGame, frShop, frShip, friendBug.getBugs(), guildId);
                }
            }
        }

        if (msg == null)
            msg = new ResponseFriendVisit(cmd, result);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             friendId,
                             bucket
                            );
    }

    private static void friendRepairMachine (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        byte result;
        UserGame game = userControl.game;
        Festival festival = game.getFestival();
        Fishing fishing = game.getFishing();

        RequestFriendRepairMachine request = new RequestFriendRepairMachine(dataCmd);
        Machine machine = null;
        MapItem removeItem = null;
        MapItem dropItem = null;
        int friendId = request.friendId;
        int goldChange = 0;

        if (friendId <= 0 || friendId == game.getUserId())
            result = ErrorConst.INVALID_ID;
        else if (request.iFloor < 0 || request.num <= 0)
            result = ErrorConst.INVALID_NUM;
        else if (game.getFriendReputation() + request.num > UserLevelInfo.FRIEND_REPU_DAILY_LIMIT(game.getLevel()))
            result = ErrorConst.LIMIT_DAY;
        else
        {
            String bucket = null;
            UserBrief brief = UserBrief.get(friendId);
            if (brief != null)
                bucket = brief.getBucketId();

            ArrayList<String> keys = new ArrayList<>();
            keys.add(InfoKeyUser.GAME.keyName(friendId));
            keys.add(InfoKeyUser.INTERACTIVE.keyName(friendId));

            Map<String, Object> mapData = BucketManager.get(bucket).getMulti(keys);

            UserGame frGame = UserGame.get(bucket, friendId, mapData, null);

            if (frGame == null)
                result = ErrorConst.NULL_USER_GAME;
            else
            {
                frGame.interactive = Interactive.get(friendId, mapData);
                machine = frGame.getMachine(request.iFloor);
                if (machine == null)
                    result = ErrorConst.NULL_OBJECT;
                else if (machine.needRepair() < request.num)
                    result = ErrorConst.INVALID_NUM;
                else if (!frGame.interactive.setMachineRepair(request.iFloor, request.num, request.friendId, game.avatar))
                    result = ErrorConst.INVALID_STATUS;
                else
                {
                    int price = Math.max(1, request.num * machine.info.getLevel(machine.getLevel()).GOLD_MAINTAIN * MiscInfo.RATE_PRICE_REPAIR_FRIEND_MACHINE() / 100);
                    if (game.removeItem(cmd, transactionId, ItemId.GOLD, price) != ErrorConst.SUCCESS)
                        result = ErrorConst.NOT_ENOUGH_GOLD;
                    else
                    {
                        dropItem = new MapItem();
                        dropItem.increase(ItemId.REPU, request.num);
                        game.addUpgradeItem(ItemType.MACHINE, dropItem);
                        game.addFriendReputation(request.num);
                        dropItem.increase(festival.collectEP(game, cmd, request.iFloor));
                        dropItem.increase(fishing.collectEP(game, cmd, request.iFloor));

                        result = ErrorConst.SUCCESS;
                        dropItem = game.skipAndAddItem(cmd, transactionId, dropItem);
                        removeItem = new MapItem (ItemId.GOLD, price);
                        goldChange = -price;

                        Interactive.set(bucket, friendId, frGame.interactive);
                        UdpHandler.notifyRepairMachine(friendId, request.iFloor);
                        userControl.markFlagSaveGame();
                    }
                }
            }
        }

        Message msg = new ResponseFriendRepairMachine(cmd, result).packData(request.iFloor,
                                                                            machine,
                                                                            game.getGold(),
                                                                            game.getReputation(),
                                                                            game.getMapItemNum(dropItem),
                                                                            dropItem);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_MACHINE_REPAIR(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             dropItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             goldChange,
                             game.getReputation(),
                             request.friendId,
                             request.iFloor,
                             request.num
                            );
    }

    private static void notifyRepairMachine (short cmd, UserControl userControl, MsgNotifyRepairMachine request) throws Exception
    {

        UserGame game = userControl.game;

        userControl.loadInteractive();
        Machine machine = game.getMachine(request.floor);

        Message msg = new ResponseNotifyRepairMachine(cmd, ErrorConst.SUCCESS).packData(request.floor, machine);
        userControl.send(msg);

        Debug.info(CmdName.get(cmd), request.floor);
    }

    private static void machineUpdateFriendRepair (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestMachineUpdateFriendRepair request = new RequestMachineUpdateFriendRepair(dataCmd);

        byte result;
        UserGame game = userControl.game;

        Machine machine = game.getMachine(request.iFloor);
        Interactive.MachineRepair repair;

        if (machine == null)
            result = ErrorConst.NULL_MACHINE;
        else if (machine.info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if ((repair = game.interactive.getMachineRepair(request.iFloor)) == null)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            result = ErrorConst.SUCCESS;

            machine.repair(repair.num);
            game.interactive.setExpireMachineRepair(request.iFloor);
            Interactive.set(userControl.brief.getBucketId(), game.getUserId(), game.interactive);

            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseMachineUpdateFriendRepair(cmd, result).packData(request.iFloor, machine);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.iFloor
                            );
    }

    private static void achievementSave (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestAchievementSave request = new RequestAchievementSave(dataCmd);


        byte result;
        UserGame game = userControl.game;
        boolean isChanged = false;

        if (!MiscInfo.ACHIEVEMENT_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (request.ids.length == 0 || request.ids.length != request.points.length)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            result = ErrorConst.SUCCESS;
            Achievement achievement = game.getAchievement();
            for (int i = 0; i < request.ids.length; i++)
            {
                int id = request.ids[i];
                AchievementInfo.Task info = AchievementInfo.getTask(id);
                if (info == null)
                {
                    Debug.info("achievementSave", id, "Null Info");
                    request.points[i] = 0;
                    continue;
                }
                Achievement.Task task = achievement.getTask(id);
                if (task == null)
                {
                    Debug.info("achievementSave", id, "Null Task");
                    request.points[i] = 0;
                    continue;
                }

                AchievementInfo.Target target = info.getTarget(task.getLevel());
                if (target == null)
                {
                    Debug.info("achievementSave", id, task.getLevel(), "Null target");
                    request.points[i] = 0;
                    continue;
                }

                isChanged |= task.setPoint(request.points[i]);
                request.points[i] = task.getPoint();

                Debug.info("achievementSave", id, task.getLevel(), request.points[i]);
            }

            if (isChanged)
                userControl.markFlagSaveGame();
        }

        Message msg = new ResponseAchievementSave(cmd, result).packData(request.ids, request.points);
        userControl.send(msg);

        Debug.info(CmdName.get(cmd), result);
    }

    private static void achievementFinish (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestAchievementFinish request = new RequestAchievementFinish(dataCmd);
        
        byte result;
        UserGame game = userControl.game;

        Achievement achievement = game.getAchievement();
        AchievementInfo.Task info = AchievementInfo.getTask(request.id);
        Achievement.Task task = achievement.getTask(request.id);
        AchievementInfo.Target target;
        MapItem receiveItems = null;

        if (!MiscInfo.ACHIEVEMENT_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (task == null)
            result = ErrorConst.NULL_OBJECT;
        else if ((target = info.getTarget(task.getLevel())) == null)
            result = ErrorConst.LIMIT_LEVEL;
        else if (task.getPoint() < target.POINT())
            result = ErrorConst.NOT_ENOUGH_ITEM;
        else if ((result = game.checkAndAddItem(cmd, transactionId, target.REWARDS())) == ErrorConst.SUCCESS)
        {
            task.finish();
            achievement.addTrophy(target.TROPHY());

            receiveItems = target.REWARDS();
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseAchievementFinish(cmd, result).packData(request.id,
                                                                          userControl.getCoin(),
                                                                          game.getExp(),
                                                                          game.getGold(),
                                                                          game.getReputation(),
                                                                          game.getMapItemNum(receiveItems));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             request.id
                            );
    }

    private static void achievementTrophyReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestAchievementTrophyReward request = new RequestAchievementTrophyReward(dataCmd);
    	
        byte result;
        UserGame game = userControl.game;

        Achievement achievement = game.getAchievement();
        int nextPoint = -1;
        MapItem receiveItems = null;

        if (!MiscInfo.ACHIEVEMENT_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (achievement.getTrophy() <= achievement.getReward())
            result = ErrorConst.INVALID_ACTION;
        else if ((nextPoint = AchievementInfo.getNextTrophyReward(achievement.getReward())) <= 0)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (nextPoint > achievement.getTrophy())
            result = ErrorConst.NOT_ENOUGH_ITEM;
        else
        {
            MapItem reward = AchievementInfo.getTrophyReward(nextPoint);
            if ((result = game.checkAndAddItem(cmd, transactionId, reward)) == ErrorConst.SUCCESS)
            {
                receiveItems = reward;
                achievement.setReward(nextPoint);

                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseAchievementTrophyReward(cmd, result).packData(nextPoint,
                                                                                userControl.getCoin(),
                                                                                game.getGold(),
                                                                                game.getReputation(),
                                                                                game.getMapItemNum(receiveItems));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             nextPoint
                            );
    }

    private static void giftCodeGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestGiftCodeGetReward request = new RequestGiftCodeGetReward(dataCmd);

        byte result;
        UserGame game = userControl.game;
        MailBox mailBox;
        Mail mail = null;

        GiftCode giftCode = game.getGiftCode();

        if (!MiscInfo.GIFTCODE_ACTIVE())
            result = ErrorConst.INVALID_ACTION;
        else if (request.id == null || request.id.isEmpty())
            result = ErrorConst.EMPTY;
        else if (request.id.length() <= GenerateGiftCode.HEADER_LEN)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            request.id = request.id.toUpperCase();

            GiftCodeInfo.Multiple mInfo = GiftCodeInfo.getMultiple(request.id);
            GiftCodeInfo.Single sInfo;
            if (mInfo != null)
            {
                if (!mInfo.isActive())
                    result = ErrorConst.TIMEOUT;
                else if (!giftCode.canUseMultipleCode(request.id))
                    result = ErrorConst.BUSY;
                else
                {
                    mailBox = userControl.loadAndUpdateMailBox();
                    mail = mailBox.addMailPrivate(MiscDefine.MAIL_GIFTCODE, mInfo.getTitle(), mInfo.getContent(), mInfo.getRewards());
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

                    giftCode.addMultipleCode(request.id);

                    result = ErrorConst.SUCCESS;
                    userControl.markFlagSaveGame();

                    GiftCodeUsed.increment(request.id);
                }
            }
            else if ((sInfo = GiftCodeInfo.getSingle(request.id.substring(0, GenerateGiftCode.HEADER_LEN))) != null)
            {
                if (!sInfo.isActive())
                    result = ErrorConst.TIMEOUT;
                else if (giftCode.isLimitSingleCode(sInfo))
                    result = ErrorConst.LIMIT;
                else if (!giftCode.canUseSingleCode(sInfo, request.id))
                    result = ErrorConst.BUSY;
                else if (!GenerateGiftCode.checkCode(request.id))
                    result = ErrorConst.INVALID_SERIAL;
                else if (!GiftCodeSingle.delete(request.id))
                    result = ErrorConst.INVALID_ID;
                else
                {
                    mailBox = userControl.loadAndUpdateMailBox();
                    mail = mailBox.addMailPrivate(MiscDefine.MAIL_GIFTCODE, sInfo.getTitle(), sInfo.getContent(), sInfo.getRewards());
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

                    giftCode.addSingleCode(sInfo, request.id);

                    result = ErrorConst.SUCCESS;
                    userControl.markFlagSaveGame();

                    GiftCodeUsed.increment(sInfo.getGroup());
                }
            }
            else
                result = ErrorConst.NULL_ITEM_INFO;
        }

        Message msg = new ResponseGiftCodeGetReward(cmd, result).packData(request.id, userControl.getMailBox());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             request.id,
                             mail == null ? -1 : mail.getUid()
                            );
    }

    private static void paymentGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        Payment payment = game.getPayment();
        payment.update(transactionId, game);

        Message msg = new ResponsePaymentGet(cmd, result).packData(payment);
        userControl.send(msg);
    }

    private static void cloudSkinApply (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestCloudSkinApply request = new RequestCloudSkinApply(dataCmd);
        int floorId = request.floorId;
        String itemId = request.itemId;
        int itemNum = request.itemNum;

        UserGame game = userControl.game;

        SkinInfo skin = ConstInfo.getSkinInfo(itemId);
        Floor floor = game.getFloor(floorId);

        MapItem removeItems = null;
        byte result;

        if (!MiscInfo.CLOUD_SKIN_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.CLOUD_SKIN_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (floor == null)
            result = ErrorConst.INVALID_FLOOR;
        else if (skin == null)
            result = ErrorConst.NULL_OBJECT;
        else if (skin.COMBO_ID().isEmpty())
            result = ErrorConst.INVALID_ITEM;
        else if (itemNum != game.numStockItem(itemId))
            result = ErrorConst.INVALID_ACTION;
        else
        {
            removeItems = new MapItem();
            removeItems.increase(itemId, 1);

            result = game.removeItem(cmd, transactionId, removeItems);
            if (result == ErrorConst.SUCCESS)
            {
                floor.applySkin(skin);
                game.getComboManager().update();
                userControl.markFlagSaveGame();
            }
            else
            {
                removeItems = null;
            }
        }

        Message msg = new ResponseCloudSkinApply(cmd, result).packData(floorId, floor == null ? null : floor.getSkin(), game.getMapItemNum(removeItems));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             removeItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.floorId,
                             request.itemId
                            );
    }

    private static void cloudSkinClear (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestCloudSkinClear request = new RequestCloudSkinClear(dataCmd);
        int floorId = request.floorId;


        UserGame game = userControl.game;

        Floor floor = game.getFloor(floorId);

        byte result = ErrorConst.SUCCESS;

        if (!MiscInfo.CLOUD_SKIN_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.CLOUD_SKIN_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (floor == null)
            result = ErrorConst.INVALID_FLOOR;
        else if (!floor.hasSkin())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            floor.clearSkin();
            game.getComboManager().update();
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseCloudSkinClear(cmd, result).packData(floorId, floor == null ? null : floor.getSkin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.floorId
                            );
    }

    private static void questBookGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        QuestBook questBook = game.getQuestBook();

        if (!MiscInfo.QUEST_BOOK_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_BOOK_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (questBook == null)
            result = ErrorConst.NULL_OBJECT;
        else
            questBook.update(game);

        Message msg = new ResponseQuestBookGet(cmd, result).packData(questBook);
        userControl.send(msg);
    }

    private static void questBookSave (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestQuestBookSave request = new RequestQuestBookSave(dataCmd);
        int questId = -1;
        int questCurrent = -1;
        QuestBook questBook = game.getQuestBook();
        QuestBookInfo.Quest quest = null;

        if (!MiscInfo.QUEST_BOOK_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_BOOK_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (questBook == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            quest = questBook.getQuest(request.questId);
            if (quest == null)
                result = ErrorConst.INVALID_SLOT_ID;
            else
            {
                result = quest.updateProgress(request.questCurrent);

                questId = request.questId;
                questCurrent = quest.CURRENT();
                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseQuestBookSave(cmd, result).packData(questId, questCurrent);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             questId,
                             questId == -1 ? "" : quest.ACTION(),
                             questId == -1 ? "" : quest.TARGET(),
                             questId == -1 ? "" : quest.CURRENT(),
                             questId == -1 ? "" : quest.REQUIRE(),
                             request.questId,
                             request.questCurrent
                            );
    }

    private static void questBookSkip (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        QuestBook questBook = game.getQuestBook();

        RequestQuestBookSkip request = new RequestQuestBookSkip(dataCmd);
        int questId = -1;
        int questCurrent = -1;
        QuestBookInfo.Quest quest = null;
        MapItem price = null;
        int coinChange = 0;
        int goldChange = 0;
        int repuChange = 0;

        if (!MiscInfo.QUEST_BOOK_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_BOOK_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (questBook == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            quest = questBook.getQuest(request.questId);
            if (quest == null)
                result = ErrorConst.INVALID_SLOT_ID;
            else if (!quest.isActive())
                result = ErrorConst.TIME_WAIT;
            else if (quest.isFinish())
                result = ErrorConst.INVALID_STATUS;
            else if (!quest.checkPrice(request.priceType, request.priceNum))
                result = ErrorConst.INVALID_PRICE;
            else
            {
                price = Common.toMap(request.priceType, request.priceNum);

                if (request.priceType.equals(ItemId.COIN))
                {
                    if (request.clientCoin != userControl.getCoin())
                        result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                    else
                        result = userControl.purchase(transactionId, request.priceNum, PurchaseInfo.questbook(cmd, quest.ACTION(), quest.TARGET()));
                }
                else
                    result = game.removeItem(cmd, transactionId, price);

                if (result == ErrorConst.SUCCESS)
                {
                    quest.updateProgress(quest.REQUIRE());

                    coinChange = request.priceType.equals(ItemId.COIN) ? (-request.priceNum) : 0;
                    goldChange = request.priceType.equals(ItemId.GOLD) ? (-request.priceNum) : 0;
                    repuChange = request.priceType.equals(ItemId.REPU) ? (-request.priceNum) : 0;

                    questId = request.questId;
                    questCurrent = quest.CURRENT();
                    userControl.markFlagSaveGame();
                }
                else
                    price = null;
            }
        }

        Message msg = new ResponseQuestBookSkip(cmd, result).packData(questId, questCurrent, userControl.getCoin(), game.getGold(), game.getReputation());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             price,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             goldChange,
                             game.getReputation(),
                             repuChange,
                             questId,
                             questId == -1 ? "" : quest.ACTION(),
                             questId == -1 ? "" : quest.TARGET(),
                             questId == -1 ? "" : quest.CURRENT(),
                             questId == -1 ? "" : quest.REQUIRE(),
                             request.questId,
                             request.priceType,
                             request.priceNum
                            );
    }

    private static void questBookClaimReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        QuestBook questBook = game.getQuestBook();

        RequestQuestBookClaimReward request = new RequestQuestBookClaimReward(dataCmd);
        int questId = -1;
        QuestBookInfo.Quest quest = null;
        MapItem reward = null;

        if (!MiscInfo.QUEST_BOOK_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_BOOK_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (questBook == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            quest = questBook.getQuest(request.questId);
            if (quest == null)
                result = ErrorConst.INVALID_SLOT_ID;
            else if (!quest.isActive())
                result = ErrorConst.TIME_WAIT;
            else if (!quest.isFinish())
                result = ErrorConst.INVALID_STATUS;
            else
            {
                reward = new MapItem();
                reward.increase(quest.REWARD());
                reward.increase(quest.SPECIAL_REWARD());

                result = game.checkAndAddItem(cmd, transactionId, reward);

                if (result == ErrorConst.SUCCESS)
                {
                    questId = request.questId;
                    questBook.finish(game, questId);
                    userControl.markFlagSaveGame();
                }
                else
                    reward = null;
            }
        }

        Message msg = new ResponseQuestBookClaimReward(cmd, result).packData(questBook, game.getMapItemNum(reward));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             reward,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             questId,
                             questId == -1 ? "" : quest.ACTION(),
                             questId == -1 ? "" : quest.TARGET(),
                             questId == -1 ? "" : quest.CURRENT(),
                             questId == -1 ? "" : quest.REQUIRE(),
                             request.questId
                            );
    }

    private static void convertOldUser (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestConvertOldUser request = new RequestConvertOldUser(dataCmd);

        byte result;
        UserGame game = userControl.game;
        ConvertInfo info = ConvertInfo.createEmpty();
        int uid = 0;

        if (!MiscInfo.CONVERT_OLD_USER())
            result = ErrorConst.INVALID_ACTION;
        else if (!game.canConvertOldUser())
            result = ErrorConst.INVALID_STATUS;
        else
        {
            if (request.facebookId != null)
                request.facebookId = request.facebookId.toLowerCase().trim();

            if (request.facebookId == null || request.facebookId.isEmpty())
            {
                result = ErrorConst.NOT_OLD_USER;
                info.setStatus(MiscDefine.CONVERT_FACEBOOK_NOT_MAP);
            }
            else if (!ConvertOldUser.add(request.facebookId, game.getUserId()))
            {
                result = ErrorConst.DUPLICATE;
                info.setStatus(MiscDefine.CONVERT_DUPLICATE);
            }
            else
            {
                try
                {
                    UserConverter converter = OldServer.getUserByFacebookId(request.facebookId);
                    if (converter == null)
                    {
                        result = ErrorConst.INVALID_FACEBOOK_ID;
                        info.setStatus(MiscDefine.CONVERT_DATABASE_NOT_MAP);
                    }
                    else
                    {
                        result = converter.check(info);
                        if (result == ErrorConst.PROCESSING)
                        {
                            if (info.reward == null || info.reward.isEmpty())
                            {
                                info.setStatus(MiscDefine.CONVERT_EMPTY_BONUS);
                            }
                            else
                            {
                                info.setStatus(MiscDefine.CONVERT_ADD_BONUS);

                                MailBox mailBox = userControl.loadAndUpdateMailBox();
                                Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_CONVERT_OLD_USER,
                                                                   "TXT_CONVERT_OLD_USER_TITLE",
                                                                   "TXT_CONVERT_OLD_USER_CONTENT",
                                                                   info.reward);
                                uid = mail.getUid();
                                MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

                                userControl.notifyMail(false);
                            }
                            result = ErrorConst.SUCCESS;
                        }
                        else
                        {
                            info.setStatus(MiscDefine.CONVERT_ERROR);
                        }
                    }
                }
                catch (Exception e)
                {
                    result = ErrorConst.EXCEPTION;
                    MetricLog.exception(e, game.getUserId(), request.facebookId);
                    if (info != null)
                        info.setStatus(MiscDefine.CONVERT_HAS_EXCEPTION);
                    ConvertOldUser.delete(request.facebookId);
                }
            }

            game.setConvertInfo(info);
            userControl.markFlagSaveGame();
        }

        Message msg = new ResponseConvertOldUser(cmd, result).packData(uid);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.facebookId,
                             info.id == null ? -1 : info.id,
                             info.level == null ? -1 : info.level,
                             info.totalPaid == null ? -1 : info.totalPaid,
                             info.coinCash == null ? -1 : info.coinCash,
                             uid
                            );
    }

    private static void paymentBrazilCreate (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {

        byte result;
        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        Payment payment = game.getPayment();

        RequestPaymentBrazilCreate request = new RequestPaymentBrazilCreate(dataCmd);

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(request.item);
        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (!info.hasChannel(request.channel))
            result = ErrorConst.INVALID_CHANNEL;
        else if (info.TYPE() == ItemType.TAB_OFFER && payment.isActiveOffer(paymentInfo, request.offer, game) == false)
            result = ErrorConst.INVALID_OFFER;
        else if (!payment.isActive(info, request.item))
            result = ErrorConst.LIMIT;
        else if (info.SUB_TYPE() == ItemSubType.SMS)
        {
            result = ErrorConst.PROCESSING;
            game.brCreateTransaction = CreateTransaction.exec(brief.getUsername(),
                                                              brief.getUserId(),
                                                              game.getLevel(),
                                                              cmd,
                                                              transactionId,
                                                              info,
                                                              request.channel,
                                                              request.offer,
                                                              userControl.address,
                                                              request.phone,
                                                              game.getCountry(),
                                                              userControl.socialType,
                                                              userControl.platformID).info;
        }
        else
        {
            result = ErrorConst.INVALID_TYPE;
        }

        if (result != ErrorConst.PROCESSING)
        {
            Message msg = new ResponsePaymentBrazilCreate(cmd, result).packData(request.channel, request.item, "", "");
            userControl.send(msg);

            CreateTransaction.logError(userControl.country,
                                       cmd,
                                       game.getUserId(),
                                       game.getLevel(),
                                       transactionId,
                                       result,
                                       request.item,
                                       request.channel,
                                       request.offer,
                                       request.phone,
                                       brief.getUsername(),
                                       userControl.socialType,
                                       userControl.platformID);
        }
    }

    private static void paymentBrazilProcess (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {

        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        byte result;

        RequestPaymentBrazilProcess request = new RequestPaymentBrazilProcess(dataCmd);
        if (request.otp == null || request.otp.isEmpty())
            result = ErrorConst.EMPTY;
        else if (game.brCreateTransaction == null)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            transactionId = game.brCreateTransaction.appTrans;

            PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
            PaymentInfo.Item info = paymentInfo.getItem(game.brCreateTransaction.item);

            if (info.SUB_TYPE() == ItemSubType.SMS)
            {
                if (EnvConfig.environment() != EnvConfig.Environment.SERVER_LIVE)
                {
                    result = ErrorConst.SUCCESS;

                    Card card = Card.createTestCard(brief.getUserId(),
                                                    brief.getUsername(),
                                                    transactionId,
                                                    info.PRICE_VND(),
                                                    info.COIN(),
                                                    info.ID(),
                                                    "PwOi",
                                                    game.brCreateTransaction.channel,
                                                    game.brCreateTransaction.offer,
                                                    game.getLevel());
                    userControl.addCashIAP(card);
                    BillingProcessing.process(userControl, card);
                    updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);
                }
                else
                {
                    result = ErrorConst.PROCESSING;
                    ProcessTransaction.exec(game.brCreateTransaction, cmd, request.otp);
                }
            }
            else
            {
                result = ErrorConst.INVALID_TYPE;
            }
        }

        if (result != ErrorConst.PROCESSING)
        {
            Message msg = new ResponsePaymentBrazilProcess(cmd, result).packData();
            userControl.send(msg);

            ProcessTransaction.logError(userControl.country, cmd, game.getUserId(), game.getLevel(), transactionId, result, request.otp);
        }
    }

    private static void paymentBrazilGetFlow (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        RequestPaymentBrazilGetFlow request = new RequestPaymentBrazilGetFlow(dataCmd);

        if (EnvConfig.environment() == EnvConfig.Environment.LOCAL)
        {
            final String[] data = {"http://127.0.0.1/payment/getToken.php", "key", "http://127.0.0.1/payment/setCvv.php"};
            PaymentBrazilGetFlow.responseToUser(ErrorConst.SUCCESS, request.channel, userControl.userId, 6, data);
        }
        else
        {
            PaymentBrazilGetFlow.exec(userControl.userId, request.channel);
        }

        Debug.info(cmd, userControl.userId, request.channel);
    }

    private static void paymentBrazilGetTransaction (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        RequestPaymentBrazilGetTransaction request = new RequestPaymentBrazilGetTransaction(dataCmd);
        byte result = ErrorConst.INIT;
        String message = "";

        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        Payment payment = game.getPayment();

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(request.item);
        LocalDate registerDate = LocalDate.ofEpochDay(TimeUnit.SECONDS.toDays(brief.timeRegister));

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.TYPE() == ItemType.TAB_OFFER && payment.isActiveOffer(paymentInfo, request.offer, game) == false)
            result = ErrorConst.INVALID_OFFER;
        else if (!payment.isActive(info, request.item))
            result = ErrorConst.LIMIT;
        else if (request.name.isEmpty())
        {
            result = ErrorConst.EMPTY;
            message = "Empty name";
        }
        else if (request.email.isEmpty())
        {
            result = ErrorConst.EMPTY;
            message = "Empty email";
        }
        else if (request.phone.isEmpty())
        {
            result = ErrorConst.EMPTY;
            message = "Empty phone";
        }
        else if (request.document.isEmpty())
        {
            result = ErrorConst.EMPTY;
            message = "Empty document";
        }
        else
        {
            if (EnvConfig.environment() == EnvConfig.Environment.LOCAL)
            {
                result = ErrorConst.SUCCESS;

                Card card = Card.createTestCard(brief.getUserId(),
                                                brief.getUsername(),
                                                transactionId,
                                                info.PRICE_VND(),
                                                info.COIN(),
                                                info.ID(),
                                                "BrCard",
                                                Integer.toString(request.channel),
                                                request.offer,
                                                game.getLevel());
                userControl.addCashIAP(card);
                BillingProcessing.process(userControl, card);
                updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);
            }
            else
            {
                result = ErrorConst.PROCESSING;

                PaymentBrazilGetTransaction.exec(brief.getUsername(),
                                                 brief.getUserId(),
                                                 game.getLevel(),
                                                 cmd,
                                                 transactionId,
                                                 info,
                                                 request.channel,
                                                 request.offer,
                                                 userControl.address,
                                                 game.getCountry(),
                                                 request.name,
                                                 request.email,
                                                 request.phone,
                                                 request.document,
                                                 brief.deviceId,
                                                 registerDate.toString(),
                                                 request.token,
                                                 request.maskedCardNumber,
                                                 request.paymentTypeCode,
                                                 userControl.socialType,
                                                 userControl.platformID
                                                );
            }
        }

        if (result != ErrorConst.PROCESSING)
        {
            Message msg = new ResponsePaymentBrazilGetTransaction(cmd, result).packData(request.channel, 0, "");
            userControl.send(msg);

            PaymentBrazilGetTransaction.logError(game.getCountry(),
                                                 cmd,
                                                 userControl.userId,
                                                 game.getLevel(),
                                                 transactionId,
                                                 result,
                                                 request.item,
                                                 request.channel,
                                                 request.offer,
                                                 message,
                                                 brief.getUsername(),
                                                 userControl.socialType,
                                                 userControl.platformID);
        }
        else
        {
            Debug.info(cmd, userControl.userId, request.channel);
        }
    }

    private static void ratingGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestRatingGetReward request = new RequestRatingGetReward(dataCmd);

        byte result;
        UserGame game = userControl.game;

        int uid = -1;

        if (!MiscInfo.RATING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.isRating())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            result = ErrorConst.SUCCESS;
            MailBox mailBox = userControl.loadAndUpdateMailBox();
            Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_RATING,
                                               "TXT_MAIL_RATING_TITLE",
                                               "TXT_MAIL_RATING_CONTENT",
                                               MiscInfo.RATING_REWARD());
            uid = mail.getUid();
            MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

            game.setRating(true);
            userControl.markFlagSaveGame();

            userControl.notifyMail(false);
        }

        Message msg = new ResponseRatingGetReward(cmd, result).packData();
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             uid
                            );
    }

    private static void rankingGetTop (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
//    	RequestRankingGetTop request = new RequestRankingGetTop(dataCmd);


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        RankingBoard.Board[] rankingBoard = null;

        if (!MiscInfo.RANKING_BOARD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else
        {
            rankingBoard = RankingManager.getBoards(game.getLevel());
            if (rankingBoard == null)
                result = ErrorConst.NULL_OBJECT;
        }

        Message msg = new ResponseRankingGetTop(cmd, result).packData(rankingBoard);
        userControl.send(msg);
    }

    private static void rankingGetPR (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
//    	RequestRankingGetPR request = new RequestRankingGetPR(dataCmd);


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        RankingPR pr = null;

        if (!MiscInfo.RANKING_BOARD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else
        {
            pr = game.getRankingPR();
            if (pr == null)
                result = ErrorConst.NULL_OBJECT;
        }

        Message msg = new ResponseRankingGetPR(cmd, result).packData(pr);
        userControl.send(msg);
    }

    private static void rankingClaimRewardDefault (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestRankingClaimRewardDefault request = new RequestRankingClaimRewardDefault(dataCmd);
        String rankingID = request.rankingID;

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        MapItem reward = null;
        int point = 0;

        if (!MiscInfo.RANKING_BOARD_ACTIVE() || !MiscInfo.TOP_ACTION_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else
        {
            RankingPR pr = game.getRankingPR();
            if (pr == null)
                result = ErrorConst.NULL_OBJECT;
            else if (!ConstInfo.getRankingBoardInfo().validRankingID(rankingID))
                result = ErrorConst.INVALID_ID;
            else if (pr.ACTION().CLAIM_DEFAULT_REWARD())
                result = ErrorConst.INVALID_STATUS;
            else
            {
                point = pr.ACTION().POINT();
                reward = ConstInfo.getRankingBoardInfo().getDefaultReward(rankingID, point);

                if (reward == null || reward.isEmpty())
                    result = ErrorConst.EMPTY_MAP_ITEM;
                else if ((result = game.checkAndAddItem(cmd, transactionId, reward)) == ErrorConst.SUCCESS)
                {
                    pr.ACTION().checkClaimDefaultReward();
                    rankingID = pr.ACTION_ID();
                    userControl.markFlagSaveGame();
                }
                else
                {
                    reward = null;
                }
            }
        }

        Message msg = new ResponseRankingClaimRewardDefault(cmd, result).packData(userControl.getCoin(),
                                                                                  game.getGold(),
                                                                                  game.getReputation(),
                                                                                  game.getMapItemNum(reward));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             reward,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             rankingID,
                             point == 0 ? "" : point
                            );
    }

    private static void pigUpdateDiamond (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        Message msg = new ResponsePigUpdateDiamond(cmd, result).packData(game.getPigBank());
        userControl.send(msg);
    }

    private static void paymentSeaAskPhone (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        //RequestPaymentSeaAskPhone request = new RequestPaymentSeaAskPhone(dataCmd);


        Message msg = new ResponsePaymentSeaAskPhone(cmd, ErrorConst.SUCCESS).packData(GetPhone.requirePhone());
        userControl.send(msg);
    }

    private static void paymentSeaCreate (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        RequestPaymentSeaCreate request = new RequestPaymentSeaCreate(dataCmd);
        paymentSeaCreate(cmd, transactionId, userControl, false, request.channel, request.item, request.offer, request.phone, request.card);
    }

    private static void paymentLibCreate (short cmd, String transactionId, UserControl userControl, DataCmd dataCmd) throws Exception
    {
        RequestPaymentLibCreate request = new RequestPaymentLibCreate(dataCmd);

        String channel = Integer.toString(request.paymentType);
        JsonObject o = Json.parse(request.extraData).getAsJsonObject();
        String item = o.get("item").getAsString();
        String offer = o.get("offer").getAsString();

        paymentSeaCreate(cmd, transactionId, userControl, true, channel, item, offer, request.cardNo, request.cardNo);
    }

    private static void paymentSeaCreate (short cmd,
                                          String transactionId,
                                          UserControl userControl,
                                          boolean isPaymentLib,
                                          String channel,
                                          String item,
                                          String offer,
                                          String phoneNum,
                                          String cardNo) throws Exception
    {

        byte result = ErrorConst.EMPTY;
        UserGame game = userControl.game;
        UserBrief brief = userControl.brief;
        Payment payment = game.getPayment();

        PaymentInfo paymentInfo = PaymentInfo.get(game.getCountry());
        PaymentInfo.Item info = paymentInfo.getItem(item);

        if (info == null)
            result = ErrorConst.NULL_ITEM_INFO;
        else if (info.TYPE() == ItemType.TAB_OFFER && payment.isActiveOffer(paymentInfo, offer, game) == false)
            result = ErrorConst.INVALID_OFFER;
        else if (!payment.isActive(info, item))
            result = ErrorConst.LIMIT;
        else
        {
            if (useTestPayment(payment))
            {
                int gross = info.PRICE_VND();
                result = ErrorConst.SUCCESS;

                Card card = Card.createTestCard(brief.getUserId(),
                                                brief.getUsername(),
                                                transactionId,
                                                gross,
                                                gross / paymentInfo.RATE_VND_TO_COIN(),
                                                item,
                                                "PZingCard",
                                                channel,
                                                offer,
                                                game.getLevel());
                userControl.addCashIAP(card);
                BillingProcessing.process(userControl, card);
                updateCoin(CmdDefine.UPDATE_COIN, transactionId, userControl);

                SeaGetTransaction.log(cmd,
                                      userControl.userId,
                                      game.getLevel(),
                                      transactionId,
                                      result,
                                      channel,
                                      item,
                                      offer,
                                      phoneNum,
                                      cardNo,
                                      game.getCountry(),
                                      true,
                                      false,
                                      brief.getUsername(),
                                      userControl.socialType,
                                      userControl.platformID
                                     );
            }
            else
            {
                game.seaTransaction = SeaGetTransaction.exec(isPaymentLib,
                                                             brief.getUsername(),
                                                             brief.getUserId(),
                                                             game.getLevel(),
                                                             cmd,
                                                             transactionId,
                                                             info,
                                                             channel,
                                                             offer,
                                                             userControl.address,
                                                             phoneNum,
                                                             cardNo,
                                                             game.getCountry(),
                                                             userControl.socialType,
                                                             userControl.platformID
                                                            ).info;
            }
        }

        if (result != ErrorConst.SUCCESS)
        {
            if (isPaymentLib)
                userControl.send(new ResponsePaymentLibCreate(cmd, result).packData(null));
            else
                userControl.send(new ResponsePaymentSeaCreate(cmd, result).packData(channel, item, 0, null, null));

            SeaGetTransaction.log(cmd,
                                  userControl.userId,
                                  game.getLevel(),
                                  transactionId,
                                  result,
                                  channel,
                                  item,
                                  offer,
                                  phoneNum,
                                  cardNo,
                                  game.getCountry(),
                                  true,
                                  isPaymentLib,
                                  brief.getUsername(),
                                  userControl.socialType,
                                  userControl.platformID
                                 );
        }
    }

    private static void paymentSeaVerify (short cmd, String transactionId, UserControl userControl, Decoder dataCmd) throws Exception
    {
        RequestPaymentSeaVerify request = new RequestPaymentSeaVerify(dataCmd);

        paymentSeaVerify(cmd, transactionId, userControl, false, request.otp);
    }

    private static void paymentLibVerify (short cmd, String transactionId, UserControl userControl, DataCmd dataCmd) throws Exception
    {
        RequestPaymentLibVerify request = new RequestPaymentLibVerify(dataCmd);

        paymentSeaVerify(cmd, transactionId, userControl, false, request.otp);
    }

    private static void paymentSeaVerify (short cmd, String transactionId, UserControl userControl, boolean isPaymentLib, String otp) throws Exception
    {

        byte result = ErrorConst.EMPTY;

        UserGame game = userControl.game;
        SeaGetTransaction.Info infoTrans = game.seaTransaction;

        if (infoTrans == null)
            result = ErrorConst.NULL_OBJECT;
        else if (infoTrans.flow != MiscDefine.SEA_PAYMENT_FLOW_OTP)
            result = ErrorConst.INVALID_ACTION;
        else
        {
            SeaVerifyOtp.exec(infoTrans, cmd, otp);
        }

        if (result != ErrorConst.SUCCESS)
        {
            if (isPaymentLib)
                userControl.send(new ResponsePaymentLibVerify(cmd, result).packData());
            else
                userControl.send(new ResponsePaymentSeaVerify(cmd, result).packData());

            SeaVerifyOtp.log(userControl.country,
                             cmd,
                             userControl.userId,
                             game.getLevel(),
                             transactionId,
                             result,
                             otp,
                             isPaymentLib
                            );
        }
    }

    private static void flippingCardsGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
//    	RequestFlippingCardsGet request = new RequestFlippingCardsGet(dataCmd);

        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        FlippingCards flippingCard = game.getFlippingCards();

        if (!MiscInfo.FLIPPINGCARDS_ACTIVE())
            result = ErrorConst.INVALID_ACTION;
        else if (MiscInfo.FLIPPINGCARDS_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (flippingCard == null)
            result = ErrorConst.NULL_OBJECT;
        else if (game.updateFlippingCards(transactionId))
            userControl.markFlagSaveGame();

        flippingCard.setTicket(game.numStockItem(MiscInfo.FLIPPINGCARDS_TICKET()));

        Message msg = new ResponseFlippingCardsGet(cmd, result).packData(flippingCard, game.getMapItemNum(MiscInfo.FLIPPINGCARDS_TICKET()));
        userControl.send(msg);
    }

    private static void flippingCardsCheckpointReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestFlippingCardsCheckpointReward request = new RequestFlippingCardsCheckpointReward(dataCmd);
        int checkpoint = request.checkpoint;


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        FlippingCards flippingCard = game.getFlippingCards();
        int mailId = -1;

        if (!MiscInfo.FLIPPINGCARDS_ACTIVE())
            result = ErrorConst.INVALID_ACTION;
        else if (MiscInfo.FLIPPINGCARDS_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (flippingCard == null)
            result = ErrorConst.NULL_OBJECT;
        else if (flippingCard.isCheckpointReceived(checkpoint))
            result = ErrorConst.REWARD_RECEIVED;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            MapItem reward = ConstInfo.getFlippingCardsInfo().getRewardAtCheckpoint(checkpoint);
            if (reward == null || reward.isEmpty())
                result = ErrorConst.EMPTY_MAP_ITEM;
            else
            {
                Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.FLIPPINGCARDS_REWARD_TITLE(), MiscInfo.FLIPPINGCARDS_REWARD_CONTENT(), reward);
                if (mail != null)
                {
                    mailId = mail.getUid();
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);

                    flippingCard.checkpointReceive(checkpoint);
                    flippingCard.setTicket(game.numStockItem(MiscInfo.FLIPPINGCARDS_TICKET()));

                    userControl.markFlagSaveGame();
                    userControl.notifyMail(false);
                }
            }
        }

        Message msg = new ResponseFlippingCardsCheckpointReward(cmd, result).packData(flippingCard, mailId);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             checkpoint,
                             mailId
                            );
    }

    private static void flippingCardsGameStart (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
//    	RequestFlippingCardsGameStart request = new RequestFlippingCardsGameStart(dataCmd);
//    	int ticket = request.ticket;


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        FlippingCards flippingCard = game.getFlippingCards();
        MapItem require = ConstInfo.getFlippingCardsInfo().GAME_START_REQUIRE();
        MapItem tickets = new MapItem();

        if (!MiscInfo.FLIPPINGCARDS_ACTIVE())
            result = ErrorConst.INVALID_ACTION;
        else if (MiscInfo.FLIPPINGCARDS_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (flippingCard == null)
            result = ErrorConst.NULL_OBJECT;
        else if (flippingCard.gamePlaying())
            result = ErrorConst.INVALID_STATUS;
        else
        {
            game.updateFlippingCards(transactionId);

            result = game.removeItem(cmd, transactionId, require);
            if (result == ErrorConst.SUCCESS)
            {
                flippingCard.newgame();
                flippingCard.setTicket(game.numStockItem(MiscInfo.FLIPPINGCARDS_TICKET()));
                userControl.markFlagSaveGame();
            }
            else
            {
                require = null;
            }
        }

        Message msg = new ResponseFlippingCardsGameStart(cmd, result).packData(flippingCard, game.getMapItemNum(require));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             require,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             flippingCard == null ? "" : flippingCard.gameLevel()
                            );
    }

    private static void flippingCardsUseItem (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestFlippingCardsUseItem request = new RequestFlippingCardsUseItem(dataCmd);
        String itemId = request.itemId;
        int itemNum = request.itemNum;


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        MapItem require = ConstInfo.getFlippingCardsInfo().getBuffItemRequire(itemId);
        FlippingCards flippingCard = game.getFlippingCards();
        String activeItemId = null;

        if (!MiscInfo.FLIPPINGCARDS_ACTIVE())
            result = ErrorConst.INVALID_ACTION;
        else if (MiscInfo.FLIPPINGCARDS_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (flippingCard == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!flippingCard.gamePlaying())
            result = ErrorConst.INVALID_STATUS;
        else if (require == null || require.isEmpty())
            result = ErrorConst.INVALID_ITEM;
        else if (itemNum != game.numStockItem(itemId))
            result = ErrorConst.INVALID_NUM;
        else
        {
            result = game.removeItem(cmd, transactionId, require);
            if (result == ErrorConst.SUCCESS)
            {
                activeItemId = itemId;
                userControl.markFlagSaveGame();
            }
            else
            {
                require = null;
            }
        }

        Message msg = new ResponseFlippingCardsUseItem(cmd, result).packData(game.getMapItemNum(require), activeItemId);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             require,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void flippingCardsGameEnd (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestFlippingCardsGameEnd request = new RequestFlippingCardsGameEnd(dataCmd);
        int startTime = request.start;
        int endTime = request.end;
        int duration = endTime - startTime;
        int match = request.match;
        int miss = request.miss;


        byte result = ErrorConst.SUCCESS;
        MapItem reward = null;

        UserGame game = userControl.game;
        FlippingCards flippingCard = game.getFlippingCards();
        FlippingCards.Result gameResult = null;

        if (!MiscInfo.FLIPPINGCARDS_ACTIVE())
            result = ErrorConst.INVALID_ACTION;
        else if (MiscInfo.FLIPPINGCARDS_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (flippingCard == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!flippingCard.gamePlaying())
            result = ErrorConst.INVALID_STATUS;
        else
        {
            gameResult = flippingCard.endgame(startTime, endTime, match, miss);

            if (gameResult == null)
                result = ErrorConst.NULL_OBJECT;
            else if (gameResult.victory())
            {
                reward = gameResult.reward();

                if (reward == null || reward.isEmpty())
                    result = ErrorConst.EMPTY_MAP_ITEM;
                else
                    result = game.checkAndAddItem(cmd, transactionId, reward);
            }

            if (result == ErrorConst.SUCCESS)
            {
                game.updateFlippingCards(transactionId);
                flippingCard.setTicket(game.numStockItem(MiscInfo.FLIPPINGCARDS_TICKET()));
                userControl.markFlagSaveGame();
            }
            else
                reward = null;
        }

        Message msg = new ResponseFlippingCardsGameEnd(cmd, result).packData(flippingCard, gameResult, game.getGold(), game.getExp(), game.getMapItemNum(reward));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             reward,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             game.getReputation(),
                             duration,
                             match,
                             miss,
                             gameResult == null ? "" : gameResult.level(),
                             gameResult == null ? "" : gameResult.victory(),
                             gameResult == null ? "" : gameResult.point()
                            );
    }

    private static void questMissionGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
//    	RequestQuestMissionGet request = new RequestQuestMissionGet(dataCmd);


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        QuestMission mission = null;

        if (!MiscInfo.QUEST_MISSION_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_MISSION_USER_LEVEL_MIN())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
            mission = game.getQuestMission();
        }

        Message msg = new ResponseQuestMissionGet(cmd, result).packData(mission);
        userControl.send(msg);
    }

    private static void questMissionSave (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestQuestMissionSave request = new RequestQuestMissionSave(dataCmd);
        int missionId = -1;
        int missionCurrent = -1;


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        QuestMission questMission = game.getQuestMission();

        if (!MiscInfo.QUEST_MISSION_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_MISSION_USER_LEVEL_MIN())
            result = ErrorConst.LIMIT_LEVEL;
        else if (questMission == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!questMission.hasMission(request.missionId))
            result = ErrorConst.INVALID_SLOT_ID;
        else
        {
            result = questMission.updateProgress(request.missionId, request.missionCurrent);
            if (result == ErrorConst.SUCCESS)
            {
                missionId = request.missionId;
                missionCurrent = questMission.getCurrent(request.missionId);
                userControl.markFlagSaveGame();
            }
        }

        Message msg = new ResponseQuestMissionkSave(cmd, result).packData(missionId, missionCurrent);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             missionId,
                             missionCurrent,
                             request.missionId,
                             request.missionCurrent
                            );
    }

    private static void questMissionClaimReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
//    	RequestQuestMissionClaimReward request = new RequestQuestMissionClaimReward(dataCmd);


        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        QuestMission questMission = game.getQuestMission();
        MapItem reward = null;

        if (!MiscInfo.QUEST_MISSION_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.QUEST_MISSION_USER_LEVEL_MIN())
            result = ErrorConst.LIMIT_LEVEL;
        else if (questMission == null)
            result = ErrorConst.NULL_OBJECT;
        else if (questMission.IS_CLAIM_REWARDS())
            result = ErrorConst.EMPTY_MAP_ITEM;
        else if (!questMission.IS_FINISH())
            result = ErrorConst.INVALID_STATUS;
        else
        {
            reward = questMission.REWARDS();
            result = game.checkAndAddItem(cmd, transactionId, reward);

            if (result == ErrorConst.SUCCESS)
            {
                questMission.checkClaimRewards();
                questMission.next(game.getLevel());

                userControl.markFlagSaveGame();
            }
            else
                reward = null;
        }

        Message msg = new ResponseQuestMissionClaimReward(cmd, result).packData(questMission,
                                                                                userControl.getCoin(),
                                                                                game.getGold(),
                                                                                game.getReputation(),
                                                                                game.getMapItemNum(reward));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             reward,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             questMission == null ? "" : questMission.ID()
                            );
    }

    private static void truckUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckUnlock request = new RequestTruckUnlock(dataCmd);
        UserGame game = userControl.game;

        byte result;
        MapItem removeItem = null;

        Truck truck = game.getTruck();
        if (!truck.isLock())
            result = ErrorConst.INVALID_STATUS;
        else if (game.getLevel() < MiscInfo.TRUCK_UNLOCK_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;

        else if ((result = game.removeItem(cmd, transactionId, MiscInfo.TRUCK_UNLOCK_REQUIRE_ITEMS())) == ErrorConst.SUCCESS)
        {
            truck.unlock(game);
            userControl.markFlagSaveGame();
            removeItem = MiscInfo.TRUCK_UNLOCK_REQUIRE_ITEMS();
        }
        Message msg = new ResponseTruckUnlock(cmd, result).packData(truck, game.getMapItemNum(MiscInfo.TRUCK_UNLOCK_REQUIRE_ITEMS()));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void truckSkipTimeUnlock (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckSkipTimeUnlock request = new RequestTruckSkipTimeUnlock(dataCmd);
        UserGame game = userControl.game;
        int price = -1;
        byte result;
        MapItem removeItem = null;
        Truck truck = game.getTruck();

        int timeSkip = truck.calcTimeSkip();
        SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.TRUCK, truck.getTimeWait());
        price = skipTimeInfo.calcPrice(timeSkip);

        if (!truck.isUnlock())
            result = ErrorConst.INVALID_STATUS;
        else if (price <= 0)
            result = ErrorConst.INVALID_PRICE;
        else if (price > request.priceCoin)
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if (userControl.getCoin() < price)
            result = ErrorConst.NOT_ENOUGH_COIN;
        else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
        {
            truck.skipTime();
            truck.update(game);
            userControl.markFlagSaveGame();
            removeItem = new MapItem (ItemId.COIN, price);
        }

        Message msg = new ResponseTruckSkipTimeUnlock(cmd, result).packData(truck, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             result == ErrorConst.SUCCESS ? (-price) : 0,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price
                            );
    }

    private static void truckGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckGet request = new RequestTruckGet(dataCmd);
        UserGame game = userControl.game;
        Truck truck = game.getTruck();
        truck.update(game);

        byte result = ErrorConst.SUCCESS;

        Message msg = new ResponseTruckGet(cmd, result).packData(truck);
        userControl.send(msg);

        /*
        MetricLog.actionUser(userControl.country, cmd,
                userControl.userId,
                game.getLevel(),
                transactionId,
                "",
                "",
                result,
                userControl.getCoin(),
                game.getGold()
        );*/
    }

    private static void truckCancelDelivery (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckCancelDelivery request = new RequestTruckCancelDelivery(dataCmd);
        UserGame game = userControl.game;

        byte result;
        Truck truck = game.getTruck();

        if (!truck.isActive())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            boolean cancelDeliveryResult = truck.cancelDelivery(game);
            if (cancelDeliveryResult)
            {
                userControl.markFlagSaveGame();
                result = ErrorConst.SUCCESS;
            }
            else
            {
                result = ErrorConst.FAIL;
            }
        }

        Message msg = new ResponseTruckCancelDelivery(cmd, result).packData(truck);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void truckPack (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckPackBag request = new RequestTruckPackBag(dataCmd);
        UserGame game = userControl.game;
        Truck truck = game.getTruck();

        byte result;
        Truck.Bag bag;
        MapItem receiveItem = null;
        MapItem requireItem = null;

        if (truck == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!truck.isActive())
            result = ErrorConst.INVALID_STATUS;
        else if ((bag = truck.getBag(request.bagId)) == null)
            result = ErrorConst.NULL_SLOT;
        else if (bag.isPacked())
            result = ErrorConst.INVALID_ACTION;
        else
        {
            requireItem = Common.toMap(bag.getItem(), bag.getNum());
            receiveItem = Common.merge(bag.getPackReward(), bag.getPackEventItems());

            result = game.removeAndAddItem(cmd, transactionId, requireItem, receiveItem);
            if (result == ErrorConst.SUCCESS)
            {
                bag.pack();
                userControl.markFlagSaveGame();
            }
            else
            {
                receiveItem = null;
                requireItem = null;
            }
        }

        Message msg = new ResponseTruckPackBag(cmd, result).packData(request.bagId,
                                                                     truck,
                                                                     game.getLevel(),
                                                                     game.getExp(),
                                                                     game.getGold(),
                                                                     game.getReputation(),
                                                                     game.getMapItemNum(receiveItem, requireItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             requireItem,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.bagId
                            );
    }

    private static void truckDelivery (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckDelivery request = new RequestTruckDelivery(dataCmd);
        UserGame game = userControl.game;

        byte result;

        Truck truck = game.getTruck();
        MapItem rewards = null;

        if (!truck.isActive())
            result = ErrorConst.INVALID_STATUS;
        else if (!truck.canDelivery())
        {
            result = ErrorConst.INVALID_ACTION;
        }
        else
        {
            rewards = truck.getDeliveryReward();
            boolean deliveryResult = truck.delivery(game);
            if (deliveryResult)
            {
                result = ErrorConst.SUCCESS;
                game.addItem(cmd, transactionId, rewards);

                //pig
                if (MiscInfo.PIG_ACTIVE() && game.getPigBank().isActive(game.getLevel()))
                {
                    game.getPigBank().addDiamond(MiscInfo.PIG_TRUCK_DELIVERY_DIAMOND());
                    pigUpdateDiamond(CmdDefine.PIG_UPDATE_DIAMOND, transactionId, userControl, dataCmd);
                }
                userControl.markFlagSaveGame();
            }
            else
            {
                result = ErrorConst.FAIL;
            }
        }

        Message msg = new ResponseTruckDelivery(cmd, result).packData(truck,
                                                                      game.getLevel(),
                                                                      game.getExp(),
                                                                      game.getGold(),
                                                                      game.getReputation(),
                                                                      game.getMapItemNum(rewards));
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && game.updateActionRecord(MiscInfo.TOP_TRUCK_DELIVERY(), 1))
            userControl.markFlagSaveGame();
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             rewards,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             truck == null ? -1 : truck.getDeliveryCount()
                            );
    }

    private static void truckSkipTimeInactive (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckSkipTimeInactive request = new RequestTruckSkipTimeInactive(dataCmd);

        UserGame game = userControl.game;
        int price = -1;
        byte result;
        MapItem removeItem = null;
        Truck truck = game.getTruck();

        int timeSkip = truck.calcTimeSkip();
        SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.TRUCK, truck.getTimeWait());
        price = skipTimeInfo.calcPrice(timeSkip);

        if (!truck.isInactive())
            result = ErrorConst.INVALID_STATUS;
        else if (price <= 0)
            result = ErrorConst.INVALID_PRICE;
        else if (price > request.priceCoin)
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if (request.clientCoin != userControl.getCoin())
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else if (userControl.getCoin() < price)
            result = ErrorConst.NOT_ENOUGH_COIN;
        else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.skipTime(cmd, timeSkip))) == ErrorConst.SUCCESS)
        {
            truck.skipTime();
            truck.update(game);
            userControl.markFlagSaveGame();
            removeItem = new MapItem (ItemId.COIN, price);
        }

        Message msg = new ResponseTruckSkipTimeUnlock(cmd, result).packData(truck, userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             result == ErrorConst.SUCCESS ? (-price) : 0,
                             game.getGold(),
                             0,
                             request.clientCoin,
                             request.priceCoin,
                             price,
                             timeSkip
                            );
    }

    private static void truckUpgrade (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestTruckUpgrade request = new RequestTruckUpgrade(dataCmd);

        UserGame game = userControl.game;
        Truck truck = game.getTruck();
        MapItem removeItem = null;
        int coinChange = 0;
        int currentLevel = truck.getLevel();

        MapItem upgradeItems = new MapItem();
        byte result;

        if (truck.getLevel() >= ConstInfo.getTruckInfo().LEVELS().length)
            result = ErrorConst.MAX_LEVEL;
        else if (!truck.canUpgrade())
        {
            result = ErrorConst.INVALID_STATUS;
        }
        else
        {
            TruckInfo.Level truckLevelInfo = ConstInfo.getTruckInfo().getTruckLevelInfo(truck.getLevel() + 1);
            int priceGold = truckLevelInfo.GOLD_UPGRADE();

            if (request.priceCoin <= 0)
            {
                upgradeItems.put(ItemId.GOLD, priceGold);
                if ((result = game.removeItem(cmd, transactionId, upgradeItems)) == ErrorConst.SUCCESS)
                {
                    int rate = ThreadLocalRandom.current().nextInt(1, 101);
                    if (rate <= truckLevelInfo.UPGRADE_RATIO())
                    {
                        truck.upgrade();
                        truck.update(game);
                        result = ErrorConst.SUCCESS;
                        userControl.markFlagSaveGame();
                        removeItem = upgradeItems;
                    }
                    else
                    {
                        result = ErrorConst.FAIL;
                    }
                }
            }
            else
            {
                int price = UserLevelInfo.priceGoldToCoin(game.getLevel(), priceGold);
                if (price <= 0)
                    result = ErrorConst.INVALID_PRICE;
                else if (price > request.priceCoin)
                    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
                else if (request.clientCoin != userControl.getCoin())
                    result = ErrorConst.CLIENT_COIN_NOT_MATCH;
                else if (userControl.getCoin() < price)
                    result = ErrorConst.NOT_ENOUGH_COIN;
                else if ((result = userControl.purchase(transactionId, price, PurchaseInfo.action(cmd))) == ErrorConst.SUCCESS)
                {
                    int rate = ThreadLocalRandom.current().nextInt(1, 101);
                    if (rate <= truckLevelInfo.UPGRADE_RATIO())
                    {
                        truck.upgrade();
                        truck.update(game);
                        result = ErrorConst.SUCCESS;
                        userControl.markFlagSaveGame();
                        removeItem = new MapItem (ItemId.COIN, price);
                        coinChange = -price;
                    }
                    else
                    {
                        result = ErrorConst.FAIL;
                    }
                }
            }
        }

        Message msg = new ResponseTruckUpgrade(cmd, result).packData(truck, upgradeItems);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             currentLevel,
                             truck.getLevel()
                            );
    }

    private static void consumeEventSpin (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestConsumeEventSpin request = new RequestConsumeEventSpin(dataCmd);

        byte result;
        UserGame game = userControl.game;
        ConsumeEventInfo.ConsumeEventTypeInfo consumeEventTypeInfo = ConstInfo.getConsumeEventInfo().getConsumeEventTypeInfo(request.id);

        ConsumeEvent consumeEvent = game.getConsumeEvent();
        ConsumeEvent.ConsumeType consumeType = null;


        if (game.getLevel() < MiscInfo.CONSUME_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (consumeEventTypeInfo == null || !ConstInfo.getConsumeEventInfo().isInDuration())
            result = ErrorConst.NOT_ACTIVE;
        else if (consumeEvent == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            consumeType = consumeEvent.getConsumeType(request.id);
            if (consumeType == null)
                result = ErrorConst.NULL_OBJECT;
            else if (consumeType.spin())
            {
                result = ErrorConst.SUCCESS;
                userControl.markFlagSaveGame();
            }
            else
                result = ErrorConst.FAIL;
        }

        Message msg = new ResponseConsumeEventSpin(cmd, result).packData(consumeEvent);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.id,
                             consumeType == null ? "" : consumeType.getConsumed(),
                             consumeType == null ? "" : consumeType.getPointConsumed(),
                             consumeEventTypeInfo == null ? "" : consumeEventTypeInfo.CONSUME_CONVERT() * consumeEventTypeInfo.POINT_CONVERT(),
                             consumeType == null ? "" : consumeType.getMilestone(),
                             consumeType == null ? "" : consumeType.getWinSlotType()
                            );
    }

    private static void consumeEventClaimReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestConsumeEventClaimReward request = new RequestConsumeEventClaimReward(dataCmd);

        byte result;
        UserGame game = userControl.game;
        ConsumeEventInfo.ConsumeEventTypeInfo consumeEventTypeInfo = ConstInfo.getConsumeEventInfo().getConsumeEventTypeInfo(request.id);
        
        MapItem reward = null;

        ConsumeEvent consumeEvent = game.getConsumeEvent();
        ConsumeEvent.ConsumeType consumeType = null;

        int milestoneOld = -1;
        int winSlotTypeOld = -1;
        int mailId = -1;

        if (game.getLevel() < MiscInfo.CONSUME_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (consumeEventTypeInfo == null || !ConstInfo.getConsumeEventInfo().isInDuration())
            result = ErrorConst.NOT_ACTIVE;
        else if (consumeEvent == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            consumeType = consumeEvent.getConsumeType(request.id);
            if (consumeType == null)
                result = ErrorConst.NULL_OBJECT;
            else if (consumeType.getStatus() != MiscDefine.CONSUME_TYPE_STATUS_OPEN)
                result = ErrorConst.INVALID_STATUS;
            else
            {
                result = ErrorConst.SUCCESS;
                reward = consumeType.getReward();
                milestoneOld = consumeType.getMilestone();
                winSlotTypeOld = consumeType.getWinSlotType();

                MailBox mailBox = userControl.loadAndUpdateMailBox();
                Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_CONSUME_EVENT,
                                                   "TXT_CONSUME_EVENT_CLAIM_REWARD_TITLE",
                                                   "TXT_CONSUME_EVENT_CLAIM_REWARD_CONTENT",
                                                   reward);
                MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                
                if (mail != null)
                    mailId = mail.getUid();

                consumeType.generateSlots();
                userControl.markFlagSaveGame();

            }
        }

        Message msg = new ResponseConsumeEventClaimReward(cmd, result).packData(consumeEvent);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.id,
                             milestoneOld,
                             winSlotTypeOld,
                             mailId
                            );
							
        MetricLog.items(reward, "MAIL_ATTACH", transactionId);
    }

    private static void consumeEventGet (short cmd, UserControl userControl)
    {
        UserGame game = userControl.game;

        byte result = ErrorConst.SUCCESS;
        ConsumeEvent consumeEvent = game.getConsumeEvent();

        if (consumeEvent == null)
            result = ErrorConst.NULL_OBJECT;

        Message msg = new ResponseConsumeEventGet(cmd, result).packData(consumeEvent);
        userControl.send(msg);
    }

    private void event02ExchangePack (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestEvent02ExchangePack request = new RequestEvent02ExchangePack(dataCmd);

        UserGame game = userControl.game;

        String eventId = request.eventId;

        Festival festival = game.getFestival();

        int mailId = -1;
        byte result = ErrorConst.SUCCESS;
        MapItem receiveMailItem = null;
        MapItem receiveItem = null;
        MapItem removeItem = null;

        Event02Info eventInfo = (Event02Info) ConstInfo.getFestival().getAction(eventId);
        Event02RewardPack reward = eventInfo.getPackRewardInfo(request.group, game.getLevel(), request.rewardId);

        MailBox mailBox = userControl.loadAndUpdateMailBox();

        if (eventInfo == null || !eventInfo.isActive() || reward == null)
            result = ErrorConst.INVALID_ACTION;

        else if (festival.isRewardPackReceived(eventId, request.rewardId))
            result = ErrorConst.EMPTY;

        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            receiveItem = reward.getBonus();
            receiveMailItem = reward.getReward();
            removeItem = reward.getRequirePack();

            if (receiveMailItem != null && !receiveMailItem.isEmpty())
            {
                result = game.removeItem(cmd, transactionId, removeItem);
                if (result == ErrorConst.SUCCESS && game.checkAndAddItem(cmd, transactionId, receiveItem) == ErrorConst.SUCCESS)
                {
                    Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.EV02_REWARD_TITLE(), MiscInfo.EV02_REWARD_CONTENT(), receiveMailItem);
                    if (mail != null)
                    {
                        mailId = mail.getUid();
                        MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                        festival.addRewardPackReceived(eventId, request.rewardId);
                        userControl.markFlagSaveGame();

                        userControl.notifyMail(false);
                    }
                    else
                    {
                        result = ErrorConst.NULL_OBJECT;
                        receiveItem = null;
                    }
                }
            }
        }

        Message msg = new ResponseEvent02ExchangePack(cmd, result).packData(mailId, receiveMailItem, removeItem, game.getMapItemNum(receiveItem));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             eventId,
                             request.rewardId,
                             mailId
                            );
    }

    private static void event02ReceiveRewards (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {

        UserGame game = userControl.game;
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        Festival festival = game.getFestival();

        final String eventId = ItemId.E2ID;
        Event02Info eventInfo = (Event02Info) ConstInfo.getFestival().getAction(eventId);

        RequestEvent02ReceiveRewards request = new RequestEvent02ReceiveRewards(dataCmd);
        int checkpoint = request.checkpoint;

        int mailId = -1;
        MapItem receiveItem = null;
        String eventPointId = "";
        int eventPointNum = 0;

        byte result = ErrorConst.SUCCESS;
        if (eventInfo == null || !eventInfo.isActive())
            result = ErrorConst.INVALID_ACTION;
        else if (festival.isCheckpointReceived(eventId, checkpoint))
            result = ErrorConst.EMPTY;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            eventPointId = eventInfo.POINT();
            eventPointNum = game.numStockItem(eventPointId);

            if (eventPointNum < checkpoint)
                result = ErrorConst.NOT_ENOUGH_ITEM;
            else
            {
                receiveItem = eventInfo.getRewards(checkpoint, game.getLevel());
                int rewardId = eventInfo.getRewardId(checkpoint, game.getLevel());
                if (rewardId > 0 && receiveItem != null && !receiveItem.isEmpty())
                {
                    Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.EV02_REWARD_TITLE(), MiscInfo.EV02_REWARD_CONTENT(), receiveItem);
                    if (mail != null)
                    {
                        mailId = mail.getUid();
                        MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                        festival.addRewardReceived(eventId, rewardId);
                        userControl.markFlagSaveGame();

                        userControl.notifyMail(false);
                    }
                    else
                    {
                        result = ErrorConst.NULL_OBJECT;
                        receiveItem = null;
                    }
                }
            }
        }

        Message msg = new ResponseEvent02ReceiveRewards(cmd, result).packData(mailId, receiveItem);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             eventId,
                             (eventPointId.isEmpty() ? "unknow" : eventPointId) + ":" + checkpoint,
                             (eventPointId.isEmpty() ? "" : (eventPointId + ":" + eventPointNum)),
                             mailId
                            );
    }

    private void gachaponGetReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        //RequestGachaponReceiveReward request = new RequestGachaponReceiveReward(dataCmd);
        byte result = ErrorConst.SUCCESS;

        Gachapon gachapon = game.getGachapon();
        MapItem receiveItems = new MapItem();
        receiveItems.increase(gachapon.getRewards());

        if (game.getLevel() < MiscInfo.GACHAPONPON_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!gachapon.canGetReward()) result = ErrorConst.INVALID_STATUS;
        else if (game.checkAndAddItem(cmd, transactionId, receiveItems) == ErrorConst.SUCCESS)
        {
            gachapon.receiveReward();

        }
        else result = ErrorConst.FAIL;
        Message msg = new ResponseGachaponReceiveReward(cmd, result).packData(gachapon, game.getMapItemNum(receiveItems));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receiveItems,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void gachaponSpin (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        RequestGachaponSpin request = new RequestGachaponSpin(dataCmd);
        byte result = ErrorConst.SUCCESS;
        MapItem removeItems = new MapItem();
        removeItems.increase(ItemId.VE_GACHA, request.numTurn * MiscInfo.GACHAPON_TICKET_REQ());

        Gachapon gachapon = game.getGachapon();

        GachaponInfo gachaponInfo = ConstInfo.getGachaponInfo();

        int[] iTurns = new int[request.numTurn];
        MapItem[] rewards = new MapItem[request.numTurn];
        int[] rewardIds = new int[request.numTurn];
        byte[] iTypes = new byte[request.numTurn];
        int color = 4;

        if (game.getLevel() < MiscInfo.GACHAPONPON_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (request.numTurn <= 0 || request.numTurn > MiscInfo.GACHAPON_TICKET_OPEN_TURN(MiscInfo.GACHAPON_TICKET_OPEN_TURN_SIZE() - 1)) result = ErrorConst.LIMIT;
        else if (gachapon == null) result = ErrorConst.NULL_OBJECT;
        else if (gachaponInfo == null || !gachapon.canSpin()) result = ErrorConst.INVALID_STATUS;
        else if (game.removeItem(cmd, transactionId, removeItems) == ErrorConst.SUCCESS)
        {
            gachapon.clearRewards();
            for (int i = 0; i < request.numTurn; i++)
            {
                iTurns[i] = gachapon.getTurn() + 1;
                ArrayList<GachaponInfo.RewardInfo> listRewards;
                if (gachaponInfo.REWARDS_SPECIAL() != null && gachaponInfo.REWARDS_SPECIAL().containsKey(iTurns[i]))
                {
                    listRewards = gachaponInfo.REWARDS_SPECIAL().get(iTurns[i]);
                    iTypes[i] = MiscDefine.GACHAPON_REWARD_TYPE_SPECIAL;
                }
                else
                {
                    listRewards = gachaponInfo.REWARDS_DEFAULT;
                    iTypes[i] = MiscDefine.GACHAPON_REWARD_TYPE_NORMAL;
                }

                GachaponInfo.RewardInfo rewardInfo = Gachapon.generateRewards(listRewards, iTurns[i]);
                if (rewardInfo != null)
                {
                    gachapon.addRewards(rewardInfo.REWARDS());
                    gachapon.increaseTurn();
                    gachapon.setStatus(MiscDefine.GACHAPON_STATUS_OPEN);
                    rewardIds[i] = rewardInfo.REWARD_ID();
                    rewards[i] = rewardInfo.REWARDS();
                    if (request.numTurn == 1)
                        color = rewardInfo.DISPLAY_COLOR();
                }
                else
                {
                    result = ErrorConst.FAIL;
                    break;
                }
            }

        }
        else result = ErrorConst.FAIL;

        Message msg = new ResponseGachaponSpin(cmd, result).packData(gachapon, game.getMapItemNum(removeItems), color);
        userControl.send(msg);
        if (result != ErrorConst.SUCCESS)
	        MetricLog.actionUser(userControl.country,
	                             "GACHAPON_RECEIVE_REWARD_ERROR",
	                             userControl.platformID,
	                             userControl.brief.getUserId(),
	                             userControl.brief.getUsername(),
	                             userControl.socialType,
	                             game.getLevel(),
	                             transactionId,
	                             null,
	                             null,
	                             result,
	                             userControl.getCoin(),
	                             0,
	                             game.getGold(),
	                             0,
                                 request.numTurn
	                            );
        else
        for (int i = 0, size = iTurns.length; i < size; i++)
        {
	        MetricLog.actionUser(userControl.country,
	                             cmd,
	                             userControl.platformID,
	                             userControl.brief.getUserId(),
	                             userControl.brief.getUsername(),
	                             userControl.socialType,
	                             game.getLevel(),
	                             transactionId,
	                             new MapItem (ItemId.VE_GACHA, MiscInfo.GACHAPON_TICKET_REQ()),
	                             null,
	                             result,
	                             userControl.getCoin(),
	                             0,
	                             game.getGold(),
	                             0,
	                             iTurns[i],
	                             iTypes[i],
	                             rewardIds[i]
	                            );

	        MetricLog.items(rewards[i], "GACHAPON_" + rewardIds[i], transactionId);
        }
    }

    private static void fishingDropHook (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        RequestFishingDropHook request = new RequestFishingDropHook(dataCmd);
        Fishing fishing = game.getFishing();
        byte result;
        int curTime = Time.getUnixTime();
        MapItem removeItem = null;

        ItemInfo itemInfo = ConstInfo.getItemInfo(request.hookId);
        if (curTime - fishing.lastTimeDropHook < ConstInfo.getFishingInfo().getMinTimeFishing())
        {
            result = ErrorConst.LIMIT_TIME;
        }
        else if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null || itemInfo == null || itemInfo.TYPE() != ItemType.HOOK)
            result = ErrorConst.NULL_OBJECT;
        else if (!fishing.canDropHook(itemInfo))
            result = ErrorConst.INVALID_STATUS;
        else result = game.removeItem(cmd, transactionId, request.hookId, 1);

        if (result == ErrorConst.SUCCESS)
        {
            removeItem =  new MapItem(request.hookId, 1);
            fishing.dropHook(request.hookId);
            fishing.lastTimeDropHook = curTime;
        }

        Message msg = new ResponseFishingDropHook(cmd, result).packData(fishing.getPond(), fishing.getMinigame(), game.getMapItemNum(request.hookId));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private static void fishingFish (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        RequestFishingFish request = new RequestFishingFish(dataCmd);

        Fishing fishing = game.getFishing();
        byte result;

        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!fishing.canFishing())
            result = ErrorConst.INVALID_STATUS;
        else
        {
            result = ErrorConst.SUCCESS;
            fishing.fish(request.point, game.getLevel());
        }

        Message msg = new ResponseFishingFish(cmd, result).packData(fishing.getMinigame());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private void fishingCollectFish (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        //  RequestFishingCollectFish request = new RequestFishingCollectFish(dataCmd);

        Fishing fishing = game.getFishing();
        byte result;
        MapItem reward = fishing != null ? fishing.getReward() : new MapItem();
        MapItem rewardClient = new MapItem();
        String fish = "";

        float fishWeight = 0;
        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!fishing.canCollectFish())
            result = ErrorConst.INVALID_STATUS;
        else if (reward == null || reward.isEmpty())
            result = ErrorConst.EMPTY;
        else {
            Fishing.Minigame fishingMinigame = fishing.getMinigame();
            fishWeight = fishingMinigame.getWeight() /  100.0f;
            for (MapItem.Entry item : reward)
            {
                ItemInfo itemInfo = ConstInfo.getItemInfo(item.key());
                if (itemInfo.SUB_TYPE() == ItemSubType.FISH) {
                    rewardClient.increase(item.key(),item.value());
                    fish = item.key();
                    reward.remove(item.key());
                }
            }
            game.addItem(cmd, transactionId, reward);
			fishing.collectFish(game.getLevel());
            result = ErrorConst.SUCCESS;
        }

        rewardClient.increase(reward);

        Message msg = new ResponseFishingCollectFish(cmd, result).packData(fishing, game.getMapItemNum(rewardClient), game.getLevel(), game.getExp(), game.getGold());
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
			                cmd,
			                userControl.platformID,
			                userControl.brief.getUserId(),
			                userControl.brief.getUsername(),
			                userControl.socialType,
			                game.getLevel(),
			                transactionId,
			                null,
			                reward,
			                result,
			                userControl.getCoin(),
			                0,
			                game.getGold(),
			                0,
			                game.getExp(),
			                fish,
			                fishing != null ? fishing.getFishCountDaily(fish) : 0,
			                fishWeight
        );
    }

    private void fishingDropBait (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        //RequestFishingDropBait request = new RequestFishingDropBait(dataCmd);

        Fishing fishing = game.getFishing();
        byte result;
        MapItem removeItem = null;

        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null)
            result = ErrorConst.NULL_OBJECT;
        else
            result = game.removeItem(cmd, transactionId, MiscInfo.FISHING_BAIT(), 1);
        if (result == ErrorConst.SUCCESS)
        {
        	removeItem = new MapItem (MiscInfo.FISHING_BAIT(), 1);
            fishing.dropBait(game.getLevel());
        }

        Message msg = new ResponseFishingDropBait(cmd, result).packData(fishing.getPond(), fishing.getMinigame(), game.getMapItemNum(MiscInfo.FISHING_BAIT()));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0
                            );
    }

    private void fishingHireSlot (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;

        RequestFishingHireSlot request = new RequestFishingHireSlot(dataCmd);

        Fishing fishing = game.getFishing();
        byte result;
        
        MapItem removeItem = null;

        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!fishing.canHireSlot(request.indexSlot))
            result = ErrorConst.INVALID_STATUS;
        else if (request.clientPrice != MiscInfo.FISHING_SLOTS_PRICE(request.indexSlot))
            result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        else if (request.clientCoin < game.coin)
            result = ErrorConst.CLIENT_COIN_NOT_MATCH;
        else result = userControl.purchase(transactionId, request.clientPrice, PurchaseInfo.fishingHireSlot(cmd, request.indexSlot));

        if (result == ErrorConst.SUCCESS)
        {
        	removeItem = new MapItem (ItemId.COIN, request.clientPrice);
            fishing.hireSlot(request.indexSlot);
        }

        Message msg = new ResponseFishingHireSlot(cmd, result).packData(fishing.getSlots(), userControl.getCoin());
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             result == ErrorConst.SUCCESS ? (-request.clientPrice) : 0,
                             game.getGold(),
                             0,
                             request.indexSlot,
                             userControl.getCoin(),
                             request.clientPrice,
                             request.clientCoin
                            );
    }

    private void fishingCollectHook (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestFishingCollectHook request = new RequestFishingCollectHook(dataCmd);

        UserGame game = userControl.game;
        Fishing fishing = game.getFishing();

        byte result;
        String hookReceive = null;
        MapItem receiveItem = null;

        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!fishing.canCollectHook(request.slotIndex))
            result = ErrorConst.INVALID_STATUS;
        else
        {
            hookReceive = fishing.getSlotHook(request.slotIndex);
            result = game.checkAndAddItem(cmd, transactionId, hookReceive, 1);
            if (result == ErrorConst.SUCCESS)
            {
            	receiveItem = new MapItem (hookReceive, 1);
                fishing.collectHook(request.slotIndex);
            }
        }

        Message msg = new ResponseFishingCollectHook(cmd, result).packData(fishing.getSlots(), game.getMapItemNum(hookReceive));
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             receiveItem,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.slotIndex
                            );
    }

    private void fishingProduceHook (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        RequestFishingProduceHook request = new RequestFishingProduceHook(dataCmd);

        UserGame game = userControl.game;
        Fishing fishing = game.getFishing();
        ItemInfo itemInfo = ConstInfo.getItemInfo(request.hookId);
        HookInfo hookInfo = (itemInfo != null && itemInfo.TYPE() == ItemType.HOOK) ? (HookInfo) itemInfo : null;
        MapItem produceHookRequire = null;

        byte result;
        MapItem removeItem = null;

        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (fishing == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!fishing.canProduceHook(request.slotIndex) || hookInfo == null)
            result = ErrorConst.INVALID_STATUS;
        else
        {
            produceHookRequire = fishing.getHookRequire(request.hookId);
            result = game.removeItem(cmd, transactionId, produceHookRequire);
            if (result == ErrorConst.SUCCESS)
            {
                removeItem = produceHookRequire;
                fishing.produceHook(request.slotIndex, hookInfo, game.getLevel());
            }
        }

        Message msg = new ResponseFishingProduceHook(cmd, result).packData(fishing.getSlots(), fishing.getHookProduceRequire(), game.getMapItemNum(produceHookRequire));
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             request.slotIndex,
                             request.hookId
                            );
    }

    private void fishingGet (short cmd, UserControl userControl)
    {
        byte result;
        UserGame game = userControl.game;

        Fishing fishing = null;

        if (!MiscInfo.FISHING_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.FISHING_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if ((fishing = game.getFishing()) == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            result = ErrorConst.SUCCESS;
            fishing.update(game.getLevel());
        }

        Message msg = new ResponseFishingGet(cmd, result).packData(fishing);
        userControl.send(msg);
    }

    private static void event03ReceiveRewards (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        Festival festival = game.getFestival();

        final String eventId = ItemId.E3ID;
        Event03Info eventInfo = (Event03Info) ConstInfo.getFestival().getAction(eventId);

        RequestEvent03ReceiveRewards request = new RequestEvent03ReceiveRewards(dataCmd);
        int checkpoint = request.checkpoint;

        int mailId = -1;
        MapItem receiveItem = null;
        String eventPointId = "";
        int eventPointNum = 0;

        byte result = ErrorConst.SUCCESS;
        if (eventInfo == null || !eventInfo.isActive())
            result = ErrorConst.INVALID_ACTION;
        else if (festival.isCheckpointReceived(eventId, checkpoint))
            result = ErrorConst.EMPTY;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
            eventPointId = eventInfo.POINT();
            eventPointNum = game.numStockItem(eventPointId);

            if (eventPointNum < checkpoint)
                result = ErrorConst.NOT_ENOUGH_ITEM;
            else
            {
                receiveItem = eventInfo.getRewards(checkpoint, game.getLevel());
                int rewardId = eventInfo.getRewardId(checkpoint, game.getLevel());
                if (rewardId > 0 && receiveItem != null && !receiveItem.isEmpty())
                {
                    Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.EV03_REWARD_TITLE(), MiscInfo.EV03_REWARD_CONTENT(), receiveItem);
                    if (mail != null)
                        mailId = mail.getUid();
                }

                if (mailId == -1)
                {
                    result = ErrorConst.NULL_OBJECT;
                    receiveItem = null;
                }
                else
                {
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                    festival.addRewardReceived(eventId, rewardId);
                    userControl.markFlagSaveGame();

                    userControl.notifyMail(false);
                }
            }
        }

        Message msg = new ResponseEvent03ReceiveRewards(cmd, result).packData(mailId, receiveItem);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             eventId,
                             (eventPointId.isEmpty() ? "unknow" : eventPointId) + ":" + checkpoint,
                             (eventPointId.isEmpty() ? "" : (eventPointId + ":" + eventPointNum)),
                             mailId
                            );
    }
	
    private static void dailyGiftGet (short cmd, UserControl userControl)
    {
        UserGame game = userControl.game;

        byte result;
        DailyGift dailyGift = game.getDailyGift();

        if (dailyGift == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            dailyGift.resetDaily(game.getLevel());
            result = ErrorConst.SUCCESS;
        }

        Message msg = new ResponseDailyGiftGet(cmd, result).packData(dailyGift);
        userControl.send(msg);
    }
    
    private static void accumulateGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserAccumulate accumulate = game.getAccumulate();
        CasValue<AccumulateStore> cas = AccumulateStore.gets(ConstInfo.getAccumulate().ID());
        AccumulateStore store = null;
        
        if (!MiscInfo.ACCUMULATE_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.ACCUMULATE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!ConstInfo.getAccumulate().isActive())
        	result = ErrorConst.INVALID_ACTION;
        else if (accumulate == null)
            result = ErrorConst.NULL_OBJECT;
        
        if (result == ErrorConst.SUCCESS)
        {
        	if (cas != null)
            {
            	store = cas.object;
            	store.update();
            	
            	AccumulateStore.cas(ConstInfo.getAccumulate().ID(), cas.cas, store);	
            }
        }

        Message msg = new ResponseAccumulateGet(cmd, result).packData(accumulate, store, game.getMapItemNum (MiscInfo.ACCUMULATE_TOKEN_ID()));
        userControl.send(msg);
    }

    private static void accumulateMilstoneReward (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        UserAccumulate accumulate = game.getAccumulate();
        
        RequestAccumulateMilestoneReward request = new RequestAccumulateMilestoneReward(dataCmd);
        int checkpoint = request.checkpoint;
        PaymentAccumulateInfo.Reward rewardInfo = null;
        MapItem reward = null;
        int mailID = -1;
        int rewardID = -1;
        
        if (!MiscInfo.ACCUMULATE_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.ACCUMULATE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!ConstInfo.getAccumulate().isActive())
        	result = ErrorConst.INVALID_ACTION;
        else if (accumulate == null)
            result = ErrorConst.NULL_OBJECT;
        else if (accumulate.isCheckpointClaim (checkpoint))
        	result = ErrorConst.LIMIT;
        else if (accumulate.getCoins () < checkpoint)
        	result = ErrorConst.NOT_ENOUGH_ITEM;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
        	rewardInfo = ConstInfo.getAccumulate().getMilestoneReward(checkpoint, game.getLevel());
            if (rewardInfo != null)
            {
            	rewardID = rewardInfo.ID();
            	reward = rewardInfo.ITEMS ();
                Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.ACCUMULATION_REWARD_TITLE(), MiscInfo.ACCUMULATION_REWARD_CONTENT(), reward);
                if (mail != null)
                    mailID = mail.getUid();
            }

            if (mailID == -1)
            {
                result = ErrorConst.EMPTY;
                reward = null;
                rewardID = -1;
            }
            else
            {
                MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox);
                accumulate.addCheckpoint(checkpoint, rewardInfo.ID()); 
                userControl.markFlagSaveGame();
                userControl.notifyMail(false);
            }
        }

        Message msg = new ResponseAccumulateMilestoneReward(cmd, result).packData(accumulate, checkpoint, rewardID);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             checkpoint,
                             rewardID,
                             mailID
                            );
    }
    
    private static void accumulateStore (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        MailBox mailBox = userControl.loadAndUpdateMailBox();
        UserAccumulate accumulate = game.getAccumulate();
        
        RequestAccumulateStore request = new RequestAccumulateStore(dataCmd);
        String packID = request.itemID;
        
        PaymentAccumulateInfo accumulateInfo = ConstInfo.getAccumulate();
        CasValue<AccumulateStore> cas = AccumulateStore.gets(accumulateInfo.ID());
        AccumulateStore store = (cas == null) ? null : cas.object;
        
        MapItem removeItems = null;
        MapItem reciveItems = null;
        int mailID = -1;
        
        if (!accumulateInfo.isActive())
        	result = ErrorConst.NOT_ACTIVE;
        else if (game.getLevel() < MiscInfo.ACCUMULATE_USER_LEVEL())
            result = ErrorConst.LIMIT_LEVEL;
        else if (!accumulateInfo.storeCheck(packID))
        	result = ErrorConst.INVALID_ITEM;
        else if (!accumulateInfo.countryCheck(packID, game.getCountry()))
            result = ErrorConst.INVALID_COUNTRY;
        else if (cas == null || store == null)
            result = ErrorConst.GETS_FAIL;
        else if (accumulate == null)
            result = ErrorConst.NULL_OBJECT;
        else if (accumulate.isLimit (packID))
            result = ErrorConst.LIMIT;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else
        {
        	result = game.checkRequireItem (MiscInfo.ACCUMULATE_TOKEN_ID(), accumulateInfo.storeItemPrice(packID));
            
        	if (result == ErrorConst.SUCCESS)
        	{
            	store = cas.object;
                store.update ();
                result = store.item_sell (packID);
        	}

        	if (result == ErrorConst.SUCCESS)
        	{
            	removeItems = new MapItem (MiscInfo.ACCUMULATE_TOKEN_ID(), accumulateInfo.storeItemPrice(packID));
            	reciveItems = accumulateInfo.storeItem (packID);
            	
            	accumulate.addItem (packID);
            	accumulate.addTokenSpent(accumulateInfo.storeItemPrice(packID));
            	
        		Mail mail = mailBox.addMailPrivate(MiscDefine.MAIL_EVENT, MiscInfo.ACCUMULATION_STORE_TITLE(), MiscInfo.ACCUMULATION_STORE_CONTENT(), reciveItems);
                if (mail != null)
                    mailID = mail.getUid();
                
                if (mailID == -1)
                    result = ErrorConst.EMPTY;
        	}

            if (result == ErrorConst.SUCCESS)
            {
            	if (AccumulateStore.cas(accumulateInfo.ID(), cas.cas, store))
                {
                	game.removeItem(cmd, transactionId, removeItems);
                	
                    MailBox.set(userControl.brief.getBucketId(), userControl.userId, mailBox); 
                    userControl.markFlagSaveGame();
                    userControl.notifyMail(false);
                }
                else
                {
                	result = ErrorConst.CAS_FAIL;
                }
            }
            
            if (result != ErrorConst.SUCCESS)
            {
            	removeItems = null;
            	reciveItems = null;
            	mailID = -1;
            }
        }

        Message msg = new ResponseAccumulateStore(cmd, result).packData(accumulate, store, game.getMapItemNum (removeItems), packID);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             game.getLevel(),
                             transactionId,
                             removeItems,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             packID,
                             mailID
                            );
    }

    public static boolean useTestPayment (Payment payment)
    {
        boolean isLocal = EnvConfig.environment() == EnvConfig.Environment.LOCAL;
        boolean useTestPayment = EnvConfig.environment() == EnvConfig.Environment.SERVER_TEST && payment.useTestPayment();
        return isLocal || useTestPayment;
    }
    private static void posmSetUserInfo (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestPOSMSetUserInfo request = new RequestPOSMSetUserInfo(dataCmd);

        POSMUserInfoData posmUserInfoData = game.getPOSMInfoData();

        POSMUserInfoData.POSMUserInfo posmInfo = posmUserInfoData.getPOSMUSerInfo(request.itemId);

        if (posmInfo == null)
            result = ErrorConst.NULL_OBJECT;
        else if (request.name.length() == 0 || request.phoneNumber.length() == 0 || request.address.length() == 0
                ||request.name.length() > 50 || request.phoneNumber.length() > 15 || request.address.length() > 200)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            posmInfo.updateInfo( request.name, request.phoneNumber, request.address);
            //result = posmUserInfoData.updatePOSMInfo(request.itemId, request.name, request.phoneNumber, request.address);
        }

        Message msg = new ResponsePOSMSetUserInfo(cmd, result).packData(posmInfo);
        userControl.send(msg);

        MetricLog.actionUser(userControl.country,
                cmd,
                userControl.platformID,
                userControl.brief.getUserId(),
                userControl.brief.getUsername(),
                userControl.socialType,
                game.getLevel(),
                transactionId,
                null,
                null,
                result,
                userControl.getCoin(),
                0,
                game.getGold(),
                0,
                request.name,
                request.phoneNumber,
                request.address,
                request.itemId
        );
    }

    private static void posmGetUserInfo (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestPOSMGetUserInfo request = new RequestPOSMGetUserInfo(dataCmd);

        POSMUserInfoData posmUserInfoData = game.getPOSMInfoData();
        POSMUserInfoData.POSMUserInfo posmInfo = posmUserInfoData.getPOSMUSerInfo(request.itemId);

        if (posmInfo == null)
            result = ErrorConst.NULL_OBJECT;
        else
            result = ErrorConst.SUCCESS;

        Message msg = new ResponsePOSMGetUserInfo(cmd, result).packData(posmInfo);
        userControl.send(msg);

    }
}