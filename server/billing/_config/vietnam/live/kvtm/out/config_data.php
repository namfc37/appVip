<?php
//ENV : VIETNAM LIVE

global $CONFIG_DATA;
$CONFIG_DATA['country'] = 'vn';
date_default_timezone_set("Asia/Bangkok");

// Bucket
$CONFIG_DATA['DbIndexHost'] = '10.50.21.11';
$CONFIG_DATA['DbIndexPort'] = 11220;
$CONFIG_DATA['DbCacheHost'] = '10.50.21.11';
$CONFIG_DATA['DbCachePort'] = 11240;

//Service log
$CONFIG_DATA['LogGameHost'] = '127.0.0.1';
$CONFIG_DATA['LogGamePort'] = 1463;
$CONFIG_DATA['LogIfrsHost'] = '127.0.0.1';
$CONFIG_DATA['LogIfrsPort'] = 1465;
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
define("SERVICE_BILLING_IP", "10.30.2.11");
define("SERVICE_BILLING_PORT", 50036);
define("SERVICE_BILLING_TIMEOUT", 30);

define("RATE_VND_TO_COIN", 100);

// direct payment
$CONFIG_DATA['DIRECT_SECRET'] = 'FDc6WLyfGYAeIoPj';
$CONFIG_DATA['DIRECT_KEY2'] = 'VCnIckjl0CuGaLWH';
$CONFIG_DATA['DIRECT_APPID'] = '181';
$CONFIG_DATA['DIRECT_CALLBACK'] = 'http://10.50.21.21/billing/kvtm/out/BillingServiceDirectMobile.php';

$CONFIG_DATA['PAYPLAY_APPID'] = '37';
$CONFIG_DATA['PAYPLAY_CALLBACK'] = 'http:///10.50.21.21/billing/kvtm/out/BillingServicePayPlay.php';

$CONFIG_DATA['GATEWAY'] = '';
$CONFIG_DATA['IS_DIRECT'] = false;
$CONFIG_DATA['APP_ID'] = 0;
$CONFIG_DATA['ALLOW_TEST'] = false;
$CONFIG_DATA['IS_MILLI_APP_TIME'] = true;
