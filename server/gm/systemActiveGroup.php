<?php
require_once 'page_header.php';
checkRight(RIGHT_SYSTEM);

addHeader(array('System', 'Balance'));
$raw = curl_get("http://$BALANCE_ADDRESS/getJsonStatus?key=kvtm@gsn.2019");

if ($raw) {
    $res = json_decode($raw);       
}

if (isset($res)) {
    $info = $res->info;
    $activeCode = $info->code;
    $activeGameGroup = $info->groups->GAME->active;
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="systemActiveGroup.php" id="fRequest" method="POST" lass="form-horizontal">
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Service</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="service" <?php addPostValue('service');?> value="GAME" class="form-control">
                    </div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Group</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="group" <?php addPostValue('group');?> value="<?php echo $activeGameGroup ?>" class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Active group: <?php echo $activeGameGroup ?></small></div>
                </div>                
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Code</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="code" <?php addPostValue('code');?> value="<?php echo $activeCode ?>" class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Active code: <?php echo $activeCode ?></small></div>
                </div>
                <div class="form-actions form-group">
					<button type="submit" class="btn btn-success btn-sm"><i class="fa fa-dot-circle-o"></i> Submit</button>
                    <button type="reset" id="bReset" class="btn btn-danger btn-sm"><i class="fa fa-ban"></i> Reset</button>
				</div>
            </form>
        </div>
    </div>
</div>

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
                        <th scope="col">run</th>                        
                        <th scope="col">CCU</th>
                        <th scope="col">Conn</th>
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
                                       echo "<td>".$worker->connection."</td>";
                                       echo "<td>".$worker->numException."</td>";                                       
                                       echo "<td>".$worker->cpuProcess."</td>";
                                       echo "<td>".$worker->cpuSystem."</td>";
                                       echo "<td>".sizeToString($worker->memProcess)."</td>";
                                       echo "<td>".sizeToString($worker->memFree)."</td>";                                       
                                       echo "<td>".upTimeToString($worker->upTime)."</td>";
                                       echo "<td>".(isset($worker->builtVersion)?$worker->builtVersion:"")."</td>";
                                       echo "<td>".$worker->minClientCode."</td>";
                                       //echo "<td>".$setClietCode."</td>";
                                       echo "<td>".date('H:i:s j-n-Y',$worker->time/1000)."</td>";                
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

<script>
    jQuery(document).ready(function($){    
        $('#bReset').on('click', function(e){ 
            e.preventDefault();       
            $("#fRequest")[0].reset();
            window.location.href = location.pathname;
        });
    });
</script>

<?php 
if (isset($_POST['group'])) {
	$data = new stdClass();
    $data->group = $_POST['group'];

    if (isset($_POST['service']))
        $data->service = $_POST['service'];
    if (isset($_POST['code']))
        $data->code = $_POST['code'];		

	$result = sendAdminRequest('setActiveGroup', $data, "$BALANCE_ADMIN_HOST:$BALANCE_ADMIN_PORT");
	if (isset($result)) {
?>
	<script>
	let rawData = '<?php echo addslashes($result) ?>';
	let jsonData = JSON.parse(rawData);
	jQuery(document).ready(function($){
		$('#rawData').text(JSON.stringify(jsonData,null,3));
        $('#rawData').scrollView();
	});
	</script>

	<div class="col-md-12">
		<div class="card">
			<div class="card-header">
				<strong class="card-title">Response</strong>
			</div>
			<div class="card-body">
			 	<pre id="rawData"></pre>
			</div>
		</div>
	</div>
<?php 
	} //check request
} //check exist userId
?>

</div><!-- .content -->

<?php
require_once 'page_footer.php';
?>