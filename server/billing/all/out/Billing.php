<?php
/**
 * Billing Proccess
 */
include('../../all/out/BillingAPI.php');

class Billing
{

    static public $timeout = 30;


    /**
     * Get money of user
     * @param Username
     */
    static function balance ($uId = 0, $username)
    {
        if ($uId == 0)
            return -1;
        if (strlen($username) == 0)
            return -3;

        $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
        $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
        if ($sk === null)
            return -4;

        $balanceInq = new BalanceInq($username, "", 0);
        $data = $balanceInq->socketDataPack();
        //Send request
        $billingSocket->writeSocket($data);
        //Receive request
        $data = "";
        while (!$billingSocket->endOfSocket())
        {
            $token = $billingSocket->readSocket(1024);
            $data .= $token;
        }

        $balanceInq->socketDataUnpack($data);
        $res = $balanceInq;

        $billingSocket->closeSocket();
        unset($billingSocket);
        return $res;

    }

    static function purchase ($uId = 0, $username, $nMoney = 0, $aArrayInfo = '')
    {
        if ($uId == 0)
            return -1;
        if (intval($nMoney) == 0)
            return -2;
        if (strlen($username) == 0)
            return -3;

        $Item = explode(':', $aArrayInfo);
        $ItemQua = $Item[2];
        $ItemName = $Item[1];
        $ItemID = $Item[0];

        $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
        $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
        if ($sk === null)
            return -4;
        $purchaseIDInq = new PurchaseIDInq($username, "", 0);
        $data = $purchaseIDInq->socketDataPack();
        $billingSocket->writeSocket($data);
        $data = null;
        $data = "";
        while (!$billingSocket->endOfSocket())
        {
            $token = $billingSocket->readSocket(1024);
            $data .= $token;
        }

        if ($data)
        {
            $purchaseIDInq->socketDataUnpack($data);
        }
        if ($purchaseIDInq->RetCode === 1 && strlen($purchaseIDInq->PurchaseID) > 0)
        {

            $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
            $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
            if ($sk === null)
            {
                return -5;
            }

            $nTransaction = md5($uId . $username . microtime());
            $itemPurchase = new ItemPurchase(
                $purchaseIDInq->PurchaseID,
                $username,
                dechex($nMoney),
                $ItemID,
                $ItemQua,
                $ItemName,
                dechex($nMoney),
                $nTransaction,
                0,
                0);
            $data = $itemPurchase->socketDataPack();
            $billingSocket->writeSocket($data);

            $data = "";
            while (!$billingSocket->endOfSocket())
            {
                $token = $billingSocket->readSocket(1024);
                $data .= $token;
            }
            $itemPurchase->socketDataUnpack($data);

            $res = $itemPurchase;
        }
        else
        {
            $res = $purchaseIDInq;
        }

        $billingSocket->closeSocket();
        unset($billingSocket);
        return $res;
    }

    static function promo ($uId, $username, $nMoney = 1, $campain = 1, $admin = 'ThuanVT')
    {

        if ($uId == 0)
            return -1;
        if (intval($nMoney) == 0)
            return -2;
        if (strlen($username) == 0)
            return -3;
        //echo  SERVICE_BILLING_IP."_". SERVICE_BILLING_PORT;
        $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
        $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
        if ($sk === null)
            return -4;
        $cashIDInq = new CashIDInq($username, "", 0);
        $data = $cashIDInq->socketDataPack();
        $billingSocket->writeSocket($data);
        $data = null;
        $data = "";
        while (!$billingSocket->endOfSocket())
        {
            $token = $billingSocket->readSocket(1024);
            $data .= $token;
        }

        if ($data)
        {
            $cashIDInq->socketDataUnpack($data);
        }
        if ($cashIDInq->RetCode === 1 && strlen($cashIDInq->CashID) > 0)
        {
            $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
            $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
            if ($sk === null)
            {
                return -5;
            }

            $nTransaction = md5($uId . $username . microtime());

            $cashPromo = new PromoCash(
                $cashIDInq->CashID,
                $username,
                dechex($nMoney),
                dechex($uId),
                dechex($nMoney),
                $nTransaction,
                $admin,
                $campain,
                0);

            $data = $cashPromo->socketDataPack();
            $billingSocket->writeSocket($data);
            $data = "";
            while (!$billingSocket->endOfSocket())
            {
                $token = $billingSocket->readSocket(1024);
                $data .= $token;
            }
            $cashPromo->socketDataUnpack($data);

            $res = $cashPromo;
        }
        else
        {
            $res = $cashIDInq;
        }

        $billingSocket->closeSocket();
        unset($billingSocket);
        return $res;
    }

    static function addCash ($uId, $username, $nMoney = 1, $campain = 102, $CashType = 'Promo', $RealCashAmt = 1, $cashCode = '', $admin = 'ThuanVT')
    {
        if ($uId == 0)
            return -1;
        if (intval($nMoney) == 0)
            return -2;
        if (strlen($username) == 0)
            return -3;
        //echo  SERVICE_BILLING_IP."_". SERVICE_BILLING_PORT;
        $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
        $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
        if ($sk === null)
        {
            return -4;
        }
        $cashIDInq = new CashIDInq($username, "", 0);
        $data = $cashIDInq->socketDataPack();
        $billingSocket->writeSocket($data);
        $data = null;
        $data = "";
        while (!$billingSocket->endOfSocket())
        {
            $token = $billingSocket->readSocket(1024);
            $data .= $token;
        }

        if ($data)
        {
            $cashIDInq->socketDataUnpack($data);
        }
        if ($cashIDInq->RetCode === 1 && strlen($cashIDInq->CashID) > 0)
        {
            $billingSocket = new BillingSocket(SERVICE_BILLING_IP, SERVICE_BILLING_PORT);
            $sk = $billingSocket->openSocket(SERVICE_BILLING_TIMEOUT, $errnum, $errstr);
            if ($sk === null)
            {
                return -5;
            }

            if ($cashCode == "")
                $cashCode = md5($uId . $username . microtime());

            $cashPromo = new PromoAddCash(
                $cashIDInq->CashID,
                $username,
                dechex($nMoney),
                dechex($uId),
                dechex($nMoney),
                $cashCode,
                $admin,
                $campain,
                0,
                $CashType,
                dechex($RealCashAmt));

            $data = $cashPromo->socketDataPack();
            $billingSocket->writeSocket($data);
            $data = "";
            while (!$billingSocket->endOfSocket())
            {
                $token = $billingSocket->readSocket(1024);
                $data .= $token;
            }

            $cashPromo->socketDataUnpack($data);

            $res = $cashPromo;
        }
        else
        {
            $res = $cashIDInq;
        }

        $billingSocket->closeSocket();
        unset($billingSocket);
        return $res;
    }
}
