<?php
require_once 'page_header.php';
checkRight(RIGHT_SEND_ALL);

if(isset($_POST['info']))
    $info = $_POST['info'];

addHeader(array('User', 'Recall item'));
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="recallItem.php" id="fRequest" method="POST" lass="form-horizontal">               
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Title</label></div>
                    <div class="col-12 col-md-4"><input type="text" name="title" <?php addPostValue('title');?> placeholder="Title" class="form-control"></div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Content</label></div>
                    <div class="col-12 col-md-4"><textarea name="content" rows="4" class="form-control"><?php postParam('content');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field</small></div>
                </div>                
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Info</label></div>
                    <div class="col-12 col-md-4"><textarea name="info" rows="10" class="form-control"><?php postParam('info');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">{<br>"userId1":{"itemId1":num1},<br>"userId2":{"itemId2":num2, "itemId3":num3"}<br>}</small></div>
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
if (isset($info)) {
	$data = new stdClass();
    $data->info = $info;

    if (isset($_POST['reason']))
        $data->reason = $_POST['reason'];    
    if (isset($_POST['title']))
        $data->title = $_POST['title'];
    if (isset($_POST['content']))
        $data->content = $_POST['content'];        
	
	$result = sendAdminRequest('recallItem', $data);
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