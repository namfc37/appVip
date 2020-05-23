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

checkBrazil();

function checkBrazil ()
{
    global $CONFIG_DATA, $count, $time;
    echo "<br> Check Brazil <br>";

    $appId = $CONFIG_DATA['DIRECT_APPID'];
    $url = "http://49.213.72.182/kvtm/billing/kvtm/out/BillingServiceBrazil.php";
    $time = millisTime();

    check ($appId, $url, "SUCCESS", SUCCESS);
    check ($appId, $url, "DUPLICATE_TRANS", DUPLICATE_TRANS);
    check ($appId, $url, "INVALID_MAC", INVALID_MAC);    
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty pay trans
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty app trans
    check ($appId, $url, "ERROR_PARAM", ERROR_PARAM);//check empty app trans
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
    $embedData->appTrans = "appTrans_$time";
    $embedData->gross = $gross;
    $embedData->net = $gross * 70 / 100;
    $embedData->time = $time;

    $data = array();
    $data['TransactionID'] = "payTrans_$time";
    $data['Type'] = 111;
    $data['UserID'] = $userId;
    $data['Username'] = $appUser;
    $data['GrossAmount'] = $gross;
    $data['NetAmount'] = $gross * 70 / 100;
    $data['Currency'] = 'BRL';    
    
    if ($checkResult == ERROR_PARAM)
    {
        switch ($time % 4)
        {
            case 0:
                $data['UserID'] = '';
                break;
            case 1:
                $data['Username'] = '';
                break;
            case 2:
                $embedData->appTrans = '';
                break;
            case 3:
                $data['TransactionID'] = '';
                break;
        }
    }
    $data['Extra'] = json_encode($embedData);  
     
    ksort($data);
    
    if ($checkResult == INVALID_MAC)
        $hash = md5('Hallo'.$CONFIG_DATA['BRAZIL_SECRET']);
    else
        $hash = md5(implode($data).$CONFIG_DATA['BRAZIL_SECRET']);
    $data['Hash'] = $hash;    

    $keyXu = $CONFIG_DATA['gameId'].'_'.$userId.'_'.$CONFIG_DATA['suffix_xu'];
    $xuBefore = intval(DataProvider::get($keyXu));
    //echo "xuBefore $xuBefore <br>";

    $rawRes = curl_post($url, json_encode($data));        
    if ($rawRes === NULL)
    {
        echo "$checkMsg ERROR: Connect fail <br>";
    }
    else
    {
        $xuAfter = intval(DataProvider::get($keyXu));
        //echo "xuAfter $xuAfter <br>";

        $res = json_decode($rawRes);

        if ($checkResult == SUCCESS)
        {
            if ($res->ReturnCode == 1)
            {
                if ($xuBefore < $xuAfter)
                    echo "check $checkMsg is <font color='green'>PASSED</font>, $xuBefore -> $xuAfter, $res->Description <br>";
                else
                    echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->Description, XU NOT CHANGED <br>";
            }
            else
            {
                echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->Description <br>";
            }
        }
        else
        {
            if ($res->ReturnCode == 1)
            {
                echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->Description <br>";                
            }
            else
            {
                if ($xuBefore == $xuAfter)
                    echo "check $checkMsg is <font color='green'>PASSED</font>, $xuBefore -> $xuAfter, $res->Description <br>";
                else
                    echo "check $checkMsg is <font color='red'>FAIL</font>, $xuBefore -> $xuAfter, $res->Description, XU IS CHANGED <br>";
            }
        }
    }

    //$keyProcessing = $CONFIG_DATA['gameId'].'_'.$userId.'_'.$CONFIG_DATA['suffix_processing'];
    //$dataProcessing = DataProvider::get($keyProcessing);
    //echo "dataProcessing $dataProcessing <br>";
    
}
?>