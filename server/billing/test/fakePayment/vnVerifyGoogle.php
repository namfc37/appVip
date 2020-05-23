<?php

require "../../kvtm/out/config_data.php";
require "../../all/out/utils.php";

$res = new stdClass();

if (!$CONFIG_DATA['ALLOW_TEST'])
{
    $res->error = -1;
    $res->message = 'Not allow test';
}
else
{   
    $request = json_decode(base64_decode($_GET["receipt_data"]));       
    $res = new stdClass();

    $res->error = 0;
    $res->code = $request->productId;
    $res->orderId = $request->orderId;
    $res->productId = $request->productId;
    $res->purchaseTime = $request->purchaseTime;
}

echo json_encode($res);

