<?php

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