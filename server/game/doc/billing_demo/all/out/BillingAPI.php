<?php
define("BILLING_BALANCE_INQUIRY", 1);
define("BILLING_PURCHASEID_INQUIRY", 2);
define("BILLING_ITEM_PURCHASE", 3);
define("BILLING_PAY_PACK_PROMO", 4);
define("BILLING_PAY_PACK_PROMO_ADD_CASH", 40);
define("BILLING_PAY_PACK_CASHID", 5);                  

define("BILL_PACK_HOLDCASH", 6);
define("BILL_PACK_RELEASECASH", 7);
define("BILL_PACK_PAYOUTCASH", 8);
define("PAY_PACK_PAYOUTID", 9);

define("PAY_PACK_HOLDID", 10);
define("PAY_PACK_HOLDSTATE", 11);


class Utilities 
{
    /**
     * Get error Code Name
     * @param $errorCode
     */
     
    public static function getErrorCodeString($errorCode) 
    {
        $errorCodeString = "";

        switch ($errorCode) {
            case 1:
                $errorCodeString = "SUCCESSFUL";
                break;
            case 0:
                $errorCodeString = "SYSTEM_BUSY";
                break;
            case -1:
                $errorCodeString = "FAIL_TO_RECEIVE_REQ_MSG";
                break;
            case -2:
                $errorCodeString = "INVALID_REQ_LEN";
                break;
            case -3:
                $errorCodeString = "INVALID_REQ_TYPE";
                break;
            case -4:
                $errorCodeString = "FAIL_TO_DECODE_MSG";
                break;
            case -5:
                $errorCodeString = "INVALID_DEFAULT_REQ_LEN";
                break;
            case -6:
                $errorCodeString = "NOT_ALLOWED_IP";
                break;
            case -7:
                $errorCodeString = "INVALID_INPUT";
                break;
            case -8:
                $errorCodeString = "INVALID_PRODUCT_ID";
                break;
            case -9:
                $errorCodeString = "CLIENT_DISCONNECTED";
                break;
            case -10:
                $errorCodeString = "UNDEFINE_ERRORCODE";
                break;
            case -11:
                $errorCodeString = "UNDEFINE_ERRORCODE";
                break;

            //Account
            case -101:
                $errorCodeString = "INVALID_ACCOUNT_NO";
                break;
            case -102:
                $errorCodeString = "INVALID_ACCOUNT_NAME";
                break;
            case -103:
                $errorCodeString = "SUSPENDED_ACCOUNT";
                break;

            //Cash
            case -201:
                $errorCodeString = "INVALID_CASH_ID";
                break;
            case -202:
                $errorCodeString = "INVALID_CASH_TYPE";
                break;
            case -203:
                $errorCodeString = "INVALID_CASH_AMT";
                break;
            case -204:
                $errorCodeString = "INSUFFICIENT_CASH_POSSESSION";
                break;

            //Purchase
            case -301:
                $errorCodeString = "INVALID_PURCHASE_ID";
                break;

            //Item
            case -401:
                $errorCodeString = "INVALID_ITEM_ID";
                break;
            case -402:
                $errorCodeString = "INVALID_ITEM_NAME";
                break;
            case -403:
                $errorCodeString = "INVALID_ITEM_QUANTITY";
                break;
        }

        return $errorCodeString;
    }
    
	public static function packInt32($int32) {
		$data = "";
		$data .= chr($int32 & 0xFF);
		$data .= chr(($int32>>8) & 0xFF);
		$data .= chr(($int32>>16) & 0xFF);
		$data .= chr(($int32>>24) & 0xFF);

		return $data;
	}

	public static function unpackInt32($data) {
		return (float) sprintf("%u",
			((ord($data[3]) << 24) |
			(ord($data[2]) << 16) |
			(ord($data[1]) << 8) |
			(ord($data[0]))));
	}

	public static function packInt64Hex($int64Hex) {
		//$data is hex number string
		//return 8bytes in little-endian
		return strrev(pack("H*", $int64Hex));
	}

	public static function unpackInt64Hex($data) {
		//$data is 8bytes in little-endian
		//return hex number string
		$tokens = unpack("H*", strrev($data));
		return $tokens[1];
	}

	public static function int64FromInt64Hex($int64Hex) {
		return (float)sprintf("%.0f", hexdec($int64Hex));
	}

	public static function decFromInt64Hex($int64Hex) {
		return hexdec($int64Hex);
	}

	public static function packString($str, $packlen) {
		$data = "";
		$len = strlen($str);
		for($i=0; $i<$len; $i++) {
			$data .= pack("c", ord(substr($str, $i, 1)));
		}
		return pack("a$packlen", $data);
	}

	public static function unpackString($data, $len) {
		$tmp_arr = unpack("c".$len."chars", $data);
		$str = "";
		foreach($tmp_arr as $v) {
			if($v>0) {
				$str .= chr($v);
			}
		}

		return $str;
	}

	public static function packUniString($str, $packlen) {
		$data = mb_convert_encoding($str, 'UCS-2LE', 'UTF-8');
		return pack("a$packlen", $data);
	}

	public static function unpackUniString($data, $len) {
		$tmp_arr = unpack("C".$len."chars", $data);
		$uniStr = "";
		foreach($tmp_arr as $v) {
			if($v > 0) {
				$uniStr .= chr($v);
			}
		}

		return $uniStr;
	}

	public static function showDecBlock($data) {
		$length = strlen($data);

		echo("<b><u>[$length bytes]</u></b><br>{");
		for ($i=0; $i<$length; $i++) {
			if ($length === 116) {
				if ($i === 2)
					echo("<b><u>");
				elseif ($i === 4)
					echo("</u></b>");
				elseif ($i === 6)
					echo("<b><u>");
				else if ($i === 108)
					echo("</u></b>");
				elseif ($i === 116)
					echo("<b><u>");
			}

			if ($i > 0)
				echo(":");
			echo(hexdec(bin2hex($data[$i])));
		}
		echo("}<br>");
	}

	public static function showHexBlock($data) {
		$length = strlen($data);

		echo("<b><u>[$length bytes]</u></b><br>{");
		for ($i=0; $i<$length; $i++) {
			if ($length === 116) {
				if ($i === 2)
					echo("<b><u>");
				elseif ($i === 4)
					echo("</u></b>");
				elseif ($i === 6)
					echo("<b><u>");
				else if ($i === 108)
					echo("</u></b>");
				elseif ($i === 116)
					echo("<b><u>");
			}

			if ($i > 0)
				echo(":");
			echo(bin2hex($data[$i]));
		}
		echo("}<br>");
	}

	public static function showCharBlock($data) {
		$length = strlen($data);

		echo("<b><u>[$length bytes]</u></b><br>{");
		for ($i=0; $i<$length; $i++) {
			if ($i > 0)
				echo(":");
			echo($data[$i]);
		}
		echo("}<br>");
	}
}

class Inquiry {
	protected $ReqLen;		//WORD
	protected $ReqType;	//WORD
	public $RetCode;	//_int16

	function __construct($ReqType, $RetCode=1) {
		$this->ReqLen = 3*2;	//2xWORD + _int16
		$this->ReqType = $ReqType;
		$this->RetCode = $RetCode;
	}

	public function socketDataPack() {
		$data = pack("vvs", $this->ReqLen, $this->ReqType, $this->RetCode);

		return $data;
	}

	public function socketDataUnpack($data) {
		$offset = 0;	//at the begin
		$len = 6;		//3xWORD

		$tokens = unpack("vReqLen/vReqType/sRetCode", substr($data, $offset, $len));
		$this->ReqLen = $tokens["ReqLen"];
		$this->ReqType = $tokens["ReqType"];
		$this->RetCode = $tokens["RetCode"];

		$offset += $len;
		return $offset;
	}
}

class BalanceInq extends Inquiry {
	public $AccountName;	//WCHAR 50+1
	public $CashRemain;		//_int64Hex

	function __construct($AccountName, $CashRemain="0", $RetCode=0) {
		parent::__construct(BILLING_BALANCE_INQUIRY, $RetCode);

		$this->AccountName = $AccountName;
		$this->CashRemain = str_pad(ltrim($CashRemain, "0x"), 16, "0", STR_PAD_LEFT);

		$this->ReqLen += 51*2 + 8;	//51wchars + _int64
	}

	public function socketDataPack() {
		$data = parent::socketDataPack();

		$data .= Utilities::packUniString($this->AccountName, 51*2);
		$data .= Utilities::packInt64Hex($this->CashRemain);

		return $data;
	}

	public function socketDataUnpack($data) {
		$offset = parent::socketDataUnpack($data);

		//AccountName
		$len = 51*2;
		$this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
		$offset += $len;

		//CashRemain
		$len = 8;
		$this->CashRemain = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $this->CashRemain = intval(hexdec($this->CashRemain));
		$offset += $len;
	}
}

class PurchaseIDInq extends Inquiry {
	public $AccountName;	//WCHAR 50+1
	public $PurchaseID;		//_int64Hex

	function __construct($AccountName, $PurchaseID="0", $RetCode=0) {
		parent::__construct(BILLING_PURCHASEID_INQUIRY, $RetCode);

		$this->AccountName = $AccountName;
		$this->PurchaseID = str_pad(ltrim($PurchaseID, "0x"), 16, "0", STR_PAD_LEFT);

		$this->ReqLen += 51*2 + 8;	//51wchars + _int64
	}

	public function socketDataPack() {
		$data = parent::socketDataPack();

		$data .= Utilities::packUniString($this->AccountName, 51*2);
		$data .= Utilities::packInt64Hex($this->PurchaseID);

		return $data;
	}

	public function socketDataUnpack($data) {
		$offset = parent::socketDataUnpack($data);

		//AccountName
		$len = 51*2;
		$this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
		$offset += $len;

		//PurchaseID
		$len = 8;
		$this->PurchaseID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
		$offset += $len;
	}
}

class CashIDInq extends Inquiry 
{
    public $AccountName;    //WCHAR 50+1
    public $CashID;        //_int64Hex

    function __construct($AccountName, $CashID="0", $RetCode=0) {
        parent::__construct(BILLING_PAY_PACK_CASHID, $RetCode);

        $this->AccountName = $AccountName;
        $this->CashID = str_pad(ltrim($CashID, "0x"), 16, "0", STR_PAD_LEFT);

        $this->ReqLen += 51*2 + 8;    //51wchars + _int64
    }

    public function socketDataPack() {
        $data = parent::socketDataPack();

        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->CashID);

        return $data;
    }

    public function socketDataUnpack($data) {
        $offset = parent::socketDataUnpack($data);

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        //PurchaseID
        $len = 8;
        $this->CashID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
    }
}

class PromoCash extends Inquiry {
    public $CashID;        //_int64Hex
    public $AccountName;    //WCHAR 50+1
    public $AccountNumb;    //int64Hex
    public $CashAmt;        //_int64Hex
    public $CashCode;    //CHAR 32+1  //WCHAR 20+1
    protected $AdminId;    //WCHAR 50+1   //WCHAR 32+1
    public $PromoCampaignId;    //_int32
    public $CashRemain;    //_int64Hex

    function __construct($CashID, $AccountName, $CashRemain = "0",
        $AccountNumb=0, $CashAmt="0", $CashCode="", $AdminId ="zp",$PromoCampaignId =1,
        $RetCode=0) {
        parent::__construct(BILLING_PAY_PACK_PROMO, $RetCode);
        
        $this->CashID = str_pad(ltrim($CashID, "0x"), 16, "0", STR_PAD_LEFT);
        $this->AccountName = $AccountName;
        $this->AccountNumb = str_pad(ltrim($AccountNumb, "0x"), 16, "0", STR_PAD_LEFT); ;
        $this->CashAmt = str_pad(ltrim($CashAmt, "0x"), 16, "0", STR_PAD_LEFT);
        $this->CashCode = $CashCode;
        $this->AdminId = $AdminId;
        $this->PromoCampaignId = $PromoCampaignId ;
        $this->CashRemain = str_pad(ltrim($CashRemain, "0x"), 16, "0", STR_PAD_LEFT);
        
        $this->ReqLen += 8*4 + 4*1 + 51*2 + 21*2 + 33*2 ;    //4x_int64 + 1x_int32 + 1x51wchars + 1x20wchars + 1x32wchars
    }

    public function socketDataPack() {
        $data = parent::socketDataPack();
        
        $data .= Utilities::packInt64Hex($this->CashID);
        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->AccountNumb);
        $data .= Utilities::packInt64Hex($this->CashAmt);
        $data .= Utilities::packUniString($this->CashCode,21*2);
        $data .= Utilities::packUniString($this->AdminId, 33*2);
        $data .= Utilities::packInt32($this->PromoCampaignId);
        $data .= Utilities::packInt64Hex($this->CashRemain);

        return $data;
    }
    
    public function socketDataUnpack($data) {
        $offset = parent::socketDataUnpack($data);
        
        //PurchaseID
        $len = 8;
        $this->CashID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        $len = 8;
        $this->AccountNumb = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        //CashAmt
        $len = 8;
        $this->CashAmt = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
        
        $this->CashAmt = intval(dechex($this->CashAmt));

        //PurchaseCode
        $len = 21*2;
        $this->CashCode = Utilities::unpackUniString(substr($data, $offset, $len),$len/2);//Utilities::unpackString(substr($data, $offset, $len), $len);
        $offset += $len;
        
        //AdminName
        $len = 33*2;
        $this->AdminId = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        $len = 4;
        $this->PromoCampaignId = Utilities::unpackInt32(substr($data, $offset, $len));
        $offset += $len;

        //CashRemain
        $len = 8;
        $this->CashRemain = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
        
        $this->CashRemain = intval(hexdec($this->CashRemain));
    }
}

class PromoAddCash extends Inquiry {
    public $CashID;        //_int64Hex
    public $AccountName;    //WCHAR 50+1
    public $AccountNumb;    //int64Hex
    public $CashAmt;        //_int64Hex
    public $CashType;
    public $CashCode;    //CHAR 32+1  //WCHAR 20+1
    public $RealCashAmt;
    protected $AdminId;    //WCHAR 50+1   //WCHAR 32+1
    public $PromoCampaignId;    //_int32
    public $CashRemain;    //_int64Hex

    function __construct($CashID, $AccountName, $CashRemain = "0",
                         $AccountNumb=0, $CashAmt="0", $CashCode="", $AdminId ="zp",$PromoCampaignId =102,
                         $RetCode=0, $CashType ="",$RealCashAmt ="0") {
        parent::__construct(BILLING_PAY_PACK_PROMO_ADD_CASH, $RetCode);

        $this->CashID = str_pad(ltrim($CashID, "0x"), 16, "0", STR_PAD_LEFT);
        $this->AccountName = $AccountName;
        $this->AccountNumb = str_pad(ltrim($AccountNumb, "0x"), 16, "0", STR_PAD_LEFT); ;
        $this->CashAmt = str_pad(ltrim($CashAmt, "0x"), 16, "0", STR_PAD_LEFT);
        $this->CashCode = $CashCode;
        $this->CashType = $CashType;
        $this->RealCashAmt = str_pad(ltrim($RealCashAmt, "0x"), 16, "0", STR_PAD_LEFT);
        $this->AdminId = $AdminId;
        $this->PromoCampaignId = $PromoCampaignId ;
        $this->CashRemain = str_pad(ltrim($CashRemain, "0x"), 16, "0", STR_PAD_LEFT);

        $this->ReqLen += 8*5 + 4*1 + 51*2 + 21*2 + 33*2 + 11*2 ;    //4x_int64 + 1x_int32 + 1x51wchars + 1x20wchars + 1x32wchars
    }

    public function socketDataPack() {
        $data = parent::socketDataPack();

        $data .= Utilities::packInt64Hex($this->CashID);
        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->AccountNumb);
        $data .= Utilities::packInt64Hex($this->CashAmt);
        //Cash Type
        $data .= Utilities::packUniString($this->CashType, 11*2);
        $data .= Utilities::packUniString($this->CashCode,21*2);
        //RealCashAmt
        $data .= Utilities::packInt64Hex($this->RealCashAmt);
        $data .= Utilities::packUniString($this->AdminId, 33*2);
        $data .= Utilities::packInt32($this->PromoCampaignId);
        $data .= Utilities::packInt64Hex($this->CashRemain);

        return $data;
    }

    public function socketDataUnpack($data) {
        $offset = parent::socketDataUnpack($data);

        //PurchaseID
        $len = 8;
        $this->CashID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        $len = 8;
        $this->AccountNumb = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        //CashAmt
        $len = 8;
        $this->CashAmt = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        $this->CashAmt = intval(dechex($this->CashAmt));

        //CashType
        $len = 11*2;
        $this->CashType = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        //PurchaseCode
        $len = 21*2;
        $this->CashCode = Utilities::unpackUniString(substr($data, $offset, $len),$len/2);//Utilities::unpackString(substr($data, $offset, $len), $len);
        $offset += $len;

        //RealCashAmt
        $len = 8;
        $this->RealCashAmt = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
        $this->RealCashAmt = intval(dechex($this->RealCashAmt));

        //AdminName
        $len = 33*2;
        $this->AdminId = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        $len = 4;
        $this->PromoCampaignId = Utilities::unpackInt32(substr($data, $offset, $len));
        $offset += $len;

        //CashRemain
        $len = 8;
        $this->CashRemain = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        $this->CashRemain = intval(hexdec($this->CashRemain));
    }
}

class ItemPurchase extends Inquiry {
	public $PurchaseID;		//_int64Hex
	public $AccountName;	//WCHAR 50+1
	public $ItemID;	//_int32
	public $ItemQuantity;	//_int32
	public $ItemName;	//WCHAR 50+1
	public $CashAmt;		//_int64Hex
	public $PurchaseCode;	//CHAR 32+1
	public $Reserved;	//_int32
	public $CashRemain;	//_int64Hex

	function __construct($PurchaseID, $AccountName, $CashRemain = "0",
		$ItemID=0, $ItemQuantity=0, $ItemName="", $CashAmt="0", $PurchaseCode="", $Reserved=0,
		$RetCode=0) {
		parent::__construct(BILLING_ITEM_PURCHASE, $RetCode);

		$this->PurchaseID = str_pad(ltrim($PurchaseID, "0x"), 16, "0", STR_PAD_LEFT);
		$this->AccountName = $AccountName;
		$this->ItemID = $ItemID;
		$this->ItemQuantity = $ItemQuantity;
		$this->ItemName = $ItemName;
		$this->CashAmt = str_pad(ltrim($CashAmt, "0x"), 16, "0", STR_PAD_LEFT);
		$this->PurchaseCode = $PurchaseCode;
		$this->Reserved = $Reserved;
		$this->CashRemain = str_pad(ltrim($CashRemain, "0x"), 16, "0", STR_PAD_LEFT);

		$this->ReqLen += 8*3 + 4*3 + 2*51*2 + 33;	//3x_int64 + 3x_int32 + 2x51wchars + 33chars
	}

	public function socketDataPack() {
		$data = parent::socketDataPack();

		$data .= Utilities::packInt64Hex($this->PurchaseID);
		$data .= Utilities::packUniString($this->AccountName, 51*2);
		$data .= Utilities::packInt32($this->ItemID);
		$data .= Utilities::packInt32($this->ItemQuantity);
		$data .= Utilities::packUniString($this->ItemName, 51*2);
		$data .= Utilities::packInt64Hex($this->CashAmt);
		$data .= pack("a33", $this->PurchaseCode);
		$data .= Utilities::packInt32($this->Reserved);
		$data .= Utilities::packInt64Hex($this->CashRemain);

		return $data;
	}

	public function socketDataUnpack($data) {
		$offset = parent::socketDataUnpack($data);

		//PurchaseID
		$len = 8;
		$this->PurchaseID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
		$offset += $len;

		//AccountName
		$len = 51*2;
		$this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
		$offset += $len;

		$len = 4;
		$this->ItemID = Utilities::unpackInt32(substr($data, $offset, $len));
		$offset += $len;

		$len = 4;
		$this->ItemQuantity = Utilities::unpackInt32(substr($data, $offset, $len));
		$offset += $len;

		//ItemName
		$len = 51*2;
		$this->ItemName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
		$offset += $len;

		//CashAmt
		$len = 8;
		$this->CashAmt = Utilities::unpackInt64Hex(substr($data, $offset, $len));
		$offset += $len;

		//PurchaseCode
		$len = 33;
		$this->PurchaseCode = trim(substr($data, $offset, $len), "\0");//Utilities::unpackString(substr($data, $offset, $len), $len);
		$offset += $len;

		$len = 4;
		$this->Reserved = Utilities::unpackInt32(substr($data, $offset, $len));
		$offset += $len;

		//CashRemain
		$len = 8;
		$this->CashRemain = Utilities::unpackInt64Hex(substr($data, $offset, $len));
		$offset += $len;
		
		$this->CashAmt = intval(hexdec($this->CashAmt));
        $this->CashRemain = intval(hexdec($this->CashRemain));
	}
}

class BillingSocket 
{
	public $ip;
	public $port;
	public $sk;

	function __construct($ip, $port) {
		$this->ip = $ip;
		$this->port = $port;
	}

	public function openSocket($timeout, &$errnum, &$errstr) {
		$this->sk=fsockopen($this->ip, $this->port, $errnum, $errstr, $timeout);
		if (!is_resource($this->sk)) {
			return null;
		} else {
			return $this->sk;
		}
	}

	public function writeSocket($data) {
		return fputs($this->sk, $data);
	}

	public function readSocket($length) {
		return fgets($this->sk, $length);
	}

	public function endOfSocket() {
		return feof($this->sk);
	}

	public function closeSocket() {
		return fclose($this->sk);
	}
}

class AccountInfo 
{
    public $ResultCode;    //_int16 
    public $PayOutType;        //_int16
    public $AccountName;    //WCHAR 50+1
    public $CashAmt;    //_int64Hex  
    public $CashRemain;    //_int64Hex
    
    function __construct($AccountName='no1',$CashAmt=0,$PayOutType=0,$CashRemain='0',$ResultCode=0)
    {
      $this->AccountName = $AccountName;
      $this->CashAmt = str_pad(ltrim(dechex($CashAmt), "0x"), 16, "0", STR_PAD_LEFT);
      $this->PayOutType = $PayOutType; 
      $this->CashRemain = str_pad(ltrim($CashRemain, "0x"), 16, "0", STR_PAD_LEFT);
      $this->ResultCode = $ResultCode ;   
    }
    
    public static function getSize()
    {
      $size = 2*2 + 8*2 + 51*2  ; // 2x_int16 + 2x_int64 + 51wchars 
      return  $size ;
    }
    
    public function socketDataPack() 
    {
        $data = ""; 
        $data .= pack("ss",$this->ResultCode,$this->PayOutType);
        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->CashAmt);
        $data .= Utilities::packInt64Hex($this->CashRemain);
             
        return $data;
    }
    
    public function socketDataUnpack($data) 
    {
        $offset = 0 ;
        
        //ResultCode &  PayOutType
        $len = 2*2;        //2 int_16
        $tokens = unpack("sResultCode/sPayOutType", substr($data, $offset, $len));
        $this->ResultCode = $tokens["ResultCode"];
        $this->PayOutType = $tokens["PayOutType"];
        $offset += $len;

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        //CashAmt
        $len = 8;
        $this->CashAmt = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;

        //CashRemain
        $len = 8;
        $this->CashRemain = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
        
        $this->CashAmt = intval(hexdec($this->CashAmt));
        $this->CashRemain = intval(hexdec($this->CashRemain));
          
    }
}

class PayOutIDInquiry extends Inquiry
{
    public $AccountName;    //WCHAR 50+1
    public $PayOutID;    //_int64Hex
    
    function __construct($AccountName='myplay_caro',$PayOutID='0',$RetCode=0)
    {
      parent::__construct(PAY_PACK_PAYOUTID, $RetCode); 
      $this->AccountName = $AccountName;
      $this->PayOutID = str_pad(ltrim($PayOutID, "0x"), 16, "0", STR_PAD_LEFT);
      
      $this->ReqLen += 51*2 + 8 ; // 1x_Wchar50 + 1x_int64   
    }
    
    public function socketDataPack() 
    {
        $data = parent::socketDataPack();   

        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->PayOutID);

        return $data;
    }

    public function socketDataUnpack($data) 
    {
        $offset = parent::socketDataUnpack($data);

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        //PayOutID
        $len = 8;
        $this->PayOutID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
    } 
}

class PayOutCash  extends Inquiry
{
    public $PayOutID;    //_int64Hex
    public $HoldID;     //_int64Hex
    public $GameCode;   //CHAR 32+1
    public $UserCnt;     //_int16
    public $AccList = array();
    
    function __construct($PayOutID='0',$HoldID='0',$GameCode='',$AccList= array(),$RetCode=0)
    {
      parent::__construct(BILL_PACK_PAYOUTCASH, $RetCode); 
      $this->PayOutID = str_pad(ltrim($PayOutID, "0x"), 16, "0", STR_PAD_LEFT);
      $this->HoldID = str_pad(ltrim($HoldID, "0x"), 16, "0", STR_PAD_LEFT);
      $this->GameCode = $GameCode ;
      
      foreach($AccList as $Acc)
      {
        $this->AccList[] =  new AccountInfo($Acc['AccountName'],$Acc['CashAmt'],$Acc['PayOutType']); 
      }
      $this->UserCnt = count($this->AccList);

      $this->ReqLen += 8*2 + 2 + 33 + $this->UserCnt*AccountInfo::getSize();    //2x_int64 + 1x_int16 + CHAR 32+1  UserCnt*   
    }
    
    public function socketDataPack() 
    {
        $data = parent::socketDataPack();

        $data .= Utilities::packInt64Hex($this->PayOutID);
        $data .= Utilities::packInt64Hex($this->HoldID);
        $data .= pack("a33", $this->GameCode);
        $data .= pack("s", $this->UserCnt);
        
        foreach($this->AccList as $oAccInfo)
          $data .= $oAccInfo->socketDataPack();  
          
        return $data;
    }

    public function socketDataUnpack($data) 
    {
        $offset = parent::socketDataUnpack($data);

        //PayOutID
        $len = 8;
        $this->PayOutID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
        
        //HoldID
        $len = 8;
        $this->HoldID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
        
        //GameCode
        $len = 33;
        $this->GameCode = trim(substr($data, $offset, $len), "\0");
        $offset += $len;
        
        //UserCnt
        $len = 2;        //1 int_16
        $tokens = unpack("sUserCnt", substr($data, $offset, $len));
        $this->UserCnt = $tokens["UserCnt"];
        $offset += $len;
        $this->AccList = array();
        for($i = 0;$i < $this->UserCnt ; $i++ )
        {   
            $len = AccountInfo::getSize() ;       
            $Acc = new AccountInfo();
            $Acc->socketDataUnpack(substr($data, $offset, $len));
            $this->AccList[] = $Acc;
            $offset += $len;  
        }
    } 
}

class HoldIDInq extends Inquiry 
{
    public $AccountName;    //WCHAR 50+1
    public $HoldID;        //_int64Hex

    function __construct($AccountName, $HoldID="0", $RetCode=0) {
        parent::__construct(PAY_PACK_HOLDID, $RetCode);

        $this->AccountName = $AccountName;
        $this->HoldID = str_pad(ltrim($HoldID, "0x"), 16, "0", STR_PAD_LEFT);

        $this->ReqLen += 51*2 + 8;    //51wchars + _int64
    }

    public function socketDataPack() {
        $data = parent::socketDataPack();

        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->HoldID);

        return $data;
    }

    public function socketDataUnpack($data) {
        $offset = parent::socketDataUnpack($data);

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        //PurchaseID
        $len = 8;
        $this->HoldID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
    }
}

class HoldState extends Inquiry 
{
    public $AccountName;    //WCHAR 50+1
    public $HoldID;        //_int64Hex

    function __construct($AccountName, $HoldID="0", $RetCode=0) {
        parent::__construct(PAY_PACK_HOLDSTATE, $RetCode);

        $this->AccountName = $AccountName;
        $this->HoldID = str_pad(ltrim($HoldID, "0x"), 16, "0", STR_PAD_LEFT);

        $this->ReqLen += 51*2 + 8;    //51wchars + _int64
    }

    public function socketDataPack() {
        $data = parent::socketDataPack();

        $data .= Utilities::packUniString($this->AccountName, 51*2);
        $data .= Utilities::packInt64Hex($this->HoldID);

        return $data;
    }

    public function socketDataUnpack($data) {
        $offset = parent::socketDataUnpack($data);

        //AccountName
        $len = 51*2;
        $this->AccountName = Utilities::unpackUniString(substr($data, $offset, $len), $len/2);
        $offset += $len;

        //PurchaseID
        $len = 8;
        $this->HoldID = Utilities::unpackInt64Hex(substr($data, $offset, $len));
        $offset += $len;
    }
}

?>
