<?php
//ENV : BRAZIL LIVE

global $CONFIG_DATA;
$CONFIG_DATA['country'] = 'br';
date_default_timezone_set("America/Sao_Paulo");

// Bucket
$CONFIG_DATA['DbIndexHost'] = '10.158.4.6';
$CONFIG_DATA['DbIndexPort'] = 11242;
$CONFIG_DATA['DbCacheHost'] = '10.158.4.6';
$CONFIG_DATA['DbCachePort'] = 11243;

//Service log
$CONFIG_DATA['LogGameHost'] = '127.0.0.1';
$CONFIG_DATA['LogGamePort'] = 1475;
$CONFIG_DATA['LogIfrsHost'] = '127.0.0.1';
$CONFIG_DATA['LogIfrsPort'] = 1575;
$CONFIG_DATA['LogServerId'] = $CONFIG_DATA['country'];
$CONFIG_DATA['LogAddNewLine'] = false;

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
define("SERVICE_BILLING_IP", "35.198.9.93"); //35.198.9.93 10.158.3.2
define("SERVICE_BILLING_PORT", 50048);
define("SERVICE_BILLING_TIMEOUT", 30);

define("RATE_VND_TO_COIN", 100);


//brazil
$CONFIG_DATA['BRAZIL_APPID'] = '50048';
$CONFIG_DATA['BRAZIL_SECRET'] = 'GsnPokerSea&$123';

$CONFIG_DATA['GATEWAY'] = '';
$CONFIG_DATA['IS_DIRECT'] = false;
$CONFIG_DATA['APP_ID'] = 0;
$CONFIG_DATA['ALLOW_TEST'] = false;
$CONFIG_DATA['IS_MILLI_APP_TIME'] = true;

$CONFIG_DATA['VND_TO_CENT'] = array(
    16674 => 72,
    38981 => 168,
    83595 => 359, 
    167246 => 719,  
    278781 => 1199 
);


