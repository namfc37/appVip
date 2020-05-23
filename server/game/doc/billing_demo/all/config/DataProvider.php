<?php

class DataProvider
{
    static private $Config;

    static private $memObj;
    static private $memObj1;
    static private $memObj2;
    static private $memObjIndex;

    static private $memCacheObj;


    static public function init()
    {
        global $CONFIG_DATA;

        $memObj = new Memcache;
        $memObj->addServer($CONFIG_DATA['Server'], $CONFIG_DATA['Port']);
        self::$memObj = &$memObj;

        if (isset($CONFIG_DATA['IndexServer']) && isset($CONFIG_DATA['IndexPort'])) {
            $memObjIndex = new Memcache;
            $memObjIndex->addServer($CONFIG_DATA['IndexServer'], $CONFIG_DATA['IndexPort']);
            self::$memObjIndex = &$memObjIndex;
        }

        if (isset($CONFIG_DATA['Server1']) && isset($CONFIG_DATA['Port1'])) {
            $memObj1 = new Memcache;
            $memObj1->addServer($CONFIG_DATA['Server1'], $CONFIG_DATA['Port1']);
            self::$memObj1 = &$memObj1;
        }

        if (isset($CONFIG_DATA['Server2']) && isset($CONFIG_DATA['Port2'])) {
            $memObj2 = new Memcache;
            $memObj2->addServer($CONFIG_DATA['Server2'], $CONFIG_DATA['Port2']);
            self::$memObj2 = &$memObj2;
        }

        $memCacheObj = new Memcache;
        $memCacheObj->addServer($CONFIG_DATA['ServerMemcache'], $CONFIG_DATA['PortMemcache']);
        self::$memCacheObj = &$memCacheObj;
    }

    static function get($key, $user = null, $isSystemKey = false)
    {
        global $CONFIG_DATA;

        $index = null;
        if (isset($CONFIG_DATA['IndexServer']) && isset($CONFIG_DATA['IndexPort'])) {
            if (isset($CONFIG_DATA['index_key']) && $user !== null) {
                echo 'get - ' . $key . ' - ' . $user . ' - ' . $isSystemKey . '<br>';
                if ($isSystemKey)
                    $indexKey = $CONFIG_DATA['prefix'] . $CONFIG_DATA['index_key'] . $CONFIG_DATA['suffix_username'] . $user;
                else
                    $indexKey = $CONFIG_DATA['prefix'] . $CONFIG_DATA['index_key'] . $user;

                $index = self::$memObjIndex->get($indexKey);
                echo ' - ' . $indexKey . ' - ' . $index . '<br>';
            }
        }

        $data = null;
        if ($index === '1') {
            if (isset($CONFIG_DATA['Server1']) && isset($CONFIG_DATA['Port1']))
                $data = self::$memObj1->get($key);

            if ($data === null)
                $data = self::$memObj->get($key);

            var_dump($data);
            echo '<br>';
            return $data;
        } else if ($index === '2') {
            if (isset($CONFIG_DATA['Server2']) && isset($CONFIG_DATA['Port2']))
                $data = self::$memObj2->get($key);

            if ($data === null)
                $data = self::$memObj->get($key);

            var_dump($data);
            echo '<br>';
            return $data;
        }

        $data = self::$memObj->get($key);
        return $data;
    }

    static function set($key, $data, $user = null, $isSystemKey = false)
    {
        global $CONFIG_DATA;

        $index = null;
        if (isset($CONFIG_DATA['IndexServer']) && isset($CONFIG_DATA['IndexPort'])) {
            if (isset($CONFIG_DATA['index_key']) && $user !== null) {
                echo 'set - ' . $key . ' - ' . $data . ' - ' . $user . ' - ' . $isSystemKey . '<br>';
                if ($isSystemKey)
                    $indexKey = $CONFIG_DATA['prefix'] . $CONFIG_DATA['index_key'] . $CONFIG_DATA['suffix_username'] . $user;
                else
                    $indexKey = $CONFIG_DATA['prefix'] . $CONFIG_DATA['index_key'] . $user;

                $index = self::$memObjIndex->get($indexKey);
                echo ' - ' . $indexKey . ' - ' . $index . '<br>';
                var_dump($data);
                echo '<br>';
            }
        }

        if ($index === '1') {
            if (isset($CONFIG_DATA['Server1']) && isset($CONFIG_DATA['Port1'])) {
                self::$memObj1->set($key, $data, 0, 0);
                return;
            }
        } else if ($index === '2') {
            if (isset($CONFIG_DATA['Server2']) && isset($CONFIG_DATA['Port2'])) {
                self::$memObj2->set($key, $data, 0, 0);
                return;
            }
        }

        self::$memObj->set($key, $data, 0, 0);
    }

    static function delete($key)
    {
        self::$memObj->set($key);
    }

    static function getCache($key)
    {
        $data = self::$memCacheObj->get($key);
        return $data;
    }


    static function setCache($key, $data)
    {
        self::$memCacheObj->set($key, $data, 0, 7 * 24 * 3600); //save cache 7 days
    }


    static function getXuByUserId($zmeId)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix'];
        return self::get($key, $zmeId);
    }

    static function setXuByUserId($zmeId, $data)
    {
        global $CONFIG_DATA;
        if ($CONFIG_DATA['prefix'] == 'caro_') {
            $keyCaroBZ = 'Carobz_' . $zmeId . $CONFIG_DATA['suffix'];
            self::set($keyCaroBZ, $data, $zmeId);
        }
        if ($CONFIG_DATA['prefix'] == 'CoTuong_') {
            $keyCotuongBZ = 'CoTuongBZ_' . $zmeId . $CONFIG_DATA['suffix'];
            self::set($keyCotuongBZ, $data, $zmeId);
        }

        $key = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix'];
        self::set($key, $data, $zmeId);
    }

    static function getSMSByUserId($zmeId)
    {
        global $CONFIG_DATA;
        $key_sms = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_sms'];
        return self::get($key_sms, $zmeId);
    }

    static function getSMSEventByUserId($zmeId)
    {
        global $CONFIG_DATA;
        $key_sms = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_sms_event'];
        return self::get($key_sms, $zmeId);
    }

    static function setSMSByUserId($zmeId, $data)
    {
        global $CONFIG_DATA;
        if ($CONFIG_DATA['prefix'] == 'CoTuong_') {
            $keyCotuongBZ = 'CoTuongBZ_' . $zmeId . $CONFIG_DATA['suffix'];
            self::set($keyCotuongBZ, $data, $zmeId);
        }

        $key_sms = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_sms'];
        self::set($key_sms, $data, $zmeId);
    }

    static function setSMSEventByUserId($zmeId, $data)
    {
        global $CONFIG_DATA;

        if ($CONFIG_DATA['prefix'] == 'CoTuong_') {
            $keyCotuongBZ = 'CoTuongBZ_' . $zmeId . $CONFIG_DATA['suffix'];
            self::set($keyCotuongBZ, $data, $zmeId);
        }

        $key_sms = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_sms_event'];
        self::set($key_sms, $data, $zmeId);
    }

    static function getIAPGoldByUserId($zmeId)
    {
        global $CONFIG_DATA;
        $key_sms = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_iap'];
        return self::get($key_sms, $zmeId);
    }

    static function setIAPGoldByUserId($zmeId, $data)
    {
        global $CONFIG_DATA;
        $key_sms = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_iap'];
        self::set($key_sms, $data, $zmeId);
    }

    static function getBuyGoldByUserId($zmeId)
    {
        global $CONFIG_DATA;
        $key_buy_gold = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_buy_gold'];
        return self::get($key_buy_gold, $zmeId);
    }

    static function setBuyGoldByUserId($zmeId, $data)
    {
        global $CONFIG_DATA;
        $key_buy_gold = $CONFIG_DATA['prefix'] . $zmeId . $CONFIG_DATA['suffix_buy_gold'];
        self::set($key_buy_gold, $data, $zmeId);
    }

    static function getZingIDByUsername($username)
    {
        global $CONFIG_DATA;
        if ($CONFIG_DATA['prefix'] == 'CoTuong_')
            $CONFIG_DATA['prefix'] = "CoTuongBZ_";
        $key_sms = $CONFIG_DATA['prefix'] . $username . $CONFIG_DATA['suffix_username'];
        $result = self::get($key_sms, $username, true);
        return $result;
    }

    /**
     * @param $username
     * @return mixed
     * get ZingID form ZAlo Transaction
     */
    static function getZingIDByUsernameZALO($username)
    {
        global $CONFIG_DATA;
        $key_sms = $CONFIG_DATA['prefix'] . $username . $CONFIG_DATA['suffix_username'];
        $result = self::get($key_sms, $username, true);
        //da bo DB cu cua 2 game binh va tala
        if ($result === false) {
            if ($CONFIG_DATA['gameId'] == 'pokerhk') {
                return self::getOldDB($key_sms);
            }
        }
        return $result;
    }




    static function getUsernameByUserId($userId)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['prefix'] . $userId . $CONFIG_DATA['suffix_userid'];
        $result = self::get($key, $userId);
        return $result;
    }

    static function isExistUserId($userId)
    {
        global $CONFIG_DATA;
        $key = $CONFIG_DATA['prefix'] . $userId . '_player_info';
        $result = self::get($key, $userId);
        return $result != false;
    }


    /**
     * @param $uId
     * @return mixed
     * lay du lieu thong ke, xem user dang nhap lan dau tu nguon nao? mWork, Csm
     */
    static function getTrackingPartnerActive($uId)
    {
        global $CONFIG_DATA;
        if ($CONFIG_DATA['prefix'] == 'CoTuong_')
            $CONFIG_DATA['prefix'] = "CoTuongBZ_";
        $key = $CONFIG_DATA['prefix'] . $uId . '_tracking_source_app';
        $result = self::get($key, $uId);
        if ($result === false || $result == '')
            $result = 0;
        return $result;
    }

    /**
     * @param $uId
     * @return mixed
     * user thanh toan tu dau? mWork, csm
     */
    static function getTrackingPartnerPay($uId)
    {
        global $CONFIG_DATA;
        if ($CONFIG_DATA['prefix'] == 'CoTuong_')
            $CONFIG_DATA['prefix'] = "CoTuongBZ_";
        $key = $CONFIG_DATA['prefix'] . $uId . '_tracking_source_pay';
        $result = self::get($key, $uId);
        if ($result === false || $result == '')
            $result = 0;
        return $result;
    }
}

DataProvider::init();
