<?php
/**
 * Created by PhpStorm.
 * User: hieupt
 * Date: 11/23/2016
 * Time: 10:49 AM
 */

error_reporting(0);
global $CHECK_SIGN;
$CHECK_SIGN = false;
global $IS_PRODUCTION;
$IS_PRODUCTION = false;

$CONFIG_DATA_GAME = "../../all/config/config_data_binh.php";
require $CONFIG_DATA_GAME;
require "../../all/out/BillingServiceDirectMobile.php";