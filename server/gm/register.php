<?php
require_once 'config.php';
checkSessionToIndex();
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
    <title>GM</title>
    <meta name="description" content="Request account">
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

<body class="bg-dark">
    <div class="sufee-login d-flex align-content-center flex-wrap">
        <div class="container">
            <div class="login-content">
                <div class="login-logo">
                    <h2 style="color:white;">Khu Vườn Trên Mây</h2>
                </div>
                <div class="login-form">
                    <form method="POST" action="registerHandle.php">
                        <div class="form-group">
                            <label>User Name</label>
                            <input type="username" id="username" name="username" class="form-control" placeholder="User Name" onkeyup="checkParams()">
                        </div>                            
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="password" name="password" class="form-control" placeholder="Password" onkeyup="checkParams()">
                        </div>
                        <div class="form-group">
                            <input type="password" id="confirm" class="form-control" placeholder="Confirm password" onkeyup="checkParams()">
                        </div>                                     

                        <button type="submit" id="bRequest" disabled class="btn btn-secondary btn-flat m-b-30 m-t-30" onclick="modifyParams()">Request account</button>                                    
                        <div class="register-link m-t-15 text-center">
                            <p>Already have account ? <a href="login.php"> Sign in</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="vendors/jquery/dist/jquery.min.js"></script>
    <script src="vendors/popper.js/dist/umd/popper.min.js"></script>
    <script src="vendors/bootstrap/dist/js/bootstrap.min.js"></script>   
    <script src="vendors/crypto-js/sha256.js"></script> 

    <script>
        function checkParams () {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            let confirm = document.getElementById("confirm").value;

            let validUsername = username.length >= <?php echo USERNAME_LENGTH ?>;
            let validPassword = password.length >= <?php echo PASSWORD_LENGTH ?>;
            let validConfirm = confirm.length > 0 && password == confirm;

            if (validUsername) {
                $('#username').removeClass('is-invalid').addClass('is-valid');;
            } else {
                $('#username').removeClass('is-valid').addClass('is-invalid');;
            }

            if (validPassword) {
                $('#password').removeClass('is-invalid').addClass('is-valid');;
            } else {
                $('#password').removeClass('is-valid').addClass('is-invalid');;
            }

            if (validConfirm) {
                $('#confirm').removeClass('is-invalid').addClass('is-valid');;
            } else {
                $('#confirm').removeClass('is-valid').addClass('is-invalid');;
            }

            if (validUsername && validPassword && validConfirm) {
                $('#bRequest').prop('disabled', false).removeClass('btn-secondary').addClass('btn-success');;
            } else {
                $('#bRequest').prop('disabled', true).removeClass('btn-success').addClass('btn-secondary');;
            }
        }

        function modifyParams () {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            document.getElementById("password").value = CryptoJS.SHA256("<?php echo LOGIN_PASSWORD_KEY;?>" + username + password);                
        }
    </script>

</body>

</html>
