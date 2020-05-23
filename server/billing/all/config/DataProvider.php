<?php

class DataProvider
{
    static private $memObj;
    static private $memCacheObj;


    static public function init ()
    {
        global $CONFIG_DATA;

        $memObj = new Memcached;
        $memObj->addServer($CONFIG_DATA['DbIndexHost'], $CONFIG_DATA['DbIndexPort']);
        $memObj->setOption(Memcached::OPT_COMPRESSION, false);
        self::$memObj = &$memObj;

        $memCacheObj = new Memcached;
        $memCacheObj->addServer($CONFIG_DATA['DbCacheHost'], $CONFIG_DATA['DbCachePort']);
        $memCacheObj->setOption(Memcached::OPT_COMPRESSION, false);
        self::$memCacheObj = &$memCacheObj;
    }

    static function get ($key)
    {
        return self::$memObj->get($key);
    }

    static function getCache ($key)
    {
        return self::$memCacheObj->get($key);
    }

    static function set ($key, $data)
    {
        self::$memObj->set($key, $data);
    }

    static function delete ($key)
    {
        self::$memObj->delete($key);
    }

    static function increment ($key, $value)
    {
        return self::$memObj->increment($key, $value);
    }

    static function decrement ($key, $value)
    {
        return self::$memObj->decrement($key, $value);
    }

    static function unlockTransaction ($id)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $id . '_' . $CONFIG_DATA['suffix_transaction'];
        return self::$memObj->delete($key);
    }

    static function lockTransaction ($id, $data)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $id . '_' . $CONFIG_DATA['suffix_transaction'];
        return self::$memObj->add($key, $data, time() + $CONFIG_DATA['expire_transaction'] * 2);
    }

    static function getTransaction ($id)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $id . '_' . $CONFIG_DATA['suffix_transaction'];
        return self::$memObj->get($key);
    }

    static function appendProcessing ($userId, $objCard)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $userId . '_' . $CONFIG_DATA['suffix_processing'];
        $data = json_encode($objCard) . "\n";
        //try to append first
        if (self::$memObj->append($key, $data))
            return;
        //if key not exist try to add
        if (self::$memObj->add($key, $data))
            return;
        //in bad situation try to append
        if (self::$memObj->append($key, $data))
            return;
    }

    static function getXuByUserId ($zmeId)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $zmeId . '_' . $CONFIG_DATA['suffix_xu'];
        return self::get($key);
    }

    static function setXuByUserId ($zmeId, $data)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $zmeId . '_' . $CONFIG_DATA['suffix_xu'];
        self::set($key, $data);
    }

    static function getUserIdByUsername ($username)
    {
        global $CONFIG_DATA;
        $username = strtolower($username);
        $key_sms = $CONFIG_DATA['gameId'] . '_' . $username . '_' . $CONFIG_DATA['suffix_username'];
        $result = self::get($key_sms);
        return $result;
    }
    
    static function getOnline ($userId)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['gameId'] . '_' . $userId . '_' . $CONFIG_DATA['suffix_online'];
        $result = self::getCache($key);
        if ($result === false)
            return false;
        return json_decode($result);
    }
}

DataProvider::init();
