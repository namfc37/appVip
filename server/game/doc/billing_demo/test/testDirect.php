<?php

$ch = curl_init("http://10.30.44.40/binh/out/BillingServiceDirectMobile.php");

$post = '{"data":"{\"appId\":43,\"appTranxId\":\"simo08_1529029146555\",\"appTime\":1529029146562,\"appUser\":\"simo08\",\"items\":\"[{\\\\\"itemId\\\\\":\\\\\"item_sam\\\\\",\\\\\"itemName\\\\\":\\\\\"BuyGold_5000\\\\\",\\\\\"itemQuantity\\\\\":1,\\\\\"itemPrice\\\\\":5000}]\",\"amount\":5000,\"netAmount\":2500,\"orgAmount\":0.0,\"currencyUnit\":\"\",\"embedData\":\"0||1||1\",\"zacTranxId\":\"160929000020415\",\"zacServerTime\":1475143051086,\"channel\":5}","mac":"7cd578bba974656d7a1d68e618124a87deed4bbfefc88fc62868d3e1e56cee49"}';

curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_error($ch);
$result = curl_exec($ch);
echo $result;
?>