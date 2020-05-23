<?php
error_reporting(0);
if(empty($zingID)) $zingID = 18564619;
if(empty($money)) $money = 0;

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

class UpdateXuCmd 
{
	protected $header = 0x80;		//byte
	protected $reqLen = 9 ;		//short
	protected $controllerId = 0 ;		//byte
	protected $cmdId = 200 ;	//short
	
	protected $uId;	//int
	
	function __construct($uId = 0) 
	{
		$this->uId = $uId;
	}

	public function socketDataPack() 
	{
		$data = '';
		$data = pack("cncnn", $this->header, $this->reqLen, $this->controllerId,$this->cmdId,0);
		
		// content
		$data .= UpdateXuCmd::packInt32($this->uId);
		return $data;
	}
	
	public static function packInt32($int32) 
	{
		$data = "";	
		$data .= chr(($int32>>24) & 0xFF);
		$data .= chr(($int32>>16) & 0xFF);
		$data .= chr(($int32>>8) & 0xFF);
		$data .= chr($int32 & 0xFF);

		return $data;
	}
}

class ChargeXuCmd 
{
	protected $header = 0x80;		//byte
	protected $reqLen = 13 ;		//short
	protected $controllerId = 0 ;		//byte
	protected $cmdId = 200 ;	//short
	protected $money = 200 ;	//short
	
	protected $uId;	//int
	
	function __construct($uId = 0,$money = 0) 
	{
		$this->uId = $uId;
		$this->money = $money;
	}

	public function socketDataPack() 
	{
		$data = '';
		$data = pack("cncnn", $this->header, $this->reqLen, $this->controllerId,$this->cmdId,1);
		
		// content
		$data .= UpdateXuCmd::packInt32($this->uId);
		$data .= UpdateXuCmd::packInt32($this->money);
		return $data;
	}
	
	public static function packInt32($int32) 
	{
		$data = "";	
		$data .= chr(($int32>>24) & 0xFF);
		$data .= chr(($int32>>16) & 0xFF);
		$data .= chr(($int32>>8) & 0xFF);
		$data .= chr($int32 & 0xFF);

		return $data;
	}
}
