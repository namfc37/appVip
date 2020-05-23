<?php
const DB_Promo = 'Promo';
const DB_Sms_Vina = "SmsVina";
const DB_Sms_Mobi = "SmsMobi";
const DB_Sms_Viettel = "SmsVTT";
const DB_MobiCard = 'MobiCard';
const DB_VinaCard = 'VinaCard';
const DB_VTTCard = 'VTTCard';
const DB_ZingCard = 'ZingCard';
const DB_Atm = 'Atm';
const DB_ZingXu = 'ZingXu';
const DB_ZingCredit = 'ZingCredit';

const RATE_SMS = 0.45;
const RATE_CARD_ZING = 1;
const RATE_CARD_TELCO = 0.86;
const RATE_ATM = 1.031;
const RATE_ZING_CREDIT = 1;
const RATE_ZING_CONVERT = 1;
class Card
{
    var $TransactionID;
    var $Type;  // SMS or Card
    var $MobileOperator;
    var $UserId; // la username khi nhan sms, la uid khi nap the
    var $GrossAmount;
    var $NetAmount;
    var $OptionData;
    var $Sig;
    var $RequestTime;

    var $G_convert; //dung cho cac game cu
    var $G_addGame = 0; // dung cho format moi
    var $G_bonus;
    var $zingId;
    var $username;
    var $upperTypeDetail;
    var $upperType;
    var $cashTypeBilling = "";

    function Card($arrSOData = array())
    {
        $this->TransactionID = @$arrSOData['TransactionID'];
        $this->Type = @$arrSOData['Type'];
        $this->MobileOperator = @$arrSOData['MobileOperator'];
        $this->UserId = @$arrSOData['UserID'];
        $this->GrossAmount = @$arrSOData['GrossAmount'];//so tien the nap
        $this->NetAmount = @$arrSOData['NetAmount'];//so tien thuc nhan dc
        $this->OptionData = @$arrSOData['OptionData'];
        $this->Sig = @$arrSOData['Sig'];
        $this->RequestTime = @$arrSOData['RequestTime'];
        // var_dump($this);
        //$this->log_r(json_encode($this));
        $this->upperType = strtoupper($this->Type);
        $this->upperTypeDetail = strtoupper($this->MobileOperator);
        $this->finalInfoZing();
        $this->getCartType();
    }

    function getCartType()
    {
        if ($this->upperType == "ZCARD" || $this->upperType == "MCARD") {
            if (in_array($this->upperTypeDetail, array('GPC', 'VNP', 'VMS', 'VIETEL', 'VTT', 'VTE'))) {
                if (in_array($this->upperTypeDetail, array('VIETEL', 'VTT', 'VTE'))) {
                    $this->cashTypeBilling = DB_VTTCard;
                } else if (in_array($this->upperTypeDetail, array('GPC', 'VNP'))) {
                    $this->cashTypeBilling = DB_VinaCard;
                } else if (in_array($this->upperTypeDetail, array('VMS'))) {
                    $this->cashTypeBilling = DB_MobiCard;
                }
            } else if ($this->upperType == 'ZCARD') {
                $this->cashTypeBilling = DB_ZingCard;
            }

        } else if ($this->upperType == "ATM") {
            $this->cashTypeBilling = DB_Atm;
        } else if ($this->upperType == 'SMS') {

            if (in_array($this->upperTypeDetail, array('VIETEL', 'VTT', 'VTE'))) {
                $this->cashTypeBilling = DB_Sms_Viettel;
            } else if (in_array($this->upperTypeDetail, array('GPC', 'VNP'))) {
                $this->cashTypeBilling = DB_Sms_Vina;
            } else if (in_array($this->upperTypeDetail, array('VMS'))) {
                $this->cashTypeBilling = DB_Sms_Mobi;
            }
        }
    }

    function finalInfoZing()
    {
        if (!$this->isSMS()) {
            $this->G_convert = ceil($this->GrossAmount / 100);
            //cach Add G thi chuan moi (Game Ba cay)
            if ($this->upperType == "MCARD") {
                $this->G_addGame = floor(floor($this->GrossAmount / 100) * RATE_CARD_TELCO);
            } else {
                $this->G_addGame = floor(floor($this->GrossAmount / 100) * RATE_CARD_ZING);
            }
            $this->G_bonus = abs(floor($this->GrossAmount / 100) - $this->G_addGame);
            $this->zingId = $this->UserId;
            $this->username = $this->getUsername();
        } else {
            $this->G_convert = ceil($this->NetAmount / 100);
            //cach Add G thi chuan moi (Game Ba cay)
            $this->G_addGame = floor(floor($this->GrossAmount / 100) * RATE_SMS);
            $this->G_bonus = 0;
            $this->username = $this->UserId;
            $this->zingId = $this->getZingIDbySMS();
        }
    }

    /**
     * tra ve nap tien tu nguon nao: sms, telco, hay card_zing
     * @return string
     */
    function getActionIdType()
    {
        if ($this->isSMS()) {
            return 'SMS';
        }
        if ($this->MobileOperator == '') {
            //neu ko phai tin nhan, va card telco tu nha mang thi la card zing
            return 'card_zing';
        }
        return $this->MobileOperator;
    }


    function getSourceByUserId($prefix = '', $suffix = '', $uId = 0, $game = '')
    {
        $source = 'Mobile';
        if ($game === 'bida' || $game === 'bidacard') {
            $source = 'web';
            return $source;
        }
        if ($prefix == 'CoTuong_') {
            $prefix = 'CoTuongBZ_';
        } else if ($prefix == 'caro_') {
            $prefix = 'Carobz_';
        }

        if ($uId === 0)
            $uId = $this->zingId;
        $key = $prefix . $uId . $suffix;
        $source_id = DataProvider::getCache($key);
//            echo 'KEY : '.$key;
//            echo 'SOURCE ID :';
//            var_dump($source_id);
        if ($source_id === false) {
            $source = 'mobile';
        } else {
            $source_id = intval($source_id);
            if ($source_id === 0) {
//                    echo 'return web';
                $source = 'web';
            }
            if ($source_id > 0) {
//                    echo 'return mobile';
                $source = 'mobile';
            }
        }

//            echo '--source:'.$source;
        return $source;
    }

    function checkOffset($typeOffset, $money)
    {
        $logMoney['xunap'] = $money;
        $logMoney['xuthuong'] = 0;
        $logMoney['gross_revenue'] = 0;
        $logMoney['gross_user'] = 0;
        switch ($typeOffset) {
            case 0: //khac
                $logMoney['xunap'] = 0;
                $logMoney['xuthuong'] = $money;
                break;
            case 1: // convert xu
                $logMoney['xunap'] = $money * RATE_ZING_CONVERT;
                $logMoney['xuthuong'] = $money - $logMoney['xunap'];
                $logMoney['gross_revenue'] = $money * 100;
                $logMoney['gross_user'] = $money * RATE_ZING_CONVERT * 100;
                break;
            case 2: // sms
                $logMoney['xunap'] = $money;
                $logMoney['xuthuong'] = 0;
                $logMoney['gross_revenue'] = floor($money / RATE_SMS * 100);
                $logMoney['gross_user'] = $money * 100;
                break;
            case 3: // the dt
                $logMoney['xunap'] = ceil($money * RATE_CARD_TELCO);
                $logMoney['xuthuong'] = $money - $logMoney['xunap'];
                $logMoney['gross_revenue'] = $money * 100;
                $logMoney['gross_user'] = ceil($money * 100 * RATE_CARD_TELCO);
                break;
            case 4: // Thuong
                $logMoney['xunap'] = 0;
                $logMoney['xuthuong'] = $money;
                break;

        }
        return $logMoney;
    }


    function getXuByUserId()
    {
        return DataProvider::getXuByUserId($this->zingId);
    }

    function checkSig($secret_key)
    {
        $compare_key = md5($this->TransactionID . $this->Type . $this->UserId . $this->GrossAmount . $this->NetAmount . $secret_key);
        if ($compare_key == $this->Sig) {
            return true;
        }
        return false;
    }

    function isSMS()
    {
        if (strtoupper($this->Type) == 'SMS')
            return true;
        else
            return false;
    }

    function addGToBilling()
    {
        return Billing::promo($this->zingId, $this->username, $this->G_convert, 2);
    }

    function addGToBillingAddCash()
    {
        //truyen lai param cashcode
        //$cashCode = $this->NetAmount."-".$this->TypePay."-".$this->TransactionID;
        $cashCode = $this->NetAmount;
        $admin_ID = $this->TransactionID;
        $res = Billing::addCash($this->zingId, $this->username, $this->G_addGame, 102, $this->cashTypeBilling, $this->GrossAmount, $cashCode, $admin_ID);

        if (is_object($res) && $res->RetCode == 1 && $this->G_bonus > 0) {
            $admin_ID = intval(hexdec($res->CashID));
            $cashCode = '0';
            $res = Billing::addCash($this->zingId, $this->username, $this->G_bonus, 102, 'Promo', 1, $cashCode, $admin_ID);
            return $res;
        }

        return $res;
    }

    function getUsername()
    {
        //nap card optiondata = username
        $strAddInfo = base64_decode($this->OptionData);
        $arr = explode(':', $strAddInfo);
        return $arr[0];
    }

    function getZingIDbySMS()
    {
        //, sms optiondata= uid
        $uId = DataProvider::getZingIDByUsername($this->username);
        if (intval($uId) <= 0) {
            $uId = DataProvider::getZingIDByUsername(strtolower($this->username));
        }
        if (intval($uId) <= 0) {
            $uId = base64_decode($this->OptionData);
        }
        return $uId;
    }

    function updateGToDB($G)
    {
        //$this->log_r($G);
        return DataProvider::setXuByUserId($this->zingId, "" . $G);
    }

    function updateSMSToDB($G = 0, $isNewFormat = false)
    {
        $mSmsG = DataProvider::getSMSByUserId($this->zingId);
        try {
            $mSmsG = json_decode($mSmsG, true);
        } catch (Exception $exx) {
            $mSmsG = array();
        }
        if (!is_array($mSmsG)) $mSmsG = array();
        if ($G == 0) {
            if (!$isNewFormat)
                $G = $this->G_convert;
            else
                $G = $this->G_addGame;

        }
        $mSmsG[] = $G;
        return DataProvider::setSMSByUserId($this->zingId, json_encode($mSmsG));
    }

    function updateSMSEventToDB($G = 0, $isNewFormat = false)
    {
        $mSmsG = DataProvider::getSMSEventByUserId($this->zingId);

        try {
            $mSmsG = json_decode($mSmsG, true);
        } catch (Exception $exx) {
            $mSmsG = array();
        }

        if (!is_array($mSmsG))
            $mSmsG = array();

        if ($G == 0) {
            if ($isNewFormat) {
                $G = $this->G_addGame;
            } else {
                $G = $this->G_convert;
            }
        }

        $mSmsG[] = $G;

        return DataProvider::setSMSEventByUserId($this->zingId, json_encode($mSmsG));
    }

    function updateIAPGoldToDB($G = 0, $isNewFormat = false)
    {
        $mSmsG = DataProvider::getIAPGoldByUserId($this->zingId);

        try {
            $mSmsG = json_decode($mSmsG, true);
        } catch (Exception $exx) {
            $mSmsG = array();
        }

        if (!is_array($mSmsG))
            $mSmsG = array();

        if ($G == 0) {
            if ($isNewFormat)
                $G = $this->G_addGame;
            else
                $G = $this->G_convert;
        }

        $mSmsG[] = $G;

        return DataProvider::setIAPGoldByUserId($this->zingId, json_encode($mSmsG));
    }

    function updateBuyGoldToDB($G = 0, $type)
    {
        $buyGoldData = DataProvider::getBuyGoldByUserId($this->zingId);

        try {
            $buyGoldData = json_decode($buyGoldData, true);
        } catch (Exception $exx) {
            $buyGoldData = array();
        }

        if (!is_array($buyGoldData))
            $buyGoldData = array();

        if ($G == 0)
            $aConvert = array("type" => $type, "value" => $this->G_addGame);
        else $aConvert = array("type" => $type, "value" => $G);

        $buyGoldData[] = $aConvert;
        return DataProvider::setBuyGoldByUserId($this->zingId, json_encode($buyGoldData));
    }

    function updateGToGameSocket($ip, $port)
    {
        try {
            $billingSocket = new BillingSocket($ip, $port);
            $sk = $billingSocket->openSocket(5, $errnum, $errstr);
            if ($sk === null) {
                return false;
            }
            $balanceInq = new UpdateXuCmd($this->zingId);

            $data = $balanceInq->socketDataPack();

            //Send request
            $billingSocket->writeSocket($data);
            return true;
        } catch (Exception $ex) {
            return false;
        }
    }

    function log_r($data)
    {
        global $CONFIG_DATA;
        if (isset($CONFIG_DATA['Logger']) && $CONFIG_DATA['Logger'] == true) {
            DataProvider::set("checkcard_" . "zalo", $data);
        }
    }

    function log_rs($key, $data)
    {
        global $CONFIG_DATA;
        if (isset($CONFIG_DATA['Logger']) && $CONFIG_DATA['Logger'] == true) {
            DataProvider::set("checkcard_" . $key, $data);
        }
    }
}


?>
