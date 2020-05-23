<?php

date_default_timezone_set("UCT");    
$BALANCE_HOST = '10.148.9.2';
$BALANCE_PORT = 8000;        
$ADMIN_HOST = '10.148.9.4';
$ADMIN_PORT = 8111;      
$SCRIBE_HOST = '127.0.0.1';
$SCRIBE_PORT = 1465;

$BALANCE_ADMIN_HOST = $BALANCE_HOST;
$BALANCE_ADMIN_PORT = $BALANCE_PORT + 100;

$configBucket = array(
    BUCKET_INDEX => array(
        'ip' => '10.148.9.3',
        'port' => '11220'
    ),
    BUCKET_CACHE => array(
        'ip' => '10.148.9.3',
        'port' => '11240'
    ),
    BUCKET_USER_1 => array(
        'ip' => '10.148.9.3',
        'port' => '11230'
    ),
);

$checkPort = array(
    array(
        'type' => 'Billing',
        'ip' => '52.76.218.64',
        'port' => '50020'
    ),
    array(
        'type' => 'Redis',
        'ip' => '10.148.9.3',
        'port' => '6379'
    )
);