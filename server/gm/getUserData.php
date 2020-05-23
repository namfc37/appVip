<?php
require_once 'page_header.php';

if(isset($_POST['userId'])) {
    $userId = $_POST['userId'];
    addHeader(array('User', 'Get Data', $userId));
} else {	
    addHeader(array('User', 'Get Data'));
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="getUserData.php" id="fRequest" method="POST" lass="form-horizontal">
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
					<button type="submit" class="btn btn-success btn-sm"><i class="fa fa-dot-circle-o"></i> Submit</button>
					<button type="reset" id="bReset" class="btn btn-danger btn-sm"><i class="fa fa-ban"></i> Reset</button>
				</div>
            </form>
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
if (isset($userId)) {
	$data = new stdClass();
	$data->userId = $userId;
	$data->useFile = false;
	
	$result = sendAdminRequest('getUserData', $data);
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
} //check exist userId
?>


</div><!-- .content -->


<?php
require_once 'page_footer.php';
?>