<?php
require_once 'page_header.php';

addHeader(array('User', 'View manager'));
?>
<div class="content mt-3">

<?php 
	$data = new stdClass();
	
	$result = sendAdminRequest('getMailManager', $data);
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
?>


</div><!-- .content -->

<?php
require_once 'page_footer.php';
?>