<?php

require "config_data.php";

global $CONFIG_DATA;
$CONFIG_DATA['GATEWAY'] = "js_Direct";
$CONFIG_DATA['IS_DIRECT'] = true;
$CONFIG_DATA['APP_ID'] = $CONFIG_DATA['DIRECT_APPID'];

require "../../all/out/BillingServiceDirectMobile.php";