<?php
define('LA_BASE_PATH', realpath(dirname(__FILE__)));
$GLOBALS['SCRIBE_ROOT'] = LA_BASE_PATH . '/scribe';
require_once(LA_BASE_PATH . '/scriber.php');

class LogAnalytic
{
    private $_category = null;
    private $config;

    public function __construct ($category = 'billing')
    {
        $this->_category = $category;

        $this->config['debug'] = 0;
        $this->config['send_timeout'] = 30;
        $this->config['recv_timeout'] = 2500;
        $this->config['num_retries'] = 1;
        $this->config['randomize'] = false;
        $this->config['always_try_last'] = true;
    }

    /**
     * Hàm ghi log
     * @param $array_data
     *
     * @return unknown_type
     */
    public function sendActLog ($array_data = array())
    {
        global $CONFIG_DATA;
        try
        {
            $time = $_SERVER['REQUEST_TIME'];
            $uId = $array_data['uid'];
            $ownerId = $array_data['ownerId'];
            $mid = $array_data['mid'];
            $actId = $array_data['act'];
            $gold_change = $array_data['gold_change'];
            $xu_change = $array_data['xu_change'];
            $gold_rest = $array_data['gold_rest'];
            $xu_rest = $array_data['xu_rest'];
            $param1 = $array_data['param1'];
            $param2 = $array_data['param2'];
            $param3 = $array_data['param3'];
            $param4 = $array_data['param4'];
            $param5 = $array_data['param5'];

            $message = sprintf('%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s', $time, $uId, $ownerId, $mid, $actId, $gold_change, $xu_change, $gold_rest, $xu_rest, $param1, $param2, $param3, $param4, $param5);
            if ($CONFIG_DATA['LogAddNewLine'])
                $message .= "\n";

            global $CONFIG_DATA;
            $config['scribe_servers'] = array($CONFIG_DATA['LogGameHost']);
            $config['scribe_ports'] = array($CONFIG_DATA['LogGamePort']);

            $scriber = new scriber($config);
            $scriber->writeLog($CONFIG_DATA['gameId'] . '_' . $this->_category, $message);
        }
        catch (Exception $ex)
        {
            throw $ex;
            return false;
        }
    }

    public function ifrs ($array_data = array())
    {
        global $CONFIG_DATA;
        try
        {
            $param1 = $array_data['userId'];
            $param2 = $array_data['currentXu'];
            $param3 = $array_data['currentPromo'];
            $param4 = millisTime();
            $param5 = $array_data['serverId'];//serverId
            $param6 = $array_data['changeXu'];
            $param7 = $array_data['changePromo'];
            $param8 = $array_data['itemId'];
            $param9 = $array_data['actionId'];
            $param10 = $array_data['unitPrice'];
            $param11 = $array_data['grossRev'];
            $param12 = $array_data['netRev'];
            $param13 = $array_data['userSource'];
            $param14 = $array_data['tranId'];
            $param15 = $array_data['sourcePartner'];
            $param16 = $array_data['sourcePay'];
            $message = sprintf('%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s', $param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8, $param9, $param10, $param11, $param12, $param13, $param14, $param15, $param16);
            if ($CONFIG_DATA['LogAddNewLine'])
                $message .= "\n";

            global $CONFIG_DATA;
            $config['scribe_servers'] = array($CONFIG_DATA['LogIfrsHost']);
            $config['scribe_ports'] = array($CONFIG_DATA['LogIfrsPort']);

            $scriber = new scriber($config);
            $scriber->writeLog($CONFIG_DATA['gameId']. '_IFRS_' . $this->_category, $message);
        }
        catch (Exception $ex)
        {
            throw $ex;
            return false;
        }
    }

    /**
     * Hàm ghi log
     * @param $array_data
     *
     * @return unknown_type
     */
    public function sendLog ($separator, $array_data = array())
    {
        global $CONFIG_DATA;
        try
        {
            $message = implode($separator, $array_data);
            if ($CONFIG_DATA['LogAddNewLine'])
                $message .= "\n";
            
            $config['scribe_servers'] = array($CONFIG_DATA['LogGameHost']);
            $config['scribe_ports'] = array($CONFIG_DATA['LogGamePort']);

            $scriber = new scriber($config);
            $scriber->writeLog($CONFIG_DATA['gameId']. '_' . $this->_category, $message);
            return true;
        }
        catch (Exception $ex)
        {
            //echo $ex->getMessage();
            return false;
        }
    }
}
