<?php
require_once 'page_header.php';

addHeader(array('System', 'Status'));
$raw = curl_get("http://$BALANCE_ADDRESS/getJsonStatus?key=kvtm@gsn.2019");

if ($raw) {
    $res = json_decode($raw);       
}
?>
<div class="content mt-3">


<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Service</strong>
        </div>
        <div class="card-body">
            <table class="table table-striped">  
                <thead>
                    <tr>                        
                        <th scope="col">IP</th>                        
                        <th scope="col">IP</th>
                        <th scope="col">Service</th>
                        <th scope="col">Group</th>                        
                        <th scope="col">Run</th>                        
                        <th scope="col">CCU</th>
                        <th scope="col">nS</th>
                        <th scope="col">nW</th>
                        <th scope="col">error</th>                        
                        <th scope="col">CPU<br>Process</th>
                        <th scope="col">CPU<br>System</th>
                        <th scope="col">Mem<br>Process</th>
                        <th scope="col">Mem<br>System</th>                        
                        <th scope="col">upTime</th>
                        <th scope="col">revision</th>
                        <th scope="col">min<br>Client</th>                        
                        <th scope="col">time</th>
                    </tr>
                </thead>             
                <tbody>
                    <?php  
                        if (isset($res)) {
                            foreach($res->mapService as $idService => $service) {        
                                foreach($service->mapGroup as $idGroup => $group) {      
                                    //$setClietCode = implode(',', $group->clientCode);
                                    foreach($group->mapWorker as $idWorker => $worker) {                
                                        if (empty($worker->service))
                                            continue;
                                       echo "<tr>";                
                                       echo "<td>".$worker->privateHost."</td>";  
                                       echo "<td>".$worker->publicHost."</td>";
                                       echo "<td>".$worker->service."</td>";                
                                       echo "<td>".$worker->group."</td>";                
                                       echo "<td>".($worker->isRunning ? "✓" : "x")."</td>";                
                                       echo "<td>".$worker->ccu."</td>";
                                       echo "<td>".$worker->conSocket."</td>";
                                       echo "<td>".$worker->conWebSocket."</td>";
                                       echo "<td>".$worker->numException."</td>";                                       
                                       echo "<td>".$worker->cpuProcess."</td>";
                                       echo "<td>".$worker->cpuSystem."</td>";
                                       echo "<td>".sizeToString($worker->memProcess)."</td>";
                                       echo "<td>".sizeToString($worker->memFree)."</td>";                                       
                                       echo "<td>".upTimeToString($worker->upTime)."</td>";
                                       echo "<td>".(isset($worker->builtVersion)?$worker->builtVersion:"")."</td>";
                                       echo "<td>".$worker->minClientCode."</td>";
                                       //echo "<td>".$setClietCode."</td>";
                                       echo "<td>".date('Y.n.j.H.i.s',$worker->time/1000)."</td>";                
                                       echo "</tr>";
                                    }
                                }
                            }
                        }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Couchbase</strong>
        </div>
        <div class="card-body">
            <table class="table table-striped">  
                <thead>
                    <tr>                        
                        <th scope="col">Bucket</th>                        
                        <th scope="col">Type</th>
                        <th scope="col">Item</th>                        
                        <th scope="col">CurSize</th>
                        <th scope="col">MaxSize</th>                     
                        <th scope="col">Hit</th>                        
                        <th scope="col">Get</th>
                        <th scope="col">Set</th>                        
                        <th scope="col">Delete</th>
                        <th scope="col">Incr</th>
                        <th scope="col">Decr</th>
                        <th scope="col">CAS</th>
                    </tr>
                </thead>             
                <tbody>
                    <?php 
                    if (isset($res)) {
                        foreach($res->couchbase as $idBucket => $bucket) {  
                            $hit = $bucket->avgGet + $bucket->avgSet + $bucket->avgDelete + $bucket->avgIncrease + $bucket->avgDecrease + $bucket->avgCas;

                            echo "<tr>";                
                            echo "<td>".$idBucket."</td>";  
                            echo "<td>".($bucket->isCache ? "cached" : "base")."</td>";
                            echo "<td>".sizeToString($bucket->numItem)."</td>";                
                            echo "<td>".sizeToString($bucket->curSize)."</td>";                
                            echo "<td>".sizeToString($bucket->maxSize)."</td>";                                            
                            echo "<td>".$hit."</td>";
                            echo "<td>".$bucket->avgGet."</td>";
                            echo "<td>".$bucket->avgSet."</td>";
                            echo "<td>".$bucket->avgDelete."</td>";
                            echo "<td>".$bucket->avgIncrease."</td>";
                            echo "<td>".$bucket->avgDecrease."</td>";
                            echo "<td>".$bucket->avgCas."</td>";
                            echo "</tr>";
                        }
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Redis</strong>
        </div>
        <div class="card-body">
            <table class="table table-striped">  
                <thead>
                    <tr>                        
                        <th scope="col">Bucket</th>                                                
                        <th scope="col">CurSize</th>                     
                        <th scope="col">Keys</th>                        
                        <th scope="col">Expires</th>                
                        <th scope="col">Hit</th>                        
                        <th scope="col">Miss</th>
                    </tr>
                </thead>             
                <tbody>
                    <?php 
                    if (isset($res)) {
                        foreach($res->redis as $idBucket => $bucket) {
                            echo "<tr>";                
                            echo "<td>".$idBucket."</td>";
                            echo "<td>".sizeToString($bucket->curSize)."</td>";                
                            echo "<td>".sizeToString($bucket->keys)."</td>";                                            
                            echo "<td>".sizeToString($bucket->expires)."</td>";                                                                        
                            echo "<td>".$bucket->avgHits."</td>";
                            echo "<td>".$bucket->avgMisses."</td>";
                            echo "</tr>";
                        }
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Info</strong>
        </div>
        <div class="card-body">
            <table class="table table-striped">  
                <thead>
                    <tr>                        
                        <th scope="col">userRegister</th>                        
                        <th scope="col">userCurrent</th>
						<th scope="col">guildRegister</th>                          
                    </tr>
                </thead>             
                <tbody>
                    <?php
                        if (isset($res)) { 
                            echo "<tr>";                
                            echo "<td>".$res->numRegister."</td>";                          
                            echo "<td>".$res->numUser."</td>";                          
                            echo "<td>".$res->guildNumRegister."</td>";                          
                            echo "</tr>";
                        }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Cache</strong>
        </div>
        <div class="card-body">
            <table class="table table-striped">  
                <thead>
                    <tr>                        
                        <th scope="col">IP</th>                        
                        <th scope="col">IP</th>
                        <th scope="col">Service</th>
                        <th scope="col">Group</th>                        
                        <th scope="col">Active</th>                                                
                        <th scope="col">prShop</th>
                        <th scope="col">airship</th>
                        <th scope="col">friend</th>
                        <th scope="col">guild</th>
                    </tr>
                </thead>             
                <tbody>
                    <?php  
                        if (isset($res)) {
                            foreach($res->mapService as $idService => $service) {        
                                foreach($service->mapGroup as $idGroup => $group) {                        
                                    foreach($group->mapWorker as $idWorker => $worker) {                
                                        if (empty($worker->service))
                                            continue;
                                        if ($worker->privateShop == 0 && $worker->airship == 0 && $worker->friend == 0)
                                            continue;
                                       echo "<tr>";                
                                       echo "<td>".$worker->privateHost."</td>";  
                                       echo "<td>".$worker->publicHost."</td>";
                                       echo "<td>".$worker->service."</td>";                
                                       echo "<td>".$worker->group."</td>";                
                                       echo "<td>".$worker->isRunning."</td>";                
                                       echo "<td>".$worker->privateShop."</td>";
                                       echo "<td>".$worker->airship."</td>";
                                       echo "<td>".$worker->friend."</td>";                                       
                                       echo "<td>".$worker->cacheGuild."</td>";
                                       echo "</tr>";
                                    }
                                }
                            }
                        }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Check Port</strong>
        </div>
        <div class="card-body">
            <table class="table table-striped">  
                <thead>
                    <tr>                        
                        <th scope="col">Type</th>        
                        <th scope="col">IP</th>
                        <th scope="col">Port</th>                        
                        <th scope="col">Status</th>                        
                    </tr>
                </thead>             
                <tbody>
                    <?php          
                    foreach($checkPort as $info)
                        checkPort($info['type'], $info['ip'], $info['port']);

                    foreach($configBucket as $bucket)
                        checkPort('Couchbase', $bucket['ip'], $bucket['port']);                    
                    
                    function checkPort ($type, $ip, $port)
                    {
                        echo "<tr>";                
                        echo "<td>".$type."</td>";  
                        echo "<td>".$ip."</td>";  
                        echo "<td>".$port."</td>";  
                        echo "<td>".(isPortOpen($ip, $port) ? '✓' : 'FAIL')."</td>";  
                        echo "</tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

</div><!-- .content -->

<?php
require_once 'page_footer.php';
?>