<?php

require "../kvtm/out/config_data.php";
require "../all/out/utils.php";
include_once '../all/config/DataProvider.php';

if (!$CONFIG_DATA['ALLOW_TEST'])
    exit("NOT SUPPORT TEST!");

define('SUCCESS', 0);
define('DUPLICATE_TRANS', 1);
define('INVALID_APP_ID', 2);
define('ERROR_PARAM', 3);
define('ACCOUNT_INVALID', 4);
define('BILLING_RES', 5);
define('INVALID_MAC', 6);
define('EXPIRED', 7);
define('FAIL', 8);

checkDirect();
checkPayPlay();

function checkDirect ()
{
    global $CONFIG_DATA, $count, $time;
    echo "Check Direct <br>";
    
    $appId = $CONFIG_DATA['DIRECT_APPID'];
    $url = $CONFIG_DATA['DIRECT_CALLBACK'];
    $time = millisTime();

    check ($appId, $url, "SUCCESS", SUCCESS);
    check ($appId, $url, "DUPLICATE_TRANS", DUPLICATE_TRANS);
    check ($appId, $url, "INVALID_MAC", INVALID_MAC);
    check ($appId, $url, "INVALID_APP_ID", INVALID_APP_ID);
    check ($appId, $url, "ACCOUNT_INVALID", ACCOUNT_INVALID);
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty pay trans
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty app trans

    $time -= $CONFIG_DATA['expire_transaction'] * 1000;
    check ($appId, $url, "EXPIRED", EXPIRED);
}

function checkPayPlay ()
{
    global $CONFIG_DATA, $count, $time;
    echo "<br> Check Pay Play <br>";
    
    $appId = $CONFIG_DATA['PAYPLAY_APPID'];
    $url = $CONFIG_DATA['PAYPLAY_CALLBACK'];
    $time = secondTime();

    check ($appId, $url, "SUCCESS", SUCCESS);
    check ($appId, $url, "DUPLICATE_TRANS", DUPLICATE_TRANS);
    //check ($appId, $url, "INVALID_MAC", INVALID_MAC);
    check ($appId, $url, "INVALID_APP_ID", INVALID_APP_ID);
    check ($appId, $url, "ACCOUNT_INVALID", ACCOUNT_INVALID);
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty pay trans
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty app trans

    $time -= $CONFIG_DATA['expire_transaction'] * 1000;
    check ($appId, $url, "EXPIRED", EXPIRED);
}

function check ($appId, $url, $checkMsg, $checkResult)
{
    global $CONFIG_DATA, $count, $time;
    $userId = 403427675;
    $appUser = "fb.10208639566962513";
    $gross = 10000;
    
    if ($checkResult != DUPLICATE_TRANS)
        $time++;

    $embedData = new stdClass();
    $embedData->item = "item";
    $embedData->channel = "channel";
    $embedData->offer = "offer";
    $embedData->level = 1;

    $data = new stdClass();;
    $data->appId = $appId;
    $data->appTranxId = "appTrans_$time";
    $data->appTime = $time;
    $data->appUser = $appUser;
    $data->items = json_encode(array());
    $data->channel = 1; //1: thẻ zing, 2: thẻ mobile, 3: thẻ vina, 4: thẻ viettel, 5: sms, 6 :atm, 36 :credit card, 38: zalopay.
    $data->amount = $gross;
    $data->netAmount = $gross * 70 / 100;
    $data->currencyUnit = "";
    $data->embedData = json_encode($embedData);
    $data->zacTranxId = "payTrans_$time";
    $data->zacServerTime = $time;

    if ($checkResult == INVALID_APP_ID)
        $data->appId++;
    if ($checkResult == ACCOUNT_INVALID)
        $data->appUser .= "x";
    if ($checkResult == ERROR_PARAM)
    {
        if (($time % 2) == 0)
            $data->appTranxId = "";
        else
            $data->zacTranxId = "";
    }
        

    $post = new stdClass();
    $post->data = json_encode($data);
    if ($checkResult == INVALID_MAC)
        $post->mac = hash_hmac("sha256", $checkMsg, $CONFIG_DATA['DIRECT_KEY2']);
    else
        $post->mac = hash_hmac("sha256", $post->data, $CONFIG_DATA['DIRECT_KEY2']);

    $keyXu = $CONFIG_DATA['gameId'].'_'.$userId.'_'.$CONFIG_DATA['suffix_xu'];
    $xuBefore = intval(DataProvider::get($keyXu));
    //echo "xuBefore $xuBefore <br>";

    $rawRes = curl_post($url, json_encode($post));        
    if ($rawRes === NULL)
    {
        echo "$checkMsg ERROR: Connect fail <br>";
    }
    else
    {        
        //echo "rawRes $rawRes <br>";

        $xuAfter = intval(DataProvider::get($keyXu));
        //echo "xuAfter $xuAfter <br>";

        $res = json_decode($rawRes);

        if ($checkResult == SUCCESS)
        {
            if ($res->errorCode == 1)
            {
                if ($xuBefore < $xuAfter)
                    echo "check $checkMsg is <font color='green'>PASSED</font>, $xuBefore -> $xuAfter, $res->errorMessage <br>";
                else
                    echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->errorMessage, XU NOT CHANGED <br>";
            }
            else
            {
                echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->errorMessage <br>";
            }
        }
        else
        {
            if ($res->errorCode == 1)
            {
                echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->errorMessage <br>";                
            }
            else
            {
                if ($xuBefore == $xuAfter)
                    echo "check $checkMsg is <font color='green'>PASSED</font>, $xuBefore -> $xuAfter, $res->errorMessage <br>";
                else
                    echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->errorMessage, XU IS CHANGED <br>";
            }
        }
    }

    //$keyProcessing = $CONFIG_DATA['gameId'].'_'.$userId.'_'.$CONFIG_DATA['suffix_processing'];
    //$dataProcessing = DataProvider::get($keyProcessing);
    //echo "dataProcessing $dataProcessing <br>";
    
}
?>