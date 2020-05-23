<?php

// Logger
global $CONFIG_DATA;
$CONFIG_DATA['Logger'] = false;
$CONFIG_DATA['logServer'] = array('10.30.44.40');
$CONFIG_DATA['logpatch'] = "./log/";
$CONFIG_DATA['CARDUNIT'] = 'G';                                 // Đơn vị thông báo cho user khi nạp thẻ
$CONFIG_DATA['SMSUNIT'] = 'VANG';                               // Đơn vị thông báo cho user khi nhắn tin
$CONFIG_DATA['IS_CONVERT_TO_ITEM'] = true;                      // Nếu chuyển từ G sang item (gold) luôn thì để true

// Config servers and buckets
$CONFIG_DATA['Server'] = '127.0.0.1';
$CONFIG_DATA['Port'] = 11211;
$CONFIG_DATA['ServerMemcache'] = '127.0.0.1';
$CONFIG_DATA['PortMemcache'] = 11211;
$CONFIG_DATA['ServerSocket'] = '120.138.65.118';
$CONFIG_DATA['PortSocket'] = 449;

// Config prefix , suffix
$CONFIG_DATA['prefix'] = "Binh_";
$CONFIG_DATA['suffix'] = "_xu";
$CONFIG_DATA['gameId'] = "binh";
$CONFIG_DATA['suffix_sms'] = "_sms_G";
$CONFIG_DATA['suffix_sms_event'] = "_sms_G_event";
$CONFIG_DATA['suffix_iap']="_iap_G" ;
$CONFIG_DATA['suffix_buy_gold']="_buy_gold_G" ;
$CONFIG_DATA['suffix_username'] = "_username";
$CONFIG_DATA['suffix_userid'] = "_userid";
$CONFIG_DATA['suffix_platform'] = "_platform_id";


//Billing config
define("SERVICE_BILLING_IP", "10.40.40.40");
define("SERVICE_BILLING_PORT", 30000);
define("SERVICE_BILLING_TIMEOUT", 30);

define("SOURCE_PREFIX", "SOURCE");

// direct payment
$CONFIG_DATA['DIRECT_SECRET'] = 'KnBnvVPv708ox3pTkgXe';
$CONFIG_DATA['DIRECT_KEY2'] = 'lps38o0nybocbg7J';
$CONFIG_DATA['DIRECT_APPID'] = '40';



$CONFIG_DATA['PROMOTE_LIST'] =
    array(
        // format: start_date, end_date, promote_rate
        array('2018-06-25', '2018-06-26', 2, array(
            'ZZingCard', 'PZingCard', 'ZingCardWv', 'ZingCard', 'ZaloZingCard', 'WebZing', 'PortalZing',
            'ZGGWallet',
            'ZAtm',
            'VietCardWv'
        )),
    );

$CONFIG_DATA['EVENT_TIME'] = array('2018-06-19', '2018-07-17');