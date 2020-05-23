<?php

global $CONFIG_DATA;
$CONFIG_DATA['country'] = 'vn';
date_default_timezone_set("Asia/Bangkok");

// Bucket
$CONFIG_DATA['DbIndexHost'] = '127.0.0.1';
$CONFIG_DATA['DbIndexPort'] = 11220;
$CONFIG_DATA['DbCacheHost'] = '127.0.0.1';
$CONFIG_DATA['DbCachePort'] = 11240;

//Service log
$CONFIG_DATA['LogGameHost'] = '127.0.0.1';
$CONFIG_DATA['LogGamePort'] = 1463;
$CONFIG_DATA['LogIfrsHost'] = '127.0.0.1';
$CONFIG_DATA['LogIfrsPort'] = 1463;
$CONFIG_DATA['LogServerId'] = $CONFIG_DATA['country'];
$CONFIG_DATA['LogAddNewLine'] = true;

// Config prefix , suffix
$CONFIG_DATA['gameId'] = "kvtm";
$CONFIG_DATA['suffix_xu'] = "xu";
$CONFIG_DATA['suffix_xuCash'] = "bCoinCash";
$CONFIG_DATA['suffix_xuPromo'] = "bCoinPromo";
$CONFIG_DATA['suffix_username'] = "mUsername";
$CONFIG_DATA['suffix_transaction'] = "bTransaction";
$CONFIG_DATA['expire_transaction'] = 14 * 24 * 3600; //second
$CONFIG_DATA['suffix_online'] = "uOnline";
$CONFIG_DATA['suffix_processing'] = "bProcessing";

//Billing config
define("SERVICE_BILLING_IP", "10.40.40.2");
define("SERVICE_BILLING_PORT", 50020);
define("SERVICE_BILLING_TIMEOUT", 30);

define("RATE_VND_TO_COIN", 100);

// direct payment
$CONFIG_DATA['DIRECT_SECRET'] = 'NCwenhd7wJLm6PHP';
$CONFIG_DATA['DIRECT_KEY2'] = 'se3PWk2XQ5r5i4BF';
$CONFIG_DATA['DIRECT_APPID'] = '181';
$CONFIG_DATA['DIRECT_CALLBACK'] = 'http://49.213.72.182/kvtm/billing/kvtm/out/BillingServiceDirectMobile.php';

$CONFIG_DATA['PAYPLAY_APPID'] = '37';
$CONFIG_DATA['PAYPLAY_CALLBACK'] = 'http://49.213.72.182/kvtm/billing/kvtm/out/BillingServicePayPlay.php';

//brazil
$CONFIG_DATA['BRAZIL_APPID'] = '50048';
$CONFIG_DATA['BRAZIL_SECRET'] = 'GsnPokerSea&$123';

//SEA
$CONFIG_DATA['SEA_APPID'] = '50020';
$CONFIG_DATA['SEA_SECRET'] = 'GsnPokerSea&$1';

$CONFIG_DATA['GATEWAY'] = '';
$CONFIG_DATA['IS_DIRECT'] = false;
$CONFIG_DATA['APP_ID'] = 0;
$CONFIG_DATA['ALLOW_TEST'] = false;
$CONFIG_DATA['IS_MILLI_APP_TIME'] = true;

$CONFIG_DATA['VND_TO_CENT'] = array(
    22000 => 99,
    44000 => 199,
    109000 => 449,
    219000 => 949,
    449000 => 1899,
    1099000 => 4699,
    2199000 => 9499
);



