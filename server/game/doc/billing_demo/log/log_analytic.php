<?php
define('LA_BASE_PATH', realpath(dirname(__FILE__)));
$GLOBALS['SCRIBE_ROOT'] = LA_BASE_PATH.'/scribe';
$CONFIG_SCRIBE['scribe_servers']	= array('10.30.44.40');
$CONFIG_SCRIBE['scribe_ports'] 	 	= array('1463');
$CONFIG_SCRIBE['debug'] 		= 0;
$CONFIG_SCRIBE['send_timeout'] 		= 30;
$CONFIG_SCRIBE['recv_timeout'] 		= 2500;
$CONFIG_SCRIBE['num_retries'] 		= 1;
$CONFIG_SCRIBE['randomize'] 		= false;
$CONFIG_SCRIBE['always_try_last'] 	= true;
require_once(LA_BASE_PATH . '/scriber.php');
class LogAnalytic
{
	private $_category = null;
	public function __construct($category ='myplay' )	
	{		
		$this->_category = $category;
	}
	/**
	 * Hàm ghi log
	 * @param $array_data
	 * 
	 * @return unknown_type
	 */
	public function sendLog($array_data = array())
	{		
		try
		{
			$time = $_SERVER['REQUEST_TIME'];
			$uId = $array_data['uid'];
			$ownerId = $array_data['ownerId'];
			$mid = $array_data['mid'];
			$actId = $array_data['act'];
			$gold_change = $array_data['gold_change'];
			$xu_change = $array_data['xu_change'];
      		$gold_rest = $array_data['gold_rest'];
      		$xu_rest = $array_data['xu_rest'];
			$param1 = $array_data['param1'];
			$param2 = $array_data['param2'];
			$param3 = $array_data['param3'];
			$param4 = $array_data['param4'];
			$param5 = $array_data['param5'];			
			
			$message = sprintf('%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s',$time,$uId,$ownerId,$mid,$actId,$gold_change,$xu_change,$gold_rest,$xu_rest,$param1,$param2,$param3,$param4,$param5);
			global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.40');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
			$scriber = new scriber($CONFIG_SCRIBE);
			$scriber->writeLog($this->_category,$message);			
		}
		catch(Exception $ex)
		{			
            throw $ex;	
			return false;
		}
	}
    public function sendLog_so6($array_data = array())
    {        
        try
        {             
            $param1 = $array_data['acc_name'];
            $param2 = $array_data['xunap'];
            $param3 = $array_data['xuthuong'];
            $param4 = $array_data['lastupdate'];               
            
            $message = sprintf('%s,%s,%s,%s',$param1,$param2,$param3,$param4);            
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.40');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);            
        }
        catch(Exception $ex)
        {                
             throw $ex;    
            return false;
        }
    }
	public function ifrs($array_data = array())
    {        
        try
        {             
            $param1 = $array_data['uid'];
            $param2 = $array_data['xunap'];
            $param3 = $array_data['xuthuong'];
			$param4 = $_SERVER['REQUEST_TIME'];
			$param5 = $_SERVER['SERVER_ADDR'];//serverId
            $param6 = $array_data['xunapspent'];
			$param7 = $array_data['xuthuongspent'];
			$param8 = "";//
			$arr = explode(':', $array_data['iteminfo']);
			$arr = explode('1', $arr[1]);
			$itemInfo = $arr[0].'_'.$arr[1];
			
			$param9 = $itemInfo;
			$param10 = $array_data['price'];
			$param11 = $array_data['xubefore'];
			$param12 = $array_data['xuafter'];
			$param13 = $array_data['username'];
            
            $message = sprintf('%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s',$param1,$param2,$param3,$param4,$param5,$param6,$param7,$param8,$param9,$param10,$param11,$param12,$param13);
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.40');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);            
        }
        catch(Exception $ex)
        {                
             throw $ex;    
            return false;
        }
    }
	
	public function ifrs_new($array_data = array())
    {        
        try
        {          
            $param1 = $array_data['userId'];
            $param2 = $array_data['currentXu'];
            $param3 = $array_data['currentPromo'];
			$param4 = $_SERVER['REQUEST_TIME'];
			$param5 = $array_data['serverId'];//serverId
            $param6 = $array_data['changeXu'];
			$param7 = $array_data['changePromo'];
			$param8 = $array_data['itemId'];
			$param9 = $array_data['actionId'];
			$param10= $array_data['unitPrice'];
            $param11= $array_data['grossRev'];
            $param12= $array_data['netRev'];
            $param13= $array_data['userSource'];
			$param14 = $array_data['tranId'];
            $param15= $array_data['sourcePartner'];
            $param16 = $array_data['sourcePay'];
            $message = sprintf('%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s',$param1,$param2,$param3,$param4,$param5,$param6,$param7,$param8,$param9,$param10,$param11,$param12,$param13,$param14,$param15,$param16);
//            var_dump($message);
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.40');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);  
			//echo("<BR>".$message."<BR>");
        }
        catch(Exception $ex)
        {                
             throw $ex;    
            return false;
        }
    }
	
	public function gold_log($array_data = array())
    {        
        try
        {             
            $param1 = $array_data['uId'];
            $param2 = $array_data['gross'];
            $param3 = $array_data['type'];
			$param4 = $_SERVER['REQUEST_TIME'];
			$param5 = $_SERVER['SERVER_ADDR'];//serverId
            $param6 = $array_data['in_transId'];
			$param7 = $array_data['in_username'];
			
            $message = sprintf('%s,%s,%s,%s,%s,%s,%s',$param1,$param2,$param3,$param4,$param5,$param6,$param7);
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.40');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);            
        }
        catch(Exception $ex)
        {                
             throw $ex;    
            return false;
        }
    }
	public function sendLog_sms($array_data = array())
    {        
        try
        {             
            $param1 = $array_data['game'];
            $param2 = $array_data['in_transId'];
            $param3 = $array_data['in_type'];
            $param4 = $array_data['in_operator'];
			$param5 = $array_data['in_userId'];
			$param6 = $array_data['in_grossAm'];
			$param7 = $array_data['in_netAm'];
			$param8 = $array_data['in_username'];
			$param9 = $array_data['in_sig'];
			$param10 = $array_data['in_requestTime'];
			$param11 = $array_data['errorCode'];
			$param12 = $array_data['retCode'];
			$param13 = $array_data['cashAmount'];
            
            $message = sprintf("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s",$param1,$param2,$param3,$param4,$param5,$param6,$param7,$param8,$param9,$param10,$param11,$param12,$param13);            
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.40');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);            
        }
        catch(Exception $ex)
        {                
             throw $ex;    
            return false;
        }
    }
	/**
     * Hàm ghi log
     * @param $array_data
     * 
     * @return unknown_type
     */
    public function sendLogMYPLAY($array_data = array())
    {        
        try
        {
            $time = $_SERVER['REQUEST_TIME'];
            $uId = $array_data['uid'];
            $ownerId = $array_data['ownerId'];
            $mType = $array_data['mType'];
            $mId = $array_data['mId'];
            $gold_change = $array_data['gold_change'];
            $xu_change = $array_data['xu_change'];
            $gold_rest = $array_data['gold_rest'];
            $xu_rest = $array_data['xu_rest'];
            $param1 = $array_data['param1'];
            $param2 = $array_data['param2'];
            $param3 = $array_data['param3'];
            $param4 = $array_data['param4'];
            $param5 = $array_data['param5'];
            
            $message = sprintf('%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|',$time,$uId,$ownerId,$mType,$mId,$gold_change,$xu_change,$gold_rest,$xu_rest,$param1,$param2,$param3,$param4,$param5);
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.195');
            $CONFIG_SCRIBE['scribe_ports']          = array('1469');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);
            return true;
        }
        catch(Exception $ex)
        {            
            //echo $ex->getMessage();
            return false;
        }
    }
    public function sendLogError($request,$response)
    {
        try
        {

            $message = sprintf('%s|%s|%s',$_SERVER['REQUEST_TIME'],$request,$response);
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('10.30.44.195');
            $CONFIG_SCRIBE['scribe_ports']          = array('1469');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);
            return true;
        }
        catch(Exception $ex)
        {

            return false;
        }
    }

    /*
    * write log exec time
    */

    public function sendLogMysqlExec($array_data = array())
    {
        try
        {
            $time = $_SERVER['REQUEST_TIME'];
            $uId = $array_data['uid'];
            $gameId = $array_data['gameId'];
            $action = $array_data['action'];
            $time_exec = $array_data['time_exec'];

            $message = sprintf('%s|%s|%s|%s|%s|',$time,$uId,$gameId,$action,$time_exec);
            global $CONFIG_SCRIBE;
            $CONFIG_SCRIBE['scribe_servers']    = array('127.0.0.1');
            $CONFIG_SCRIBE['scribe_ports']          = array('1463');
            $scriber = new scriber($CONFIG_SCRIBE);
            $scriber->writeLog($this->_category,$message);
            return true;
        }
        catch(Exception $ex)
        {
            //echo $ex->getMessage();
            return false;
        }
    }
}
