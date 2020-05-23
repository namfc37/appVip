<?php

date_default_timezone_set("America/Sao_Paulo");
$BALANCE_HOST = '10.158.4.8';
$BALANCE_PORT = 8000;
$ADMIN_HOST = '10.158.4.8';
$ADMIN_PORT = 8111;     
$SCRIBE_HOST = '10.158.4.8';
$SCRIBE_PORT = 1475;     

$BALANCE_ADMIN_HOST = '35.247.192.87';
$BALANCE_ADMIN_PORT = $BALANCE_PORT + 100;

$configBucket = array(
    BUCKET_INDEX => array(
        'ip' => '10.158.4.6',
        'port' => '11242'
    ),
    BUCKET_CACHE => array(
        'ip' => '10.158.4.6',
        'port' => '11243'
    ),
    BUCKET_USER_1 => array(
        'ip' => '10.158.4.6',
        'port' => '11241'
    )
);

$checkPort = array(
    array(
        'type' => 'Billing',
        'ip' => '35.198.9.93',
        'port' => '50048'
    ),
    array(
        'type' => 'Redis',
        'ip' => '10.158.4.6',
        'port' => '6379'
    )
);