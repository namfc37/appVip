<?php

date_default_timezone_set("Asia/Bangkok");
$BALANCE_HOST = '127.0.0.1';
$BALANCE_PORT = 8000;
$ADMIN_HOST = '127.0.0.1';
$ADMIN_PORT = 8101;     
$SCRIBE_HOST = '127.0.0.1';
$SCRIBE_PORT = 1463;     

$BALANCE_ADMIN_HOST = $BALANCE_HOST;
$BALANCE_ADMIN_PORT = $BALANCE_PORT + 100;

$configBucket = array(
    BUCKET_INDEX => array(
        'ip' => '127.0.0.1',
        'port' => '11220'
    ),
    BUCKET_CACHE => array(
        'ip' => '127.0.0.1',
        'port' => '11240'
    ),
    BUCKET_USER_1 => array(
        'ip' => '127.0.0.1',
        'port' => '11230'
    )
);

$checkPort = array(
    array(
        'type' => 'Billing',
        'ip' => '10.40.40.2',
        'port' => '50020'
    ),
    array(
        'type' => 'Redis',
        'ip' => '127.0.0.1',
        'port' => '6379'
    )
);
