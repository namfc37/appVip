<?php
require_once 'page_header.php';
checkRight(RIGHT_EDIT_USER);

addHeader(array('User', 'Generate Gift Code'));
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="genGiftCode.php" id="fRequest" method="POST" lass="form-horizontal">
				<div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Group Code</label></div>
                    <div class="col-12 col-md-4"><input type="text" name="group" <?php addPostValue('group');?> placeholder="Group Code" class="form-control"></div>
                </div>                                			
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Num code</label></div>
                    <div class="col-12 col-md-4"><input type="text" name="num" <?php addPostValue('num');?> placeholder="Num code" class="form-control"></div>
                </div>                                  				
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Reason</label></div>
                    <div class="col-12 col-md-4"><input type="text" name="reason" <?php addPostValue('reason');?> placeholder="Reason" class="form-control"></div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field</small></div>
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
if (isset($_POST['group'])) {
	$data = new stdClass();
	$data->group = $_POST['group'];	

    if (isset($_POST['reason']))
        $data->reason = $_POST['reason'];        
    if (isset($_POST['num']))
        $data->num = $_POST['num'];    
	
	$result = sendAdminRequest('genGiftCode', $data);
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