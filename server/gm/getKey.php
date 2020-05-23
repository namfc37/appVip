<?php
require_once 'page_header.php';

if(isset($_POST['bucket'])) {
    $bucket = $_POST['bucket'];
    addHeader(array('System', 'Get Key', $bucket));
} else {	
    addHeader(array('System', 'Get Key'));
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="getKey.php" id="fRequest" method="POST" lass="form-horizontal">
            
                <div class="row form-group">    
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Bucket</label></div>
                    <div class="col-12 col-md-4">
                        <select name="bucket" class="form-control">
                        <option value="NotSelect">Please select bucket</option>
                        <option value="index" <?php addPostSelected("bucket", "index"); ?>>Index</option>
                        <option value="redis" <?php addPostSelected("bucket", "redis"); ?>>Redis</option>
                        <option value="cache" <?php addPostSelected("bucket", "cache"); ?>>Cache</option>
                        <option value="user_1" <?php addPostSelected("bucket", "user_1"); ?>>User 1</option>
                        <option value="user_2" <?php addPostSelected("bucket", "user_2"); ?>>User 2</option>
                        </select>
                    </div>
                </div>
                
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Key</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="key" <?php addPostValue('key');?> placeholder="Key Name" class="form-control">
                    </div>
                </div>
                
                <div class="row form-group">    
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">[Redis] Type</label></div>
                        <div class="col-12 col-md-4">
                        <select name="type" class="form-control">
                        <option value="NotSelect">Please select type</option>
                        <option value="get" <?php addPostSelected("type", "get"); ?>>get</option>
                        <option value="hget" <?php addPostSelected("type", "hget"); ?>>hget</option>
                        <option value="hmget" <?php addPostSelected("type", "hmget"); ?>>hmget</option>
                        <option value="hgetAll" <?php addPostSelected("type", "hgetAll"); ?>>hgetAll</option>
                        <option value="zrank" <?php addPostSelected("type", "zrank"); ?>>zrank</option>
                        </select>
                    </div>
                </div>
                
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">[Redis] Member</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="member" <?php addPostValue('member');?> placeholder="Member" class="form-control">
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
if (isset($bucket)) {
	$data = new stdClass();
    $data->bucket = $bucket;

    if (isset($_POST['key']))
        $data->key = $_POST['key'];
    if (isset($_POST['type']))
        $data->type = $_POST['type'];	
    if (isset($_POST['member']))
        $data->member = $_POST['member'];
	
	$result = sendAdminRequest('getKey', $data);
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