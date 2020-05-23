<?php
/**
 * Created by JetBrains PhpStorm.
 * User: hungvm2
 * Date: 11/27/14
 * Time: 1:39 PM
 * To change this template use File | Settings | File Templates.
 */

function dumplog($log, $fname="/home/www/payment/all/out/dumplog.txt")
{
    $file = fopen($fname,"a");
    fwrite($file,$log."\n");
    fclose($file);
    return file_put_contents($fname, "$log\n", FILE_APPEND);
    echo $log."<br>";
    return 0;
}

function dumplogData($log, $fname="/home/www/payment/all/out/dumplog.txt")
{
//    $file = fopen($fname,"a");
//    fwrite($file,$log."\n");
//    fclose($file);



    //return file_put_contents($fname, "$log\n", FILE_APPEND);
    //echo $log."<br>";
    //return 0;
}


function castvar($var)
{
    ob_start();
    print_r($var);
    return ob_get_clean();
}

function getGBonus($gross, $cashTypeBilling){
    $t = time();
    global $CONFIG_DATA;

    foreach($CONFIG_DATA['PROMOTE_LIST'] as $aDate){
        if ($t >= strtotime($aDate[0]) && $t < strtotime($aDate[1])){
            foreach ($aDate[3] as $cashType) {
                /*echo '$cashType -> ' . $cashType;*/
                if ($cashTypeBilling === $cashType)
                    return ($aDate[2]-1)*$gross;
            }
        }
    }
    return 0;
}

function getGBonus_vnd($gross){
    $t = time();
    global $CONFIG_DATA;
    foreach($CONFIG_DATA['PROMOTE_LIST'] as $aDate){
        if ($t >= strtotime($aDate[0]) && $t < strtotime($aDate[1])){
            return ($aDate[2]-1)*$gross / 100;
        }
    }
    return 0;
}

function isInEvent(){
    $t = time();

    global $CONFIG_DATA;

    $aDate = $CONFIG_DATA['EVENT_TIME'];
    return $t >= strtotime($aDate[0]) && $t < strtotime($aDate[1]);
}

function isSaveNewFormat($gameId){
    return ($gameId=='binh' || $gameId=='pokerhk' || $gameId=='sam' || $gameId=='tala' || $gameId=='tienlen');
}