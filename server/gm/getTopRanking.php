<?php
require_once 'page_header.php';

if(isset($_POST['key'])) {
    $key = $_POST['key'];
    addHeader(array('Ranking', 'Get Top', $key));
} else {	
    addHeader(array('Ranking', 'Get Top'));
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="getTopRanking.php" id="fRequest" method="POST" lass="form-horizontal">
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-addon"><i class="fa fa-key"></i></div>
                        <input type="text" name="key" 
						<?php 
							if (isset($key)) 
								echo 'value="'.$key.'" ';							
						?>
						placeholder="Key" 
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
if (isset($key)) {
	$data = new stdClass();
	$data->key = $key;
	
	$result = sendAdminRequest('getTopRanking', $data);
	if (isset($result)) {
?>
	<script>
	let rawData = '<?php echo addslashes($result) ?>';
	let jsonData = JSON.parse(rawData);
	jQuery(document).ready(function($){
		$('#rawData').text(JSON.stringify(jsonData,null,3));
	});
	</script>
	
<?php 
	} //check request
} else {//check exist key
	$data = new stdClass();
	
	$result = sendAdminRequest('getKeyRanking', $data);
	if (isset($result)) {
?>
	<script>
	let rawData = '<?php echo addslashes($result) ?>';
	let jsonData = JSON.parse(rawData);
	jQuery(document).ready(function($){
		$('#rawData').text(JSON.stringify(jsonData,null,3));
	});
	</script>
<?php 
}
}
?>



</div><!-- .content -->


<?php
require_once 'page_footer.php';
?>