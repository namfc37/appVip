<?php
//error_reporting(0);
$GLOBALS['THRIFT_ROOT'] = '../../log/thrift';
require '../../log/zf_log.php';
require "../../all/out/Billing.php";
require '../../all/config/DataProvider.php';
require '../../all/out/Card.php';
require '../../log/IfrsLog.php';
require_once '../../all/cmd/xu_update.php';
require_once 'utils.php';
require_once '../../all/config/BuyGoldType.php';

$serviceName = $_REQUEST['serviceName'];

$objCard = new Card();
$objCard->userId = intval($_REQUEST['uId']);
$objCard->username = $_REQUEST['userName'];

$result = array();

function microtime_float ()
{
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}


try
{
    switch ($serviceName)
    {
        case  'balance' :
            //$time_start = microtime_float();

            $ret = Billing::balance($objCard->userId, $objCard->username);
			if (is_object($ret))
			{
				$objCard->coinRemain = $ret->CashRemain;
				$objCard->updateCoinToDB();
			}

            //$time_end = microtime_float();
            //Zf_log::write_time_exec_log($CONFIG_DATA['gameId'], $objCard->userId, 'balance', round(1000 * ($time_end - $time_start)), $ret);
            break;

        case  'purchase' :
            //$time_start = microtime_float();

            $itemInfo = $_REQUEST['itemInfo'];
            $action = $_REQUEST['action'];
            $money = $_REQUEST['money'];
            $objCard->appTrans = $_REQUEST['transactionId'];
            $objCard->description = $_REQUEST['description'];
            $objCard->level = $_REQUEST['level'];
            $objCard->socialType = $_REQUEST['socialType'];
            $objCard->platformID = $_REQUEST['platformID'];

            $arrItemInfo = explode(':', $itemInfo);
            $itemId = $arrItemInfo[0];
            $itemName = $arrItemInfo[1];
            $itemNum = $arrItemInfo[2];

            $ret = Billing::purchase($objCard->userId, $objCard->username, $money, $itemInfo);

            if (is_object($ret))
            {
                if ($ret->RetCode == 1)
                {
                    $objCard->coinRemain = $ret->CashRemain;
                    $objCard->bilTrans = $ret->PurchaseID;
                    $objCard->updateCoinToDB();

                    $error = 0;
                    IfrsLog::writeLog($objCard, $objCard->userId, -abs($money), 0, $itemId, $itemName, $money, 0, 0, 'mobile', $objCard->appTrans);
                }
                else
                {
                    $error = 1;
                    $objCard->description = "Res:".$ret->RetCode;
                }
            }
            else
            {
                $error = 2;
                $objCard->description = "Err:".$ret;
            }
            Zf_log::spent($objCard->userId, $action, $objCard->appTrans, $objCard->bilTrans, $itemId, $itemName, $itemNum, $error, $objCard->description, $objCard->coinRemain, $objCard->coinCash, $objCard->coinPromo, $money, $objCard->level, $objCard->username, $objCard->socialType, $objCard->platformID);

            //$time_end = microtime_float();
            //Zf_log::write_time_exec_log($CONFIG_DATA['gameId'], $objCard->userId, 'purchase', round(1000 * ($time_end - $time_start)), $ret);
            break;

        case  'promo' :
            //$time_start = microtime_float();

            $campaign = $_REQUEST['campaign']; //101: tặng G trong game, 102: tặng khi nạp, 104: đền bù, 105: convert data
            $objCard->gateway = "js_Ingame";
            $objCard->appTrans = $_REQUEST['appTrans'];
            $objCard->payTrans = $_REQUEST['payTrans'];
            $objCard->type = $_REQUEST['type'];
            $objCard->description = $_REQUEST['description'];
            $objCard->coinConvert = $_REQUEST['money'];
            $objCard->addCash = 0;
            $objCard->addPromo = 0;
            $objCard->level = $_REQUEST['level'];
            $objCard->socialType = $_REQUEST['socialType'];
            $objCard->platformID = $_REQUEST['platformID'];

            $ret = Billing::addCash($objCard->userId, $objCard->username, $objCard->coinConvert, $campaign, 'Promo', 1, $objCard->payTrans, $objCard->appTrans);

            if (is_object($ret))
            {
                if ($ret->RetCode == 1)
                {
                    $objCard->coinRemain = $ret->CashRemain;
                    $objCard->addPromo = $objCard->coinConvert;
                    $objCard->bilTrans = $ret->CashID;
                    $objCard->updateCoinToDB();

                    $error = 0;
                    IfrsLog::writeLog($objCard, $objCard->userId, 0, $objCard->coinConvert, $objCard->gateway, $objCard->type, $objCard->coinConvert, 0, 0, 'mobile', $objCard->appTrans);
                }
                else
                {
                    $error = 1;
                    $objCard->description = "Res:".$ret->RetCode;
                }
            }
            else
            {
                $error = 2;
                $objCard->description = "Err:".$ret;
            }
            $objCard->logPaying($error);

            //$time_end = microtime_float();
            //Zf_log::write_time_exec_log($CONFIG_DATA['gameId'], $objCard->userId, 'promo', round(1000 * ($time_end - $time_start)), $ret);
            break;

        case 'addCashIAP':
            $objCard->gateway = "js_IAP";
            $objCard->type = $_REQUEST['type'];
            $objCard->gross = $_REQUEST['gross'];
            $objCard->net = $_REQUEST['net'];
            $objCard->coinConvert = intval($_REQUEST['money']);
            $objCard->convertCash = intval($_REQUEST['gConvert']);
            $objCard->convertPromo = $objCard->coinConvert - $objCard->convertCash;
            $objCard->payTrans = $_REQUEST['transactionId'];
            $objCard->appTrans = $_REQUEST['appTrans'];
            $objCard->item = $_REQUEST['item'];
            $objCard->level = $_REQUEST['level'];
            $objCard->offer = $_REQUEST['offer'];
            $objCard->socialType = $_REQUEST['socialType'];
            $objCard->platformID = $_REQUEST['platformID'];

            $ret = $objCard->addCoinIAP();
            if (is_object($ret))
            {
                if ($ret->RetCode == 1)
                {
                    $objCard->updateCoinToDB();
                    //$objCard->updateGToGameSocket();

                    $error = 0;
                    IfrsLog::writeLog($objCard, $objCard->userId, $objCard->addCash, $objCard->addPromo, $objCard->gateway, $objCard->type, $objCard->coinConvert, $objCard->gross, $objCard->net, 'mobile', $objCard->appTrans . ":" . $objCard->payTrans);
                }
                else
                {
                    $error = 1;
                    $objCard->description = "Res:".$ret->RetCode;
                }
            }
            else
            {
                $error = 2;
                $objCard->description = "Err:".$ret;
            }
            $objCard->logPaying($error);
            break;

        default :
            $ret = -100;
            break;
    }
    $success = 1;
}
catch (Exception $falt)
{
    $success = -1001;
}

if (!is_object($ret))
{
    $result[0] = $ret;
    $result[1] = array();
}
else
{
    $result[0] = $success;
    $result[1] = $ret;
}

echo json_encode($result);
