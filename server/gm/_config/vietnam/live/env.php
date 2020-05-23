<?php

date_default_timezone_set("Asia/Bangkok");    
$BALANCE_HOST = '10.50.21.20';
$BALANCE_PORT = 8000;        
$ADMIN_HOST = '10.50.21.22';
$ADMIN_PORT = 8111;      
$SCRIBE_HOST = '127.0.0.1';
$SCRIBE_PORT = 1463;    

$BALANCE_ADMIN_HOST = $BALANCE_HOST;
$BALANCE_ADMIN_PORT = $BALANCE_PORT + 100;

$configBucket = array(
    BUCKET_INDEX => array(
        'ip' => '10.50.21.11',
        'port' => '11220'
    ),
    BUCKET_CACHE => array(
        'ip' => '10.50.21.11',
        'port' => '11240'
    ),
    BUCKET_USER_1 => array(
        'ip' => '10.50.21.12',
        'port' => '11230'
    ),
);

$checkPort = array(
    array(
        'type' => 'Billing',
        'ip' => '10.30.2.11',
        'port' => '50036'
    ),
    array(
        'type' => 'Redis',
        'ip' => '10.50.21.11',
        'port' => '6379'
    )
);