<?php
require_once 'page_header.php';
checkRight(RIGHT_EDIT_USER);

if(isset($_POST['userId'])) {
    $userId = $_POST['userId'];
    addHeader(array('User', 'Send Private', $userId));
} else {	
    addHeader(array('User', 'Send Private'));
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="addPrivateMail.php" id="fRequest" method="POST" lass="form-horizontal">
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">User ID</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="userId" <?php addPostValue('userId');?> placeholder="User ID" class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field<br>User must offline</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Type</label></div>
                    <div class="col-12 col-md-4"><input type="text" name="type" <?php addPostValue('type');?> value="1" class="form-control" readonly></div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Title</label></div>
                    <div class="col-12 col-md-4"><input type="text" name="title" <?php addPostValue('title');?> placeholder="Title" class="form-control"></div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Content</label></div>
                    <div class="col-12 col-md-4"><textarea name="content" rows="6" class="form-control"><?php postParam('content');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field</small></div>
                </div>                
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Items</label></div>
                    <div class="col-12 col-md-4"><textarea name="items" rows="3" class="form-control"><?php postParam('items');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">ItemId1:Num1<br>ItemId2:Num2</small></div>
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
if (isset($userId)) {
	$data = new stdClass();
    $data->userId = $userId;

    if (isset($_POST['reason']))
        $data->reason = $_POST['reason'];
    if (isset($_POST['type']))
        $data->type = $_POST['type'];	
    if (isset($_POST['title']))
        $data->title = $_POST['title'];
    if (isset($_POST['content']))
        $data->content = $_POST['content'];    
    if (isset($_POST['items'])) 
        $data->items = parseItemNum($_POST['items']);
	
	$result = sendAdminRequest('addPrivateMail', $data);
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