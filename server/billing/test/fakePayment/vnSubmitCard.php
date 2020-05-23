<?php

require "../../kvtm/out/config_data.php";
require "../../all/out/utils.php";

$res = new stdClass();
$res->zmpTransID = millisTime();

if (!$CONFIG_DATA['ALLOW_TEST'])
{
    $res->returnCode = -1;
    $res->returnMessage = 'Not allow test';
}
else
{
    $SEPARATOR = '|';

    $appId = $_GET["appID"];
    $appTrans = $_GET["appTransID"];
    $appUser = $_GET["appUser"];
    $appTime = $_GET["appTime"];    
    $embedData = $_GET["embedData"];
    $mac = $_GET["mac"];
    $gross = intval($_GET["cardCodeEncrypt"]);
    
    $inputHash = $appId.$SEPARATOR
                .$appTrans.$SEPARATOR
                .$appUser.$SEPARATOR
                .$appTime.$SEPARATOR
                .$SEPARATOR            
                .$embedData;
    $hash = hash_hmac('sha256', $inputHash, $CONFIG_DATA['DIRECT_SECRET']);

    
    if ($appId != $CONFIG_DATA['DIRECT_APPID'])
    {
        $res->returnCode = -2;
        $res->returnMessage = 'Wrong appID';
    }
    else if ($mac != $hash)
    {
        $res->returnCode = -3;
        $res->returnMessage = 'Wrong hash';
    }
    else
    {
        $data = new stdClass();;
        $data->appId = $appId;
        $data->appTranxId = $appTrans;
        $data->appTime = $appTime;
        $data->appUser = $appUser;
        $data->items = json_encode(array());
        $data->channel = 1; //1: thẻ zing, 2: thẻ mobile, 3: thẻ vina, 4: thẻ viettel, 5: sms, 6 :atm, 36 :credit card, 38: zalopay.
        $data->amount = $gross;
        $data->netAmount = $gross * 70 / 100;
        $data->currencyUnit = "";
        $data->embedData = $embedData;
        $data->zacTranxId = $res->zmpTransID;
        $data->zacServerTime = millisTime();

        $post = new stdClass();
        $post->data = json_encode($data);
        $post->mac = hash_hmac("sha256", $post->data, $CONFIG_DATA['DIRECT_KEY2']);            

        $resCallback = curl_post($CONFIG_DATA['DIRECT_CALLBACK'], json_encode($post));
        
        if ($resCallback === NULL)
        {
            $res->returnCode = -4;
            $res->returnMessage = "call callback fail";
        }
        else
        {            
            $result = json_decode($resCallback);            

            if ($result->errorCode == 1)
            {
                $res->returnCode = 1;
                $res->returnMessage = '';                                
                $res->ppValue = $data->netAmount;
            }
            else 
            {
                $res->returnCode = -5;
                $res->returnMessage = "Fail error $resCallback";
            }
        }        
    }
}

echo json_encode($res);

