<?php
require_once 'log_analytic.php';

class Zf_log
{
    /**
     * send log
     * @param int $uId zing id user action
     * @param int $ownerId zing id farmer
     * @param string $act name action
     * @param int $gold money ingame
     * @param int $xu zing xu
     * @param int $exp exp ingame
     * @param int $level level ingame
     * @param string $params ex: 1 2 3 4 5
     */
    public static function write_act_log ($game, $uId, $ownerId = 0, $mid = 0, $act = '', $gold_change = 0, $xu_change = 0, $gold_rest = 0, $xu_rest = 0, $param1 = 0, $param2 = 0, $param3 = 0, $param4 = 0, $param5 = 0)
    {
        $LogAnalytic = new LogAnalytic($game);
        $logData = array(
            'uid' => $uId,
            'ownerId' => $ownerId,
            'mid' => $mid,
            'act' => $act,
            'gold_change' => $gold_change,
            'xu_change' => $xu_change,
            'gold_rest' => $gold_rest,
            'xu_rest' => $xu_rest,
            'param1' => $param1,
            'param2' => $param2,
            'param3' => $param3,
            'param4' => $param4,
            'param5' => $param5,
        );
        /*
         * send log
         */
        $LogAnalytic->sendActLog($logData);
    }

    /**
     * todo: ghi log ifrs theo format moi
     * owner: thuytt2
     * date: 20/11/2013
     * format: userId, currentXu, currentPromo, stime, serverId, changeXu, changePromo, itemId, actionId, unitPrice
     */
    public static function ifrs ($game, $userId, $currentXu, $currentPromo, $changeXu, $changePromo, $itemId, $actionId,
                                 $unitPrice, $grossRev, $netRev, $userSource, $tranId = '', $sourcePartner = '', $sourcePay = '')
    {
        global $CONFIG_DATA;

        $LogAnalytic = new LogAnalytic(date('Ymd'));
        $logData = array(
            'userId' => $userId,
            'currentXu' => $currentXu,
            'currentPromo' => $currentPromo,
            'serverId' => $CONFIG_DATA['LogServerId'],
            'changeXu' => $changeXu,
            'changePromo' => $changePromo,
            'itemId' => $itemId,
            'actionId' => $actionId,
            'unitPrice' => $unitPrice,
            'grossRev' => $grossRev,
            'netRev' => $netRev,
            'userSource' => $userSource,
            'tranId' => $tranId,
            'sourcePartner' => $sourcePartner,
            'sourcePay' => $sourcePay
        );
        /*
         * send log
         */
//        echo '<BR> LOG:';
//        var_dump($logData);
        $LogAnalytic->ifrs($logData);
    }

    public static function paying ($userId, $gateway, $type, $subType,
                                   $appTrans, $payTrans, $bilTrans,
                                   $item, $result, $description,
                                   $gross, $net,
                                   $coinRemain, $coinCash, $coinPromo,
                                   $coinConvert, $addCash, $addPromo,
                                   $offer, $level, 
                                   $currency,
                                   $username, $socialType, $platformID
    )
    {
        global $CONFIG_DATA;
        $LogAnalytic = new LogAnalytic('PAYING');

        $logData = array(
            millisTime(),
            $userId,
            $username,
            $socialType,
            "", // partner code
            "", // reference code or market
            $platformID, // ["web", "iOS", "androidC", "androidJS", "Windows Phone"]
            "", // tracking source
            "COMMON", // group action name
            "PAYING", //action
            0, //gold
            $coinRemain, //coin
            0, //gold change
            $coinConvert, //coin change

            $CONFIG_DATA['LogServerId'], //vServerID
            $gateway,
            $type,
            $subType,
            $appTrans,
            $payTrans,
            $bilTrans,
            $item,
            $result,
            $description,
            $gross,
            $net,            
            $coinCash,
            $coinPromo,            
            $addCash,
            $addPromo,
			$offer,
            $level,
            getRealIp(),
            $currency
        );

        return $LogAnalytic->sendLog("|", $logData);
    }

    public static function spent ($userId, $action,
                                  $appTrans, $bilTrans,
                                  $itemId, $itemName, $itemNum,
                                  $result, $description,
                                  $coinRemain, $coinCash, $coinPromo,
                                  $spent, $level, 
                                  $username, $socialType, $platformID
    )
    {
        global $CONFIG_DATA;
        $LogAnalytic = new LogAnalytic('SPENT_COIN');

        $logData = array(
            millisTime(),
            $userId,
            $username,
            $socialType,
            "", // partner code
            "", // reference code or market
            $platformID, // ["web", "iOS", "androidC", "androidJS", "Windows Phone"]
            "", // tracking source
            "COMMON", // group action name
            "SPENT", //action
            0, //gold
            $coinRemain, //coin
            0, //gold change
            -$spent, //coin change

            $CONFIG_DATA['LogServerId'], //vServerID
            $action,
            $appTrans,
            $bilTrans,
            $itemId,
            $itemName,
            $itemNum,
            $result,
            $description,            
            $coinCash,
            $coinPromo,
            $level,
            getRealIp()
        );

        return $LogAnalytic->sendLog("|", $logData);
    }

    public static function write_time_exec_log ($gameId, $uId, $action, $deltaTime, $ret)
    {
        $LogAnalytic = new LogAnalytic('billing_time_exec');

        $logData = array(
            $gameId,
            $uId,
            $action,
            $deltaTime,
            json_encode($ret),
        );

        return $LogAnalytic->sendLog(" | ", $logData);
    }
    
    public static function info ($logData = array())
    {
        $LogAnalytic = new LogAnalytic('INFO');
        return $LogAnalytic->sendLog("\t", $logData);
    }
}
