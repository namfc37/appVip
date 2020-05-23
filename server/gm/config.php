<?php
define('BUCKET_INDEX', 'index');
define('BUCKET_CACHE', 'cache');
define('BUCKET_USER_1', 'user_1');
define('BUCKET_USER_2', 'user_2');

define('SUFFIX_GM_SESSION', 'gmSession');

define('RIGHT_VIEW_USER', 1);
define('RIGHT_EDIT_USER', 2);
define('RIGHT_DELETE_USER', 3);
define('RIGHT_SEND_ALL', 4);
define('RIGHT_SYSTEM', 5);

define('LOGIN_SESSION_KEY', 'ZNvr6cW&eR6*sUn#KaQ2');
define('LOGIN_PASSWORD_KEY', 'h%c8yeVQGwfc46f5$cR*');
define('LOGIN_EXPIRE', 600);
define('LOGIN_HASH_ALGORITHM', 'sha256');

define('SESSION_EXPIRE', 691200);
define('SESSION_HASH_KEY', '96$y8NXcLxEj@PG^b7L*y94Q');
define('SESSION_HASH_ALGORITHM', 'sha256');
define('SESSION_ADMIN', 'admin');
define('SESSION_TIME', 'time');
define('SESSION_SEED', 'seed');
define('SESSION_HASH', 'hash');

define('ADMIN_HASH_KEY', '(@dm1nS#cr3tKey!)');

define('USERNAME_LENGTH', 4);
define('PASSWORD_LENGTH', 8);

include_once 'env.php';
include_once 'utils.php';

$mapUser = array();
include_once 'users.php';

$CLIENT_IP = getRealIp();
$adminId = '';
$right = array();
$useMemcached = class_exists('Memcached');

$BALANCE_ADDRESS = "$BALANCE_HOST:$BALANCE_PORT";
$ADMIN_ADDRESS = "$ADMIN_HOST:$ADMIN_PORT";

function setSession ($adminId)
{    
    $time = time();
    $seed = mt_rand();
    
    $ip = getRealIp();
    $checkIp = getUserIp($adminId);
    if ($checkIp)
    {
        if ($checkIp != $ip)
            exit("Invalid IP $ip");
    }
    else
    {
        $ip = '';
    }
    
    $hash = hash(SESSION_HASH_ALGORITHM, SESSION_HASH_KEY.$ip.$adminId.$time.$seed);
    $expire = $time + SESSION_EXPIRE;	

    $keyName = keyGmSession($adminId);	
    if (setKey(BUCKET_CACHE, $keyName, $hash, $expire) === false)
        exit('Set session fail');

    setcookie(SESSION_ADMIN, $adminId, $expire);
    setcookie(SESSION_TIME, $time, $expire);
    setcookie(SESSION_SEED, $seed, $expire);
    setcookie(SESSION_HASH, $hash, $expire);
}

function checkSessionToIndex ()
{
    $result = checkSession();
    if ($result === true)
        redirectIndex($result);
}

function checkSessionToLogin ()
{
    $result = checkSession();
    if ($result !== true)
        redirectLogin($result);
}

function checkSession ()
{
    global $adminId, $right;
   
    if (!array_key_exists(SESSION_ADMIN, $_COOKIE) || !array_key_exists(SESSION_TIME, $_COOKIE) || !array_key_exists(SESSION_SEED, $_COOKIE) || !array_key_exists(SESSION_HASH, $_COOKIE))
        return '[checkSession] Invalid session';
    $adminId = $_COOKIE[SESSION_ADMIN];
    $time = $_COOKIE[SESSION_TIME];
    $seed = $_COOKIE[SESSION_SEED];
    $hash = $_COOKIE[SESSION_HASH];    
    if (empty($adminId) || empty($time) || empty($seed) || empty($hash))
        return '[checkSession] Empty session';
    if (time() - $time > SESSION_EXPIRE)
        return '[checkSession] Session expire';
	
	$ip = getRealIp();
	$checkIp = getUserIp($adminId);
    if ($checkIp)
    {
        if ($checkIp != $ip)
            return "[checkSession] Invalid IP $ip";
    }
    else
    {
        $ip = '';
    }	 
    if ($hash != hash(SESSION_HASH_ALGORITHM, SESSION_HASH_KEY.$ip.$adminId.$time.$seed))
        return '[checkSession] Wrong hash';
    
    $keyName = keyGmSession($adminId);	
    $session = getKey(BUCKET_CACHE, $keyName);
    if ($session === false)
        return "[checkSession] Get session fail $keyName";
    if ($session != $hash)
        return '[checkSession] Wrong session';

    $right = getUserRight($adminId);    
    return true;
}

function hasRight ($id)
{
    global $right;
    return in_array($id, $right);
}

function checkRight ($id)
{
    if (!hasRight($id))
        exit("Need right $id");
}

function getMemcached ($bucketId)
{
    global $configBucket, $mapMemcached, $useMemcached;
    if (isset($configBucket[$bucketId]))
    {
        if (!isset($mapMemcached))
            $mapMemcached = array();
        if (!isset($mapMemcached[$bucketId]))
        {
            if ($useMemcached)
                $bucket = new Memcached();
            else
                $bucket = new Memcache();
            $bucket->addServer($configBucket[$bucketId]['ip'], $configBucket[$bucketId]['port']);
            $mapMemcached[$bucketId] = $bucket;
        }
        return $mapMemcached[$bucketId];
    }
    return false;
}

function keyGmSession ($adminId)
{
    return $adminId.'_'.SUFFIX_GM_SESSION;
}

function loadKeyJson ($bucket, $key)
{   
    $raw = getKey($bucket, $key);
    if ($raw === false)
        return false;

    return json_decode($raw);
}

function getKey ($bucket, $key)
{
    global $useMemcached;
    $db = getMemcached($bucket);
    if ($db === false)
        return false;
    return $db->get($key);
}

function setKey ($bucket, $key, $value, $expire=0)
{
    global $useMemcached;
    $db = getMemcached($bucket);
    if ($db === false)
        return false;
    if ($useMemcached)
        return $db->set($key, $value, $expire);
    else 
        return $db->set($key, $value, 0, $expire);
}

function addUser($id, $ip, $right, $pass)
{
    global $mapUser;
    $info = new stdClass();
    $info->ip = $ip;
    $info->pass = $pass;
    $info->right = $right;

    $mapUser[$id] = $info;
}

function hasUser($id)
{
    global $mapUser;
    return array_key_exists($id, $mapUser);
}

function getUserPass($id)
{
    global $mapUser;
    return $mapUser[$id]->pass;
}

function getUserRight($id)
{
    global $mapUser;
    return $mapUser[$id]->right;
}

function getUserIp($id)
{
    global $mapUser;
    return $mapUser[$id]->ip;
}