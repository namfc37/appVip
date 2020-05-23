<?php
function curl_get($url, array $get = NULL, array $options = array())
{
    if ($get)
        $url. (strpos($url, '?') === FALSE ? '?' : ''). http_build_query($get);
    $defaults = array(
        CURLOPT_URL => $url,
        CURLOPT_HEADER => 0,
		CURLOPT_RETURNTRANSFER => TRUE,
		CURLOPT_CONNECTTIMEOUT => 6,
		CURLOPT_TIMEOUT => 30
    );

    $ch = curl_init();
    curl_setopt_array($ch, ($options + $defaults));
    if( ! $result = curl_exec($ch))
    {
        return NULL;
    }
    curl_close($ch);
    return $result;
}

function sendAdminRequest ($cmd, $data, $address = NULL)
{
    global $adminId, $ADMIN_ADDRESS;
    $msg = new stdClass();
    $msg->admin = $adminId;
    $msg->time = millisTime();
    $msg->data = json_encode($data);
    $msg->hash = hash('sha256', ADMIN_HASH_KEY.$msg->admin.$msg->time.$msg->data);

    $str = json_encode($msg);
	
	if (empty($address))
		$address = $ADMIN_ADDRESS;
		
	$url = "http://$address/$cmd";
    $ch = curl_init($url);                                                                      
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
    curl_setopt($ch, CURLOPT_POSTFIELDS, $str);                                                                  
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 6);
	curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
        'Content-Type: application/json',                                                                                
        'Content-Length: ' . strlen($str))                                                                       
    );                                                                                                                   
                                                                                                                        
	$result = curl_exec($ch);
	if ($result === false) 
	{
		addAlertFail("Connect fail: $url");
		return NULL;
	}
	else
	{
		return $result;
	}
}

function addAlertFail ($msg)
{
?>
<div class="col-md-12">
<div class="sufee-alert alert with-close alert-danger alert-dismissible fade show">
    <span class="badge badge-pill badge-danger">FAIL</span>
<?php
echo $msg;
?>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
</div>
<?php
}

function redirect ($url)
{
   header('Location: ' . $url);
   exit();
}

function redirectAfter ($link='index.php', $msg=null, $wait=0)
{	
	if ($wait <= 0)
		echo("<script type='text/javascript'>parent.location.href='" . $link . "'</script>\n");
	else
		echo("<script type='text/javascript'>setTimeout(\"parent.location.href='" . $link . "'\"," . $wait .");</script>\n");
	
	if ($msg)
		echo($msg);
	exit();
}

function redirectLogin ($msg, $wait=1000)
{
	redirectAfter('login.php', $msg, $wait);
}

function redirectIndex ()
{
	redirect('index.php');
}

function timeToDate ($time, $isMillis = false)
{
    if ($isMillis)
        $time /= 1000;
    return date('H:i:s j-n-Y', $time);
}

function timeToTime ($time, $isMillis = false)
{
    if ($isMillis)
        $time /= 1000;
    return date('H:i:s', $time);
}

function millisToDate ($time)
{
    return date('Y-n-j H:i:s.', $time / 1000).substr($time , -3);
}

function millisTime ()
{
    return round(microtime(true) * 1000);
}

function getRealIp()
{
	if(isset($_SERVER['HTTP_X_FORWARDED_FOR'])) { 
		// case 1.A: proxy && HTTP_X_FORWARDED_FOR is defined
		$array = extractIP($_SERVER['HTTP_X_FORWARDED_FOR']);
		if ($array && count($array) >= 1) {
			return $array[0]; // first IP in the list
		}
	}
	if(isset($_SERVER['HTTP_X_FORWARDED'])) { 
		// case 1.B: proxy && HTTP_X_FORWARDED is defined
		$array = extractIP($_SERVER['HTTP_X_FORWARDED']);
		if ($array && count($array) >= 1) {
			return $array[0]; // first IP in the list
		}
	}
	if(isset($_SERVER['HTTP_FORWARDED_FOR'])) { 
		// case 1.C: proxy && HTTP_FORWARDED_FOR is defined
		$array = extractIP($_SERVER['HTTP_FORWARDED_FOR']);
		if ($array && count($array) >= 1) {
			return $array[0]; // first IP in the list
		}
	}
	if(isset($_SERVER['HTTP_FORWARDED'])) { 
		// case 1.D: proxy && HTTP_FORWARDED is defined
		$array = extractIP($_SERVER['HTTP_FORWARDED']);
		if ($array && count($array) >= 1) {
			return $array[0]; // first IP in the list
		}
	}
	if(isset($_SERVER['HTTP_CLIENT_IP'])) { 
		// case 1.E: proxy && HTTP_CLIENT_IP is defined
		$array = extractIP($_SERVER['HTTP_CLIENT_IP']);
		if ($array && count($array) >= 1) {
			return $array[0]; // first IP in the list
		}
	}
	
	if(isset($_SERVER['HTTP_VIA'])) {
		// case 2: 
		// proxy && HTTP_(X_) FORWARDED (_FOR) not defined && HTTP_VIA defined
		// other exotic variables may be defined 
		return ( $_SERVER['HTTP_VIA']. 
			'_' . $_SERVER['HTTP_X_COMING_FROM'].
			'_' . $_SERVER['HTTP_COMING_FROM']
			);
	}
	if(isset($_SERVER['HTTP_X_COMING_FROM']) || isset($_SERVER['HTTP_COMING_FROM']) ) {
		// case 3: proxy && only exotic variables defined
		// the exotic variables are not enough, we add the REMOTE_ADDR of the proxy
		return ( $_SERVER['REMOTE_ADDR'] . 
			'_' . $_SERVER['HTTP_X_COMING_FROM'] .
			'_' . $_SERVER['HTTP_COMING_FROM']
		  );
	}
	// case 4: no proxy (or tricky case: proxy+refresh)
	if(isset($_SERVER['REMOTE_HOST'])) {
		$array = extractIP($_SERVER['REMOTE_HOST']);
		if ($array && count($array) >= 1) {
			return $array[0]; // first IP in the list
		}
	}
	return $_SERVER['REMOTE_ADDR'];
}	

function extractIP($ip) {
	//if (ereg ("^([0-9]{1,3}\.){3,3}[0-9]{1,3}", $ip, $array))
	if (preg_match_all('/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/', $ip, $array))
	{
		if (is_array($array))
			return $array[0];
		else
			return $array;
	}
	else
		return false;
}

function upTimeToString ($upTime)
{
    $d  = floor($upTime / 86400);
    $rD = $upTime - $d * 86400;
    
    $h  = floor($rD / 3600);
    $rH = $rD - $h * 3600;
    
    $m  = floor($rH / 60);
    $s = $rH - $m * 60;
        
    if ($d > 0)
        return $d.'d'.$h.'h'; //$d.'d '.$h.'h'.$m.'m'.$s.'s';
    else if ($h > 0)
        return $h.'h'.$m.'m'; //$h.'h'.$m.'m'.$s.'s';
    else if ($m > 0)
        return $m.'m'.$s.'s';
    else
        return $s.'s';
}

function sizeToString($size) {
    $units = array('','k','M','G','T');
    $precision = array(0, 0, 1, 1, 2);
    $step = 1024;
    $i = 0;
    while (($size / $step) > 0.9) {
        $size = $size / $step;
        $i++;
	}
	$round = round($size, 0);
	if (strlen($round) >= 3)
		return $round.$units[$i];
    return round($size, $precision[$i]).$units[$i];
}

function addGetValue ($id)
{
	if (isset($_GET[$id]))
		echo 'value="'.$_GET[$id].'"';
}

function addPostValue ($id)
{
	if (isset($_POST[$id]))
		echo 'value="'.$_POST[$id].'"';
}

function addChecked ($id)
{
	if (isset($_GET[$id]) && $_GET[$id])
		echo 'checked';
}

function addPostSelected ($id, $value)
{
	if (isset($_POST[$id]) && $_POST[$id] == $value)
		echo 'selected="selected"';
}

function getParam ($id)
{
	if (isset($_GET[$id]))
		echo $_GET[$id];
}

function postParam ($id)
{
	if (isset($_POST[$id]))
		echo $_POST[$id];
}

function isEmptyString($str) 
{
	if(!isset($str))
		return true;
	$str = trim($str);   
	return $str === ''; 
}

function parseItemNum ($data)
{
	$r = new stdClass();
	foreach (preg_split("/[\s,;]+/", $data) as $in)
	{
		if (isEmptyString($in))
			continue;
		if (strpos($in, ':') === false)
			continue;
		$v = explode(':', $in);
		$itemId = $v[0];
		$num = $v[1];
		$r->$itemId = $num;
	}
	return $r;
}

function isPortOpen($ip, $portt) {
    $fp = @fsockopen($ip, $portt, $errno, $errstr, 0.1);
    if (!$fp) {
        return false;
    } else {
        fclose($fp);
        return true;
    }
}