<?php
require_once 'config.php';

$raw = curl_get("http://$BALANCE_ADDRESS/getJsonStatus?key=kvtm@gsn.2019");

$res = new stdClass();

if ($raw) {
    $res->error = 0;
    $res->data = array();

    $obj = json_decode($raw);    
    foreach($obj->mapService as $idService => $service) {        
        foreach($service->mapGroup as $idGroup => $group) {                        
            foreach($group->mapWorker as $idWorker => $worker) {                
                if (empty($worker->service) || $worker->service != 'GAME')
                    continue;
                $ip = $worker->privateHost;
                if (array_key_exists($ip, $res->data))
                    $res->data[$ip] += $worker->ccu;
                else
                    $res->data[$ip] = $worker->ccu;
            }
        }
    }
} else {
    $res->error = -1;
    $res->message = "Connect fail";
}
echo json_encode($res);
?>
