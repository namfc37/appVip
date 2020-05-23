<?php

/**
 * @author : thuytt2
 */
class IfrsLog
{
    static private $KEY_IFRS_PROFILE_TEMPLATE = '%s_%s_%s';
    static private $PREFIX_G = 'ifrs_xu3';
    static private $PREFIX_P = 'ifrs_xu_bonus3';
    static private $ENABLE = true;

    /**
    todo: ghi log ifrs theo format moi
    owner: thuytt2
    date: 20/11/2013
    format: userId, currentXu, currentPromo, stime, serverId, changeXu, changePromo, itemId, actionId, unitPrice
     */
    public static function writeLog($game='zingplay',$userId,$cG,$cP,$changeXu, $changePromo, $itemId, $actionId,
                                    $unitPrice,$grossRev,$netRev,$userSource,$tranId='',$sourcePartner='0', $sourcePay='0')
    {
        try
        {
            if(self::$ENABLE){
                $keyG = sprintf(self::$KEY_IFRS_PROFILE_TEMPLATE,$game,$userId,self::$PREFIX_G);
                $keyP = sprintf(self::$KEY_IFRS_PROFILE_TEMPLATE,$game,$userId,self::$PREFIX_P);
                $currentG = DataProvider::get($keyG);
                $currentP = DataProvider::get($keyP);
                //init
                if($currentP === false){
                    $currentP = $cP;
                    DataProvider::set($keyP,$currentP);
                }
                //init
                if($currentG===false){
                    $currentG = $cG;
                    DataProvider::set($keyG,$currentG);
                }
                else
                {
                    $currentG = intval($currentG);
                    $currentP = intval($currentP);
                    $currentG += $changeXu;
                    $currentP += $changePromo;
                    if($currentG<0){
                        $deltaG = $currentG;
                        $currentG = 0;
                        $currentP += $deltaG;
                        if($currentP<0){
                            $currentP = 0;
                        }
                    }
                }

                DataProvider::set($keyG,$currentG);
                DataProvider::set($keyP,$currentP);
            }
            else
            {
                $currentG = $cG;
                $currentP = $cP;
            }
            //ghi log ifrs
//            echo '<br> Gross : '.$sourcePartner;
//            echo 'NET : '.$sourcePay;
            Zf_log::ifrs_log_new($game,$userId,$currentG,$currentP,$changeXu, $changePromo, $itemId, $actionId,
                $unitPrice,$grossRev,$netRev,$userSource,$tranId,$sourcePartner, $sourcePay);
        }
        catch(Exception $e)
        {

        }
    }

}