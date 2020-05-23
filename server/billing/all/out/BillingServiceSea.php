<?php
//error_reporting(0);

importLibraries();
defineVariables();

$objCard = new Card();
$objCard->gateway = $CONFIG_DATA['GATEWAY'];

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!validateMac($data, 'Hash'))
{
    processAction($objCard, INVALID_MAC);
    exit;
}

$objCard->userId = intval($data['UserID']);
$objCard->username = $data['Username'];
$objCard->net = $data['NetAmount'];
$objCard->gross = $data['GrossAmount'];
$objCard->payTrans = $data['TransactionID'];
$objCard->currency = $data['Currency'];
$objCard->type = $data['Type'];

$embedData = json_decode($data['Extra'], true);

$objCard->subType = $embedData['channel'];
$objCard->item = $embedData['item'];
$objCard->offer = $embedData['offer'];
$objCard->level = $embedData['level'];
$objCard->appTrans = $embedData['appTrans'];
$objCard->appTime = $embedData['time'];
$objCard->socialType = $embedData['socialType'];
$objCard->platformID = $embedData['platformID'];

$rateType = 'SEA_RATE_'.$objCard->currency;
if (isset($CONFIG_DATA[$rateType]))
{
    $rate = $CONFIG_DATA[$rateType];
    $localToVnd = $objCard->gross * $rate;
    $vnd = $embedData['gross'];
    //$vnd <= 0 : card
    //vnd > 105% localToVnd : cheat
    if ($vnd <= 0 || $vnd > $localToVnd * 105 / 100)
        $vnd = $localToVnd;

    $objCard->coinConvert = round($vnd / RATE_VND_TO_COIN);
    $objCard->convertCash = round($objCard->coinConvert * 70 / 100);    
}
else
{
    $objCard->coinConvert = 0;
    $objCard->convertCash = 0;
}
$objCard->convertPromo = $objCard->coinConvert - $objCard->convertCash;

if ($CONFIG_DATA['IS_MILLI_APP_TIME'])
    $isExpire = $objCard->appTime + $CONFIG_DATA['expire_transaction'] * 1000 < millisTime();
else
    $isExpire = $objCard->appTime + $CONFIG_DATA['expire_transaction'] < secondTime();

if ($isExpire)
{
    processAction($objCard, EXPIRED);
}
else if ($objCard->userId == 0 || $objCard->username == '' || $objCard->appTrans == '' || $objCard->payTrans == '')
{
    processAction($objCard, ERROR_PARAM);
}
else if ($objCard->coinConvert <= 0)
{
    processAction($objCard, ERROR_COIN);
}
else if (!DataProvider::lockTransaction($objCard->payTrans, $input))
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
    define('ERROR_COIN', 9);

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
        ERROR_COIN => 'Invalid coin',
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

function validateMac ($data, $keyHash)
{
    global $CONFIG_DATA;
    $hash = '';
    $array = array();
    foreach ($data as $key => $value)
    {
        if ($key == $keyHash)
            $hash = $value;
        else
            $array[$key] = $value;
    }
    ksort($array);	
    $check = md5(implode($array).$CONFIG_DATA['SEA_SECRET']);
    return $hash == $check;
}

function processAction ($objCard, $result)
{
    global $ERROR_MESSAGE;

    $res = array();
    if ($result == SUCCESS)
        $res['ReturnCode']= 1;
    else if ($result == DUPLICATE_TRANS)
        $res['ReturnCode']= 2;
    else
        $res['ReturnCode']= 3;

    if (isset($ERROR_MESSAGE[$result]))
        $res['Description'] = $ERROR_MESSAGE[$result];
    else
        $res['Description'] = 'Error ' . $result;

    echo json_encode($res);

    $objCard->logPaying($result);
    exit;
}


