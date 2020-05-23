<?php
/**
 * Created by PhpStorm.
 * User: hieupt
 * Date: 9/19/2016
 * Time: 11:13 AM
 */

//error_reporting(0);
importLibraries();
defineVariables();

$objCard = new Card();
$objCard->gateway = $CONFIG_DATA['GATEWAY'];

$input = file_get_contents('php://input');
$requestData = json_decode($input, true);

if ($CONFIG_DATA['IS_DIRECT'] && !validateMac($requestData['mac'], $requestData['data'], $CONFIG_DATA['DIRECT_KEY2']))
{
    processAction($objCard, INVALID_MAC);
    exit;
}

$data = json_decode($requestData['data'], true);

$objCard->username = $data['appUser'];
$objCard->net = intval($data['netAmount']);
$objCard->gross = intval($data['amount']);
$objCard->type = channelToType($data['channel']);

$objCard->coinConvert = intval($data['amount'] / RATE_VND_TO_COIN);
$objCard->convertCash = intval($data['netAmount'] / RATE_VND_TO_COIN);
if ($objCard->type == 'PSms' || $objCard->type == 'PSmsMobi') //SMS
    $objCard->coinConvert *= 80 / 100;
$objCard->convertPromo = $objCard->coinConvert - $objCard->convertCash;

$objCard->appTrans = $data['appTranxId'];
$objCard->payTrans = $data['zacTranxId'];
$objCard->appTime = $data['appTime'];

if ($CONFIG_DATA['IS_DIRECT'])
{
    $embedData = json_decode($data['embedData'], true);
    $objCard->subType = $embedData['channel'];
    $objCard->item = $embedData['item'];
    $objCard->offer = $embedData['offer'];
    $objCard->level = $embedData['level'];
    $objCard->socialType = $embedData['socialType'];
    $objCard->platformID = $embedData['platformID'];
}

if ($CONFIG_DATA['IS_MILLI_APP_TIME'])
    $isExpire = $objCard->appTime + $CONFIG_DATA['expire_transaction'] * 1000 < millisTime();
else
    $isExpire = $objCard->appTime + $CONFIG_DATA['expire_transaction'] < secondTime();

if ($isExpire)
{
    processAction($objCard, EXPIRED);
}
else if ($data['appId'] != $CONFIG_DATA['APP_ID'])
{
    processAction($objCard, INVALID_APP_ID);
}
else if ($objCard->username == '' || $objCard->appTrans == '' || $objCard->payTrans == '')
{
    processAction($objCard, ERROR_PARAM);
}
else if (!updateUserId($objCard->username, $objCard))
{
    processAction($objCard, ACCOUNT_INVALID);
}
else if (!DataProvider::lockTransaction($objCard->payTrans, $requestData['data']))
{
    processAction($objCard, DUPLICATE_TRANS);
}
else
{
    $resBilling = $objCard->addGToBillingAddCash();
    if (is_object($resBilling))
    {
        if ($resBilling->RetCode == 1)
        {
            DataProvider::appendProcessing($objCard->userId, $objCard);
            $objCard->updateCoinToDB();
            $objCard->updateGToGameSocket();

            $result = SUCCESS;
            IfrsLog::writeLog($objCard, $objCard->userId, $objCard->addCash, $objCard->addPromo, $objCard->gateway, $objCard->type, $objCard->coinConvert, $objCard->gross, $objCard->net, 'mobile', $objCard->appTrans . ":" . $objCard->payTrans);
        }
        else
        {
            $result = BILLING_RES;
            $objCard->description = "Res:".$resBilling->RetCode;
        }
    }
    else
    {
        $result = FAIL;
        $objCard->description = "Err:".$resBilling;
    }

    if ($result != SUCCESS)
        DataProvider::unlockTransaction($objCard->payTrans);
    processAction($objCard, $result);
}


function defineVariables ()
{
    define('SUCCESS', 0);
    define('DUPLICATE_TRANS', 1);
    define('INVALID_APP_ID', 2);
    define('ERROR_PARAM', 3);
    define('ACCOUNT_INVALID', 4);
    define('BILLING_RES', 5);
    define('INVALID_MAC', 6);
    define('EXPIRED', 7);
    define('FAIL', 8);

    global $ERROR_MESSAGE;
    $ERROR_MESSAGE = array(
        SUCCESS => 'Success',
        DUPLICATE_TRANS => 'Duplicated transactionID',
        INVALID_MAC => 'Invalid sign',
        INVALID_APP_ID => 'Invalid AppId',
        ERROR_PARAM => 'Missing param',
        ACCOUNT_INVALID => 'Account not exist',
        BILLING_RES => 'Billing Response Fail',
        EXPIRED => 'Transaction expired',
        FAIL => 'fail',
    );
}

function importLibraries ()
{
    $GLOBALS['THRIFT_ROOT'] = '../../log/thrift';
    require_once '../../log/zf_log.php';
    require_once "../../all/out/Billing.php";
    require_once '../../all/config/DataProvider.php';
    require_once '../../all/cmd/xu_update.php';
    require_once '../../log/IfrsLog.php';
    require_once 'Card.php';
    require_once 'utils.php';
    require_once '../../all/config/BuyGoldType.php';
}

function validateMac ($mac, $data, $key)
{
    return $mac == hash_hmac("sha256", $data, $key);
}

function updateUserId ($username, $objCard)
{
    $uid = DataProvider::getUserIdByUsername($username);
    if ($uid === false)
        return false;

    $objCard->userId = intval($uid);
    return true;
}

function processAction ($objCard, $result)
{
    global $ERROR_MESSAGE;

    $res = array();
    if ($result == SUCCESS)
        $res['errorCode']= 1;
    else if ($result == DUPLICATE_TRANS)
        $res['errorCode']= 2;
    else
        $res['errorCode']= 3;

    if (isset($ERROR_MESSAGE[$result]))
        $res['errorMessage'] = $ERROR_MESSAGE[$result];
    else
        $res['errorMessage'] = 'Error ' . $result;

    echo json_encode($res);

    $objCard->logPaying($result);
    exit;
}

function channelToType ($channel)
{
    //DO NOT EDIT KEY OR VALUE
    $billingType = array(
        1 => 'PZingCard',
        2 => 'PMobiCard',
        3 => 'PVinaCard',
        4 => 'PVTTCard',
        5 => 'PSms',
        6 => 'PAtm',
        36 => 'PAtm', //credit
        38 => 'ZaloPay',
        42 => 'WebSMS',
        45 => 'PVNMCard',
        51 => 'PAtm',
        52 => 'PAtm', //credit	
        58 => 'PSmsMobi', //sms mobifone
        59 => 'PSmsVina', //sms vinaphone
    );

    if (isset($billingType[$channel]))
        return $billingType[$channel];
    else
        return 'Other';
}

