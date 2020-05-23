<?php
  error_reporting(0);
  $GLOBALS['THRIFT_ROOT'] ='../../log/thrift' ;
  require '../../log/zf_log.php';
  require "../../all/out/Billing.php";
  require '../../all/config/DataProvider.php';
  require '../../all/out/Card.php';
  require '../../all/config/IfrsLog.php';
  require_once '../../all/config/xu_update.php';
  require_once 'utils.php';
  require_once 'BuyGoldType.php';
  
  $uId = intval($_REQUEST['uId']);
  $userName = $_REQUEST['userName'];
  $serviceName = $_REQUEST['serviceName'];
  
  $money = $_REQUEST['money'];

  $typeOffset = isset($_REQUEST['typeOffset'])?intval($_REQUEST['typeOffset']):0;

  $holdId = $_REQUEST['holdId'];
  $gameCode = $_REQUEST['gameCode'];
  $accList = json_decode($_REQUEST['accList'],true);
  $homeAcc = $_REQUEST['homeAcc'];
  $itemInfo = $_REQUEST['itemInfo'];
  if(strlen($homeAcc) < 3 )  $homeAcc = 'myplay_caro';
  
  $result = array();
  
  function microtime_float()
  {
     list($usec, $sec) = explode(" ", microtime());
     return ((float)$usec + (float)$sec);
  }
 

  try
  {
      if(($serviceName == 'promo1') &&
          ($CONFIG_DATA['gameId'] == 'Bacay' ||
          $CONFIG_DATA['gameId'] == 'tala' ||
          $CONFIG_DATA['gameId'] == 'tienlen' ||
          $CONFIG_DATA['gameId'] == 'binh' ||
          $CONFIG_DATA['gameId'] == 'pokerhk' ||
          $CONFIG_DATA['gameId'] == 'pokerus' ||
          $CONFIG_DATA['gameId'] == 'caro' ||
          $CONFIG_DATA['gameId'] == 'cotuong' ||
          $CONFIG_DATA['gameId'] == 'sam' ||
          $CONFIG_DATA['gameId'] == 'coup')
      )
      {
          $serviceName = 'addCash';
      }
      switch($serviceName)
      {
          case  'balance' :
            $time_start = microtime_float();
            $ret = Billing::balance($uId,$userName);
            $time_end = microtime_float();
            Zf_log::write_time_exec_log('zingplay_exec_time',$CONFIG_DATA['gameId'],$uId,'balance',round(1000*($time_end - $time_start)));
            break;
          case  'purchase' :
            $time_start = microtime_float();
            $ret = Billing::purchase($uId,$userName,$money,$itemInfo);
            $time_end = microtime_float();
            if(is_object($ret)){
				//ghi log ifrs
				if($ret->RetCode==1){
                    $objCard = new Card();
                    $source = $objCard->getSourceByUserId($CONFIG_DATA['prefix'],$CONFIG_DATA['suffix_platform'],$uId, $CONFIG_DATA['gameId']);
					$arrItemInfo =	explode(':',$itemInfo);
					IfrsLog::writeLog($CONFIG_DATA['gameId'],$uId,$ret->CashRemain,0,-abs($money),0,$arrItemInfo[0], $arrItemInfo[1], $money,0,0,$source,0);
          Zf_log::write_time_exec_log('zingplay_exec_time',$CONFIG_DATA['gameId'],$uId,'purchase',round(1000*($time_end - $time_start)));
				}
            }
            break;
          case  'promo' :
			$ret = -1;//Billing::promo($uId,$userName,$money);
              $time_start = microtime_float();
              $ret = Billing::addCash($uId,$userName,$money,104,'Promo',$money);
              $time_end = microtime_float();
              //ghi log ifrs
              if(is_object($ret)){
                  if($ret->RetCode==1){

                      //update key su
                      $objCard =  new Card();
                      $objCard->zingId=$uId;
                      $objCard->updateGToDB($ret->CashRemain);

                      IfrsLog::writeLog($CONFIG_DATA['gameId'],$uId,$ret->CashRemain,0,0,abs($money),0,3,$money,0,0,0,0);

                  }
              }
              Zf_log::write_time_exec_log('zingplay_exec_time',$CONFIG_DATA['gameId'],$uId,'promo',round(1000*($time_end - $time_start)));
            break;

          case 'addCash':
              $time_start = microtime_float();
              $ret = Billing::addCash($uId,$userName,$money,104,'Promo',$money);
              $time_end = microtime_float();
              //ghi log ifrs
              if(is_object($ret)){
                  if($ret->RetCode==1){
                      $objCard =  new Card();
                      $objCard->zingId=$uId;
                      $objCard->updateGToDB($ret->CashRemain);
                      $logMoney = $objCard->checkOffset($typeOffset,$money);
                      //var_dump($logMoney);
                      $source = $objCard->getSourceByUserId($CONFIG_DATA['prefix'],$CONFIG_DATA['suffix_platform'],$uId, $CONFIG_DATA['gameId']);
                      IfrsLog::writeLog($CONFIG_DATA['gameId'],$uId,$ret->CashRemain,0,$logMoney['xunap'],$logMoney['xuthuong'],0,3,$money,$logMoney['gross_revenue'],$logMoney['gross_user'],$source,0);

                  }
              }
              Zf_log::write_time_exec_log('zingplay_exec_time',$CONFIG_DATA['gameId'],$uId,'addcash',round(1000*($time_end - $time_start)));
              break;

          case 'addCashIAP':
              $buyGold = $_REQUEST['buyGold'];

              $objCard =  new Card();
              $objCard->zingId=$uId;
              $objCard->username = $userName;
              $objCard->cashTypeBilling = $_REQUEST['type'];
              $objCard->GrossAmount = $_REQUEST['gross'];
              $objCard->NetAmount = $_REQUEST['net'];
              $objCard->G_addGame = $_REQUEST['gConvert'];
              $objCard->G_bonus = $money-$objCard->G_addGame;
              $objCard->TransactionID = $_REQUEST['transactionId'];


              if ($buyGold!=1){
                  $objCard->G_bonus += getGBonus($money, $objCard->cashTypeBilling);
              }

              $ret = $objCard->addGToBillingAddCash();
              if(is_object($ret) && $ret->RetCode == 1){
                  $objCard->updateGToDB($ret->CashRemain);

                  // check isBuyGold
                  if ($buyGold==1){
                      if (isSaveNewFormat($CONFIG_DATA['gameId']))
                          $objCard->updateBuyGoldToDB($money,BuyGoldType::$IAP);
                      else $objCard->updateIAPGoldToDB($money,true);
                  }


                  $result[0] = 1 ;
                  $result[1] = $ret ;

                  echo json_encode($result);

                  //echo $CONFIG_DATA['ServerSocket'].'-'.$CONFIG_DATA['PortSocket'];
                  $objCard->updateGToGameSocket($CONFIG_DATA['ServerSocket'],$CONFIG_DATA['PortSocket']);
                  if(isset($CONFIG_DATA['ServerSocket2'])){
                      $objCard->updateGToGameSocket($CONFIG_DATA['ServerSocket2'],$CONFIG_DATA['PortSocket2']);
                  }
                  if(isset($CONFIG_DATA['ServerSocket3'])){
                      $objCard->updateGToGameSocket($CONFIG_DATA['ServerSocket3'],$CONFIG_DATA['PortSocket3']);
                  }

                  $logMoney = $objCard->checkOffset($typeOffset,$money);
                  //var_dump($logMoney);
                  $source = $objCard->getSourceByUserId($CONFIG_DATA['prefix'],$CONFIG_DATA['suffix_platform'],$uId, $CONFIG_DATA['gameId']);
                  IfrsLog::writeLog($CONFIG_DATA['gameId'],$uId,$ret->CashRemain,0,$logMoney['xunap'],$logMoney['xuthuong'],$objCard->cashTypeBilling,$objCard->cashTypeBilling,$money,$objCard->GrossAmount,$objCard->NetAmount,$source,$objCard->TransactionID);
                  exit;
              }
              break;
          default :
            $ret = -100 ;
            break ;
      }
      $success = 1 ;
  }
  catch(Exception $falt)
  {
    $success = -1001 ;  
  }
  
  if(!is_object($ret))
  {
    $result[0] = $ret ;
    $result[1] = array() ; 
  }
  else
  {
    $result[0] = $success ;
    $result[1] = $ret ;
  }
  
  echo json_encode($result);
