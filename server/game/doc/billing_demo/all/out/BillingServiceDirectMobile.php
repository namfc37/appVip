<?php
/**
 * Created by PhpStorm.
 * User: hieupt
 * Date: 9/19/2016
 * Time: 11:13 AM
 */

error_reporting(0);
importLibraries();
defineVariables();


$input = file_get_contents('php://input');
$requestData = json_decode($input, true);

$promoType = 0;
if (isset($requestData['promotype']))
    $promoType = $requestData['promotype'];

$direct_app_id = $CONFIG_DATA['FORWARD_APPID_PORTAL'];
$direct_key2 = $CONFIG_DATA['FORWARD_KEY2_PORTAL'];

global $CHECK_SIGN;

if ($CHECK_SIGN){
    if (!validateMac($requestData['mac'],$requestData['data'],$direct_key2)){
        processAction($CONFIG_DATA['gameId'],INVALID_MAC,$objCard,"");
        exit;
    }
}

$configExist = importConfig($CONFIG_DATA['gameId']);
$data = json_decode($requestData['data'],true);

$sourceChannel = $data['embedData'];
$arr_source = explode("||",$sourceChannel);
$sourceChannel = $arr_source[0];

$res = array();
$res['errorCode'] = OK;

$objCard =  new Card();
$objCard->username = $data['appUser'];
$objCard->Type = 'PaymentDirect';
$objCard->MobileOperator = $data['channel'];
$objCard->NetAmount = intval($data['netAmount']);
$objCard->GrossAmount = intval($data['amount']);
$objCard->G_addGame = intval($data['netAmount']/100);
$objCard->G_convert = intval($data['amount']/100);


/*
 * both portal and web will assign for portal revenue
 */
if (!$CHECK_SIGN)
    $objCard->cashTypeBilling = convertCashBillingTypeWeb($data['channel']);
else if ($IS_PORTAL)
    $objCard->cashTypeBilling = convertCashBillingTypePortal($data['channel']);
else if ($sourceChannel=='so6')
    $objCard->cashTypeBilling = convertCashBillingTypeWebGame($data['channel']);
else
    $objCard->cashTypeBilling = convertCashBillingType($data['channel']);


$objCard->TransactionID = $data['zacTranxId'];
$objCard->Sig = $requestData['mac'];
$objCard->RequestTime = $data['zacServerTime'];
$objCard->TypePay = 'DirectMobilePay';

/*
 * bonus G, in ZaloPay, grossamount = 46750, netamount = 50000
 */

$objCard->cashTypeBilling = "ZaloPay";

if (!isBuyGold($objCard->cashTypeBilling, $data['embedData'])){
    if (isZaloPay($objCard->cashTypeBilling)){
        $objCard->G_bonus = getGBonus($objCard->G_addGame, $objCard->cashTypeBilling);
    }
    else{
        $objCard->G_bonus = $objCard->G_convert - $objCard->G_addGame + getGBonus($objCard->G_convert, $objCard->cashTypeBilling);
    }

}


/*
 * bonus promoType
 */
if (!isBuyGold($objCard->cashTypeBilling, $data['embedData']))
    $objCard->G_bonus += floor($objCard->G_convert*$promoType/100);

if ($CHECK_SIGN &&!$IS_FORWARD){
    if ($data['appId']!=$direct_app_id){
        dumplogData("appId=: " .$data['appId'].'_configid='.$direct_app_id);
        processAction($CONFIG_DATA['gameId'],INVALID_APPID,$objCard,"");
    }
}

if($data['appUser'] == '' || $data['zacTranxId']=='') {
    processAction($CONFIG_DATA['gameId'],ERROR_PARAM,$objCard,"");
}
else if (!$configExist){
    processAction($CONFIG_DATA['gameId'],CONFIG_MISSING,$objCard,"");
}
else if (!isExistUser($data['appUser'], $objCard)){
    processAction($CONFIG_DATA['gameId'],ACCOUNT_INVALID,$objCard,"");
}
else if (DataProvider::getCache("direct_trans_" . $data['zacTranxId'])){
    processAction($CONFIG_DATA['gameId'],DUPLICATE_TRANS,$objCard,"");
}
else {
    $resBilling = $objCard->addGToBillingAddCash();
    if(is_object($resBilling) && $resBilling->RetCode == 1){
        $CashRemain = $resBilling->CashRemain;
        $objCard->updateGToDB($CashRemain);

        // update SMS
        if (isSaveNewFormat($CONFIG_DATA['gameId'])){
            if (isSMSType($objCard->cashTypeBilling) && $CONFIG_DATA['IS_CONVERT_TO_ITEM']) {
                if (isInEvent() && $sourceChannel === '1')
                    $objCard->updateBuyGoldToDB(0, BuyGoldType::$SMS_EVENT);
                else
                    $objCard->updateBuyGoldToDB(0, BuyGoldType::$SMS);
            }
            else if (isBuyGoldATM($objCard->cashTypeBilling, $data['embedData']) && $CONFIG_DATA['IS_CONVERT_TO_ITEM']) {
                $objCard->updateBuyGoldToDB(0, BuyGoldType::$ATM);
            }
            else if (isBuyGoldZingCard($objCard->cashTypeBilling, $data['embedData']) && $CONFIG_DATA['IS_CONVERT_TO_ITEM']) {
                $objCard->updateBuyGoldToDB(0, BuyGoldType::$ZING_CARD);
            }
            else if (isBuyGoldZaloPay($objCard->cashTypeBilling, $data['embedData']) && $CONFIG_DATA['IS_CONVERT_TO_ITEM']) {
                $objCard->updateBuyGoldToDB(0, BuyGoldType::$ZALOPAY);
            }
        }
        else{
            if (isSMSType($objCard->cashTypeBilling) && $CONFIG_DATA['IS_CONVERT_TO_ITEM']) {
                if (isInEvent() && $sourceChannel === '1' && ($objCard->GrossAmount == 15000 || $objCard->GrossAmount == 5000))
                    $objCard->updateSMSEventToDB(0, true);
                else
                    $objCard->updateSMSToDB(0, true);
            }
        }

        $res['errorMessage'] = $ERROR_MESSAGE[$res['errorCode']];
        echo json_encode($res);


        $objCard->updateGToGameSocket($CONFIG_DATA['ServerSocket'],$CONFIG_DATA['PortSocket']);
        DataProvider::setCache("direct_trans_".$data['zacTranxId'],true);

        //write log ifrs
        $itemIdIfrs = "Direct";
        $ifrsActionId = "Direct";

        //check source web or mobile
        $source = $objCard->getSourceByUserId($CONFIG_DATA['prefix'],$CONFIG_DATA['suffix_platform'],0,$CONFIG_DATA['gameId']);
        IfrsLog::writeLog($CONFIG_DATA['gameId'],$objCard->zingId,$CashRemain,0,$objCard->G_addGame,
            $objCard->G_bonus, $itemIdIfrs, $ifrsActionId,$objCard->G_addGame,
            $objCard->GrossAmount,$objCard->NetAmount,$source,$objCard->TransactionID);
        Zf_log::write_act_log('log_billing',$CONFIG_DATA['gameId'],$objCard->zingId,$objCard->username,100,'DIRECT Payment',json_encode($requestData),json_encode($objCard),json_encode($resBilling), $res['errorCode'], $res['errorMessage']);

        exit;
    }
    else{
        if(is_object($resBilling)){
            $res['errorCode'] = $resBilling->RetCode;
        } else {
            $res['errorCode'] = '-1000';
        }

        processAction($CONFIG_DATA['gameId'],BILLING_RES,$objCard,$resBilling);

        Zf_log::write_act_log('log_billing_error',$CONFIG_DATA['gameId'],$objCard->zingId,$objCard->username,100,'DIRECT Payment',json_encode($requestData),json_encode($objCard),json_encode($resBilling), json_encode($data));
    }
}



function defineVariables(){
    define('OK',1);
    define('INVALID_APPID',2);
    define('CONFIG_MISSING',3);
    define('ERROR_PARAM',4);
    define('ACCOUNT_INVALID',5);
    define('DUPLICATE_TRANS',6);
    define('BILLING_RES',7);
    define('INVALID_MAC',8);

    global $ERROR_MESSAGE;
    $ERROR_MESSAGE = array(
        OK => 'Add Cash success',
        INVALID_MAC => 'Invalid sign',
        INVALID_APPID => 'Invalid AppId',
        CONFIG_MISSING=>'Missing config',
        ERROR_PARAM => 'Missing param',
        ACCOUNT_INVALID=>'Account not exist',
        DUPLICATE_TRANS=>'Duplicated transactionID',
        BILLING_RES => 'Billing Response Fail'
    );
}

function importLibraries(){
    $GLOBALS['THRIFT_ROOT'] ='../../log/thrift' ;
    require_once '../../log/zf_log.php';
    require_once "../../all/out/Billing.php";
    require_once '../../all/config/DataProvider.php';
    require_once '../../all/config/xu_update.php';
    require_once '../../all/config/IfrsLog.php';
    require_once 'Card.php';
    require_once 'utils.php';
    require_once 'BuyGoldType.php';
}


function validateMac($mac, $data, $key){
    return $mac==genMac($data,$key);
}

function genMac($data, $key){
    return hash_hmac("sha256",$data,$key);
}

function validateSign($secret,$username, $time, $sign){
    return md5($secret.$username.$time)==$sign;
}

function isExistUser($username, $objCard){
    $uid = DataProvider::getZingIDByUsername(strtolower($username));
    if ($uid===false)
        return false;

    $objCard->zingId = intval($uid);
    return true;
}

function importConfig($gameId){
    return true;
    /*
    $gameName = strtolower($gameId);
    $result = false;
    switch($gameName)
    {
        case 'sam':
            $result = true;
            break;
    }
    return $result;
    */
}

function processAction($gameId,$action,$objCard,$resBilling){
    $res['errorCode'] = $action;
    global $ERROR_MESSAGE;

    // response payment
    if (isset($ERROR_MESSAGE[$res['errorCode']]))
        $res['errorMessage'] = $ERROR_MESSAGE[$res['errorCode']];
    else $res['errorMessage'] = 'Error '.$res['errorCode'];

    dumplogData("_res: " . json_encode($res));

    echo json_encode($res);

    // write log
    Zf_log::write_act_log('log_billing',$gameId,$objCard->zingId,$objCard->username,100+$action,'DIRECT Payment',json_encode($_REQUEST),json_encode($objCard),json_encode($resBilling), $res['errorCode'], $res['errorMessage']);

    exit;
}

function convertCashBillingType($type){
    $bilingType = array(
        100 => 'Other',
        1 => 'PZingCard',
        2 => 'PMobiCard',
        3 => 'PVinaCard',
        4 => 'PVTTCard',
        5 => 'PSms',
        6 => 'PAtm',
        38 => 'ZaloPay',
        42 => 'WebSMS',
        45 => 'PVNMCard'
    );

    if (isset($bilingType[$type]))
        return $bilingType[$type];
    else return $bilingType[100];
}

function convertCashBillingTypePortal($type){
    $bilingType = array(
        100 => 'Other',
        1 => 'PortalZing',
        2 => 'PortalMobi',
        3 => 'PortalVina',
        4 => 'PortalViet',
        5 => 'PortalSms',
        6 => 'PortalAtm',
        38 => 'PZaloPay',
        42 => 'WebSMS',
        45 => 'PortalVnm'
    );

    if (isset($bilingType[$type]))
        return $bilingType[$type];
    else return $bilingType[100];
}

function convertCashBillingTypeWeb($type){
    $bilingType = array(
        100 => 'Other',
        1 => 'WebZing',
        2 => 'WebMobi',
        3 => 'WebVina',
        4 => 'WebViet',
        5 => 'WebSms',
        6 => 'Atm',
        38 => 'ZaloPay',
        42 => 'WebSMS',
        45 => 'WebVnm'
    );

    if (isset($bilingType[$type]))
        return $bilingType[$type];
    else return $bilingType[100];
}

function convertCashBillingTypeWebGame($type){
    $bilingType = array(
        100 => 'Other',
        1 => 'ZingCardWv',
        2 => 'MobiCardWv',
        3 => 'VinaCardWv',
        4 => 'VietCardWv',
        5 => 'SmsWv',
        6 => 'Atm',
        38 => 'ZaloPay',
        42 => 'SmsWv'
    );

    if (isset($bilingType[$type]))
        return $bilingType[$type];
    else return $bilingType[100];
}

function isSMSType($billingType){
    return (strpos(strtolower($billingType),'sms') !== false);
    //return ($billingType=='PSms' || $billingType=='PortalSms' || $billingType=='WebSMS' || $billingType=='WebSms' || $billingType=='SmsWv');
}

function isBuyGold($billingType, $embedData){
    return isSMSType($billingType) || isBuyGoldATM($billingType, $embedData) || isBuyGoldZingCard($billingType, $embedData) || isBuyGoldZaloPay($billingType, $embedData);
}

function isBuyGoldATM($billingType, $embedData){
    $arr_source = explode("||",$embedData);
    if (count($arr_source) >= 3){
        return (strpos(strtolower($billingType),'atm') !== false && $arr_source[2]=="1");
    }
    else return false;
}

function isBuyGoldZingCard($billingType, $embedData){
    $arr_source = explode("||",$embedData);
    if (count($arr_source) >= 3){
        return (strpos(strtolower($billingType),'zing') !== false && $arr_source[2]=="1" && isSaveNewFormat($CONFIG_DATA['gameId']));
    }
    else return false;
}

function isBuyGoldZaloPay($billingType, $embedData){
    $arr_source = explode("||",$embedData);
    if (count($arr_source) >= 3){
        return (strpos(strtolower($billingType),'zalopay') !== false && $arr_source[2]=="1");
    }
    else return false;
}

function isZaloPay($billingType){
    return (strpos(strtolower($billingType),'zalopay') !== false);
}