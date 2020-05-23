<?php

date_default_timezone_set("UCT");
$BALANCE_HOST = '10.11.91.3';
$BALANCE_PORT = 8000;        
$ADMIN_HOST = '10.11.91.3';
$ADMIN_PORT = 8111;    
$SCRIBE_HOST = '127.0.0.1';
$SCRIBE_PORT = 1508; 

$BALANCE_ADMIN_HOST = $BALANCE_HOST;
$BALANCE_ADMIN_PORT = $BALANCE_PORT + 100;

$configBucket = array(
    BUCKET_INDEX => array(
        'ip' => '10.11.91.3',
        'port' => '11220'
    ),
    BUCKET_CACHE => array(
        'ip' => '10.11.91.3',
        'port' => '11240'
    ),
    BUCKET_USER_1 => array(
        'ip' => '10.11.91.3',
        'port' => '11230'
    ),
    BUCKET_USER_2 => array(
        'ip' => '10.11.91.3',
        'port' => '11231'
    ),
);

$checkPort = array(
    array(
        'type' => 'Billing',
        'ip' => '49.213.124.115',
        'port' => '50048'
    ),
    array(
        'type' => 'Redis',
        'ip' => '127.0.0.1',
        'port' => '6379'
    )
);