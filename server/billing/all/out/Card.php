<?php

class Card
{
    var $userId;
    var $username;
    var $appTime;
    var $appTrans = "";
    var $payTrans = "";
    var $bilTrans = "";
    var $gross;
    var $net;
    var $coinRemain;     //tiền tồn trong hệ thống billing
    var $coinCash;       //cash trong key IFRS
    var $coinPromo;      //promo trong key IFRS
    var $coinConvert;    //tổng số coin sẽ convert
    var $convertCash;    //số cash sẽ convert
    var $convertPromo;   //số promo sẽ convert
    var $addCash = 0;    //số cash thực tế đã thêm vào hệ thống billing
    var $addPromo = 0;   //số promo thực tế đã thêm vào hệ thống billing
    var $gateway;
    var $type;
    var $subType = "";
    var $item = "";
    var $description;
    var $offer = "";
    var $level = 0;
    var $currency = '';
    var $socialType = '';
    var $platformID = -1;

    function Card ()
    {

    }

    function addCoinIAP ()
    {
        global $CONFIG_DATA;
        $realCashAmt = round($this->gross);
        
        if (isset($CONFIG_DATA['VND_TO_CENT']))
        {         
            $map = $CONFIG_DATA['VND_TO_CENT'];
            if (isset($map[$realCashAmt]))
                $realCashAmt = $map[$realCashAmt];
            else
                $realCashAmt = round($realCashAmt * 100/ 23150, 0);
        }       
        
        return $this->addCoin($realCashAmt);
    }

    function addGToBillingAddCash ()
    {
        return $this->addCoin($this->gross);
    }

    function addCoin ($realCashAmt)
    {
        $res = Billing::addCash($this->userId, $this->username, $this->convertCash, 102, $this->type, $realCashAmt, $this->payTrans, $this->appTrans);
        if (is_object($res))
        {
			$this->bilTrans = $res->CashID;
			if ($res->RetCode == 1)
			{
				$this->coinRemain = $res->CashRemain;            
				$this->addCash = $this->convertCash;
				if ($this->convertPromo > 0)
				{
					$resPromo = Billing::addCash($this->userId, $this->username, $this->convertPromo, 102, 'Promo', 1, $this->payTrans, $this->appTrans);
					if (is_object($resPromo) && $resPromo->RetCode == 1)
					{
                        $this->coinRemain = $resPromo->CashRemain;
                        $res->CashRemain = $resPromo->CashRemain;

                        $this->bilTrans .= ':'.$resPromo->CashID;
                        $res->CashID .= ':'.$resPromo->CashID;
                        
                        $this->addPromo = $this->convertPromo;
					}
				}
			}
        }

        return $res;
    }

    function updateCoinToDB ()
    {
        return DataProvider::setXuByUserId($this->userId, "" . $this->coinRemain);
    }

    function updateGToGameSocket ()
    {
        try
        {
            $online = DataProvider::getOnline($this->userId);
            if ($online === false)
                return;

            $billingSocket = new BillingSocket($online->privateHost, $online->portUser);
            $sk = $billingSocket->openSocket(5, $errnum, $errstr);
            if ($sk === null)
            {
                return false;
            }
            $balanceInq = new UpdateXuCmd($this->userId);

            $data = $balanceInq->socketDataPack();

            //Send request
            $billingSocket->writeSocket($data);
            return true;
        }
        catch (Exception $ex)
        {
            return false;
        }
    }

    function logPaying ($result)
    {
        Zf_log::paying($this->userId, $this->gateway, $this->type, $this->subType,
            $this->appTrans, $this->payTrans, $this->bilTrans,
            $this->item, $result, $this->description,
            $this->gross, $this->net,
            $this->coinRemain, $this->coinCash, $this->coinPromo,
            $this->coinConvert, $this->addCash, $this->addPromo,
            $this->offer, $this->level, 
            $this->currency,
            $this->username, $this->socialType, $this->platformID
        );
    }
}

?>
