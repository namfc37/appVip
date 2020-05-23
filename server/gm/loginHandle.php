<?php
include_once 'config.php';
include_once 'Logger.php';

$isSuccess = false;
$msg = '';
$user = '';

if (array_key_exists('username', $_POST) && array_key_exists('password', $_POST) && array_key_exists('time', $_POST) && array_key_exists('seed', $_POST) && array_key_exists('session', $_POST))
{
    $user = $_POST['username'];
    $password = $_POST['password'];
    $time = $_POST['time'];
    $seed = $_POST['seed'];
    $session = $_POST['session'];


    if (time() - $time > LOGIN_EXPIRE)
        $msg = 'EXPIRED';
    else if (!hasUser($user))
        $msg = 'INVALID USER';
    else if ($session != hash(LOGIN_HASH_ALGORITHM, LOGIN_SESSION_KEY.$time.$seed))
        $msg = 'INVALID SESSION';
    else if ($password != hash(LOGIN_HASH_ALGORITHM, getUserPass($user).$time.$seed.$session))
        $msg = 'WRONG PASSWORD';
    else
    {
        $isSuccess = true;
        $msg = 'SUCCESS';
        setSession($user);
    }
}
else
{
    $msg = 'INVALID PARAMS';
}

if ($isSuccess)
    redirectIndex();
else
    redirectLogin($msg);
