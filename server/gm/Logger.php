<?php
$GLOBALS['THRIFT_ROOT'] = dirname(__FILE__) . '/includes';
include_once $GLOBALS['THRIFT_ROOT'] . '/scribe.php';
include_once $GLOBALS['THRIFT_ROOT'] . '/transport/TSocket.php';
include_once $GLOBALS['THRIFT_ROOT'] . '/transport/TFramedTransport.php';
include_once $GLOBALS['THRIFT_ROOT'] . '/protocol/TBinaryProtocol.php';

class Logger
{
	private $ip, $port;

	function __construct ($ip, $port)
	{
		$this->ip = $ip;
		$this->port = $port;
	}

	public function write ($message, $category)
	{
		$socket = new TSocket($this->ip, $this->port, true);
		$transport = new TFramedTransport($socket);
		$protocol = new TBinaryProtocol($transport, false, false);
		$scribe_client = new scribeClient($protocol, $protocol);
		$transport->open();
		try
		{
			$msg1['category'] = $category;
			$msg1['message'] = $message;
			$entry1 = new LogEntry($msg1);
			$messages = array($entry1);
			$scribe_client->Log($messages);
		}
		catch(Exception $e)
		{}
		$transport->close();
	}
}

function writeLog ($message, $category='INFO')
{
	try
	{
		global $loggerFarm, $SCRIBE_HOST, $SCRIBE_PORT;
		if (!$loggerFarm)
		{
			$loggerFarm = new Logger($SCRIBE_HOST, $SCRIBE_PORT);
		}
		$loggerFarm->write(date('Y-m-d H:i:s')."\t$message", $category);
	}
	catch(Exception $e2)
	{}
}

function writeLogInfo($infos)
{
    $msg = '';
    if (is_array($infos))
    {        
        foreach ($infos as $i)
            $msg .= "$i\t";
    }
    else
    {
        $msg .= $infos;
    }
    writeLog($msg);
}

?>