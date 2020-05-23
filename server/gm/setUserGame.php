<?php
require_once 'page_header.php';
checkRight(RIGHT_EDIT_USER);

if(isset($_POST['userId'])) {
    $userId = $_POST['userId'];
    addHeader(array('User', 'Set Game', $userId));
} else {	
    addHeader(array('User', 'Set Game'));
}
?>
<div class="content mt-3">

<div class="col-md-12">
    <div class="card">
        <div class="card-header">
            <strong class="card-title">Request</strong>
        </div>
        <div class="card-body">
            <form action="setUserGame.php" id="fRequest" method="POST" lass="form-horizontal">
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">User ID</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="userId" <?php addPostValue('userId');?> placeholder="User ID" class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">Required field<br>User must offline</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Level</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="level" <?php addPostValue('level');?> placeholder="Level" class="form-control">
                    </div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Exp</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="exp" <?php addPostValue('exp');?> placeholder="Exp" class="form-control">
                    </div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label class=" form-control-label">Options</label></div>
                    <div class="col col-md-4">
                        <div class="form-check">
                            <div class="checkbox">
                                <label for="checkbox1" class="form-check-label ">
                                    <input type="checkbox" name="resetDaily" value="true" class="form-check-input" <?php addChecked('resetDaily');?>>Reset Daily
                                </label>
                            </div>                            
                        </div>
						<div class="form-check">
                            <div class="checkbox">
                                <label for="checkbox1" class="form-check-label ">
                                    <input type="checkbox" name="resetOffer" value="true" class="form-check-input" <?php addChecked('resetOffer');?>>Reset Offer
                                </label>
                            </div>                            
                        </div>
                        <div class="form-check">
                            <div class="checkbox">
                                <label for="checkbox1" class="form-check-label ">
                                    <input type="checkbox" name="resetConvertInfo" value="true" class="form-check-input" <?php addChecked('resetConvertInfo');?>>Reset Convert Info
                                </label>
                            </div>                            
                        </div>
                    </div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Add Items</label></div>
                    <div class="col-12 col-md-4"><textarea name="addItems" rows="3" class="form-control"><?php postParam('addItems');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">ItemId1:Num1<br>ItemId2:Num2</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Remove Items</label></div>
                    <div class="col-12 col-md-4"><textarea name="removeItems" rows="3" class="form-control"><?php postParam('removeItems');?></textarea></div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">ItemId1:Num1<br>ItemId2:Num2</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Add Quest</label></div>
                    <div class="col-12 col-md-4"><textarea name="addQuest" rows="3" class="form-control"><?php postParam('addQuest');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">QuestAction,QuestAction,...<br>View more detail in <b>41. Quest Book.xlsx</b> sheet <b>Action</b></small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Remove Quest</label></div>
                    <div class="col-12 col-md-4"><textarea name="removeQuest" rows="3" class="form-control"><?php postParam('removeQuest');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">QuestAction,QuestAction,...<br></small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="textarea-input" class=" form-control-label">Change Quest Process</label></div>
                    <div class="col-12 col-md-4"><textarea name="editQuest" rows="3" class="form-control"><?php postParam('editQuest');?></textarea></div>                    
                    <div class="col-12 col-md-4"><small class="form-text text-muted">QuestAction:Process,QuestAction:Process,...<br></small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Change Mission</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="missionId" <?php addPostValue('missionId');?> placeholder="mission id" class="form-control">
                    </div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Local payment</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="activeLocal" <?php addPostValue('activeLocal');?> class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">0: disable<br>1: enable</small></div>
                </div>
				<div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">Use test payment</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="useTestPayment" <?php addPostValue('useTestPayment');?> class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">0: disable<br>1: enable</small></div>
                </div>
                <div class="row form-group">
                    <div class="col col-md-2"><label for="text-input" class=" form-control-label">VIP</label></div>
                    <div class="col-12 col-md-4">
                        <input type="text" name="vip" <?php addPostValue('vip');?> class="form-control">
                    </div>
                    <div class="col-12 col-md-4"><small class="form-text text-muted">id vip</small></div>
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
    if (isset($_POST['level']))
        $data->level = $_POST['level'];	
    if (isset($_POST['exp']))
        $data->exp = $_POST['exp'];
    if (isset($_POST['resetDaily']))
        $data->resetDaily = $_POST['resetDaily'];
	if (isset($_POST['resetOffer']))
        $data->resetOffer = $_POST['resetOffer'];
    if (isset($_POST['resetConvertInfo']))
        $data->resetConvertInfo = $_POST['resetConvertInfo'];
    if (isset($_POST['addItems'])) 
        $data->addItems = parseItemNum($_POST['addItems']);
    if (isset($_POST['removeItems'])) 
        $data->removeItems = parseItemNum($_POST['removeItems']);
	  
    if (isset($_POST['addQuest']))
        $data->addQuest = $_POST['addQuest'];
    if (isset($_POST['removeQuest']))
        $data->removeQuest = $_POST['removeQuest'];
    if (isset($_POST['editQuest']))
        $data->editQuest = $_POST['editQuest'];
    if (isset($_POST['activeLocal']))
        $data->activeLocal = $_POST['activeLocal'];
	if (isset($_POST['useTestPayment']))
        $data->useTestPayment = $_POST['useTestPayment'];
    if (isset($_POST['vip']))
        $data->vip = $_POST['vip'];
    if (isset($_POST['missionId']))
        $data->missionId = $_POST['missionId'];
	
	$result = sendAdminRequest('setUserGame', $data);
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