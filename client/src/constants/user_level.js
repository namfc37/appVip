var jsonConstPath = "res";
var json_user_level = {};
cc.loader.loadJson(jsonConstPath + "/user_level.json", function(error, data) {
   json_user_level = data;
});
json_user_level.LEVEL = json_user_level["LEVEL"];
json_user_level.EXP = json_user_level["EXP"];
json_user_level.SEED_UNLOCK = json_user_level["SEED_UNLOCK"];
json_user_level.POT_UNLOCK = json_user_level["POT_UNLOCK"];
json_user_level.PROD_UNLOCK = json_user_level["PROD_UNLOCK"];
json_user_level.FLOOR_UNLOCK = json_user_level["FLOOR_UNLOCK"];
json_user_level.MACHINE_UNLOCK = json_user_level["MACHINE_UNLOCK"];
json_user_level.REWARD_ITEM_NAME = json_user_level["REWARD_ITEM_NAME"];
json_user_level.REWARD_ITEM_NUM = json_user_level["REWARD_ITEM_NUM"];
json_user_level.GOLD_PER_DIAMOND = json_user_level["GOLD_PER_DIAMOND"];
json_user_level.ORDER_SLOT_UNLOCK = json_user_level["ORDER_SLOT_UNLOCK"];
json_user_level.DO_FREE_UNLOCK = json_user_level["DO_FREE_UNLOCK"];
json_user_level.DO_PAID_UNLOCK = json_user_level["DO_PAID_UNLOCK"];
json_user_level.NEW_ORDER_WAIT_TIME = json_user_level["NEW_ORDER_WAIT_TIME"];
json_user_level.MAX_AIRSHIP_PER_DAY = json_user_level["MAX_AIRSHIP_PER_DAY"];
json_user_level.AIRSHIP_REWARD_NAME = json_user_level["AIRSHIP_REWARD_NAME"];
json_user_level.AIRSHIP_REWARD_NUM = json_user_level["AIRSHIP_REWARD_NUM"];
json_user_level.FRIEND_REPU_DAILY_LIMIT = json_user_level["FRIEND_REPU_DAILY_LIMIT"];
