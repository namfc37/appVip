<?php
include_once $GLOBALS['SCRIBE_ROOT'].'/scribe.php';
include_once $GLOBALS['THRIFT_ROOT'].'/protocol/TBinaryProtocol.php';
include_once $GLOBALS['THRIFT_ROOT'].'/transport/TFramedTransport.php';
include_once $GLOBALS['THRIFT_ROOT'].'/transport/TSocketPool.php';


class Scriber
{
    private $_scribe_servers = null;
    private $_scribe_ports = null;
    private $_scribe_client = null;
    private $_debug = 0;
    private $_send_timeout = 1000;
    private $_recv_timeout = 2500;
    private $_num_retries = 1;
    private $_randomize = false;
    private $_always_try_last = true;
    private $_trans = null;

    public function __construct($params = array())
    {
        $this->_scribe_servers = 	$params['scribe_servers'];
        $this->_scribe_ports = 	$params['scribe_ports'];
        if(isset($params['debug']))
            $this->_debug  = 	$params['debug'];
        if(isset($params['send_timeout']))
            $this->_send_timeout = $params['send_timeout'];
        if(isset($params['recv_timeout']))
            $this->_recv_timeout = $params['recv_timeout'];
        if(isset($params['num_retries']))
            $this->_num_retries = $params['num_retries'];
        if(isset($params['randomize']))
            $this->_randomize = $params['randomize'];
        if(isset($params['always_try_last']))
            $this->_always_try_last = $params['always_try_last'];

    }
    public function writeLog($category,$message)
    {
        try
        {
            $arr_msg = array();
            $msg = new LogEntry;
            $msg->category = $category;
            $msg->message = $message;
            $arr_msg[]= $msg;
            $this->createScribeClient();
            return $this->sendLog($arr_msg);
        }
        catch(Exception $ex)
        {
            throw new Exception($ex->getMessage(),$ex->getCode());
        }

    }

    public function sendLog($messages)
    {
        try
        {
            $result = $this->_scribe_client->Log($messages);
            try{
                if($this->_trans != null) {
                    $this->_trans->close();
                }
            } catch(Exception $exx) {

            }
            if ($result <> 0)
            {
                throw new Exception('Warning: Log returned ' . $result);
            }
            return true;
        }
        catch(Exception $ex)
        {
            throw new Exception('Scribe client failed logging messages with exception' . $ex->getMessage(),$ex->getCode());
        }


    }

    public function createScribeClient()
    {
        try
        {
            // Set up the socket connections
            $sock = new TSocketPool($this->_scribe_servers, $this->_scribe_ports );
            $sock->setDebug($this->_debug);
            $sock->setSendTimeout($this->_send_timeout);
            $sock->setRecvTimeout($this->_recv_timeout);
            $sock->setNumRetries($this->_num_retries);
            $sock->setRandomize($this->_randomize);
            $sock->setAlwaysTryLast($this->_always_try_last);
            $this->_trans = new TFramedTransport($sock);
            $prot = new TBinaryProtocol($this->_trans);

            // Create the client
            $scribe_client = new scribeClient($prot);

            // Open the transport (we rely on PHP to close it at script termination)
            $this->_trans->open();

        }
        catch (Exception $ex)
        {
            throw new Exception('Unable to create global scribe client, received exception:' . $ex->getMessage(),$ex->getCode());
            return;
        }

        $this->_scribe_client = $scribe_client;
    }

}