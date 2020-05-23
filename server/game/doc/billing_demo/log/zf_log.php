<?php
require_once 'log_analytic.php';
class Zf_log
{	
	/**
	 * send log
	 * @param int $uId zing id user action
	 * @param int $ownerId zing id farmer
	 * @param string $act name action
	 * @param int $gold money ingame
	 * @param int $xu zing xu
	 * @param int $exp exp ingame
	 * @param int $level level ingame
	 * @param string $params ex: 1 2 3 4 5
	 */
	public static function write_act_log($game,$uId,$ownerId = 0 ,$mid = 0 ,$act = '',$gold_change = 0,$xu_change = 0,$gold_rest = 0,$xu_rest = 0,$param1 = 0, $param2 = 0, $param3 = 0, $param4 = 0, $param5 = 0)
	{
		$LogAnalytic = new LogAnalytic($game);
		$logData= array(
			'uid'=>$uId,
			'ownerId'=>$ownerId,
			'mid'=>$mid,
			'act'=>$act,
			'gold_change'=>$gold_change,
			'xu_change'=>$xu_change,
			'gold_rest'=>$gold_rest,
			'xu_rest'=>$xu_rest,
			'param1'=>$param1,
			'param2'=>$param2,
			'param3'=>$param3,
			'param4'=>$param4,
			'param5'=>$param5,			
		);		
		/*
		 * send log
		 */
		$LogAnalytic->sendLog($logData);		
	}
    public static function write_act_log_so6($game='myplay',$acc_name='',$xunap=0,$xuthuong=0,$lastupdate=0)
    {           
        $LogAnalytic = new LogAnalytic($game.'_'.date('Ymd'));
        $logData= array(
            'acc_name'=>$acc_name,
            'xunap'=>$xunap,
            'xuthuong'=>$xuthuong,
            'lastupdate'=>$lastupdate,            
        );        
        /*
         * send log
         */
        $LogAnalytic->sendLog_so6($logData);        
    }
	
	public static function ifrs_log($game='farmery_ifrs',$uid=0,$xunap=0,$xuthuong=0,$xunapspent=0, $xuthuongspent=0, $iteminfo,$price, $xubefore, $xuafter, $username)
    {           
        $LogAnalytic = new LogAnalytic($game.'_'.date('Ymd'));
        $logData= array(
            'uid'=>$uid,
            'xunap'=>$xunap,
            'xuthuong'=>$xuthuong,
            'xunapspent'=>$xunapspent,
			'xuthuongspent'=>$xuthuongspent,
			'iteminfo'=>$iteminfo,
			'price'=>$price,
			'xubefore'=>$xubefore,
			'xuafter'=>$xuafter,
			'username'=>$username,
        );        
        /*
         * send log
         */
        $LogAnalytic->ifrs($logData);        
    }
	
	/**
	todo: ghi log ifrs theo format moi
	owner: thuytt2
	date: 20/11/2013
	format: userId, currentXu, currentPromo, stime, serverId, changeXu, changePromo, itemId, actionId, unitPrice
	*/
	public static function ifrs_log_new($game='zingplay',$userId,$currentXu,$currentPromo,$changeXu, $changePromo, $itemId, $actionId,
                                        $unitPrice,$grossRev,$netRev,$userSource,$tranId='',$sourcePartner='', $sourcePay='')
    {   
        $LogAnalytic = new LogAnalytic($game.'_newformat_'.date('Ymd'));
        $logData= array(
            'userId'=>$userId,
            'currentXu'=>$currentXu,
            'currentPromo'=>$currentPromo,
			'serverId'=>$game,
			'changeXu'=>$changeXu,
			'changePromo'=>$changePromo,
			'itemId'=>$itemId,
			'actionId'=>$actionId,
			'unitPrice'=>$unitPrice,
            'grossRev'=>$grossRev,
            'netRev'=>$netRev,
            'userSource'=>$userSource,
            'tranId'=>$tranId,
            'sourcePartner'=>$sourcePartner,
            'sourcePay'=>$sourcePay
        );        
        /*
         * send log
         */
//        echo '<BR> LOG:';
//        var_dump($logData);
        $LogAnalytic->ifrs_new($logData);        
    }
	
	public static function gold_log($game, $uId, $gross, $type, $in_transId, $in_username)
    {           
        $LogAnalytic = new LogAnalytic($game.'_'.date('Ymd'));
        $logData= array(
            'uId'=>$uId,
            'gross'=>$gross,
            'type'=>$type,
            'in_transId'=>$in_transId,
			'in_username'=>$in_username,
        );        
        /*
         * send log
         */
        $LogAnalytic->gold_log($logData);        
    }
	
	public static function write_sms_log($game, $in_transId, $in_type, $in_operator, $in_userId, $in_grossAm, $in_netAm, $in_username, $in_sig, $in_requestTime, $errorCode=0, $retCode=0, $cashAmount=0)
    {           
        $LogAnalytic = new LogAnalytic($game);
        $logData= array(
            'game'=>$game,
            'in_transId'=>$in_transId,
            'in_type'=>$in_type,
            'in_operator'=>$in_operator,
			'in_userId'=>$in_userId,
			'in_grossAm'=>$in_grossAm,
			'in_netAm'=>$in_netAm,
			'in_username'=>$in_username,
			'in_sig'=>$in_sig,
			'in_requestTime'=>$in_requestTime,
			'errorCode'=>$errorCode,
			'retCode'=>$retCode,
			'cashAmount'=>$cashAmount,
        );        
        /*
         * send log
         */
        $LogAnalytic->sendLog_sms($logData);        
    }
    
    public static function write_act_log_MYPLAY($uId,$ownerId,$metricId,$gold_change,$xu_change,$gold_rest,$xu_rest, $param1 = 0, $param2 = 0, $param3 = 0, $param4 = 0, $param5 = 0)
    {          
        /*
         * KhÃ¡Â»Å¸i tÃ¡ÂºÂ¡o classs log
         */        
        $LogAnalytic = new LogAnalytic('MYPLAY');
        /*
         * format message log
         */
        $logData= array(
            'uid'=>$uId,
            'ownerId'=>$ownerId,
            'mType'=>0,            
            'mId'=>$metricId,
            'gold_change'=>intval($gold_change),
            'xu_change'=>intval($xu_change),
            'gold_rest'=>intval($gold_rest),
            'xu_rest'=>intval($xu_rest),
            'param1'=>$param1,
            'param2'=>$param2,
            'param3'=>$param3,
            'param4'=>$param4,
            'param5'=>$param5,
        );
        //print_r($logData);
        /*
         * send log
         */
    
        return $LogAnalytic->sendLogMYPLAY($logData);
        
        //echo 'write act log';
    }
    public static function sendLogError($request,$response)
    {
        $LogAnalytic = new LogAnalytic('ERR_PAY');
        return $LogAnalytic->sendLogError($request,$response);
    }
	
	
	public static function write_time_exec_log($uId,$ownerId,$metricId,$gold_change,$xu_change,$gold_rest,$xu_rest, $param1 = 0, $param2 = 0, $param3 = 0, $param4 = 0, $param5 = 0)
    {          
        /*
         * KhÃ¡Â»Å¸i tÃ¡ÂºÂ¡o classs log
         */        
        $LogAnalytic = new LogAnalytic('MYPLAY');
        /*
         * format message log
         */
        $logData= array(
            'uid'=>$uId,
            'ownerId'=>$ownerId,
            'mType'=>0,            
            'mId'=>$metricId,
            'gold_change'=>intval($gold_change),
            'xu_change'=>intval($xu_change),
            'gold_rest'=>intval($gold_rest),
            'xu_rest'=>intval($xu_rest),
            'param1'=>$param1,
            'param2'=>$param2,
            'param3'=>$param3,
            'param4'=>$param4,
            'param5'=>$param5,
        );
        //print_r($logData);
        /*
         * send log
         */
    
        return $LogAnalytic->sendLogMYPLAY($logData);
        
        //echo 'write act log';
    }

	public static function write_mysql_exec_log($category='zingplay_service_mysql_exec_time',$gameId,$uId,$action,$exec_time)
	{
		$LogAnalytic = new LogAnalytic('zingplay_service_mysql_exec_time');
		/*
         * format message log
         */
		$logData= array(
				'uid'=>$uId,
				'gameId'=>$gameId,
				'action'=>$action,
				'time_exec'=>$exec_time
		);
		//print_r($logData);
		/*
         * send log
         */

		return $LogAnalytic->sendLogMysqlExec($logData);
	}
}
