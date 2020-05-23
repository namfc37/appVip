<?php
require_once 'config.php';
checkSessionToLogin();

function addHeader($params = array())
{
?>
<!-- Header-->
<header id="header" class="header">

<div class="header-menu">
    <div class="col-sm-12">
        <a id="menuToggle" class="menutoggle pull-left"><i class="fa fa fa-tasks"></i></a>
        <div class="page-header float-left">            
            <div class="page-title">                
                <ol class="breadcrumb text-left">
                    <li class="flag-icon flag-icon-vn"></li>
                    <?php                        
                        $len = count($params);
                        for ($i = 0; $i < $len - 1; $i++)
                            echo '<li>'.$params[$i].'</li>';
                        echo '<li class="active">'.$params[$len - 1].'</li>';
                        
                    ?>
                </ol>
            </div>
        </div>
    </div>   
</div>
</header><!-- /header -->
<!-- Header-->
<?php
}
?>


<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" lang=""> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" lang=""> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="en">
<!--<![endif]-->

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>KVTM</title>
    <meta name="description" content="GM Khu Vườn Trên Mây">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="apple-touch-icon" href="apple-icon.png">
    <link rel="shortcut icon" href="favicon.ico">

    <link rel="stylesheet" href="vendors/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="vendors/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="vendors/themify-icons/css/themify-icons.css">
    <link rel="stylesheet" href="vendors/flag-icon-css/css/flag-icon.min.css">
    <link rel="stylesheet" href="vendors/selectFX/css/cs-skin-elastic.css">    


    <link rel="stylesheet" href="assets/css/style.css">

    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800' rel='stylesheet' type='text/css'>

</head>

<body>
    <script src="vendors/jquery/dist/jquery.min.js"></script>
    <script src="vendors/popper.js/dist/umd/popper.min.js"></script>
    <script src="vendors/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="assets/js/main.js"></script>

    <!-- Left Panel -->
    <aside id="left-panel" class="left-panel">
        <nav class="navbar navbar-expand-sm navbar-default">

            <div class="navbar-header">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-menu" aria-controls="main-menu" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fa fa-bars"></i>
                </button>
                <a class="navbar-brand" href="./">KTVM</a>
                <a class="navbar-brand hidden" href="./">K</a>
            </div>

            <div id="main-menu" class="main-menu collapse navbar-collapse">
                <ul class="nav navbar-nav">
                    <li class="active">
                        <a href="index.php"> <i class="menu-icon fa fa-dashboard"></i>Dashboard </a>
                    </li>

                    <h3 class="menu-title">GAME</h3><!-- /.menu-title -->
                    <li class="menu-item-has-children dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <i class="menu-icon fa fa-user"></i>User</a>
                        <ul class="sub-menu children dropdown-menu">
                            <li><i class="menu-icon fa fa-eye"></i><a href="getUserData.php"> Get Data</a></li>
							<li><i class="menu-icon fa fa-download"></i><a href="downloadUserData.php"> Download</a></li>
                            <?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-edit"></i><a href="setUserGame.php"> Set Game</a></li> <?php } ?>
                            <?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-usd"></i><a href="updateUserCoin.php"> Update Coin</a></li> <?php } ?>
                            <?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-truck"></i><a href="setUserAirship.php"> Set Airship</a></li> <?php } ?>                            
							<?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-barcode"></i><a href="addGiftCode.php"> Add Gift Code</a></li> <?php } ?>
							<?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-credit-card"></i><a href="genGiftCode.php"> Generate Gift Code</a></li> <?php } ?>
							<?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-ban"></i><a href="banUser.php"> Ban User</a></li> <?php } ?>
                            <?php if (hasRight(RIGHT_DELETE_USER)) { ?> <li><i class="menu-icon fa fa-chain-broken"></i><a href="deleteUserGame.php"> Delete User</a></li> <?php } ?>							
                            <?php if (hasRight(RIGHT_SEND_ALL)) { ?> <li><i class="menu-icon fa fa-magnet"></i><a href="recallItem.php"> Recall item</a></li> <?php } ?>                            
                        </ul>
                    </li>                      
                    <li class="menu-item-has-children dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <i class="menu-icon fa fa-envelope"></i>Mail</a>
                        <ul class="sub-menu children dropdown-menu">
							<li><i class="menu-icon fa fa-briefcase"></i><a href="getMailManager.php"> View manager</a></li>
                            <?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-comment-o"></i><a href="addPrivateMail.php"> Send Private</a></li> <?php } ?>
                            <?php if (hasRight(RIGHT_EDIT_USER)) { ?> <li><i class="menu-icon fa fa-fire-extinguisher"></i><a href="addMultiPrivateMail.php"> Send Multi</a></li> <?php } ?>
							<?php if (hasRight(RIGHT_SEND_ALL)) { ?> <li><i class="menu-icon fa fa-bullhorn"></i><a href="addSystemMail.php"> Send All</a></li> <?php } ?>                            
                        </ul>
                    </li>   
                    <li class="menu-item-has-children dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <i class="menu-icon fa fa-sort"></i>Ranking</a>
                        <ul class="sub-menu children dropdown-menu">
							<li><i class="menu-icon fa fa-sort-amount-asc"></i><a href="getTopRanking.php"> View top</a></li>                            
                            <?php if (hasRight(RIGHT_SEND_ALL)) { ?> <li><i class="menu-icon fa fa-gift"></i><a href="addTopReward.php"> Add reward</a></li> <?php } ?>                            
                        </ul>
                    </li>

                    <h3 class="menu-title">SYSTEM</h3><!-- /.menu-title -->
                    <li><a href="getKey.php"><i class="menu-icon fa fa-crop"></i>Get Key</a></li>
					<?php if (hasRight(RIGHT_SYSTEM)) { ?><li><a href="systemActiveGroup.php"><i class="menu-icon fa fa-random"></i>Active Group</a></li> <?php } ?>                            
                    <li><a href="systemStatus.php"><i class="menu-icon fa fa-table"></i>Status</a></li>					
                    
                    <h3 class="menu-title">LOG</h3><!-- /.menu-title -->
                    
                </ul>
            </div><!-- /.navbar-collapse -->

        </nav>
    </aside><!-- /#left-panel -->
    <!-- Left Panel -->    

    <script>   
    jQuery.fn.scrollView = function () {
        return this.each(function () {
            jQuery('html, body').animate({
            scrollTop: jQuery(this).offset().top
            }, 1000);
        });
    }
    </script>

    <!-- Right Panel -->
    <div id="right-panel" class="right-panel">
