<?php
/**
 * Created by JetBrains PhpStorm.
 * Date: 8/6/14
 * Time: 11:47 AM
 * To change this template use File | Settings | File Templates.
 */
const CashType_SandBox = 'ZSandBox';
const CashType_Promo = 'Promo';
const CashType_ZSms = 'ZSms';
const CashType_ZSms_Vina = 'ZSmsVina';
const CashType_ZSms_Mobi = 'ZSmsMobi';
const CashType_ZSms_Viettel = 'ZSmsVTT';
const CashType_ZMobiCard = 'ZMobiCard';
const CashType_ZVinaCard = 'ZVinaCard';
const CashType_ZVTTCard = 'ZVTTCard';
const CashType_ZZingCard = 'ZZingCard';
const CashType_ZAtm = 'ZAtm';
const CashType_ZZingXu = 'ZZingXu';
const CashType_ZZingCredit = 'ZZingCredit';
const CashType_GoogleWallet = 'ZGGWallet';
const CashType_Other = 'Other';

const CashType_Atm = 'Atm';
const CashType_ZingCard = 'ZingCardWv';
const CashType_ZaloPay = 'ZaloPay';
const CashType_ZaloPay_G = 'VietCardWv';

const CHANNEL_SANDBOX = 0;
const CHANNEL_ZING_CARD = 100;
const CHANNEL_ZINGWALLET = 101;

const CHANNEL_VINA = 121;
const CHANNEL_MOBI = 122;
const CHANNEL_VIETTEL = 123;

const CHANNEL_DIRECTCHARGING_VINA = 141;
const CHANNEL_DIRECTCHARGING_MOBI = 142;
const CHANNEL_DIRECTCHARGING_VIETTEL = 143;

const CHANNEL_SMS = 160;
const CHANNEL_SMS_VINA = 161;
const CHANNEL_SMS_MOBI = 162;
const CHANNEL_SMS_VIETTEL = 163;

const CHANNEL_ATM = 180;
const CHANNEL_ATM_WALLET = 181;
const CHANNEL_CREDITS_CARD = 191;
const CHANNEL_REDEEMCODE = 200;
const CHANNEL_GOOGLE_WALLET = 220;
const CHANNEL_APPLE = 221;

const CHANNEL_ZALOPAY = 230;
const CHANNEL_ZALOPAY_WALLET = 231;

const ACTIONID_SANDBOX = 'sandbox';
const ACTIONID_VIETTEL = 'card_viettel';
const ACTIONID_MOBI = 'card_mobi';
const ACTIONID_VINA = 'card_vina';
const ACTIONID_ZINGCARD = 'card_zing';
const ACTIONID_ATM = 'atm';
const ACTIONID_SMS = 'sms';

$CHANNEL_CODE = array(
    '0' => 'SandBox',
    '181' => 'ZaloATM',
    '121' => 'ZaloVina',
    '122' => 'ZaloMobi',
    '123' => 'ZaloViettel',
    '100' => 'ZaloZingCard'
);

define("ZERROR_SUCCESS", 1);
define("ZERROR_ACC_NOT_EXIST", -1000);
define("ZERROR_AUTH_FAILED", -1002);
define("ZERROR_TRANX_USED", -1003);
define("ZERROR_PARAMS_ERROR", -1004);
define("ZERROR_MONEY_NEGATIVE", -1005);
define("ZERROR_DUPLICATE_TRANS", -1006);
define("ZERROR_DB_EXCEPTION", -1007);
define("ZERROR_PURCHASE_INVALID", -1008);
define("ZERROR_CODE_NOT_PROCESS", -1009);
define("ZERROR_TRANX_EXPIRED", -1010);

$ERROR_CODE_DESC = array
(
    ZERROR_SUCCESS => "Success",
    ZERROR_ACC_NOT_EXIST => "acc not exist",
    ZERROR_AUTH_FAILED => "Authentication failed",
    ZERROR_TRANX_USED => "Transaction was used",
    ZERROR_PARAMS_ERROR => "Tham số không hợp lệ (%s).",
    ZERROR_MONEY_NEGATIVE => "Không được phép nạp số G âm (%s).",
    ZERROR_DUPLICATE_TRANS => "Trùng giao dịch nạp G (%s).",
    ZERROR_DB_EXCEPTION => "Giao dịch nạp G đang chờ xử lý (%s).",
    ZERROR_PURCHASE_INVALID => "Thanh Toan khong hop le",
    ZERROR_CODE_NOT_PROCESS => "Code chua xu ly het ",
    ZERROR_TRANX_EXPIRED => "Transaction Expired"
);
