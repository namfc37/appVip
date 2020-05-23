<?php
putenv('FREETDSCONF=/etc/freetds.conf');
define('LA_BASE_PATH1', realpath(dirname(__FILE__)));
$GLOBALS['THRIFT_ROOT'] = LA_BASE_PATH1.'/thrift';
require 'zf_log.php';  
require LA_BASE_PATH1.'/../blance/config_data.php' ;
require LA_BASE_PATH1.'/../blance/DataProvider.php'; 


foreach($CONFIG_DATA as $game=>$value)
{
$f1 = fopen(LA_BASE_PATH1."/binh/$game.csv",'r');
        
if($f1){    

    while (!feof($f1)) 
    {
        $UserId = intval(fgets($f1));        
        if(!empty($UserId))
        {            
            DataProvider::init($game);
            $key = $CONFIG_DATA[$game]['prefix'].$UserId.$CONFIG_DATA[$game]['suffix'] ;                  
            $xunap = DataProvider::get($key);            
            if(!empty($xunap))  $xunap = intval($xunap);
            else $xunap=0;
            try
            {       
                Zf_log::write_act_log_so6($game,$UserId,$xunap,0,$_SERVER['REQUEST_TIME']);
            }
            catch(Exception $pdoe){
                echo $pdoe->getMessage();
            }
        }
    }
    fclose($f1);
}           
}    
echo 'success!';

