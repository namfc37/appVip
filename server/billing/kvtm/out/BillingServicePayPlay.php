<?php

require "config_data.php";

global $CONFIG_DATA;
$CONFIG_DATA['GATEWAY'] = "js_PayPlay";
$CONFIG_DATA['IS_DIRECT'] = false;
$CONFIG_DATA['APP_ID'] = $CONFIG_DATA['PAYPLAY_APPID'];
$CONFIG_DATA['IS_MILLI_APP_TIME'] = false;

require "../../all/out/BillingServiceDirectMobile.php";