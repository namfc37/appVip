<?php
if(isset($_POST['userId'])) {
    $userId = $_POST['userId'];
	
	require_once 'config.php';
	checkSessionToLogin();
	
	$data = new stdClass();
	$data->userId = $userId;
	$data->useFile = true;
	
	$result = sendAdminRequest('getUserData', $data);
	if (isset($result)) {
		if (strpos($result, '{') !== 0) {
			$filename = $userId.date("_Ymd_His").'.zip';			
			header('Content-Description: File Transfer');
			header('Content-Type: application/octet-stream');
			header('Content-Disposition: attachment; filename="'.$filename.'"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');
			header('Content-Length: ' . strlen($result));
			print $result;
			exit();
		}		
	}	
}

require_once 'page_header.php';

if(isset($_POST['userId'])) {
    $userId = $_POST['userId'];
    addHeader(array('User', 'Download', $userId));
} else {	
    addHeader(array('User', 'Download'));
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="downloadUserData.php" id="fRequest" method="POST" lass="form-horizontal">
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-addon"><i class="fa fa-user"></i></div>
                        <input type="text" name="userId" 
						<?php 
							if (isset($userId)) 
								echo 'value="'.$userId.'" ';							
						?>
						placeholder="User ID" 
						class="form-control">                        
                    </div>
                </div>
                <div class="form-actions form-group">
					<button type="submit" class="btn btn-success btn-sm"><i class="fa fa-dot-circle-o"></i> Download</button>
				</div>
            </form>
        </div>
    </div>
</div>

<?php 
	if (isset($result)) {
?>
	<script>
	let rawData = '<?php echo addslashes($result) ?>';
	let jsonData = JSON.parse(rawData);
	jQuery(document).ready(function($){
		$('#rawData').text(JSON.stringify(jsonData,null,3));
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
?>


</div><!-- .content -->


<?php
require_once 'page_footer.php';
?>