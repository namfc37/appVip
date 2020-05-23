
const TUTO_SAVE_LOCAL = false;
const TUTO_VERSION = 2;
const TUTO_FLOW_OLD = 1;
const TUTO_FLOW_NEW = 2;

const TUTO_STEP_NONE = -1;
const TUTO_STEP_00_HELLO_JACK = 0;
const TUTO_STEP_01_HELLO_RED = 100;
const TUTO_STEP_02_SCROLL_DOWN = 200;
const TUTO_STEP_03_JACK = 300;
const TUTO_STEP_04_HARVEST_HINT = 400;
const TUTO_STEP_05_HARVEST = 500;
const TUTO_STEP_05B_HARVEST2 = 501;
const TUTO_STEP_06_RED = 600;
//const TUTO_STEP_07_PLANT_HINT = 700;
const TUTO_STEP_08_PLANT = 800;
const TUTO_STEP_08B_PLANT2 = 801;
const TUTO_STEP_08C_PLANT3 = 802;
const TUTO_STEP_09_RED = 900;
const TUTO_STEP_10_BUG_HINT = 1000;
const TUTO_STEP_11_BUG = 1100;
const TUTO_STEP_11B_BUG2 = 1101;
const TUTO_STEP_12_RED = 1200;
const TUTO_STEP_13_JACK = 1300;
const TUTO_STEP_13B_UNLOCK_MACHINE = 1301;
const TUTO_STEP_13C_TOUCH_MACHINE = 1302;
const TUTO_STEP_14_SKIP_TIME_MACHINE = 1400;
const TUTO_STEP_14B_TOUCH_MACHINE = 1401;
const TUTO_STEP_15_JACK = 1500;
//const TUTO_STEP_16_HINT_PRODUCE = 1600;
const TUTO_STEP_16B_TOUCH_MACHINE = 1601;
const TUTO_STEP_17_PRODUCE = 1700;
const TUTO_STEP_18_SKIP_TIME_PRODUCE = 1800;
const TUTO_STEP_19_COLLECT = 1900;
const TUTO_STEP_20_RED = 2000;
const TUTO_STEP_21_OWL = 2100;
const TUTO_STEP_22_LETTER = 2200;
const TUTO_STEP_23_ORDER_HINT = 2300;
const TUTO_STEP_24_ORDER = 2400;
const TUTO_STEP_25_RED = 2500;
const TUTO_STEP_25B_OWL_APPEAR = 2501;
// new tutor
//const TUTO_STEP_26_FROG = 2600;
//const TUTO_STEP_26B_RECEIVE_REWARDS = 2601; // jira#5643
const TUTO_STEP_27_JACK = 2700;
const TUTO_STEP_27B_TOUCH_CLOUD = 2701;
const TUTO_STEP_27C_UNLOCK_CLOUD = 2702;
// new tutor
/*const TUTO_STEP_28_RED = 2800;
const TUTO_STEP_28B_TOUCH_SLOT = 2801;
const TUTO_STEP_28C_TOUCH_PLUS_BUTTON = 2802;
const TUTO_STEP_28D_BUY_POT = 2803;*/
//const TUTO_STEP_29_HINT_PUT_POT = 2900;
const TUTO_STEP_29B_TOUCH_SLOT = 2901;
const TUTO_STEP_29C_PUT_POT = 2902;
// new tutor
/*const TUTO_STEP_30_RED = 3000;
const TUTO_STEP_31_STORE_POT_HINT = 3100;*/
const TUTO_STEP_32_RED = 3200;
const TUTO_STEP_33_UPGRADE_HINT = 3300;
// new tutor
/*const TUTO_STEP_33B_TOUCH_POT = 3301;
const TUTO_STEP_33C_TOUCH_UPGRADE_BUTTON = 3302;
const TUTO_STEP_33D_UPGRADE = 3303;*/
//const TUTO_STEP_34_JACK = 3400;
//const TUTO_STEP_35_FULL_HINT = 3500;
//const TUTO_STEP_35N3_DECOR_HINT = 3527;// new tutor
const TUTO_STEP_35N4_QUEST_BOOK = 3528;
const TUTO_STEP_35N5_GANDALF = 3529;
// new tutor
//const TUTO_STEP_36_JACK = 3600;
//const TUTO_STEP_37_PS_SHOW = 3700;
const TUTO_STEP_38_PS_HINT = 3800;
// new tutor
//const TUTO_STEP_39_JACK = 3900;
//const TUTO_STEP_39B_TOUCH_NEWSBOARD = 3901;
const TUTO_STEP_39C_NEWSBOARD_HINT = 3902;
const TUTO_STEP_43_UNLOCK_AIRSHIP = 4300;
const TUTO_STEP_44_UNLOCK_TOM = 4400;
const TUTO_STEP_45_UNLOCK_WHEEL = 4500;
const TUTO_STEP_46_UNLOCK_CHEST = 4600;
const TUTO_STEP_47_UNLOCK_MINE = 4700;
const TUTO_STEP_48_UNLOCK_SMITH = 4800;
const TUTO_STEP_49_UNLOCK_DICE = 4900;
const TUTO_STEP_51_SKIN_HINT = 5100;
const TUTO_STEP_51B_TOUCH_CLOUD = 5101;
const TUTO_STEP_52_GACHA = 5200;
const TUTO_STEP_52B_GACHA_TOUCH = 5201;
const TUTO_STEP_53_QUEST_MISSION = 5300;
const TUTO_STEP_53B_QUEST_MISSION = 5301;
const TUTO_STEP_54_RED_DECOR = 5400;
const TUTO_STEP_54B_TOUCH_DECOR = 5401;
const TUTO_STEP_55_UNLOCK_TRUCK = 5402;
const TUTO_STEP_55_GUILD = 5500;
const TUTO_STEP_55B_GUILD_FRIENDLIST = 5501;
const TUTO_STEP_55C_GUILD_INVITE = 5502;


const TUTO_STEP_56_FISHING_INTRODUCE_1 = 5600;
const TUTO_STEP_56_FISHING_INTRODUCE_2 = 5601;
const TUTO_STEP_56_FISHING_SELECT_HOOK = 5602;
const TUTO_STEP_56_FISHING_DROP_HOOK = 5603;
const TUTO_STEP_56_FISHING_INTRODUCE_3 = 5604;
const TUTO_STEP_56_FISHING_CLICK_1 = 5605;
const TUTO_STEP_56_FISHING_INTRODUCE_4 = 5606;
const TUTO_STEP_56_FISHING_CLICK_2 = 5607;
const TUTO_STEP_56_FISHING_POPUP_RESULT = 5608;
const TUTO_STEP_56_FISHING_INTRODUCE_5 = 5609;


////////// ----------- NEW TUTO --- FLOW2 ----------------///////////
// ----------1-----
const TUTO2_STEP_1_JACK = 10100;
const TUTO2_STEP_2A_RED = 10200;
const TUTO2_STEP_2B_RED = 10201;
const TUTO2_STEP_2C_RED = 10202;
const TUTO2_STEP_3_SCROLL_DOWN = 10300;
// ----------2-----
const TUTO2_STEP_4_HARVEST = 10400;
const TUTO2_STEP_4_HARVEST2 = 10401;
// -----------3----
const TUTO2_STEP_5_PLANT = 10500;
const TUTO2_STEP_5_PLANT2 = 10502;
// -----------4----
const TUTO2_STEP_6_BUG = 10600;
const TUTO2_STEP_6_BUG2 = 10601;
const TUTO2_STEP_6_BUG3 = 10602;
const TUTO2_STEP_6_BUG4 = 10603;
// -----------5----
const TUTO2_STEP_7 = 10700;
const TUTO2_STEP_7_POT = 10701;
const TUTO2_STEP_7_POT2 = 10702;
const TUTO2_STEP_7_POT3 = 10703;
const TUTO2_STEP_7_POT4 = 10704;
// -----------6----
const TUTO2_STEP_8_MACHINE = 10800;
const TUTO2_STEP_8_MACHINE2 = 10801;
const TUTO2_STEP_8_MACHINE3 = 10802;
const TUTO2_STEP_8_MACHINE4 = 10803;
const TUTO2_STEP_8_MACHINE5 = 10804;
const TUTO2_STEP_8_MACHINE6 = 10805;
// -----------7----
const TUTO2_STEP_9_PRODUCT = 10900;
const TUTO2_STEP_9_PRODUCT2 = 10901;
const TUTO2_STEP_9_PRODUCT3 = 10902;
const TUTO2_STEP_9_PRODUCT4 = 10903;
// ------------8----
const TUTO2_STEP_10_LETTER = 11000;
const TUTO2_STEP_10_LETTER2 = 11001;
const TUTO2_STEP_10_LETTER3 = 11002;
const TUTO2_STEP_10_LETTER4 = 11003;
const TUTO2_STEP_10_LETTER5 = 11004;
const TUTO2_STEP_10_LETTER6 = 11005;
const TUTO2_STEP_10_LETTER7 = 11006;
// ------------9----
const TUTO2_STEP_11_QUEST_MISSION = 11100;
const TUTO2_STEP_11_QUEST_MISSION2 = 11101;
// ------------10----
const TUTO2_STEP_12_OPEN_CLOUD = 11200;
const TUTO2_STEP_12_OPEN_CLOUD2 = 11201;
const TUTO2_STEP_12_OPEN_CLOUD3 = 11202;
// ------------11----
const TUTO2_STEP_13_DROP_POT = 11300;
const TUTO2_STEP_13_DROP_POT2 = 11301;
// ------------12----
const TUTO2_STEP_14_DECOR = 11400;
const TUTO2_STEP_14_DECOR2 = 11401;
// ------------13----
const TUTO2_STEP_15_PRIVATE_SHOP = 11500;


const TUTO_STEP_FINISH = 9999999;
var TUTO_LAST_MAIN_STEP = TUTO_STEP_33_UPGRADE_HINT; // last step of main tutorial, by finishing this step user is considered finished tutorial

const TUTO_TYPE_NONE = 0;
const TUTO_TYPE_DIALOG = 1;
const TUTO_TYPE_HINT = 2;
const TUTO_TYPE_BUBBLE = 3;
const TUTO_TYPE_CUSTOM = 4;
const TUTO_TYPE_NEWTUTO = 5;

const EVT_START_GAME = 0;
const EVT_SCROLL_TO_FLOOR = 1;
const EVT_TOUCH_END = 2;
const EVT_FINISH_TUTO_STEP = 3;
const EVT_HARVEST = 4;
const EVT_CATCH_BUG = 5;
const EVT_BUG_APPEAR = 6;
const EVT_BUG_DISAPPEAR = 7;
const EVT_SHOW_WIDGET = 8;
const EVT_HIDE_WIDGET = 9;
const EVT_REFRESH_MACHINE = 10;
const EVT_COLLECT_PRODUCT = 11;
const EVT_OWL_STATE = 12;
const EVT_PUT_POT = 13;
const EVT_UNLOCK_FEATURE = 14;
const EVT_PLANT = 15;
const EVT_REFRESH_LISTHOOK = 16;
const EVT_CLICK_BTN_FISHING = 17;
const EVT_CLICK_BTN_FISHING2 = 18;
//const EVT_GACHA_SHIP_ARRIVED = 16; not used

const DARKBG_NONE = 1;
const DARKBG_NORMAL = 2;
const DARKBG_LINES = 3;
const DARKBG_FOCUS = 4;

var TUTO_STEPS = null;
const TUTO_STEPS_FLOW_1 =
[
	{
		id:TUTO_STEP_00_HELLO_JACK,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_04.png",
		text:"TXT_TUTO_00",
		startCondition:"event === EVT_START_GAME && Tutorial.savedData.finishedStepIds.length <= 0",
		endCondition:"event === EVT_TOUCH_END"
	},
	{
		id:TUTO_STEP_01_HELLO_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_01.png",
		text:"TXT_TUTO_01",
		rightAvatar: true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_00_HELLO_JACK",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_02_SCROLL_DOWN,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_scroll",
		bottomText:"TXT_TUTO_02",
		blockTouch:false,
		acceptScrolling:true,
		acceptInput:[],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_01_HELLO_RED",
		endCondition:"event === EVT_SCROLL_TO_FLOOR && param0 === 0"
	},
	{
		id:TUTO_STEP_03_JACK,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_02.png",
		text:"TXT_TUTO_03",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_02_SCROLL_DOWN",
		endCondition:"event === EVT_TOUCH_END"
	},
	{
		id:TUTO_STEP_04_HARVEST_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_harvest",
		topText:"TXT_TUTO_04",
		skipButton:true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_03_JACK",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		hideProgress:true,
	},
	{
		id:TUTO_STEP_05_HARVEST,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_05",
		blockTouch:false,
		acceptInput:["firstSlotWithPlant"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_04_HARVEST_HINT",
		//endCondition:"event === EVT_TOUCH_END && (param0 === \"pot\" || param0 === \"plant\") && param1 === 0 && param2 === 0"
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_PLANT_MENU"
	},
	{
		id:TUTO_STEP_05B_HARVEST2,
		type:TUTO_TYPE_CUSTOM,
		blockTouch:false,
		acceptInput:["UIItem"],
		darkBg:DARKBG_NONE,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_05_HARVEST",
		endCondition:"event === EVT_HARVEST && CloudFloors.getEmptyPotsCountOnFloor(0) >= 6",
		revertCondition:"event === EVT_HARVEST && CloudFloors.getEmptyPotsCountOnFloor(0) < 6",
		revertSteps:[TUTO_STEP_05_HARVEST],
		saveOnFinish:true
	},
	{
		id:TUTO_STEP_06_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_02.png",
		text:"TXT_TUTO_06",
		rightAvatar: true,
		//startCondition:"event === EVT_HARVEST && CloudFloors.getEmptyPotsCountOnFloor(0) >= 6 && Tutorial.isStepFinished(TUTO_STEP_05B_HARVEST2)",
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_05B_HARVEST2",
		endCondition:"event === EVT_TOUCH_END",
	},
	/*{
		id:TUTO_STEP_07_PLANT_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_planting",
		topText:"TXT_TUTO_07",
		skipButton:true,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_06_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\""
	},*/
	{
		id:TUTO_STEP_08_PLANT,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_03.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO_08",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["firstEmptyPot"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_06_RED",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_07_PLANT_HINT",
		//endCondition:"event === EVT_TOUCH_END && (param0 === \"pot\" || param0 === \"plant\") && param1 === 0 && param2 === 0",
		//saveOnFinish:true,
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU",
		//skipCondition:"event === EVT_BUG_APPEAR || event === EVT_BUG_DISAPPEAR",
		//skipSteps:[TUTO_STEP_08_PLANT, TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
	},
	{
		id:TUTO_STEP_08B_PLANT2,
		type:TUTO_TYPE_CUSTOM,
		acceptInput:["UIItem"],
		darkBg:DARKBG_NONE,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_08_PLANT",
		endCondition:"event === EVT_PLANT && CloudFloors.getEmptyPotsCountOnFloor(0) <= 0",
		revertCondition:"event === EVT_PLANT && CloudFloors.getEmptyPotsCountOnFloor(0) > 0",
		revertSteps:[TUTO_STEP_08_PLANT],
		//skipCondition:"event === EVT_BUG_APPEAR",
		//skipSteps:[TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_08C_PLANT3,
		type:TUTO_TYPE_CUSTOM,
		acceptInput:[],
		darkBg:DARKBG_NONE,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_08B_PLANT2",
		endCondition:"event === EVT_BUG_APPEAR",// jira#5433 endCondition:"event === EVT_BUG_APPEAR || event === EVT_BUG_DISAPPEAR",
		skipCondition:"CloudFloors.getBugsCountOnFloor(0) > 0 && Tutorial.isStepFinished(TUTO_STEP_08B_PLANT2)",
		skipSteps:[TUTO_STEP_08C_PLANT3],
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_09_RED,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_04.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO_09",
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		delay:1,
		//startCondition:"event === EVT_BUG_APPEAR && Tutorial.isStepFinished(TUTO_STEP_08C_PLANT3)",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_08C_PLANT3",
		endCondition:"event === EVT_TOUCH_END",
		//skipCondition:"CloudFloors.getBugsCountOnFloor(0) <= 0 && Tutorial.isStepFinished(TUTO_STEP_08C_PLANT3)",
		//skipSteps:[TUTO_STEP_09_RED, TUTO_STEP_10_BUG_HINT, TUTO_STEP_11_BUG, TUTO_STEP_11B_BUG2, TUTO_STEP_12_RED],
	},	
	{
		id:TUTO_STEP_10_BUG_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_catch_bug",
		topText:"TXT_TUTO_10",
		skipButton:true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_09_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		hideProgress:true,
	},
	{
		id:TUTO_STEP_11_BUG,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_04.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO_11",
		blockTouch:false,
		acceptInput:["firstSlotWithBug"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_10_BUG_HINT",
		//endCondition:"event === EVT_TOUCH_END && (param0 === \"pot\" || param0 === \"plant\") && param1 === this.bugFloorIdx && param2 === this.bugSlotIdx",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_PLANT_MENU",
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_10_BUG_HINT)",
		//skipSteps:[TUTO_STEP_11_BUG, TUTO_STEP_11B_BUG2, TUTO_STEP_12_RED],
	},
	{
		id:TUTO_STEP_11B_BUG2,
		type:TUTO_TYPE_CUSTOM,
		acceptInput:["UIItem"],
		darkBg:DARKBG_NONE,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_11_BUG",
		endCondition:"event === EVT_CATCH_BUG && CloudFloors.getBugsCountOnFloor(0) <= 0",
		revertCondition:"event === EVT_HIDE_WIDGET && param0 === UI_PLANT_MENU && CloudFloors.getBugsCountOnFloor(0) > 0",
		revertSteps:[TUTO_STEP_11_BUG],
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		//skipSteps:[TUTO_STEP_11B_BUG2, TUTO_STEP_12_RED],
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_12_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_04.png",
		text:"TXT_TUTO_12",
		rightAvatar: true,
		//startCondition:"event === EVT_CATCH_BUG && CloudFloors.getBugsCountOnFloor(0) <= 0 && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP_NEW",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_11B_BUG2",
		endCondition:"event === EVT_TOUCH_END",
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		//skipSteps:[TUTO_STEP_12_RED],
		saveOnFinish:true
	},
	{
		id:TUTO_STEP_13_JACK,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_13",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["machine0", "btnReceive"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		delay:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_12_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0"
	},
	{
		id:TUTO_STEP_13B_UNLOCK_MACHINE,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["buttonUnlock"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_MACHINE_UNLOCK && Tutorial.isStepFinished(TUTO_STEP_13_JACK)",
		endCondition:"event === EVT_HIDE_WIDGET && param0 === UI_MACHINE_UNLOCK",
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO_STEP_13C_TOUCH_MACHINE,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["machine0"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_13B_UNLOCK_MACHINE",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0",
		// jira#5791
		skipCondition:"event === EVT_START_GAME && gv.userMachine.getMachineByFloor(0).state === MACHINE_STATE_GROWING_FULL",
		skipSteps:[TUTO_STEP_13C_TOUCH_MACHINE, TUTO_STEP_14_SKIP_TIME_MACHINE],
	},
	{
		id:TUTO_STEP_14_SKIP_TIME_MACHINE,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_14",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["btnSkipCoin"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_SKIP_TIME && Tutorial.isStepFinished(TUTO_STEP_13C_TOUCH_MACHINE)",
		endCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_GROWING_FULL",
		skipCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_GROWING_FULL",
		saveOnFinish:true,
		// jira#5791
		//skipSteps:[TUTO_STEP_14_SKIP_TIME_MACHINE, TUTO_STEP_14B_TOUCH_MACHINE, TUTO_STEP_15_JACK],
		skipSteps:[TUTO_STEP_14_SKIP_TIME_MACHINE],
	},
	{
		id:TUTO_STEP_14B_TOUCH_MACHINE,
		type:TUTO_TYPE_NONE,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_14_SKIP_TIME_MACHINE",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0",
		// new tutor
		//blockTouch:false,
		//darkBg:DARKBG_FOCUS,
		//acceptInput:["machine0"],
		blockTouch:true,
		darkBg:DARKBG_NONE,
		acceptInput:[],
		startAction:function() {cc.director.getScheduler().scheduleCallbackForTarget(this, function() {gv.userMachine.getMachineByFloor(0).onTouchEnded(null, null, true);}, 1, 0, 0, false);},
		// fix: stuck if quit game at TUTO_STEP_15_JACK
		saveOnFinish:true,
		skipCondition:"event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_14_SKIP_TIME_MACHINE)",
		skipSteps:[TUTO_STEP_14B_TOUCH_MACHINE],
	},
	{
		id:TUTO_STEP_15_JACK,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_15",
		rightAvatar: true,
		darkBg:DARKBG_FOCUS,
		delay:1,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_14B_TOUCH_MACHINE",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true
	},
	/*{
		id:TUTO_STEP_16_HINT_PRODUCE,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_producing",
		topText:"TXT_TUTO_16",
		skipButton:true,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_15_JACK",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\""
	},*/
	{
		id:TUTO_STEP_16B_TOUCH_MACHINE,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["machine0"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_15_JACK",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_16_HINT_PRODUCE",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0",
		skipCondition:"Tutorial.isStepFinished(TUTO_STEP_17_PRODUCE)",
		skipSteps:[TUTO_STEP_16B_TOUCH_MACHINE],
	},
	{
		id:TUTO_STEP_17_PRODUCE,
		type:TUTO_TYPE_BUBBLE,
		bubblePos:cc.p(0, -150),
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_17",
		rightAvatar:true,
		blockTouch:false,
		acceptInput:["UIItem"],
		darkBg:DARKBG_FOCUS,//DARKBG_NONE,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_MACHINE_PRODUCE",
		endCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_PRODUCING",
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO_STEP_18_SKIP_TIME_PRODUCE,
		type:TUTO_TYPE_BUBBLE,
		bubblePos:cc.p(0, -150),
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_18",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["buttonSkip"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_17_PRODUCE",
		endCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_READY",
		skipCondition:"(event === EVT_HIDE_WIDGET && param0 === UI_MACHINE_PRODUCE) || (event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_17_PRODUCE))",
		skipSteps:[TUTO_STEP_18_SKIP_TIME_PRODUCE, TUTO_STEP_19_COLLECT],
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO_STEP_19_COLLECT,
		type:TUTO_TYPE_BUBBLE,
		bubblePos:cc.p(0, -150),
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_19",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["machine0", "UIItem"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_18_SKIP_TIME_PRODUCE",
		endCondition:"event === EVT_COLLECT_PRODUCT",
		skipCondition:"(!gv.userMachine.getMachineByFloor(0).storage || gv.userMachine.getMachineByFloor(0).storage.length <= 0) && Tutorial.isStepFinished(TUTO_STEP_18_SKIP_TIME_PRODUCE)",
		skipSteps:[TUTO_STEP_19_COLLECT],
		saveOnFinish:true
	},
	{
		id:TUTO_STEP_20_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_05.png",
		text:"TXT_TUTO_20",
		rightAvatar: true,
		requireFloor:0,
		delay:1,
		startCondition:"(event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP_NEW && gv.userData.getLevel() === 3) || (event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_19_COLLECT))",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_19_COLLECT",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"gv.userData.getLevel() > 3",
		skipSteps:[TUTO_STEP_20_RED, TUTO_STEP_21_OWL, TUTO_STEP_22_LETTER, TUTO_STEP_23_ORDER_HINT, TUTO_STEP_24_ORDER, TUTO_STEP_25_RED, TUTO_STEP_25B_OWL_APPEAR],
	},
	{
		id:TUTO_STEP_21_OWL,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NONE,
		acceptInput:["letter"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_20_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"letter\"",
	},
	{
		id:TUTO_STEP_22_LETTER,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_LINES,
		acceptInput:["hintSkipButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_21_OWL",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		hideProgress:true,
	},
	{
		id:TUTO_STEP_23_ORDER_HINT,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_05.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO_21",
		blockTouch:false,
		acceptInput:["btnOrder"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_22_LETTER",
		endCondition:"event === EVT_TOUCH_END && param0 === \"btnOrder\"",
	},
	{
		id:TUTO_STEP_24_ORDER,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["btnDeliver"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_ORDER",
		endCondition:"event === EVT_TOUCH_END && param0 === \"btnDeliver\"",
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO_STEP_25_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_05.png",
		text:"TXT_TUTO_22",
		rightAvatar: true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_24_ORDER",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_24_ORDER)",//skipCondition:"Tutorial.isStepFinished(TUTO_STEP_24_ORDER) && Orders.owl !== null",
		// new tutor
		//skipSteps:[TUTO_STEP_25_RED, TUTO_STEP_25B_OWL_APPEAR, TUTO_STEP_26_FROG],
		skipSteps:[TUTO_STEP_25_RED, TUTO_STEP_25B_OWL_APPEAR],
	},
	{
		id:TUTO_STEP_25B_OWL_APPEAR,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NONE,
		acceptInput:[],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_25_RED",
		endCondition:"event === EVT_OWL_STATE && param0 === STATE_OWL_RETURN2",
		// new tutor
		saveOnFinish:true,
	},
	// new tutor
	/*{
		id:TUTO_STEP_26_FROG,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_03",
		avatar:"npc/npc_frog.png",
		text:"TXT_TUTO_23",
		itemList:{EXP:8, GOLD:8},
		//startCondition:"event === EVT_OWL_STATE && param0 === STATE_OWL_RETURN2",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_25B_OWL_APPEAR",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_26B_RECEIVE_REWARDS,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NONE,
		acceptInput:[],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_26_FROG",
		//endCondition:"((event === EVT_OWL_STATE && param0 === STATE_OWL_FLY_AWAY) || Tutorial.isStepFinished(TUTO_STEP_27_JACK))",
		endCondition:"event === EVT_OWL_STATE && param0 === STATE_OWL_FLY_AWAY",
		skipCondition:"event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_26_FROG)",
		skipSteps:[TUTO_STEP_26B_RECEIVE_REWARDS],
		saveOnFinish:true,
	},*/
	{
		id:TUTO_STEP_27_JACK,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_04.png",
		text:"TXT_TUTO_24",
		itemList:{M12:0, M13:0},
		// new tutor
		//startCondition:"(((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || event === EVT_START_GAME) && gv.userData.getLevel() >= 4) && Tutorial.isStepFinished(TUTO_STEP_26_FROG)",
		//startCondition:"((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || event === EVT_START_GAME) && gv.userData.getLevel() === 5",
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) && gv.userData.getLevel() === 5 && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"CloudFloors.getLastUnlockedFloorIdx() >= 1 || (gv.userData.getLevel() === 5 && gv.userMachine.getMachineByFloor(0).state < MACHINE_STATE_READY) || gv.userData.getLevel() > 5",
		skipSteps:[TUTO_STEP_27_JACK,TUTO_STEP_27B_TOUCH_CLOUD,TUTO_STEP_27C_UNLOCK_CLOUD,TUTO_STEP_29B_TOUCH_SLOT,TUTO_STEP_29C_PUT_POT],
	},
	{
		id:TUTO_STEP_27B_TOUCH_CLOUD,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		requireFloor:"lockedFloor", 
		acceptInput:["bean01_lockedFloor", "leaf_lockedFloor"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_27_JACK",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_UNLOCK_FLOOR",
	},
	{
		id:TUTO_STEP_27C_UNLOCK_CLOUD,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["unlockButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_27B_TOUCH_CLOUD",
		endCondition:"event === EVT_HIDE_WIDGET && param0 === UI_UNLOCK_FLOOR",
		saveOnFinish:true,
	},
	// new tutor
	/*{
		id:TUTO_STEP_28_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_02.png",
		rightAvatar:true,
		text:"TXT_TUTO_25",
		delay:2,
		requireFloor:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_27C_UNLOCK_CLOUD",
		endCondition:"event === EVT_TOUCH_END",
	},
	{
		id:TUTO_STEP_28B_TOUCH_SLOT,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_03.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO_26",
		blockTouch:false,
		acceptInput:["emptySlot10"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_28_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"emptySlot\" && param1 === 1 && param2 === 0",
	},
	{
		id:TUTO_STEP_28C_TOUCH_PLUS_BUTTON,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["buyButton", "UIItem"],
		zDarkBg:Z_UI_TUTORIAL + 2,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU && Tutorial.isStepFinished(TUTO_STEP_28B_TOUCH_SLOT)",
		endCondition:"event === EVT_TOUCH_END && (param0 === \"buyButton\" || param0 === \"UIItem\")",
		skipCondition:"event === EVT_HIDE_WIDGET && param0 === UI_POT_MENU && Tutorial.isStepFinished(TUTO_STEP_28B_TOUCH_SLOT)",
		skipSteps:[TUTO_STEP_28C_TOUCH_PLUS_BUTTON, TUTO_STEP_28D_BUY_POT, TUTO_STEP_29_HINT_PUT_POT, TUTO_STEP_29B_TOUCH_SLOT],
	},
	{
		id:TUTO_STEP_28D_BUY_POT,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["buttonBuy"],
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_IB_SHOP_MAIN && Tutorial.isStepFinished(TUTO_STEP_28C_TOUCH_PLUS_BUTTON)",
		endCondition:"event === EVT_TOUCH_END && param0 === \"buttonBuy\"",
		skipCondition:"event === EVT_HIDE_WIDGET && param0 === UI_IB_SHOP_MAIN && Tutorial.isStepFinished(TUTO_STEP_28C_TOUCH_PLUS_BUTTON)",
		skipSteps:[TUTO_STEP_28D_BUY_POT, TUTO_STEP_29_HINT_PUT_POT, TUTO_STEP_29B_TOUCH_SLOT],
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_29_HINT_PUT_POT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_place_pots",
		topText:"TXT_TUTO_27",
		skipButton:true,
		delay:1,
		requireFloor:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_28D_BUY_POT",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
	},*/
	{
		id:TUTO_STEP_29B_TOUCH_SLOT,
		darkBg:DARKBG_FOCUS,
		acceptInput:["firstEmptySlot"],//acceptInput:["emptySlot10"],
		//endCondition:"event === EVT_TOUCH_END && param0 === \"emptySlot\" && param1 === 1 && param2 === 0",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU",
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_29_HINT_PUT_POT",
		//type:TUTO_TYPE_CUSTOM,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_27C_UNLOCK_CLOUD",
		type:TUTO_TYPE_BUBBLE,
		delay:1,
		requireFloor:1,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_26",
		blockTouch:false,
		// new tutor
		//skipCondition:"event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_27_JACK)",
		//skipSteps:[TUTO_STEP_29B_TOUCH_SLOT,TUTO_STEP_29C_PUT_POT],
		skipCondition:"gv.userData.getLevel() > 5 || (gv.userData.getLevel() > 5 === 5 && CloudFloors.getLastUnlockedFloorIdx() < 1)",
		skipSteps:[TUTO_STEP_29B_TOUCH_SLOT,TUTO_STEP_29C_PUT_POT],		
	},
	{
		id:TUTO_STEP_29C_PUT_POT,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NONE,
		acceptInput:["UIItem"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_29B_TOUCH_SLOT",
		endCondition:"event === EVT_PUT_POT && CloudFloors.getPotsCountOnFloor(1) >= 6",
		revertCondition:"event === EVT_PUT_POT && CloudFloors.getPotsCountOnFloor(1) < 6",
		revertSteps:[TUTO_STEP_29B_TOUCH_SLOT],
		saveOnFinish:true,
	},
	// new tutor
	/*{
		id:TUTO_STEP_30_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_05.png",
		rightAvatar:true,
		text:"TXT_TUTO_28",
		delay:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_29C_PUT_POT",
		endCondition:"event === EVT_TOUCH_END",
	},
	{
		id:TUTO_STEP_31_STORE_POT_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_hide_pot",
		animLoop:false,
		topText:"TXT_TUTO_29",
		hint31:"TXT_TUTO_29A",
		hint32:"TXT_TUTO_29B",
		hint33:"TXT_TUTO_29C",
		skipButton:true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_30_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},*/
	{
		id:TUTO_STEP_32_RED,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_06.png",
		rightAvatar:true,
		text:"TXT_TUTO_30",
		delay:1,
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_31_STORE_POT_HINT",
		//startCondition:"(((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || event === EVT_START_GAME) && gv.userData.getLevel() === 6)",
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) && gv.userData.getLevel() === 6 && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"gv.userData.getLevel() > 6",
		skipSteps:[TUTO_STEP_32_RED,TUTO_STEP_33_UPGRADE_HINT],
	},
	{
		id:TUTO_STEP_33_UPGRADE_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_upgarde_pot",
		animLoop:false,
		topText:"TXT_TUTO_31",
		hint31:"TXT_TUTO_31A",
		hint32:"TXT_TUTO_31B",
		hint33:"TXT_TUTO_31C",
		skipButton:true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_32_RED",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		// new tutor
		saveOnFinish:true,
	},
	// new tutor
	/*{
		id:TUTO_STEP_33B_TOUCH_POT,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["pot10"],
		requireFloor:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_33_UPGRADE_HINT",
		//endCondition:"event === EVT_TOUCH_END && param0 === \"pot\" && param1 === 1 && param2 === 0",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU",
	},
	{
		id:TUTO_STEP_33C_TOUCH_UPGRADE_BUTTON,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		zDarkBg:Z_UI_TUTORIAL + 2,
		acceptInput:["upgradeButton"],
		//startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU && Tutorial.isStepFinished(TUTO_STEP_33B_TOUCH_POT)",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_33B_TOUCH_POT",
		endCondition:"event === EVT_TOUCH_END && param0 === \"upgradeButton\"",
		//skipCondition:"event === EVT_HIDE_WIDGET && param0 === UI_POT_MENU && Tutorial.isStepFinished(TUTO_STEP_33B_TOUCH_POT)",
		//skipSteps:[TUTO_STEP_33C_TOUCH_UPGRADE_BUTTON, TUTO_STEP_33D_UPGRADE],
	},
	{
		id:TUTO_STEP_33D_UPGRADE,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["upgradeButton"],
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_UPGRADE",
		endCondition:"event === EVT_TOUCH_END && param0 === \"upgradeButton\"",
		saveOnFinish:true,
	},*/
	/*{
		id:TUTO_STEP_34_JACK,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_05.png",
		text:"TXT_TUTO_32",
		delay:3,
		// jira#6039
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_33D_UPGRADE",
		//startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME || event === EVT_FINISH_TUTO_STEP) && Tutorial.isStepFinished(TUTO_STEP_33_UPGRADE_HINT) && Tutorial.isStepFinished(TUTO_STEP_29C_PUT_POT) && !Game.isAnyPopupShowing()",
		//endCondition:"event === EVT_TOUCH_END",
		startCondition:"false",
		endCondition:"false",
		skipCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME || event === EVT_FINISH_TUTO_STEP) && Tutorial.isStepFinished(TUTO_STEP_33_UPGRADE_HINT) && Tutorial.isStepFinished(TUTO_STEP_29C_PUT_POT)",
		skipSteps:[TUTO_STEP_34_JACK,TUTO_STEP_35_FULL_HINT],
	},
	{
		id:TUTO_STEP_35_FULL_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_full",
		animLoop:false,
		topText:"TXT_TUTO_33",
		hint51:"TXT_TUTO_33E",
		hint52:"TXT_TUTO_33A",
		hint53:"TXT_TUTO_33B",
		hint54:"TXT_TUTO_33C",
		hint55:"TXT_TUTO_33D",
		hintDelay: 0.5,
		hintDuration: 0.35,
		skipButton:true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_34_JACK",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
		finishAction:function() {Game.refreshUIMain(RF_UIMAIN_ORDER);Game.gameScene.showDynamicButton();FriendList.load();},
	},*/
	{
		id:TUTO_STEP_54_RED_DECOR,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_01.png",
		text:"TXT_TUTO_52",
		delay:1,
		endCondition:"event === EVT_TOUCH_END",
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_35_FULL_HINT",
		//skipCondition:"gv.userData.getLevel() >= 5",
		//skipSteps:[TUTO_STEP_54_RED_DECOR,TUTO_STEP_54B_TOUCH_DECOR,TUTO_STEP_35N3_DECOR_HINT],
		startCondition:"event === EVT_HIDE_WIDGET && gv.userData.getLevel() === 8 && !Game.isAnyPopupShowing()",
		skipCondition:"(event === EVT_START_GAME && gv.userData.getLevel() >= 8) || CloudFloors.getDecorsOnFloor(1).length > 0",
		skipSteps:[TUTO_STEP_54_RED_DECOR,TUTO_STEP_54B_TOUCH_DECOR],
	},
	{
		id:TUTO_STEP_54B_TOUCH_DECOR,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["emptyDecorSlot10"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_54_RED_DECOR",
		endCondition:"event === EVT_TOUCH_END && param0 === \"emptyDecorSlot\" && param1 === 1 && param2 === 0",
		// new tutor
		saveOnFinish:true,
	},
	// new tutor
	/*{
		id:TUTO_STEP_35N3_DECOR_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_decors",
		topText:"TXT_TUTO_52A",
		skipButton:true,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_54B_TOUCH_DECOR",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
		finishAction:function() {if(CloudFloors.slots[1][0]) CloudFloors.slots[1][0].showPlaceDecorMenu();},
	},
	{
		id:TUTO_STEP_36_JACK,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_03.png",
		text:"TXT_TUTO_34",
		delay:1,
		//startCondition:"((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || gv.userData.getLevel() >= 5) && Tutorial.isStepFinished(TUTO_STEP_35_FULL_HINT)",
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_35_FULL_HINT",
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP && Tutorial.isStepFinished(TUTO_STEP_35N3_DECOR_HINT)",
		endCondition:"event === EVT_TOUCH_END",
		startAction:function() {Tutorial.hideCurrentPopups();},
		skipCondition:"gv.userData.getLevel() >= g_MISCINFO.OFFER_NEWBIE_LEVEL",
		skipSteps:[TUTO_STEP_36_JACK,TUTO_STEP_37_PS_SHOW,TUTO_STEP_38_PS_HINT,TUTO_STEP_39_JACK,TUTO_STEP_39B_TOUCH_NEWSBOARD,TUTO_STEP_39C_NEWSBOARD_HINT],
	},
	{
		id:TUTO_STEP_37_PS_SHOW,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_35",
		requireFloor:-1,
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_36_JACK",
		endCondition:"event === EVT_TOUCH_END",
	},*/
	{
		id:TUTO_STEP_38_PS_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_pshop_sell",
		animLoop:false,
		topText:"TXT_TUTO_36",
		hint41:"TXT_TUTO_36A",
		hint42:"TXT_TUTO_36B",
		hint43:"TXT_TUTO_36C",
		hint44:"TXT_TUTO_36D",
		skipButton:true,
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_37_PS_SHOW",
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"privateShop\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	// new tutor
	/*{
		id:TUTO_STEP_39_JACK,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_03.png",
		text:"TXT_TUTO_37",
		delay:1,
		requireFloor:-1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_38_PS_HINT",
		endCondition:"event === EVT_TOUCH_END",
		startAction:function() {Tutorial.hideCurrentPopups();},
		skipCondition:"gv.userData.getLevel() >= g_MISCINFO.OFFER_NEWBIE_LEVEL",
		skipSteps:[TUTO_STEP_39_JACK,TUTO_STEP_39B_TOUCH_NEWSBOARD,TUTO_STEP_39C_NEWSBOARD_HINT],
	},
	{
		id:TUTO_STEP_39B_TOUCH_NEWSBOARD,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["bgNewsboard"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_39_JACK",
		endCondition:"event === EVT_TOUCH_END && param0 === \"bgNewsboard\"",
	},*/
	{
		id:TUTO_STEP_53_QUEST_MISSION,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_RED",
		avatar:"npc/npc_red_mission.png",
		text:"TXT_TUTO_53",
		rightAvatar: true,
		delay:1,
		startAction:function() {
			QuestMission.reload (function() {
				QuestMission.updateMissionData();
				Game.gameScene.showDynamicButton(true);
				QuestMission.refreshHomeIcon();
				var button = Game.gameScene.getDynamicButtonById("questMission");
				Tutorial.currentStep.focus = FWUtils.getWorldPosition(button);
			});
		},
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) &&  !Game.isAnyPopupShowing() && QuestMission.checkLevel()",
		endCondition:"event === EVT_TOUCH_END && QuestMission.check()",
		skipCondition:"gv.userData.getLevel() > g_MISCINFO.QUEST_MISSION_USER_LEVEL_MAX",
		skipSteps:[TUTO_STEP_53B_QUEST_MISSION, TUTO_STEP_53_QUEST_MISSION],
	},
	{
		id:TUTO_STEP_53B_QUEST_MISSION,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["homeButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_53_QUEST_MISSION",
		endCondition:"event === EVT_TOUCH_END && param0 === \"homeButton\" && param1 && param1.uiData && param1.uiData.id === \"questMission\"",
		saveOnFinish:true,
	}
];
const TUTO_STEPS_FLOW_2 = [
	{
		id:TUTO2_STEP_1_JACK,
		type:TUTO_TYPE_DIALOG,
		leftAvatar: true,
		avatar:"npc/npc_jack_04.png",
		text:"TXT_TUTO2_00",
		name:"TXT_NPC_TOM",
		darkBg: DARKBG_NORMAL,
		startCondition:"event === EVT_START_GAME && Tutorial.savedData.finishedStepIds.length <= 0",
		endCondition:"event === EVT_TOUCH_END"
	},
	{
		id:TUTO2_STEP_2A_RED,
		type:TUTO_TYPE_DIALOG,
		avatar:"npc/npc_red_01.png",
		text:"TXT_TUTO2_01",
		name:"TXT_NPC_OWL",
		rightAvatar: true,
		darkBg: DARKBG_NORMAL,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_1_JACK",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true,
	},
	//{
	//	id:TUTO2_STEP_2B_RED,
	//	type:TUTO_TYPE_DIALOG,
	//	avatar:"npc/npc_red_04.png",
	//	text:"TXT_TUTO2_02",
	//	name:"TXT_NPC_OWL",
	//	rightAvatar: true,
	//	darkBg: DARKBG_NORMAL,
	//	startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_2A_RED",
	//	endCondition:"event === EVT_TOUCH_END",
	//	//saveOnFinish:true,
	//},
	//{
	//	id:TUTO2_STEP_2C_RED,
	//	type:TUTO_TYPE_DIALOG,
	//	avatar:"npc/npc_red_06.png",
	//	text:"TXT_TUTO2_03",
	//	name:"TXT_NPC_OWL",
	//	rightAvatar: true,
	//	darkBg: DARKBG_NORMAL,
	//	startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_2B_RED",
	//	endCondition:"event === EVT_TOUCH_END",
	//	saveOnFinish:true,
	//},
	{
		id:TUTO2_STEP_3_SCROLL_DOWN,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_1,
		anim:"tutorial_scroll",
		bottomText:"TXT_TUTO2_04",
		blockTouch:false,
		acceptScrolling:true,
		acceptInput:[],
		darkBg: DARKBG_NORMAL,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_2A_RED",
		endCondition:"event === EVT_SCROLL_TO_FLOOR && param0 === 0",
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_4_HARVEST,
		type:TUTO_TYPE_NEWTUTO,
		leftAvatar: true,
		avatar:"npc/npc_jack_02.png",
		text:"TXT_TUTO2_05",
		darkBg: DARKBG_NORMAL,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_3_SCROLL_DOWN",
		endCondition:"event === EVT_TOUCH_END",
		finishAction:function()
		{
			CloudFloors.slots[0][0].showHarvestMenu();
		},
		//saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_4_HARVEST2,
		type:TUTO_TYPE_NEWTUTO,
		blockTouch:false,
		avatar:"npc/npc_Jack_01.png",
		text:"TXT_TUTO2_06",
		leftAvatar: true,
		bubblePos:cc.p(0,100),
		//spine:SPINE_HUD_TUTORIAL_1,
		//anim:"tutorial_scroll",
		anim:"tutorial_harvest",
		zOrder:Z_UI_POT_INFO,
		acceptInput:["UIItem"],
		darkBg:DARKBG_NORMAL,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_4_HARVEST",
		endCondition:"event === EVT_HARVEST && CloudFloors.getEmptyPotsCountOnFloor(0) >= 6",
		revertCondition:"event === EVT_HARVEST && CloudFloors.getEmptyPotsCountOnFloor(0) < 6",
		revertSteps:[TUTO2_STEP_4_HARVEST],
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_5_PLANT,
		type:TUTO_TYPE_NEWTUTO,
		avatar:"npc/npc_red_04.png",
		text:"TXT_TUTO2_07",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["firstEmptyPot"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_4_HARVEST2",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_07_PLANT_HINT",
		//endCondition:"event === EVT_TOUCH_END && (param0 === \"pot\" || param0 === \"plant\") && param1 === 0 && param2 === 0",
		//saveOnFinish:true,
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU",
		//skipCondition:"event === EVT_BUG_APPEAR || event === EVT_BUG_DISAPPEAR",
		//skipSteps:[TUTO_STEP_08_PLANT, TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
	},
	{
		id:TUTO2_STEP_5_PLANT2,
		type:TUTO_TYPE_NEWTUTO,
		acceptInput:["UIItem"],
		darkBg:DARKBG_NORMAL,
		anim:"tutorial_planting",
		blockTouch:false,
		zOrder:Z_UI_POT_INFO,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_5_PLANT",
		endCondition:"event === EVT_PLANT && CloudFloors.getEmptyPotsCountOnFloor(0) <= 0",
		revertCondition:"event === EVT_PLANT && CloudFloors.getEmptyPotsCountOnFloor(0) > 0",
		revertSteps:[TUTO2_STEP_5_PLANT],
		//skipCondition:"event === EVT_BUG_APPEAR",
		//skipSteps:[TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
		saveOnFinish:true,
	},
	//{
	//	id:TUTO2_STEP_6_BUG,
	//	type:TUTO_TYPE_NEWTUTO,
	//	avatar:"npc/npc_red_05.png",
	//	rightAvatar:true,
	//	text:"TXT_TUTO2_08",
	//	darkBg:DARKBG_FOCUS,
	//	requireFloor:0,
	//	delay:1,
	//	//startCondition:"event === EVT_BUG_APPEAR && Tutorial.isStepFinished(TUTO_STEP_08C_PLANT3)",
	//	startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_5_PLANT2",
	//	endCondition:"event === EVT_TOUCH_END",
	//	//skipCondition:"CloudFloors.getBugsCountOnFloor(0) <= 0 && Tutorial.isStepFinished(TUTO_STEP_08C_PLANT3)",
	//	//skipSteps:[TUTO_STEP_09_RED, TUTO_STEP_10_BUG_HINT, TUTO_STEP_11_BUG, TUTO_STEP_11B_BUG2, TUTO_STEP_12_RED],
	//},
	{
		id:TUTO2_STEP_6_BUG2,
		type:TUTO_TYPE_NEWTUTO,
		avatar:"npc/npc_red_05.png",
		//avatarBg:"npc/nhc_red_bg.png",
		rightAvatar:true,
		text:"TXT_TUTO2_09",
		blockTouch:false,
		requireFloor:0,
		delay:1,
		acceptInput:["firstSlotWithBug"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_5_PLANT2",
		//endCondition:"event === EVT_TOUCH_END && (param0 === \"pot\" || param0 === \"plant\") && param1 === this.bugFloorIdx && param2 === this.bugSlotIdx",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_PLANT_MENU",
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_10_BUG_HINT)",
		//skipSteps:[TUTO_STEP_11_BUG, TUTO_STEP_11B_BUG2, TUTO_STEP_12_RED],
	},
	{
		id:TUTO2_STEP_6_BUG3,
		type:TUTO_TYPE_NEWTUTO,
		acceptInput:["UIItem"],
		darkBg:DARKBG_NORMAL,
		anim:"tutorial_catch_bug",
		blockTouch:false,
		zOrder:Z_UI_POT_INFO,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_6_BUG2",
		endCondition:"event === EVT_CATCH_BUG && CloudFloors.getBugsCountOnFloor(0) <= 0",
		revertCondition:"event === EVT_HIDE_WIDGET && param0 === UI_PLANT_MENU && CloudFloors.getBugsCountOnFloor(0) > 0",
		revertSteps:[TUTO2_STEP_6_BUG],
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		//skipSteps:[TUTO_STEP_11B_BUG2, TUTO_STEP_12_RED],
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_6_BUG4,
		type:TUTO_TYPE_NEWTUTO,
		avatar:"npc/npc_red_04.png",
		text:"TXT_TUTO2_10",
		rightAvatar: true,
		darkBg:DARKBG_NONE,
		requireFloor:0,
		//startCondition:"event === EVT_CATCH_BUG && CloudFloors.getBugsCountOnFloor(0) <= 0 && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP_NEW",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_11B_BUG2",
		endCondition:"event === EVT_TOUCH_END",
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		//skipSteps:[TUTO_STEP_12_RED],
		saveOnFinish:true
	},
	{
		id:TUTO2_STEP_7,
		type:TUTO_TYPE_NEWTUTO,
		avatar:"npc/npc_red_02.png",
		text:"TXT_TUTO2_11",
		rightAvatar: true,
		darkBg:DARKBG_NORMAL,
		requireFloor:0,
		//startCondition:"event === EVT_CATCH_BUG && CloudFloors.getBugsCountOnFloor(0) <= 0 && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_6_BUG4",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_11B_BUG2",
		endCondition:"event === EVT_TOUCH_END",
		//skipCondition:"event === EVT_BUG_DISAPPEAR && Tutorial.isStepFinished(TUTO_STEP_11_BUG)",
		//skipSteps:[TUTO_STEP_12_RED],
		//saveOnFinish:true
	},
	{
		id:TUTO2_STEP_7_POT,
		type:TUTO_TYPE_NEWTUTO,
		blockTouch:false,
		delay:1,
		acceptInput:["pot00"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_7 && gv.userData.getLevel() === 2 && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU",
		//skipCondition:"gv.userData.getLevel() > 2",
		//skipCondition:"event === EVT_BUG_APPEAR || event === EVT_BUG_DISAPPEAR",
		//skipSteps:[TUTO_STEP_08_PLANT, TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
	},
	{
		id:TUTO2_STEP_7_POT2,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_03.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO2_12",
		rightAvatar: false,
		blockTouch:false,
		acceptInput:["upgradeButton"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_7_POT ",
		endCondition:"event === EVT_HIDE_WIDGET && param0 === UI_POT_MENU",
		//skipCondition:"gv.userData.getLevel() > 2",
		//skipCondition:"event === EVT_BUG_APPEAR || event === EVT_BUG_DISAPPEAR",
		//skipSteps:[TUTO_STEP_08_PLANT, TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
	},
	{
		id:TUTO2_STEP_7_POT3,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["upgradeButton"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_7_POT2 ",
		endCondition:"event === EVT_HIDE_WIDGET && param0 === UI_POT_UPGRADE",
		//skipCondition:"gv.userData.getLevel() > 2",
		//skipCondition:"event === EVT_BUG_APPEAR || event === EVT_BUG_DISAPPEAR",
		//skipSteps:[TUTO_STEP_08_PLANT, TUTO_STEP_08B_PLANT2, TUTO_STEP_08C_PLANT3],
		hideProgress:true,
		saveOnFinish:true
	},
	{
		id:TUTO2_STEP_7_POT4,
		type:TUTO_TYPE_NEWTUTO,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_06.png",
		rightAvatar:true,
		text:"TXT_TUTO2_13",
		delay:1.5,
		darkBg:DARKBG_NONE,
		requireFloor:0,
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_31_STORE_POT_HINT",
		//startCondition:"(((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || event === EVT_START_GAME) && gv.userData.getLevel() === 6)",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_7_POT3",
		endCondition:"event === EVT_TOUCH_END",
		//skipCondition:"gv.userData.getLevel() > 6",
		//skipSteps:[TUTO_STEP_32_RED,TUTO_STEP_33_UPGRADE_HINT],
		saveOnFinish:true
	},
	{
		id:TUTO2_STEP_8_MACHINE,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_13",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["machine0", "btnReceive"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		delay:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_7_POT4",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0"
	},
	{
		id:TUTO2_STEP_8_MACHINE2,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["buttonUnlock"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_MACHINE_UNLOCK && Tutorial.isStepFinished(TUTO2_STEP_8_MACHINE)",
		endCondition:"event === EVT_HIDE_WIDGET && param0 === UI_MACHINE_UNLOCK",
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO2_STEP_8_MACHINE3,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["machine0"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_8_MACHINE2",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0",
		// jira#5791
		skipCondition:"event === EVT_START_GAME && gv.userMachine.getMachineByFloor(0).state === MACHINE_STATE_GROWING_FULL",
		//skipSteps:[TUTO_STEP_13C_TOUCH_MACHINE, TUTO_STEP_14_SKIP_TIME_MACHINE],
	},
	{
		id:TUTO2_STEP_8_MACHINE4,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_14",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["btnSkipCoin"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_SKIP_TIME && Tutorial.isStepFinished(TUTO2_STEP_8_MACHINE3)",
		endCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_GROWING_FULL",
		skipCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_GROWING_FULL",
		saveOnFinish:true,
		// jira#5791
		//skipSteps:[TUTO_STEP_14_SKIP_TIME_MACHINE, TUTO_STEP_14B_TOUCH_MACHINE, TUTO_STEP_15_JACK],
		//skipSteps:[TUTO_STEP_14_SKIP_TIME_MACHINE],
	},
	{
		id:TUTO2_STEP_8_MACHINE5,
		type:TUTO_TYPE_NONE,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_8_MACHINE4",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0",
		// new tutor
		//blockTouch:false,
		//darkBg:DARKBG_FOCUS,
		//acceptInput:["machine0"],
		blockTouch:true,
		darkBg:DARKBG_NONE,
		acceptInput:[],
		startAction:function() {cc.director.getScheduler().scheduleCallbackForTarget(this, function() {gv.userMachine.getMachineByFloor(0).onTouchEnded(null, null, true);}, 1, 0, 0, false);},
	},
	{
		id:TUTO2_STEP_8_MACHINE6,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_15",
		rightAvatar: true,
		darkBg:DARKBG_FOCUS,
		delay:1,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_8_MACHINE5",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true
	},
	{
		id:TUTO2_STEP_9_PRODUCT,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["machine0"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_8_MACHINE6",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_16_HINT_PRODUCE",
		endCondition:"event === EVT_TOUCH_END && param0 === \"machine\" && param1 === 0",
		//skipCondition:"Tutorial.isStepFinished(TUTO_STEP_17_PRODUCE)",
		//skipSteps:[TUTO_STEP_16B_TOUCH_MACHINE],
	},
	{
		id:TUTO2_STEP_9_PRODUCT2,
		type:TUTO_TYPE_BUBBLE,
		bubblePos:cc.p(0, -235),
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_17",
		rightAvatar:true,
		blockTouch:false,
		acceptInput:["UIItem"],
		darkBg:DARKBG_FOCUS,//DARKBG_NONE,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_MACHINE_PRODUCE",
		endCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_PRODUCING",
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO2_STEP_9_PRODUCT3,
		type:TUTO_TYPE_BUBBLE,
		bubblePos:cc.p(0, -235),
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_18",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["buttonSkip"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_9_PRODUCT2",
		endCondition:"event === EVT_REFRESH_MACHINE && param0 === 0 && param1 === MACHINE_STATE_READY",
		skipCondition:"(event === EVT_HIDE_WIDGET && param0 === UI_MACHINE_PRODUCE) || (event === EVT_START_GAME && Tutorial.isStepFinished(TUTO2_STEP_9_PRODUCT2))",
		skipSteps:[TUTO2_STEP_9_PRODUCT3, TUTO2_STEP_9_PRODUCT4],
		saveOnFinish:true,
		hideProgress:true,
	},
	{
		id:TUTO2_STEP_9_PRODUCT4,
		type:TUTO_TYPE_BUBBLE,
		bubblePos:cc.p(0, -235),
		avatar:"npc/npc_jack_04.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_19",
		rightAvatar: true,
		blockTouch:false,
		acceptInput:["machine0", "UIItem"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_9_PRODUCT3",
		endCondition:"event === EVT_COLLECT_PRODUCT",
		//skipCondition:"(!gv.userMachine.getMachineByFloor(0).storage || gv.userMachine.getMachineByFloor(0).storage.length <= 0) && Tutorial.isStepFinished(TUTO_STEP_18_SKIP_TIME_PRODUCE)",
		//skipSteps:[TUTO_STEP_19_COLLECT],
		hideProgress:true,
		saveOnFinish:true,
		finishAction:function()
		{
			if (gv.userMachine.popupMachineProduce)
				gv.userMachine.popupMachineProduce.hide();
		},
	},

	{
		id:TUTO2_STEP_10_LETTER,
		type:TUTO_TYPE_NEWTUTO,
		//name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_05.png",
		text:"TXT_TUTO_20",
		rightAvatar: true,
		darkBg:DARKBG_NONE,
		requireFloor:0,
		delay:1,
		startCondition:"(event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP_NEW && gv.userData.getLevel() === 3) || (event === EVT_START_GAME && Tutorial.isStepFinished(TUTO2_STEP_9_PRODUCT4))",//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_19_COLLECT",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"gv.userData.getLevel() > 3",
		skipSteps:[TUTO2_STEP_10_LETTER, TUTO2_STEP_10_LETTER2, TUTO2_STEP_10_LETTER3, TUTO2_STEP_10_LETTER4, TUTO2_STEP_10_LETTER5],
	},
	{
		id:TUTO2_STEP_10_LETTER2,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NONE,
		acceptInput:["letter"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_10_LETTER",
		endCondition:"event === EVT_TOUCH_END && param0 === \"letter\"",
	},
	{
		id:TUTO2_STEP_10_LETTER3,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NORMAL,
		acceptInput:["hintSkipButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_10_LETTER2",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		hideProgress:true,
	},
	{
		id:TUTO2_STEP_10_LETTER4,
		type:TUTO_TYPE_BUBBLE,
		avatar:"npc/npc_red_05.png",
		avatarBg:"npc/nhc_red_bg.png",
		text:"TXT_TUTO_21",
		blockTouch:false,
		acceptInput:["btnOrder"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_10_LETTER3",
		endCondition:"event === EVT_TOUCH_END && param0 === \"btnOrder\"",
	},
	{
		id:TUTO2_STEP_10_LETTER5,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["btnDeliver"],
		darkBg:DARKBG_FOCUS,
		startCondition:"event === EVT_SHOW_WIDGET && param0 === UI_ORDER",
		endCondition:"event === EVT_TOUCH_END && param0 === \"btnDeliver\"",
		saveOnFinish:true,
		hideProgress:true,
	},
	//{
	//	id:TUTO2_STEP_10_LETTER6,
	//	type:TUTO_TYPE_NEWTUTO,
	//	name:"TXT_NPC_OWL",
	//	avatar:"npc/npc_red_05.png",
	//	text:"TXT_TUTO_22",
	//	rightAvatar: true,
	//	darkBg:DARKBG_NONE,
	//	startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_10_LETTER5",
	//	endCondition:"event === EVT_TOUCH_END",
	//	skipCondition:"event === EVT_START_GAME && Tutorial.isStepFinished(TUTO2_STEP_10_LETTER5)",//skipCondition:"Tutorial.isStepFinished(TUTO_STEP_24_ORDER) && Orders.owl !== null",
	//	// new tutor
	//	//skipSteps:[TUTO_STEP_25_RED, TUTO_STEP_25B_OWL_APPEAR, TUTO_STEP_26_FROG],
	//	skipSteps:[TUTO2_STEP_10_LETTER6, TUTO2_STEP_10_LETTER7],
	//},
	//{
	//	id:TUTO2_STEP_10_LETTER7,
	//	type:TUTO_TYPE_CUSTOM,
	//	darkBg:DARKBG_NONE,
	//	acceptInput:[],
	//	startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_10_LETTER6",
	//	endCondition:"event === EVT_OWL_STATE && param0 === STATE_OWL_RETURN2",
	//	// new tutor
	//	saveOnFinish:true,
	//},
	{
		id:TUTO2_STEP_11_QUEST_MISSION,
		type:TUTO_TYPE_NEWTUTO,
		name:"TXT_NPC_RED",
		darkBg:DARKBG_NORMAL,
		avatar:"npc/npc_red_mission.png",
		text:"TXT_TUTO2_14",
		rightAvatar: true,
		delay:1,
		startAction:function() {
			QuestMission.reload (function() {
				QuestMission.updateMissionData();
				Game.gameScene.showDynamicButton(true);
				QuestMission.refreshHomeIcon();
				var button = Game.gameScene.getDynamicButtonById("questMission");
				Tutorial.currentStep.focus = FWUtils.getWorldPosition(button);
			});
		},
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) &&  !Game.isAnyPopupShowing() && QuestMission.checkLevel()",
		endCondition:"event === EVT_TOUCH_END && QuestMission.check()",
		skipCondition:"gv.userData.getLevel() > g_MISCINFO.QUEST_MISSION_USER_LEVEL_MAX",
		skipSteps:[TUTO2_STEP_11_QUEST_MISSION, TUTO2_STEP_11_QUEST_MISSION2],
	},
	{
		id:TUTO2_STEP_11_QUEST_MISSION2,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["homeButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_11_QUEST_MISSION",
		endCondition:"event === EVT_TOUCH_END && param0 === \"homeButton\" && param1 && param1.uiData && param1.uiData.id === \"questMission\"",
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_12_OPEN_CLOUD,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_04.png",
		text:"TXT_TUTO_24",
		itemList:{M12:0, M13:0},
		darkBg: DARKBG_NORMAL,
		// new tutor
		//startCondition:"(((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || event === EVT_START_GAME) && gv.userData.getLevel() >= 4) && Tutorial.isStepFinished(TUTO_STEP_26_FROG)",
		//startCondition:"((event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP) || event === EVT_START_GAME) && gv.userData.getLevel() === 5",
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) && gv.userData.getLevel() === 5 && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"CloudFloors.getLastUnlockedFloorIdx() >= 1 || (gv.userData.getLevel() === 5 && gv.userMachine.getMachineByFloor(0).state < MACHINE_STATE_READY) || gv.userData.getLevel() > 5",
		skipSteps:[TUTO2_STEP_12_OPEN_CLOUD,TUTO2_STEP_12_OPEN_CLOUD2,TUTO2_STEP_12_OPEN_CLOUD3],
	},
	{
		id:TUTO2_STEP_12_OPEN_CLOUD2,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		requireFloor:"lockedFloor",
		acceptInput:["bean01_lockedFloor", "leaf_lockedFloor"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_12_OPEN_CLOUD",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_UNLOCK_FLOOR",
	},
	{
		id:TUTO2_STEP_12_OPEN_CLOUD3,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["unlockButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_12_OPEN_CLOUD2",
		endCondition:"event === EVT_HIDE_WIDGET && param0 === UI_UNLOCK_FLOOR",
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_13_DROP_POT,
		darkBg:DARKBG_FOCUS,
		acceptInput:["firstEmptySlot"],//acceptInput:["emptySlot10"],
		//endCondition:"event === EVT_TOUCH_END && param0 === \"emptySlot\" && param1 === 1 && param2 === 0",
		endCondition:"event === EVT_SHOW_WIDGET && param0 === UI_POT_MENU",
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_29_HINT_PUT_POT",
		//type:TUTO_TYPE_CUSTOM,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_12_OPEN_CLOUD3",
		type:TUTO_TYPE_BUBBLE,
		delay:1,
		requireFloor:1,
		avatar:"npc/npc_jack_03.png",
		avatarBg:"npc/npc_jack_bg.png",
		text:"TXT_TUTO_26",
		blockTouch:false,
		// new tutor
		//skipCondition:"event === EVT_START_GAME && Tutorial.isStepFinished(TUTO_STEP_27_JACK)",
		//skipSteps:[TUTO_STEP_29B_TOUCH_SLOT,TUTO_STEP_29C_PUT_POT],
		skipCondition:"gv.userData.getLevel() > 5",
		skipSteps:[TUTO2_STEP_13_DROP_POT,TUTO2_STEP_13_DROP_POT2],
	},
	{
		id:TUTO2_STEP_13_DROP_POT2,
		type:TUTO_TYPE_NEWTUTO,
		anim:"tutorial_place_pots",
		darkBg:DARKBG_NONE,
		blockTouch:false,
		zOrder:Z_UI_POT_INFO+1,
		acceptInput:["UIItem"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_13_DROP_POT",
		endCondition:"event === EVT_PUT_POT && CloudFloors.getPotsCountOnFloor(1) >= 6",
		revertCondition:"event === EVT_PUT_POT && CloudFloors.getPotsCountOnFloor(1) < 6",
		revertSteps:[TUTO2_STEP_13_DROP_POT],
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_14_DECOR,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_OWL",
		avatar:"npc/npc_red_01.png",
		text:"TXT_TUTO_52",
		delay:1,
		darkBg: DARKBG_NORMAL,
		endCondition:"event === EVT_TOUCH_END",
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_35_FULL_HINT",
		//skipCondition:"gv.userData.getLevel() >= 5",
		//skipSteps:[TUTO_STEP_54_RED_DECOR,TUTO_STEP_54B_TOUCH_DECOR,TUTO_STEP_35N3_DECOR_HINT],
		startCondition:"event === EVT_HIDE_WIDGET && gv.userData.getLevel() === 8 && !Game.isAnyPopupShowing()",
		skipCondition:"(event === EVT_START_GAME && gv.userData.getLevel() >= 8) || CloudFloors.getDecorsOnFloor(1).length > 0",
		skipSteps:[TUTO2_STEP_14_DECOR,TUTO2_STEP_14_DECOR2],
	},
	{
		id:TUTO2_STEP_14_DECOR2,
		type:TUTO_TYPE_NONE,
		blockTouch:false,
		acceptInput:["emptyDecorSlot10"],
		darkBg:DARKBG_FOCUS,
		requireFloor:0,
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO2_STEP_14_DECOR",
		endCondition:"event === EVT_TOUCH_END && param0 === \"emptyDecorSlot\" && param1 === 1 && param2 === 0",
		// new tutor
		saveOnFinish:true,
	},
	{
		id:TUTO2_STEP_15_PRIVATE_SHOP,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_pshop_sell",
		animLoop:false,
		topText:"TXT_TUTO_36",
		hint41:"TXT_TUTO_36A",
		hint42:"TXT_TUTO_36B",
		hint43:"TXT_TUTO_36C",
		hint44:"TXT_TUTO_36D",
		skipButton:true,
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_37_PS_SHOW",
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"privateShop\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},

];

const TUTO_STEPS_GENERAL = [
	{
		id:TUTO_STEP_35N5_GANDALF,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_GANDALF",
		avatar:"npc/npc_gandalf.png",
		text:"TXT_TUTO_35N5",
		rightAvatar: true,
		delay:1,
		startAction:function() {Game.gameScene.showDynamicButton(true);QuestBook.refresh();var button = Game.gameScene.getDynamicButtonById("questBook");Tutorial.currentStep.focus = FWUtils.getWorldPosition(button);},
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) && gv.userData.getLevel() === g_MISCINFO.QUEST_BOOK_USER_LEVEL && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"gv.userData.getLevel() > g_MISCINFO.QUEST_BOOK_USER_LEVEL || Tutorial.isStepFinished(TUTO_STEP_35N4_QUEST_BOOK)",
		skipSteps:[TUTO_STEP_35N4_QUEST_BOOK, TUTO_STEP_35N5_GANDALF],
	},
	{
		id:TUTO_STEP_35N4_QUEST_BOOK,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["homeButton"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_35N5_GANDALF",
		endCondition:"event === EVT_TOUCH_END && param0 === \"homeButton\" && param1 && param1.uiData && param1.uiData.id === \"questBook\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_39C_NEWSBOARD_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_pshop_buy_news",
		animLoop:false,
		topText:"TXT_TUTO_38",
		hint41:"TXT_TUTO_38A",
		hint42:"TXT_TUTO_38B",
		hint43:"TXT_TUTO_38C",
		hint44:"TXT_TUTO_38D",
		skipButton:true,
		// new tutor
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_39B_TOUCH_NEWSBOARD",
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"newsboard\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_43_UNLOCK_AIRSHIP,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_airship_package",
		animLoop:false,
		topText:"TXT_TUTO_45",
		hint31:"TXT_TUTO_45A",
		hint32:"TXT_TUTO_45B",
		hint33:"TXT_TUTO_45C",
		hintDelay: 1,
		hintDuration: 1.5,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"airship\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_44_UNLOCK_TOM,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_tom_hire",
		animLoop:false,
		topText:"TXT_TUTO_46",
		hint31:"TXT_TUTO_46A",
		hint32:"TXT_TUTO_46B",
		hint33:"TXT_TUTO_46C",
		hintDelay: 1,
		hintDuration: 1.5,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"tom\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_45_UNLOCK_WHEEL,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_wheel",
		animLoop:false,
		topText:"TXT_TUTO_47",
		hint31:"TXT_TUTO_47A",
		hint32:"TXT_TUTO_47B",
		hint33:"TXT_TUTO_47C",
		hintDelay: 0.5,
		hintDuration: 0.75,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"wheel\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_46_UNLOCK_CHEST,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_chest",
		animLoop:false,
		topText:"TXT_TUTO_48",
		hint31:"TXT_TUTO_48A",
		hint32:"TXT_TUTO_48B",
		hint33:"TXT_TUTO_48C",
		hintDelay: 0.5,
		hintDuration: 0.75,
		skipButton:true,

		// fix: step 5201 is not finished because it is interrupted by step 4600
		//startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"chest\"",
		
		// jira#5991
		//startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_52B_GACHA_TOUCH",
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"chest\"",
		
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_47_UNLOCK_MINE,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_miner",
		animLoop:false,
		topText:"TXT_TUTO_49",
		hint31:"TXT_TUTO_49A",
		hint32:"TXT_TUTO_49B",
		hint33:"TXT_TUTO_49C",
		hintDelay: 0.5,
		hintDuration: 0.75,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"mine\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_48_UNLOCK_SMITH,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_craft_pot",
		animLoop:false,
		topText:"TXT_TUTO_50",
		hint31:"TXT_TUTO_50A",
		hint32:"TXT_TUTO_50B",
		hint33:"TXT_TUTO_50C",
		hintDelay: 1,
		hintDuration: 1.5,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"smith\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_49_UNLOCK_DICE,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_dice",
		animLoop:false,
		topText:"TXT_TUTO_51",
		hint31:"TXT_TUTO_51A",
		hint32:"TXT_TUTO_51B",
		hint33:"TXT_TUTO_51C",
		hintDelay: 0.5,
		hintDuration: 0.75,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"dice\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},
	{
		id:TUTO_STEP_55_UNLOCK_TRUCK,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_oxcart",
		animLoop:false,
		topText:"TXT_TUTO_55",
		hint31:"TXT_TUTO_55A",
		hint32:"TXT_TUTO_55B",
		hint33:"TXT_TUTO_55C",
		hintDelay: 1,
		hintDuration: 1.5,
		skipButton:true,
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"truck\"",
		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		saveOnFinish:true,
	},

	{
		id:TUTO_STEP_51_SKIN_HINT,
		type:TUTO_TYPE_HINT,
		spine:SPINE_HUD_TUTORIAL_2,
		anim:"tutorial_cloud_skin",
		animLoop:false,
		topText:"TXT_TUTO_53A",
		hint31:"TXT_TUTO_53B",
		hint32:"TXT_TUTO_53C",
		hint33:"TXT_TUTO_53D",
		hintDelay: 1,
		hintDuration: 1.5,
		skipButton:true,

		// jira#5956
		//startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP && gv.userData.getLevel() === g_MISCINFO.CLOUD_SKIN_USER_LEVEL",
		startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) && gv.userData.getLevel() === g_MISCINFO.CLOUD_SKIN_USER_LEVEL && !Game.isAnyPopupShowing()",

		endCondition:"event === EVT_TOUCH_END && param0 === \"hintSkipButton\"",
		skipCondition:"gv.userData.getLevel() > g_MISCINFO.CLOUD_SKIN_USER_LEVEL",
		skipSteps:[TUTO_STEP_51_SKIN_HINT, TUTO_STEP_51B_TOUCH_CLOUD],
		requireFloor:0,
		delay:1,
		startAction:function() {if(CloudFloors.currentFloorNum == 0) {CloudFloors.showFloorNum(-1);CloudFloors.showFloorNum(0);CloudFloors.showFloorNum(1);}},
	},
	{
		id:TUTO_STEP_51B_TOUCH_CLOUD,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["skinSelect"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_51_SKIN_HINT",
		endCondition:"event === EVT_TOUCH_END && param0 === \"skinSelect\"",
		saveOnFinish:true,
	},

	// feedback: skip ship's appear animation
	/*{
		id:TUTO_STEP_52_GACHA,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_NONE,
		requireFloor:-1,
		acceptInput:[""],
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP && gv.userData.getLevel() === g_MISCINFO.GACHA_USER_LEVEL",
		endCondition:"event === EVT_GACHA_SHIP_ARRIVED",
		skipCondition:"event === EVT_START_GAME && gv.userData.getLevel() >= g_MISCINFO.GACHA_USER_LEVEL",
		skipSteps:[TUTO_STEP_52_GACHA, TUTO_STEP_52B_GACHA_TOUCH, TUTO_STEP_46_UNLOCK_CHEST],
	},
	{
		id:TUTO_STEP_52B_GACHA_TOUCH,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["bgChest"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_52_GACHA",
		endCondition:"event === EVT_TOUCH_END && param0 === \"bgChest\"",
	}*/
	// jira#5991
	/*{
		id:TUTO_STEP_52B_GACHA_TOUCH,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		requireFloor:-1,
		acceptInput:["bgChest"],
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP && gv.userData.getLevel() === g_MISCINFO.GACHA_USER_LEVEL",
		endCondition:"event === EVT_TOUCH_END && param0 === \"bgChest\"",
		skipCondition:"event === EVT_START_GAME && gv.userData.getLevel() >= g_MISCINFO.GACHA_USER_LEVEL",
		skipSteps:[TUTO_STEP_52B_GACHA_TOUCH, TUTO_STEP_46_UNLOCK_CHEST],
	}*/
	{
		id:TUTO_STEP_55_GUILD,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_TOM",
		avatar:"npc/npc_jack_04.png",
		text:"TXT_GUILD_TUTORIAL_55",
		requireFloor:-1,
		delay: 1,
		
		// jira#6750
		//startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_LEVEL_UP && gv.userData.getLevel() === g_MISCINFO.GUILD_USER_LEVEL && !Game.isAnyPopupShowing()",
		startCondition:"event === EVT_HIDE_WIDGET && gv.userData.getLevel() === g_MISCINFO.GUILD_USER_LEVEL && !Game.isAnyPopupShowing()",
		
		endCondition:"event === EVT_TOUCH_END",
		skipCondition:"(event === EVT_START_GAME && gv.userData.getLevel() >= g_MISCINFO.GUILD_USER_LEVEL)",
		skipSteps:[TUTO_STEP_55_GUILD],
		saveOnFinish:true,
		finishAction:function()
			{
				var pos = gv.background.animGuild.getWorldPosition();
				pos.y += 50;
				Game.gameScene.showFocusPointer("guild", pos.x, pos.y, true, Z_UI_COMMON - 1, 3);
			},
	},
	{
		id:TUTO_STEP_55B_GUILD_FRIENDLIST,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_06",
		avatar:"npc/npc_puss_in_boots_bg.png",
		text:"TXT_GUILD_TUTORIAL_55B",
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_GUILD && Guild.playerGuildData && Guild.playerGuildData[GUILD_USER_ROLE] === GUILD_ROLE_PRESIDENT && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true,
		finishAction:function()
			{
				var btnFriendlist = FWUI.getChildByName(Game.gameScene.uiMain, "btnFriendlist");
				var pos = FWUtils.getWorldPosition(btnFriendlist);
				pos.y += 20;
				Game.gameScene.showFocusPointer("guild", pos.x, pos.y, true, Z_UI_COMMON - 1, 3);
			},
	},
	{
		id:TUTO_STEP_55C_GUILD_INVITE,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_06",
		avatar:"npc/npc_puss_in_boots_bg.png",
		text:"TXT_GUILD_TUTORIAL_55C",
		startCondition:"event === EVT_START_GAME && Game.isFriendGarden() && gv.userData.userId !== USER_ID_JACK && Guild.playerGuildData && Guild.playerGuildData[GUILD_USER_ROLE] === GUILD_ROLE_PRESIDENT && !Game.isAnyPopupShowing()",
		endCondition:"event === EVT_TOUCH_END",
		saveOnFinish:true,
		finishAction:function()
			{
				var btnFriendGuild = FWUI.getChildByName(Game.gameScene.uiMain, "btnFriendGuild");
				var pos = FWUtils.getWorldPosition(btnFriendGuild);
				pos.y += 20;
				Game.gameScene.showFocusPointer("guild", pos.x, pos.y, true, Z_UI_COMMON - 1, 3);
			},
	},
	{
		id:TUTO_STEP_56_FISHING_INTRODUCE_1,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_12",
		avatar:"npc/npc_wolf_fishing_tut_01.png",
		text:"TXT_FISHING_TUTORIAL_56_INTRODUCE_1",
		startCondition:"event === EVT_UNLOCK_FEATURE && param0 === \"fishing\"",
		endCondition:"event === EVT_TOUCH_END",
	},
	{
		id:TUTO_STEP_56_FISHING_INTRODUCE_2,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_12",
		avatar:"npc/npc_wolf_fishing_tut_02.png",
		text:"TXT_FISHING_TUTORIAL_56_INTRODUCE_2",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_INTRODUCE_1",
		endCondition:"event === EVT_TOUCH_END",
	},
	{
		id:TUTO_STEP_56_FISHING_SELECT_HOOK,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["item"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_INTRODUCE_2",
		endCondition:"event === EVT_REFRESH_LISTHOOK && param0 === FISHING_HOOK_TUTO",
		finishAction:function() {GameEventTemplate3.showListSentence();},
	},
	{
		id:TUTO_STEP_56_FISHING_INTRODUCE_3,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_12",
		avatar:"npc/npc_wolf_fishing_tut_01.png",
		text:"TXT_FISHING_TUTORIAL_56_INTRODUCE_3",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_SELECT_HOOK",
		endCondition:"event === EVT_TOUCH_END",
		finishAction:function() {GameEventTemplate3.canUpdate = true;},
	},
	{
		id:TUTO_STEP_56_FISHING_CLICK_1,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["btnFishingActive"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_INTRODUCE_3",
		endCondition:"event === EVT_CLICK_BTN_FISHING",
	},
	{
		id:TUTO_STEP_56_FISHING_INTRODUCE_4,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_12",
		avatar:"npc/npc_wolf_fishing_tut_02.png",
		text:"TXT_FISHING_TUTORIAL_56_INTRODUCE_4",
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_CLICK_1",
		endCondition:"event === EVT_TOUCH_END",
		finishAction:function() {GameEventTemplate3.canUpdate = true; GameEventTemplate3.imgPos.setPosition(GameEventTemplate3.imgPos.getPositionX(),(EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN)/1.5); GameEventTemplate3.isRun =false;},
	},
	{
		id:TUTO_STEP_56_FISHING_CLICK_2,
		type:TUTO_TYPE_CUSTOM,
		darkBg:DARKBG_FOCUS,
		acceptInput:["btnFishingActive"],
		startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_INTRODUCE_4",
		endCondition:"event === EVT_CLICK_BTN_FISHING2",
	},
	{
		id:TUTO_STEP_56_FISHING_INTRODUCE_5,
		type:TUTO_TYPE_DIALOG,
		name:"TXT_NPC_12",
		avatar:"npc/npc_wolf_fishing_tut_02.png",
		text:"TXT_FISHING_TUTORIAL_56_INTRODUCE_5",
		startCondition:"event === EVT_HIDE_WIDGET && param0 === UI_EVENT3_RESULT_FISHING",
		endCondition:"event === EVT_TOUCH_END",
		finishAction:function() {GameEventTemplate3.endTutorial();},
		saveOnFinish:true,
	},
	//{
	//	id:TUTO_STEP_56_FISHING_DROP_HOOK,
	//	type:TUTO_TYPE_CUSTOM,
	//	darkBg:DARKBG_FOCUS,
	//	acceptInput:["panelFish"],
	//	startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_56_FISHING_SELECT_HOOK",
	//	endCondition:"event === EVT_TOUCH_END && param0 === \"panelFish\"",
    //
	//},
];

var Tutorial =
{
	savedData:
	{
		isFinished: false,
		finishedStepIds: [],
		version: TUTO_VERSION,
		flow: 0,
	},
	currentStep: null,
	remainSteps: [],
	darkBg: DARKBG_NONE,
	darkBgFocus: null,
	widget: null,
	isInitialized: false,
	//bugFloorIdx: 0,
	//bugSlotIdx: 0,
	currentWidget: null,
	currentFloorIdx: null,
	scrollHintAnim: null,
	owl: null,
	letter: null,
	//pauseOwl: false,
	isInit: false,
	
	init:function()
	{
		this.isInit = true;
		
		// additional feature tutorials
		/*if(ENABLE_QUEST_BOOK)
		{
			TUTO_STEPS.push(
			{
				id:TUTO_STEP_35N5_GANDALF,
				type:TUTO_TYPE_DIALOG,
				name:"TXT_NPC_GANDALF",
				avatar:"npc/npc_gandalf.png",
				text:"TXT_TUTO_35N5",
				rightAvatar: true,
				delay:1,
				startAction:function() {Game.gameScene.showDynamicButton(true);QuestBook.refresh();var button = Game.gameScene.getDynamicButtonById("questBook");Tutorial.currentStep.focus = FWUtils.getWorldPosition(button);},
				startCondition:"(event === EVT_HIDE_WIDGET || event === EVT_START_GAME) && gv.userData.getLevel() === g_MISCINFO.QUEST_BOOK_USER_LEVEL && !Game.isAnyPopupShowing()",
				endCondition:"event === EVT_TOUCH_END",
				skipCondition:"gv.userData.getLevel() > g_MISCINFO.QUEST_BOOK_USER_LEVEL || Tutorial.isStepFinished(TUTO_STEP_35N4_QUEST_BOOK)",
				skipSteps:[TUTO_STEP_35N4_QUEST_BOOK, TUTO_STEP_35N5_GANDALF],
			},
			{
				id:TUTO_STEP_35N4_QUEST_BOOK,
				type:TUTO_TYPE_CUSTOM,
				darkBg:DARKBG_FOCUS,
				acceptInput:["homeButton"],
				startCondition:"event === EVT_FINISH_TUTO_STEP && param0 === TUTO_STEP_35N5_GANDALF",
				endCondition:"event === EVT_TOUCH_END && param0 === \"homeButton\" && param1 && param1.uiData && param1.uiData.id === \"questBook\"",
				saveOnFinish:true,
			}
			);
		}*/

		
		// test, TODO: remove
		//cc.sys.localStorage.removeItem("tutorial");
		
		// load
		var savedData = (TUTO_SAVE_LOCAL ? cc.sys.localStorage.getItem("tutorial") : gv.userData.game[GAME_TUTORIAL]);
		if(savedData)
		{
			cc.log("Tutorial::load: " + savedData);
			savedData = JSON.parse(savedData);
			if(savedData)
				this.savedData = savedData;

			if(!this.savedData.flow) this.savedData.flow = TUTO_FLOW_OLD;

			if(this.savedData.version !== TUTO_VERSION)
			{
				// skip old tutorial
				this.savedData.isFinished = true;
				this.savedData.version = TUTO_VERSION;
				this.save();
			}
		}
		else {
			var flowTuto = this.getFlowTutorial();
			cc.log("flowTuto",flowTuto);
			if(!this.savedData.flow) this.savedData.flow = flowTuto;
		}


		if(this.savedData.flow == TUTO_FLOW_OLD)
		{
			TUTO_STEPS = TUTO_STEPS_FLOW_1;

		}
		else if(this.savedData.flow == TUTO_FLOW_NEW)
		{
			TUTO_STEPS = TUTO_STEPS_FLOW_2;
			TUTO_LAST_MAIN_STEP=TUTO2_STEP_13_DROP_POT2;
		}

		for(var i=0;i<TUTO_STEPS_GENERAL.length;i++)
		{
			TUTO_STEPS.push(TUTO_STEPS_GENERAL[i]);
		}

		// test, TODO: remove
		//this.savedData.finishedStepIds = [0,100,200,300,400,500,501,600,700,800,801,802,900,1000,1100,1101,1200,1300,1301,1302,1400,1401,1500,1600,1601,1700,1800,1900,2000,2100,2200,2300,2400,2500,2501,2600,2700,2701,2702,2800,2801,2802,2803,2900,2901,2902,3000,3100,3200,3300,3301,3302,3303,3400,3500,3600,3700,3800,3900,3901,3902];
		//this.savedData.finishedStepIds = [0,100,200,300,400,500,501,600,700,800,801,802,900,1000,1100,1101,1200,1300,1301,1302,1400,1401,1500,1600,1601,1700,1800,1900,2000,2100,2200,2300,2400,2500,2501,2600,2700,2701,2702,2800,2801,2802,2803,2900,2901,2902,3000,3100,3200,3300,3301,3302,3303,3400,3500,3600,3700,3800,3900,3901,3902];
		//this.savedData.isFinished = false;
		
		if(this.isFinished())
			return;
		
		// remain steps
		this.remainSteps = [];
		for(var i=0; i<TUTO_STEPS.length; i++)
		{
			var step = TUTO_STEPS[i];
			if(this.savedData.finishedStepIds.indexOf(step.id) < 0)
				this.remainSteps.push(step);
		}
		
		 // unknown error, skip main tutorial
		if(gv.userData.getLevel() > 1 && this.savedData.finishedStepIds.length <= 0)
			this.skipMainTutorial();
			
		// jira#5791
		// error from previous version, skip main tutorial
		if(!this.isStepFinished(TUTO_STEP_13C_TOUCH_MACHINE) && gv.userData.getLevel() >= 3)
			this.skipMainTutorial();
		
		// unknown error, skip main tutorial
		if(gv.userData.getLevel() >= g_MISCINFO.OFFER_NEWBIE_LEVEL)//if(gv.userData.getLevel() >= g_MISCINFO.OFFER_NEWBIE_LEVEL && this.savedData.finishedStepIds.indexOf(TUTO_STEP_35_FULL_HINT) < 0)//if(gv.userData.getLevel() >= g_MISCINFO.OFFER_NEWBIE_LEVEL && !Tutorial.isMainTutorialFinished())
			this.skipMainTutorial();
		
		this.currentFloorIdx = -1;
	},
	getFlowTutorial:function(){
		// feedback: new flow
		/*switch (COUNTRY){
			//case COUNTRY_VIETNAM:{
			//	return TUTO_FLOW_OLD;
			//	break;
			//}
			//case COUNTRY_MYANMAR:
			//case COUNTRY_THAILAND:
			//case COUNTRY_PHILIPPINE:
			//	//return Math.random() >= 0.5 ? 1:2;

		}*/
		return TUTO_FLOW_NEW;
	},
	init2:function()
	{
		this.isInitialized = true;		
		
		// unknown error, skip main tutorial
		if(gv.userData.getLevel() >= 3 && gv.userMachine && gv.userMachine.getMachineByFloor(0) && gv.userMachine.getMachineByFloor(0).state < MACHINE_STATE_READY)
			this.skipMainTutorial();
		
		// trigger
		for(var i=0; i<this.savedData.finishedStepIds.length; i++)
		{
			if(this.onGameEvent(EVT_FINISH_TUTO_STEP, this.savedData.finishedStepIds[i]))
				break;
		}
		
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0.25, cc.REPEAT_FOREVER, 0, false);
	},

	initInGameScene:function()
	{
		if (!this.isInit)
			this.init();
		if(this.isFinished())
			return;

		this.scrollHintAnim = FWPool.getNode(SPINE_HUD_TUTORIAL_1);
		this.scrollHintAnim.setAnimation(0, "tutorial_scroll", true);
		this.scrollHintAnim.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
		this.scrollHintAnim.setLocalZOrder(Z_UI_TUTORIAL);
	},
	
	uninit:function()
	{
		this.isInit = false;
		this.isInitialized = false;
		// jira#5440
		this.savedData =
		{
			isFinished: false,
			finishedStepIds: [],
		};
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
	},
	
	update:function(dt)
	{
		// dark bg
		var darkBg = (this.currentStep && this.currentStep.delay <= 0 ? this.currentStep.darkBg : DARKBG_NONE);
		
		if(darkBg !== this.darkBg || (darkBg === DARKBG_FOCUS && this.darkBgFocus != this.currentStep.focus))
		{
			if(this.darkBg !== DARKBG_NONE)
			{
				FWUtils.hideDarkBg(null, "darkBgTutorial" + this.darkBg);
				Game.gameScene.showFocusPointer("tutor", false);
			}
				
			if(darkBg !== DARKBG_NONE)
			{
				this.darkBgFocus = this.currentStep.focus;
				if(darkBg === DARKBG_FOCUS)
				{
					if(this.darkBgFocus)
					{
						if(this.darkBgFocus.x2 !== undefined)
							Game.gameScene.showFocusPointer2("tutor", this.darkBgFocus.x, this.darkBgFocus.y, this.darkBgFocus.x2, this.darkBgFocus.y2);
						else
							Game.gameScene.showFocusPointer("tutor", this.darkBgFocus.x, this.darkBgFocus.y);
					}
				}
				else
					FWUtils.showDarkBg(null, this.currentStep.zDarkBg ? this.currentStep.zDarkBg : Z_UI_TUTORIAL - 1, "darkBgTutorial" + darkBg, DARKBG_ALPHA_TUTORIAL, false/*darkBg === DARKBG_LINES*/, true, this.currentStep.focus, this.currentStep.focusScale);
			}
			this.darkBg = darkBg;
		}
	},
	
	isFinished:function()
	{
		return (this.savedData.isFinished);
	},

	isStepFinished:function(stepId)
	{
		if(this.isFinished())
			return true;
		
		for(var i=0; i<this.remainSteps.length; i++)
			if(this.remainSteps[i].id === stepId)
				return false;
		return true;
	},
	
	isMainTutorialFinished:function()
	{
		//return this.isStepFinished(TUTO_STEP_35_FULL_HINT);
		return this.isStepFinished(TUTO_LAST_MAIN_STEP);
	},
	
	skipMainTutorial:function()
	{
		cc.log("Tutorial::skipMainTutorial");
		var save = false;
		for(var i=0; i<TUTO_STEPS.length; i++)
		{
			var step = TUTO_STEPS[i];
			// new tutor
			//if(step.id < TUTO_STEP_43_UNLOCK_AIRSHIP)
			//if(step.id < TUTO_STEP_38_PS_HINT)
			if(step.id <= TUTO_LAST_MAIN_STEP)
			{
				if(this.savedData.finishedStepIds.indexOf(step.id) < 0)
				{
					this.savedData.finishedStepIds.push(step.id);
					save = true;
				}
				
				save = (FWUtils.removeArrayElement(this.remainSteps, step) || save);
			}
		}
		
		if(save)
			this.save();
	},
	
	isRunning:function()
	{
		if(this.currentStep)
			return true;
		
		if(this.isStepFinished(TUTO_STEP_13C_TOUCH_MACHINE) && !this.isStepFinished(TUTO_STEP_14_SKIP_TIME_MACHINE))
			return true;
		if(this.isStepFinished(TUTO_STEP_13_JACK) && !this.isStepFinished(TUTO_STEP_13B_UNLOCK_MACHINE))
			return true;

		if(this.isStepFinished(TUTO2_STEP_8_MACHINE) && !this.isStepFinished(TUTO2_STEP_8_MACHINE4) && gv.userData.getLevel() < g_MISCINFO.OFFER_NEWBIE_LEVEL)
			return true;


		return (this.currentStep !== null);
	},
	
	onGameEventWithDelay:function(event, delay, param0, param1, param2)
	{
		if(this.isFinished())
			return false;
		
		if(delay === 0)
			return Tutorial.onGameEvent(event, param0, param1, param2);
		
		cc.director.getScheduler().scheduleCallbackForTarget(Tutorial, function() {Tutorial.onGameEvent(event, param0, param1, param2);}, 0, 0, delay || 1, false);
	},
	
	onGameEvent:function(event, param0, param1, param2)
	{
		// uncomment to disable tutorial
		//if(true)
		//	return;
		
		if(this.isFinished() || !this.isInitialized || this.isSkippingTutorialProgress)
			return false;
		
		cc.log("Tutorial::onGameEvent: event=" + event + " param0=" + param0 + " param1=" + param1 + " param2=" + param2);
		if(!cc.sys.isNative)
			eval("var event = arguments[0]; var param0 = arguments[1]; var param1 = arguments[2]; var param2 = arguments[3];");
		
		// save params to use later
		if(event === EVT_SCROLL_TO_FLOOR)
			this.currentFloorIdx = param0;
		// fix: varables are not set on game restart => hardcode
		//else if(event === EVT_BUG_APPEAR && this.bugFloorIdx === null)
		//{
		//	this.bugFloorIdx = param0;
		//	this.bugSlotIdx = param1;
		//}
		else if(event === EVT_SHOW_WIDGET && param0 !== UI_TUTORIAL  && param0 !== UI_TUTORIAL_NEW)
			this.currentWidget = param1;
		
		var prevStep = this.currentStep;
		if(this.currentStep)
		{
			if(!this.currentStep.isStarted)
			{
				// start delayed step
				if(this.currentStep.delay <= 0)
					this.startStep(this.currentStep);
			}
			else if(this.currentStep.endCondition && eval(this.currentStep.endCondition) === true)
			{
				// finish current step
				this.finishStep(this.currentStep);
				
				if(this.onGameEvent(EVT_FINISH_TUTO_STEP, prevStep.id))
					return true;
			}
			else if(this.currentStep.revertCondition && eval(this.currentStep.revertCondition) === true)
			{
				// revert to a previous step
				var reverToStep = null;
				for(var j=0; j<this.currentStep.revertSteps.length; j++)
				{
					FWUtils.removeArrayElement(this.savedData.finishedStepIds, this.currentStep.revertSteps[j]);
					reverToStep = this.getStepById(this.currentStep.revertSteps[j]);
					this.remainSteps.push(reverToStep);
				}
				this.startStep(reverToStep);
			}
			else if(prevStep.skipCondition && eval(prevStep.skipCondition) === true)
			{
				// skip current step
				for(var j=0; j<prevStep.skipSteps.length; j++)
					this.finishStepById(prevStep.skipSteps[j]);
				return this.onGameEvent(EVT_FINISH_TUTO_STEP, prevStep.skipSteps[prevStep.skipSteps.length - 1]);
			}
		}
		
		// check to skip steps
		for(var i=0; i<this.remainSteps.length; i++)
		{
			var step = this.remainSteps[i];
			if(step.skipCondition && eval(step.skipCondition) === true)
			{
				for(var j=0; j<step.skipSteps.length; j++)
					this.finishStepById(step.skipSteps[j]);
				return this.onGameEvent(EVT_FINISH_TUTO_STEP, step.skipSteps[step.skipSteps.length - 1]);
			}
		}
		
		// check for next step
		var uiDef = null;
		for(var i=0; i<this.remainSteps.length; i++)
		{
			var step = this.remainSteps[i];
			if(eval(step.startCondition) === true)
			{
				// start current step
				if(!step.delay)
					this.startStep(step);
				else
				{
					this.currentStep = step;
					FWUtils.disableAllTouchesByDuration(step.delay + 0.25);
					cc.director.getScheduler().scheduleCallbackForTarget(Tutorial, function() {Tutorial.startStep(step);}, 0, 0, step.delay, false);
				}
				
				return true;
			}
		}
		
		return false;
	},
	
	canStartStep:function(step)
	{
		// check floor
		var requireFloor = step.requireFloor;
		if(requireFloor === "lockedFloor")
			requireFloor = CloudFloors.getLastUnlockedFloorIdx();
		if(requireFloor !== undefined && requireFloor !== this.currentFloorIdx)
		{
			if(step.id === TUTO_STEP_02_SCROLL_DOWN)
			{
				if(this.scrollHintAnim.getParent() === null)
				{
					FWUtils.getCurrentScene().addChild(this.scrollHintAnim);
					this.scrollHintAnim.setAnimation(0, requireFloor > this.currentFloorIdx ? "tutorial_scroll" : "tutorial_scroll_up", true);
				}
			}
			else
			{
				FWObjectManager.updateVisibility_showAll();
				gv.background.snapFloor(requireFloor, BG_FLOOR_BASE_INDEX);
			}
			return false;
		}
		else if(this.scrollHintAnim.getParent() !== null)
			this.scrollHintAnim.removeFromParent();
		
		return true;
	},
	
	startStep:function(step)
	{
		this.currentStep = step;
		FWUtils.disableAllTouchesByDuration(0.25);
		step.delay = 0;
		
		if(!this.canStartStep(step))
		{
			step.isStarted = false;
			return false;
		}
		
		cc.log("Tutorial::startStep: " + step.id);
		
		// log
		// feedback: prevent sending logs continuously
		if(Tutorial.tutorialLastLoggedStep === step.id)
			Tutorial.tutorialLastLoggedStepCount++;
		else
		{
			Tutorial.tutorialLastLoggedStep = step.id;
			Tutorial.tutorialLastLoggedStepCount = 0;
		}
		if(Tutorial.tutorialLastLoggedStepCount < 3)
		{
			var pk = network.connector.client.getOutPacket(Tutorial.RequestTutorialStep);
			pk.pack(step.id,this.savedData.flow);
			network.connector.client.sendPacket(pk);
		}

		if(step.type === TUTO_TYPE_NEWTUTO)
		{
			this.startNewTutoStep(step);
			var bubble = FWUtils.getChildByName(this.widget, "bubble2");
			bubble.setPosition(step.bubblePos ? step.bubblePos : cc.p(0, 0));
		}
		else if(step.type === TUTO_TYPE_CUSTOM)
			this.startCustomStep(step);
		else
		{
			this.widget = FWUI.showWithData(UI_TUTORIAL, null, this.getStepUiDef(step), FWUtils.getCurrentScene(), UIFX_FADE);
			this.widget.setLocalZOrder(step.zOrder? step.zOrder:Z_UI_TUTORIAL);
			this.widget.setTouchEnabled(step.blockTouch === false ? false : true);
			
			if(step.type === TUTO_TYPE_BUBBLE)
			{
				var bubble = FWUtils.getChildByName(this.widget, "bubble2");
				bubble.setPosition(step.bubblePos ? step.bubblePos : cc.p(0, 0));
			}
			if(step.type === TUTO_TYPE_DIALOG)
				FWUtils.disableAllTouchesByDuration(0.5);
			
			// jira#5863
			//// jira#5428
			//var spineParent = FWUtils.getChildByName(this.widget, "hints");
			//var spine = spineParent.getChildByTag(UI_FILL_DATA_TAG);
			//if(spine)
			//{
			//	spine.setCompleteListener(function() {
			//		var hintSkipButton = FWUtils.getChildByName(this.widget, "hintSkipButton");
			//		hintSkipButton.setVisible(this.currentStep.skipButton === true);
			//	}.bind(this));
			//}
		}
		
		// feedback: blink fx for skip button
		if(this.widget)
		{
			var hintSkipButton = FWUtils.getChildByName(this.widget, "hintSkipButton");
			if(hintSkipButton && hintSkipButton.isVisible())
			{
				hintSkipButton.stopAllActions();
				hintSkipButton.setScale(1);
				hintSkipButton.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.5, 1.1), cc.scaleTo(0.5, 1))));
			}
		}
		
		if(step.darkBg === DARKBG_FOCUS)
		{
			// focus pos
			step.darkBg = DARKBG_FOCUS;
			//if(step.id === TUTO_STEP_05_HARVEST || step.id === TUTO_STEP_08_PLANT)
			//{
			//	step.focus = CloudFloors.slots[0][0].getWorldPosition();
			//	step.focus.y += 50;
			//}
			if(step.id === TUTO_STEP_05_HARVEST)
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(CloudFloors.slots[0][i].slotData[SLOT_PLANT])
					{
						step.focus = CloudFloors.slots[0][i].getWorldPosition();	
						step.focus.y += 50;
						break;
					}
				}
			}
			else if(step.id === TUTO_STEP_08_PLANT)
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(CloudFloors.slots[0][i].slotData[SLOT_POT] && !CloudFloors.slots[0][i].slotData[SLOT_PLANT])
					{
						step.focus = CloudFloors.slots[0][i].getWorldPosition();	
						step.focus.y += 50;
						break;
					}
				}
			}
			else if(step.id === TUTO_STEP_09_RED || step.id === TUTO_STEP_11_BUG)
			{
				// fix: tutorial stucks if bug is not on the first plant
				//step.focus = CloudFloors.slots[this.bugFloorIdx][this.bugSlotIdx].getWorldPosition();
				//step.focus.y += 50;
				
				step.focus = cc.p(0, 0);
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					var slot = CloudFloors.slots[0][i];
					if(slot && slot.slotData && slot.hasBug())
					{
						step.focus = slot.getWorldPosition();
						step.focus.y += 50;
						break;
					}
				}
			}
			else if(step.id === TUTO_STEP_13_JACK || step.id === TUTO_STEP_13C_TOUCH_MACHINE || step.id === TUTO_STEP_14B_TOUCH_MACHINE || step.id === TUTO_STEP_15_JACK || step.id === TUTO_STEP_16B_TOUCH_MACHINE)
			{
				var widget = CloudFloors.firstFloorMarker.getChildByTag(0);
				var machineMarker = FWUtils.getChildByName(widget, "machine");
				step.focus = FWUtils.getWorldPosition(machineMarker);
				step.focus.y += 60;
			}
			else if(step.id === TUTO_STEP_13B_UNLOCK_MACHINE)
			{
				var buttonUnlock = FWUtils.getChildByName(this.currentWidget, "buttonUnlock");
				step.focus = FWUtils.getWorldPosition(buttonUnlock);
			}
			else if(step.id === TUTO_STEP_14_SKIP_TIME_MACHINE)
			{
				var btnSkipCoin = FWUtils.getChildByName(this.currentWidget, "btnSkipCoin");
				step.focus = FWUtils.getWorldPosition(btnSkipCoin);
			}
			else if(step.id === TUTO_STEP_17_PRODUCE)
			{
				var panelProductItems = FWUtils.getChildByName(this.currentWidget, "panelProductItems");
				var item = panelProductItems.getChildren()[0];
				step.focus = FWUtils.getWorldPosition(item);
				step.focus.x2 = step.focus.x - 75;
				step.focus.y2 = step.focus.y - 140;
				
				// new tutor
				// jira#5525
				// step.focus.x -= 60;
				// step.focus.y -= 60;
				// step.focusScale = 18;
			}
			else if(step.id === TUTO_STEP_18_SKIP_TIME_PRODUCE)
			{
				var buttonSkip = FWUtils.getChildByName(this.currentWidget, "buttonSkip");
				step.focus = FWUtils.getWorldPosition(buttonSkip);
			}
			else if(step.id === TUTO_STEP_19_COLLECT)
			{
				var widget = CloudFloors.firstFloorMarker.getChildByTag(0);
				var machineMarker = FWUtils.getChildByName(widget, "machine");
				step.focus = FWUtils.getWorldPosition(machineMarker);
			}
			else if(step.id === TUTO_STEP_23_ORDER_HINT)
				step.focus = FWUtils.getWorldPosition(Game.gameScene.uiMainBtnOrder);
			else if(step.id === TUTO_STEP_24_ORDER)
			{
				var widget = FWPool.getNode(UI_ORDER, false);
				var btnDeliver = FWUtils.getChildByName(widget, "btnDeliver");
				step.focus = FWUtils.getWorldPosition(btnDeliver);
			}

			else if(step.id === TUTO2_STEP_10_LETTER5)
			{
				var widget = FWPool.getNode(UI_ORDER, false);
				var btnDeliver = FWUtils.getChildByName(widget, "btnDeliver");
				step.focus = FWUtils.getWorldPosition(btnDeliver);
			}
			else if(step.id === TUTO_STEP_27B_TOUCH_CLOUD)
			{
				var widget = CloudFloors.firstFloorMarker.getChildByTag(CloudFloors.getLastUnlockedFloorIdx() + 1);
				step.focus = FWUtils.getWorldPosition(widget);
				step.focus.y += 60;
			}
			else if(step.id === TUTO_STEP_27C_UNLOCK_CLOUD)
			{
				var widget = FWPool.getNode(UI_UNLOCK_FLOOR, false);
				var unlockButton = FWUtils.getChildByName(widget, "unlockButton");
				step.focus = FWUtils.getWorldPosition(unlockButton);
			}
			// new tutor
			//else if(step.id === TUTO_STEP_28B_TOUCH_SLOT || step.id === TUTO_STEP_29B_TOUCH_SLOT)
			else if(step.id === TUTO_STEP_29B_TOUCH_SLOT)
			{
				//step.focus = CloudFloors.slots[1][0].getWorldPosition();
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(!CloudFloors.slots[1][i].slotData[SLOT_POT])
					{
						step.focus = CloudFloors.slots[1][i].getWorldPosition();
						break;
					}
				}
			}
			// new tutor
			/*else if(step.id === TUTO_STEP_28C_TOUCH_PLUS_BUTTON)
			{
				var widget = FWPool.getNode(UI_POT_MENU, false);
				var items = FWUtils.getChildByName(widget, "items");
				var item = null;
				var children = items.getChildren();
				for(var i=0; i<children.length; i++)
				{
					if(children[i].uiData && children[i].uiData.itemId === "P0")
					{
						item = children[i];
						break;
					}
				}
				//var buyButton = FWUtils.getChildByName(item, "buyButton");
				//step.focus = FWUtils.getWorldPosition(buyButton);
				step.focus = FWUtils.getWorldPosition(item);
			}
			else if(step.id === TUTO_STEP_28D_BUY_POT)
			{
				var listItems = gv.ibshop.popupMain.mapTabIndex[1].tabList.getItems();
				var widget = listItems[1];
				var buttonBuy = FWUtils.getChildByName(widget, "buttonBuy");
				step.focus = FWUtils.getWorldPosition(buttonBuy);
				step.focus.x = cc.winSize.width - 100; // incorrect pos due to slide fx
			}
			else if(step.id === TUTO_STEP_33B_TOUCH_POT)
			{
				step.focus = CloudFloors.slots[1][0].getWorldPosition();
				step.focus.y += 20;
			}
			else if(step.id === TUTO_STEP_33C_TOUCH_UPGRADE_BUTTON)
			{
				var widget = FWPool.getNode(UI_POT_MENU, false);
				var upgradeButton = FWUtils.getChildByName(widget, "upgradeButton");
				step.focus = FWUtils.getWorldPosition(upgradeButton);
			}
			else if(step.id === TUTO_STEP_33D_UPGRADE)
			{
				var widget = FWPool.getNode(UI_POT_UPGRADE, false);
				var upgradeButton = FWUtils.getChildByName(widget, "upgradeButton");
				step.focus = FWUtils.getWorldPosition(upgradeButton);
			}
			else if(step.id === TUTO_STEP_37_PS_SHOW)
			{
				step.focus = gv.background.animShop.getWorldPosition();
				step.focus.y += 30;
			}
			else if(step.id === TUTO_STEP_39B_TOUCH_NEWSBOARD)
			{
				step.focus = gv.background.animInbox.getWorldPosition();
				step.focus.y += 30;
			}*/
			else if(step.id === TUTO_STEP_54B_TOUCH_DECOR)
				step.focus = CloudFloors.slots[1][0].emptyDecorSlot.getWorldPosition();
			else if(step.id === TUTO_STEP_35N4_QUEST_BOOK)
			{
				var button = Game.gameScene.getDynamicButtonById("questBook");
				step.focus = FWUtils.getWorldPosition(button);
			}
			else if(step.id === TUTO_STEP_53B_QUEST_MISSION)
			{
				var button = Game.gameScene.getDynamicButtonById("questMission");
				step.focus = FWUtils.getWorldPosition(button);
			}
			else if(step.id === TUTO_STEP_51B_TOUCH_CLOUD)
			{
				var button = CloudFloors.firstFloorMarker.getChildByTag(1).getChildByName("skinSelect");
				var pos = FWUtils.getWorldPosition(button);
				pos.x += 40;
				pos.y += 30;
				step.focus = pos;
			}
			else if(step.id === TUTO_STEP_52B_GACHA_TOUCH)
			{
				var pos = FWUtils.getWorldPosition(Game.gameScene.background.animTreasure.node);
				pos.y += 40;
				step.focus = pos;
			}
			else if(step.id === TUTO2_STEP_4_HARVEST2)
			{
				var pos = CloudFloors.slots[0][0].getWorldPosition();
				pos.x -= 100;
				pos.y += 200;
				step.focus = pos;
			}
			else if(step.id === TUTO2_STEP_5_PLANT)
			{
				var pos = CloudFloors.slots[0][0].getWorldPosition();
				cc.log("TUTO2_STEP_5_PLANT","pos",JSON.stringify(pos));
				step.focus = CloudFloors.slots[0][0].getWorldPosition();
				step.focus.y += 50;
			}
			else if(step.id === TUTO2_STEP_6_BUG || step.id === TUTO2_STEP_6_BUG2)
			{
				// fix: tutorial stucks if bug is not on the first plant
				//step.focus = CloudFloors.slots[this.bugFloorIdx][this.bugSlotIdx].getWorldPosition();
				//step.focus.y += 50;
				cc.log("TUTO2_STEP_6_BUG 0","step",step.id,JSON.stringify(step.focus));
				step.focus = cc.p(0, 0);
				//for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++) {
				var slot = CloudFloors.slots[0][0];
				//	//if(slot && slot.slotData && slot.hasBug())
				//	//{
                //
				//	break;
				//	//
				//}
				step.focus = slot.getWorldPosition();
				step.focus.y += 50;

				cc.log("TUTO2_STEP_6_BUG","step",step.id,JSON.stringify(step.focus));
			}
			else if(step.id === TUTO2_STEP_7_POT)
			{
				// fix: tutorial stucks if bug is not on the first plant
				//step.focus = CloudFloors.slots[this.bugFloorIdx][this.bugSlotIdx].getWorldPosition();
				//step.focus.y += 50;

				step.focus = cc.p(0, 0);
				var slot = CloudFloors.slots[0][0];
				step.focus = slot.getWorldPosition();
				step.focus.y += 20;
			}
			else if(step.id ===TUTO2_STEP_7_POT2 )
			{
				// fix: tutorial stucks if bug is not on the first plant
				//step.focus = CloudFloors.slots[this.bugFloorIdx][this.bugSlotIdx].getWorldPosition();
				//step.focus.y += 50;

				step.focus = cc.p(0, 0);
				var slot = CloudFloors.slots[0][0];
				step.focus = slot.getWorldPosition();
				step.focus.y += 140;
			}
			else if(step.id === TUTO2_STEP_7_POT3)
			{
				step.focus = cc.p(568,40);
			}
			else if(step.id === TUTO2_STEP_8_MACHINE ||step.id === TUTO2_STEP_8_MACHINE3||step.id === TUTO2_STEP_8_MACHINE5|| step.id === TUTO2_STEP_9_PRODUCT)
			{
				var widget = CloudFloors.firstFloorMarker.getChildByTag(0);
				var machineMarker = FWUtils.getChildByName(widget, "machine");
				step.focus = FWUtils.getWorldPosition(machineMarker);
				step.focus.y += 60;
			}
			else if(step.id === TUTO2_STEP_8_MACHINE2)
			{
				var buttonUnlock = FWUtils.getChildByName(this.currentWidget, "buttonUnlock");
				step.focus = FWUtils.getWorldPosition(buttonUnlock);
			}
			else if(step.id === TUTO2_STEP_8_MACHINE4)
			{
				var btnSkipCoin = FWUtils.getChildByName(this.currentWidget, "btnSkipCoin");
				step.focus = FWUtils.getWorldPosition(btnSkipCoin);
			}
			else if(step.id === TUTO2_STEP_9_PRODUCT2)
			{
				var panelProductItems = FWUtils.getChildByName(this.currentWidget, "panelProductItems");
				var item = panelProductItems.getChildren()[0];
				step.focus = FWUtils.getWorldPosition(item);
				step.focus.x2 = step.focus.x - 75;
				step.focus.y2 = step.focus.y - 140;

				// new tutor
				// jira#5525
				// step.focus.x -= 60;
				// step.focus.y -= 60;
				// step.focusScale = 18;
			}
			else if(step.id === TUTO2_STEP_9_PRODUCT3)
			{
				var buttonSkip = FWUtils.getChildByName(this.currentWidget, "buttonSkip");
				step.focus = FWUtils.getWorldPosition(buttonSkip);
			}
			else if(step.id === TUTO2_STEP_9_PRODUCT4)
			{
				var widget = CloudFloors.firstFloorMarker.getChildByTag(0);
				var machineMarker = FWUtils.getChildByName(widget, "machine");
				step.focus = FWUtils.getWorldPosition(machineMarker);
			}
			else if(step.id === TUTO2_STEP_10_LETTER4)
			{
				step.focus = FWUtils.getWorldPosition(Game.gameScene.uiMainBtnOrder);
			}
			else if(step.id === TUTO2_STEP_11_QUEST_MISSION2)
			{
				var button = Game.gameScene.getDynamicButtonById("questMission");
				step.focus = FWUtils.getWorldPosition(button);
			}
			else if(step.id === TUTO2_STEP_12_OPEN_CLOUD2)
			{
				var widget = CloudFloors.firstFloorMarker.getChildByTag(CloudFloors.getLastUnlockedFloorIdx() + 1);
				step.focus = FWUtils.getWorldPosition(widget);
				step.focus.y += 60;
			}
			else if(step.id === TUTO2_STEP_12_OPEN_CLOUD3)
			{
				var widget = FWPool.getNode(UI_UNLOCK_FLOOR, false);
				var unlockButton = FWUtils.getChildByName(widget, "unlockButton");
				step.focus = FWUtils.getWorldPosition(unlockButton);
			}
			else if(step.id === TUTO2_STEP_13_DROP_POT)
			{
				//step.focus = CloudFloors.slots[1][0].getWorldPosition();
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(!CloudFloors.slots[1][i].slotData[SLOT_POT])
					{
						step.focus = CloudFloors.slots[1][i].getWorldPosition();
						break;
					}
				}
			}
			else if(step.id === TUTO2_STEP_14_DECOR2)
			{
				step.focus = CloudFloors.slots[1][0].emptyDecorSlot.getWorldPosition();
			}
      else if(step.id === TUTO_STEP_56_FISHING_SELECT_HOOK)
			{
				var pos = cc.p(229,486);
				step.focus = pos;
				step.focus.x2 = 500;
				step.focus.y2 = 300;
			}
			else if(step.id === TUTO_STEP_56_FISHING_CLICK_1)
			{
				var pos = cc.p(887,72);
				step.focus = pos;
			}

		}
		else
			step.darkBg = step.darkBg || (step.type === TUTO_TYPE_BUBBLE ? DARKBG_NORMAL : DARKBG_LINES);
		
		if(step.saveOnStart)
			this.save();
		
		if(step.startAction)
			step.startAction();
		
		step.isStarted = true;
		gv.background.setDisableScrolling(!this.acceptScrolling());
		this.checkProgresOnStepStarts(step);

		return true;
	},
	
	startCustomStep:function(step)
	{
		if(step.id === TUTO_STEP_21_OWL || step.id === TUTO2_STEP_10_LETTER2)
		{
			this.owl = new FWObject();
			this.owl.initWithSpine(SPINE_OWL_TUTU);
			this.owl.setAnimation("tutorial_scroll_drop", false);
			this.owl.setParent(FWUtils.getCurrentScene(), Z_UI_TUTORIAL);
			this.owl.setScale(OWL_SCALE);
			this.owl.setPosition(cc.winSize.width / 2, 60);
			
			this.letter = new FWObject();
			this.letter.initWithSpine(SPINE_OWL_TUTU);
			this.letter.setAnimation("tutorial_scroll_idle", true);
			this.letter.setParent(FWUtils.getCurrentScene(), Z_UI_TUTORIAL);
			this.letter.setScale(OWL_SCALE);
			this.letter.setPosition(this.owl.getPosition());
			this.letter.setEventListener(null, this.onTouchEnded.bind(this));
			this.letter.name = "letter";
			this.letter.setVisible(false);
			this.letter.customBoundingBoxes = cc.rect(-75, -75, 150, 150); // feedback
			
			this.owl.spine.runAction(cc.sequence(
				cc.delayTime(2),
				cc.callFunc(function()
				{
					// new tutor
					//FWUtils.showDarkBg(null, Z_UI_TUTORIAL - 1, "darkBgTutorial", DARKBG_ALPHA, false, true, this.letter.getPosition());
					Game.gameScene.showFocusPointer("tutor", this.letter.getPositionX(), this.letter.getPositionY());
					this.letter.setVisible(true);
					this.owl.uninit();
					this.owl = null;
					if(step.id === TUTO2_STEP_10_LETTER2)
					{
						this.onTouchEnded(null,this.letter);
					}
				}.bind(this))
			));
		}
		else if(step.id === TUTO_STEP_22_LETTER ||step.id === TUTO2_STEP_10_LETTER3 )
		{
			var uiDef =
			{
				dialog:{visible:false},
				hints:{visible:true},
				bubble:{visible:false},
				letter:{visible:false},
				itemList:{visible:false},
				hints3:{visible:false},
				hints4:{visible:false},
				hints5:{visible:false},
				hintSkipButton:{visible:true},
				hintSkipText:{type:UITYPE_TEXT, value:"TXT_TUTO_OK", style:TEXT_STYLE_TEXT_BUTTON},
				letter:{visible:true},
				letterText:{type:UITYPE_TEXT, value:"TXT_TUTO_23A", style:TEXT_STYLE_TEXT_DIALOG},
				letterText2:{type:UITYPE_TEXT, value:"TXT_NPC_03", style:TEXT_STYLE_TEXT_DIALOG},
				hintTop:{visible:false},
				hintBottom:{visible:false},
				hintBottom2:{visible:false},
			};
			
			this.widget = FWUI.showWithData(UI_TUTORIAL, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE);
			this.widget.setLocalZOrder(Z_UI_TUTORIAL);
			this.widget.setTouchEnabled(false);
			
			// new tutor
			//FWUtils.hideDarkBg(null, "darkBgTutorial");
			Game.gameScene.showFocusPointer("tutor", false);
			if (this.letter)
			{
				this.letter.uninit();
				this.letter = null;
			}
			//this.pauseOwl = true;
		}
		else if(step.id === TUTO_STEP_25B_OWL_APPEAR)
		{
			Orders.owl.fwObject.setVisible(true);
			Orders.owl.setState(STATE_OWL_DELIVER, true);
		}
		if(step.id === TUTO2_STEP_4_HARVEST2 ||step.id === TUTO2_STEP_5_PLANT2 ||step.id === TUTO2_STEP_6_BUG3)
		{
			var uiDef =
			{
				dialog:{visible:false},
				hints:{visible:false},
				bubble:{visible:false},
				letter:{visible:false},
				itemList:{visible:false},
				hints3:{visible:false},
				hints4:{visible:false},
				hints5:{visible:false},
				hintSkipButton:{visible:true},
			};

			if(step.anim)
			{
				uiDef.spinePanel = {visible:true, type:UITYPE_SPINE, id:SPINE_TUTOTIAL_NEW, anim:step.anim, loop:step.animLoop !== undefined ? step.animLoop : true};
			}

			this.widget = FWUI.showWithData(UI_TUTORIAL, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE);
			this.widget.setLocalZOrder(Z_UI_TUTORIAL);
			this.widget.setTouchEnabled(false);

		}
	},
	startNewTutoStep:function(step){
		var uiDef =
		{
			bubble:{visible:false},
			itemList:{visible:false},
			spinePanel:{visible:false},
		};

		if(step.rightAvatar)
		{
			uiDef.bubble ={visible:true};
			uiDef.bbLeftAvatarBg = {visible:false};
			uiDef.bbRightAvatarBg = {visible:true, type:UITYPE_IMAGE, value:"npc/nhc_red_bg.png"};
			uiDef.bbRightAvatar = {type:UITYPE_IMAGE, value:step.avatar};
			uiDef.bbTextRight = {type:UITYPE_TEXT, value:step.text, style:TEXT_STYLE_TEXT_DIALOG};
		}
		else if(step.leftAvatar)
		{
			uiDef.bubble ={visible:true};
			uiDef.bbRightAvatarBg = {visible:false};
			uiDef.bbLeftAvatarBg = {visible:true,type:UITYPE_IMAGE, value:"npc/npc_jack_bg.png"};
			uiDef.bbLeftAvatar = {type:UITYPE_IMAGE, value:step.avatar};
			uiDef.bbTextLeft = {type:UITYPE_TEXT, value:step.text, style:TEXT_STYLE_TEXT_DIALOG};
		}


		if(step.anim)
		{
			uiDef.spinePanel = {visible:true, type:UITYPE_SPINE, id:SPINE_TUTOTIAL_NEW, anim:step.anim, loop:step.animLoop !== undefined ? step.animLoop : true};
		}

		this.widget = FWUI.showWithData(UI_TUTORIAL_NEW, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE);
		this.widget.setLocalZOrder(step.zOrder? step.zOrder:Z_UI_TUTORIAL);
		this.widget.setTouchEnabled(step.blockTouch === false ? false : true);


	},
	finishStep:function(step)
	{
		cc.log("Tutorial::finishStep: " + step.id);
		if(!FWUtils.removeArrayElement(this.remainSteps, step))
		{
			// already finished
			cc.log("already finished");
			return;
		}
			
		this.updateUIMainButtons();
		this.savedData.finishedStepIds.push(step.id);
		this.savedData.isFinished = (this.remainSteps.length <= 0);
		if(step.saveOnFinish || this.savedData.isFinished)
			this.save();
		if(step.finishAction)
			step.finishAction();

		if(step === this.currentStep)
		{
			this.currentStep = null;
			FWUtils.disableAllTouchesByDuration(0.25);
			if(this.widget)
			{
				FWUI.hideWidget(this.widget, UIFX_FADE);
				this.widget = null;
			}
			gv.background.setDisableScrolling(false);
		}
		
		// sp
		// new tutor
		//if(step.id === TUTO_STEP_28D_BUY_POT)
		//	gv.ibshop.hidePopup();
		if(step.id === TUTO_STEP_18_SKIP_TIME_PRODUCE)
			cc.director.getScheduler().scheduleCallbackForTarget(Tutorial, function() {if(gv.userMachine.popupMachineProduce) gv.userMachine.popupMachineProduce.hide();}, 0, 0, 0.1, false);
		
		if(step.id === TUTO_LAST_MAIN_STEP)
		{
			// unlock all buttons after finishing main tutorial
			Game.refreshUIMain(RF_UIMAIN_ORDER);
			Game.gameScene.showDynamicButton();
			FriendList.load();
		}

		this.checkProgressOnStepFinishes(step);
	},
	
	finishStepById:function(id)
	{
		for(var i=0; i<TUTO_STEPS.length; i++)
		{
			if(TUTO_STEPS[i].id === id)
			{
				this.finishStep(TUTO_STEPS[i]);
				return;
			}
		}
	},
	
	getStepById:function(id)
	{
		for(var i=0; i<TUTO_STEPS.length; i++)
		{
			if(TUTO_STEPS[i].id === id)
				return TUTO_STEPS[i];
		}
		return null;
	},
	
	getStepUiDef:function(step)
	{
		var type = step.type;
		var uiDef =
		{
			dialog:{visible:false},
			hints:{visible:false},
			bubble:{visible:false},
			letter:{visible:false},
			itemList:{visible:false},
			hints3:{visible:false},
			hints4:{visible:false},
			hints5:{visible:false},
			spinePanel:{visible:false},
		};
		
		if(type === TUTO_TYPE_DIALOG)
		{
			uiDef.dialog = {visible:true};
			uiDef.dlgText = {type:UITYPE_TEXT, value:step.text, style:TEXT_STYLE_TEXT_DIALOG};
			if(step.rightAvatar)
			{
				uiDef.dlgLeftAvatar = {visible:false};
				uiDef.dlgRightAvatar = {visible:true, type:UITYPE_IMAGE, value:step.avatar, scale:cc.p(-1, 1)};
				uiDef.dlgRightName = {type:UITYPE_TEXT, value:step.name, style:TEXT_STYLE_TEXT_NORMAL};
			}
			else
			{
				uiDef.dlgRightAvatar = {visible:false};
				uiDef.dlgLeftAvatar = {visible:true, type:UITYPE_IMAGE, value:step.avatar};
				uiDef.dlgLeftName = {type:UITYPE_TEXT, value:step.name, style:TEXT_STYLE_TEXT_NORMAL};
			}
		}
		else if(type === TUTO_TYPE_HINT)
		{
			uiDef.hints = {visible:true, type:UITYPE_SPINE, id:step.spine, anim:step.anim, loop:step.animLoop !== undefined ? step.animLoop : true};
			if(step.topText)
				uiDef.hintTop = {type:UITYPE_TEXT, value:step.topText, style:TEXT_STYLE_TEXT_NORMAL_GREEN, visible:true};
			else
				uiDef.hintTop = {visible:false};
			if(step.bottomText)
				uiDef.hintBottom = {type:UITYPE_TEXT, value:step.bottomText, style:TEXT_STYLE_TEXT_NORMAL, visible:true};
			else
				uiDef.hintBottom = {visible:false};
			if(step.bottomText2)
				uiDef.hintBottom2 = {type:UITYPE_TEXT, value:step.bottomText2, style:TEXT_STYLE_TEXT_NORMAL, visible:true};
			else
				uiDef.hintBottom2 = {visible:false};
			
			// jira#5863
			//uiDef.hintSkipButton = {visible:false};// jira#5428 {visible:step.skipButton === true};
			uiDef.hintSkipButton = {visible:step.skipButton === true};
			
			uiDef.hintSkipText = {type:UITYPE_TEXT, value:"TXT_TUTO_OK", style:TEXT_STYLE_TEXT_BUTTON};
		}
		else if(type === TUTO_TYPE_BUBBLE)
		{
			uiDef.bubble = {visible:true};
			uiDef.bbText = {type:UITYPE_TEXT, value:step.text, style:TEXT_STYLE_TEXT_DIALOG};
			if(step.rightAvatar)
			{
				uiDef.bbLeftAvatarBg = {visible:false};
				if(step.avatarBg)
					uiDef.bbRightAvatarBg = {visible:true, type:UITYPE_IMAGE, value:step.avatarBg, scale:cc.p(-0.8, 0.8)};
				else
					uiDef.bbRightAvatarBg = {visible:true};
				uiDef.bbRightAvatar = {type:UITYPE_IMAGE, value:step.avatar};
			}
			else
			{
				uiDef.bbRightAvatarBg = {visible:false};
				if(step.avatarBg)
					uiDef.bbLeftAvatarBg = {visible:true, type:UITYPE_IMAGE, value:step.avatarBg, scale:0.8};
				else
					uiDef.bbLeftAvatarBg = {visible:true};
				uiDef.bbLeftAvatar = {type:UITYPE_IMAGE, value:step.avatar};
			}
		}

		cc.log("idStep0",step.id,step.anim);

		if(step.anim)
		{
			cc.log("idStep",step.id);
			uiDef.hints = {visible:true, type:UITYPE_SPINE, id:step.spine, anim:step.anim, loop:step.animLoop !== undefined ? step.animLoop : true};
			//uiDef.hints = {visible:true, type:UITYPE_SPINE, id:SPINE_TUTOTIAL_NEW, anim:step.anim, loop:step.animLoop !== undefined ? step.animLoop : true};
		}


		if(step.itemList)
		{
			var itemList = FWUtils.getItemsArray(step.itemList);
			var itemDef =
			{
				fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.9},
				fx2:{visible:false},
				gfx:{type:UITYPE_ITEM, field:"itemId", options:{isBigIcon:true}},
				amount:{type:UITYPE_TEXT, format:"x%s", field:"amount", style:TEXT_STYLE_NUMBER, visible:"data.amount > 0"},
				bg:{visible:false}
			};
			uiDef.itemList = {visible:true, type:UITYPE_2D_LIST, itemUI:UI_MAILBOX_RECEIVE_ITEM, itemDef:itemDef, itemSize:cc.size(200, 200), items:itemList, singleLine:true, itemsAlign:"center"};
		}
		
		this.hintsCount = 0;
		if(step.hint31 || step.hint32 || step.hint33)
		{
			uiDef.hints3 = {visible:true};
			uiDef.hint31 = (step.hint31 ? {type:UITYPE_TEXT, value:step.hint31, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint32 = (step.hint32 ? {type:UITYPE_TEXT, value:step.hint32, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint33 = (step.hint33 ? {type:UITYPE_TEXT, value:step.hint33, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			this.hintsCount = 3;
		}
		
		if(step.hint41 || step.hint42 || step.hint43 || step.hint44)
		{
			uiDef.hints4 = {visible:true};
			uiDef.hint41 = (step.hint41 ? {type:UITYPE_TEXT, value:step.hint41, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint42 = (step.hint42 ? {type:UITYPE_TEXT, value:step.hint42, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint43 = (step.hint43 ? {type:UITYPE_TEXT, value:step.hint43, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint44 = (step.hint44 ? {type:UITYPE_TEXT, value:step.hint44, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			this.hintsCount = 4;
		}
		
		if(step.hint51 || step.hint52 || step.hint53 || step.hint54 || step.hint55)
		{
			uiDef.hints5 = {visible:true};
			uiDef.hint51 = (step.hint51 ? {type:UITYPE_TEXT, value:step.hint51, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint52 = (step.hint52 ? {type:UITYPE_TEXT, value:step.hint52, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint53 = (step.hint53 ? {type:UITYPE_TEXT, value:step.hint53, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint54 = (step.hint54 ? {type:UITYPE_TEXT, value:step.hint54, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			uiDef.hint55 = (step.hint55 ? {type:UITYPE_TEXT, value:step.hint55, style:TEXT_STYLE_TEXT_NORMAL, visible:true} : {visible:false});
			this.hintsCount = 5;
		}
		
		if(this.hintsCount > 0)
		{
			this.currentHintIndex = 0;
			this.choHinhAnhVaTextHuongDanChayCungNhau();
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.choHinhAnhVaTextHuongDanChayCungNhau, step.hintDuration || 1.5, this.hintsCount - 1, step.hintDelay || 1.5, false);
		}
		
		return uiDef;
	},
	
	// jira#5521
	hintsCount: 0,
	currentHintIndex: 0,
	choHinhAnhVaTextHuongDanChayCungNhau:function(dt)
	{
		var widget = FWPool.getNode(UI_TUTORIAL, false);
		if(this.currentHintIndex === 0)
		{
			// hide all
			for(var i=1; i<=this.hintsCount; i++)
			{
				var label = FWUtils.getChildByName(widget, "hint" + this.hintsCount + "" + i);
				if(label)
					label.setOpacity(0);
			}
		}
		else
		{
			// show one by one
			var label = FWUtils.getChildByName(widget, "hint" + this.hintsCount + "" + this.currentHintIndex);
			if(label)
				label.runAction(cc.fadeTo(1, 255));
		}
		this.currentHintIndex++;
	},
	
	save:function(skipProgressId)//web save:function(skipProgressId = null)
	{
		if(skipProgressId === undefined)
			skipProgressId = null;
		
		if(this.delaySaving)
		{
			this.saveAfterDelay = true;
			return;
		}
		
		var savedData = JSON.stringify(this.savedData);
		cc.log("Tutorial::save: " + savedData);
		if(skipProgressId !== null)
			cc.log("Tutorial::save: saved after skipping progress " + skipProgressId);
		
		if(TUTO_SAVE_LOCAL)
			cc.sys.localStorage.setItem("tutorial", savedData);
		else
		{
			// server
			var pk = network.connector.client.getOutPacket(Tutorial.RequestTutorialSave);
			pk.pack(savedData, skipProgressId, this.savedData.flow);
			network.connector.client.sendPacket(pk);
		}
	},
	
	onTouchEnded:function(touch, sender)
	{
		cc.log("Tutorial::onTouchEnded: " + sender.name);
		Tutorial.onGameEvent(EVT_TOUCH_END, sender.name);
	},
	
	acceptInput:function(name)
	{
		// jira#5571: don't know why touch eater is not active for several first frames
		if(FWUtils.touchEater)
			return false;
		
		if(this.isFinished() || !this.currentStep || !this.currentStep.acceptInput)
			return true;
		
		// jira#5423
		if(name === "btn_quit" || name === "btn_continue" || name == "skipButton")
			return true;
		
		for(var i=0; i<this.currentStep.acceptInput.length; i++)
		{
			var inputName = this.currentStep.acceptInput[i];
			if(inputName === name)
				return true;
			else if(inputName === "firstSlotWithPlant")
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(CloudFloors.slots[0][i].slotData[SLOT_PLANT])
					{
						if(name === "pot0" + i || name === "plant0" + i)
							return true;
						break;
					}
				}
			}
			else if(inputName === "firstEmptyPot")
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(CloudFloors.slots[0][i].slotData[SLOT_POT] && !CloudFloors.slots[0][i].slotData[SLOT_PLANT])
					{
						if(name === "pot0" + i || name === "plant0" + i)
							return true;
						break;
					}
				}
			}
			else if(inputName === "firstEmptySlot")
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(!CloudFloors.slots[1][i].slotData[SLOT_POT])
					{
						if(name === "emptySlot1" + i)
							return true;
						break;
					}
				}
			}
			else if(inputName === "firstSlotWithBug")
			{
				// fix: tutorial stucks if bug is not on the first plant
				//if(name === "pot0" + this.bugSlotIdx || name === "plant0" + this.bugSlotIdx)
				//	return true;
				
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					if(CloudFloors.slots[0][i].hasBug())
					{
						if(name === "pot0" + i || name === "plant0" + i)
							return true;
						break;
					}
				}
			}
		}
		
		return false;
	},
	
	acceptScrolling:function()
	{
		if(this.isFinished() || !this.currentStep || this.currentStep.acceptScrolling)
			return true;

		return false;
	},
	
	isIBShopStep:function()
	{
		// new tutor
		//return (Tutorial.isStepFinished(TUTO_STEP_28C_TOUCH_PLUS_BUTTON) && !Tutorial.isStepFinished(TUTO_STEP_28D_BUY_POT));
		return false;
	},
	
	// new tutor
	/*isPlaceDecorStep:function()
	{
		return (Tutorial.isStepFinished(TUTO_STEP_54B_TOUCH_DECOR) && !Tutorial.isStepFinished(TUTO_STEP_35N3_DECOR_HINT));
	},*/
	
	// jira#5429
	updateUIMainButtons:function()
	{
		if(Game.isFriendGarden() || this.isFinished())
			return;
		
		// jira#5610: temporarily hide chat button
		//var buttonList = ["btnBuyGold", "btnBuyCoin", "btnOrder", "btnProfile", "btnMail", "btnFriendlist", "btnShop", "btnChat"];
		var buttonList = ["btnBuyGold", "btnBuyCoin", "btnOrder", "btnProfile", "btnMail", "btnFriendlist", "btnShop"];
		if(!this.uiMainButtons)
		{
			// cache buttons
			this.uiMainButtons = {};
			for(var i=0; i<buttonList.length; i++)
				this.uiMainButtons[buttonList[i]] = FWUtils.getChildByName(Game.gameScene.uiMain, buttonList[i]);
		}
		
		var isMainTutorialFinished = this.isMainTutorialFinished();
		for(var i=0; i<buttonList.length; i++)
		{
			var name = buttonList[i];
			var button = this.uiMainButtons[name];
			if(name === "btnOrder")
				button.setVisible(isMainTutorialFinished || this.isStepFinished(TUTO_STEP_22_LETTER));
			else
				button.setVisible(isMainTutorialFinished);
		}
	},
	
	hideCurrentPopups:function()
	{
		if(FWUI.isShowing(UI_ORDER))
			Orders.hide();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// tutorial progress //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	tutorialProgressWidget: null,
	tutorialProgressList: null,
	tutorialProgressListPos: null,
	tutorialProgressLastStep: TUTO_STEP_25B_OWL_APPEAR,
	isSkippingTutorialProgress: false, // will not process events while skipping
	
	// reduce server hits
	delaySaving: false,
	saveAfterDelay: false,
	
	// to fix the mess caused by showOverUi
	currentCloudFloorSlot: null,

	initTutorialProgress:function()
	{
		cc.log("initTutorialProgress",0);
		if(this.savedData.flow === TUTO_FLOW_OLD)
		{
			cc.log("initTutorialProgress",TUTO_FLOW_OLD);
			this.tutorialProgressLastStep=TUTO_STEP_25B_OWL_APPEAR;
		}
		else if(this.savedData.flow === TUTO_FLOW_NEW)
		{
			cc.log("initTutorialProgress",TUTO_FLOW_NEW);
			this.tutorialProgressLastStep= TUTO2_STEP_10_LETTER5;
		}
		if(Tutorial.isStepFinished(this.tutorialProgressLastStep))
		{
			cc.log("initTutorialProgress",3);
			return;
		}
		var steps = null;
		if(this.savedData.flow === TUTO_FLOW_OLD)
		{
			var step0 = {id:0, startStep:TUTO_STEP_03_JACK, endStep:TUTO_STEP_05B_HARVEST2, icon:"hud/hud_tutorial_process_bar_icon_normal_1.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_1.png", level:"1"};
			var step1 = {id:1, startStep:TUTO_STEP_06_RED, endStep:TUTO_STEP_08C_PLANT3, icon:"hud/hud_tutorial_process_bar_icon_normal_2.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_2.png", level:""};
			var step2 = {id:2, startStep:TUTO_STEP_09_RED, endStep:TUTO_STEP_11B_BUG2, icon:"hud/hud_tutorial_process_bar_icon_normal_3.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_3.png", level:""};
			var step3 = {id:3, startStep:TUTO_STEP_13_JACK, endStep:TUTO_STEP_14B_TOUCH_MACHINE, icon:"hud/hud_tutorial_process_bar_icon_normal_4.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_4.png", level:"2"};
			var step4 = {id:4, startStep:TUTO_STEP_15_JACK, endStep:TUTO_STEP_19_COLLECT, icon:"hud/hud_tutorial_process_bar_icon_normal_5.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_5.png", level:""};
			var step5 = {id:5, startStep:TUTO_STEP_21_OWL, endStep:TUTO_STEP_22_LETTER, icon:"hud/hud_tutorial_process_bar_icon_normal_6.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_6.png", level:"3"};
			var step6 = {id:6, startStep:TUTO_STEP_23_ORDER_HINT, endStep:TUTO_STEP_25B_OWL_APPEAR, icon:"hud/hud_tutorial_process_bar_icon_normal_7.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_7.png", level:""};
			steps = [step0, step1, step2, step3, step4, step5, step6];
		}
		else if (this.savedData.flow === TUTO_FLOW_NEW)
		{
			var step0 = {id:0, startStep:TUTO2_STEP_4_HARVEST, endStep:TUTO2_STEP_4_HARVEST2, icon:"hud/hud_tutorial_process_bar_icon_normal_1.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_1.png", level:"1"};
			var step1 = {id:1, startStep:TUTO2_STEP_5_PLANT, endStep:TUTO2_STEP_5_PLANT2, icon:"hud/hud_tutorial_process_bar_icon_normal_2.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_2.png", level:""};
			var step2 = {id:2, startStep:TUTO2_STEP_6_BUG2, endStep:TUTO2_STEP_6_BUG4, icon:"hud/hud_tutorial_process_bar_icon_normal_3.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_3.png", level:""};
			var step3 = {id:3, startStep:TUTO2_STEP_7, endStep:TUTO2_STEP_7_POT4, icon:"hud/hud_tutorial_process_bar_icon_normal_8.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_8.png", level:"2"};
			var step4 = {id:3, startStep:TUTO2_STEP_8_MACHINE, endStep:TUTO2_STEP_8_MACHINE6, icon:"hud/hud_tutorial_process_bar_icon_normal_4.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_4.png", level:""};
			var step5 = {id:4, startStep:TUTO2_STEP_9_PRODUCT, endStep:TUTO2_STEP_9_PRODUCT4, icon:"hud/hud_tutorial_process_bar_icon_normal_5.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_5.png", level:""};
			var step6 = {id:5, startStep:TUTO2_STEP_10_LETTER, endStep:TUTO2_STEP_10_LETTER3, icon:"hud/hud_tutorial_process_bar_icon_normal_6.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_6.png", level:"3"};
			var step7 = {id:6, startStep:TUTO2_STEP_10_LETTER4, endStep:TUTO2_STEP_10_LETTER5, icon:"hud/hud_tutorial_process_bar_icon_normal_7.png", activeIcon:"hud/hud_tutorial_process_bar_icon_active_7.png", level:""};
			steps = [step0, step1, step2, step3, step4, step5, step6,step7];
		}

		cc.log("initTutorialProgress",4);
		var itemDef =
		{
			bg_left:{visible:"data.id === 0"},
			bg_mid:{visible:"data.id > 0 && data.id < 5"},
			bg_right:{visible:"data.id >= 5"},
			progressBg:{visible:"data.id > 0"},
			progress:{visible:false},
			icon:{type:UITYPE_IMAGE, field:"icon", scale:1},
			check:{visible:false},
			level:{type:UITYPE_TEXT, field:"level", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			skipButton:{onTouchEnded:this.onSkipTutorialProgress.bind(this),visible:this.savedData.flow ==TUTO_FLOW_NEW},
			skipText:{type:UITYPE_TEXT, value:"TXT_INTRO_SKIP", style:TEXT_STYLE_TEXT_DIALOG},
		};
		
		var uiDef =
		{
			tutorialProgress:{visible:true, type:UITYPE_2D_LIST, itemUI:UI_TUTORIAL_PROGRESS_STEP, itemDef:itemDef, itemSize:cc.size(80, 80), items:steps, singleLine:true, itemsAlign:"center"},
		};
		this.tutorialProgressWidget = FWUI.showWithData(UI_TUTORIAL_PROGRESS, null, uiDef, FWUtils.getCurrentScene());
		this.tutorialProgressWidget.setLocalZOrder(Z_FX + 1); // overlaps pointer
		
		this.tutorialProgressList = FWUtils.getChildByName(this.tutorialProgressWidget, "tutorialProgress");
		this.tutorialProgressList.setVisible(false);
		this.tutorialProgressListPos = this.tutorialProgressList.getPosition();
		//this.tutorialProgressList.setScale(0.85);

		cc.log("initTutorialProgress",5);
		// cache 
		for(var i=0; i<steps.length; i++)
		{
			var step = steps[i];
			var item = this.tutorialProgressList.getChildren()[i];
			
			step.uiBgFill = FWUtils.getChildByName(item, "bg_fill");
			step.uiProgress = FWUtils.getChildByName(item, "progress");
			step.uiIcon = FWUtils.getChildByName(item, "icon");
			step.uiCheck = FWUtils.getChildByName(item, "check");
			step.uiLevel = FWUtils.getChildByName(item, "level");
			step.uiSkipButton = FWUtils.getChildByName(item, "skipButton");
			step.uiSkipButton.setVisible(false);
		}
		this.tutorialProgressSteps = steps;
	},
	
	uninitTutorialProgress:function()
	{
		// nothing
	},
	
	checkProgresOnStepStarts:function(step)
	{
		if(!this.tutorialProgressSteps)
			return;
		
		this.refreshProgress(step, true);
	},
	
	checkProgressOnStepFinishes:function(step)
	{
		if(!this.tutorialProgressSteps)
			return;
		
		this.refreshProgress(step, false);
	},
	
	refreshProgress:function(tutorialStep, isStart)
	{
		if(tutorialStep.id > this.tutorialProgressLastStep)
			return;
		
		var areAllStepsFinished = true;
		var hasStartedStep = false;

		// refresh
		for(var i=0; i<this.tutorialProgressSteps.length; i++)
		{
			var step = this.tutorialProgressSteps[i];
			
			// ui
			if(isStart && tutorialStep.id === step.startStep)
			{
				step.uiProgress.setVisible(step.id > 0);
				step.uiProgress.setScale(0, 1);
				step.uiProgress.runAction(cc.scaleTo(0.25, 1, 1));

				step.uiIcon.loadTexture(step.activeIcon, ccui.Widget.PLIST_TEXTURE);
				hasStartedStep = true;
			}
			else if(Tutorial.isStepFinished(step.startStep))
			{
				step.uiProgress.setVisible(step.id > 0);
				step.uiIcon.loadTexture(step.activeIcon, ccui.Widget.PLIST_TEXTURE);
				hasStartedStep = true;
			}
			else
			{
				step.uiProgress.setVisible(false);
				step.uiIcon.loadTexture(step.icon, ccui.Widget.PLIST_TEXTURE);
			}
			if(Tutorial.isStepFinished(step.endStep))
			{
				step.uiBgFill.setVisible(true);
				if(!isStart && tutorialStep.id == step.endStep)
				{
					step.uiBgFill.setScale(0, 0);
					step.uiBgFill.runAction(cc.scaleTo(0.25, 1, 1));
					
					// jira#6387
					FWUtils.showSpine(SPINE_EFFECT_FIREWORK, null, "effect_tut_processbar", false, step.uiBgFill.getParent(), step.uiBgFill.getPosition(), step.uiBgFill.getLocalZOrder() + 1);
				}
				else
					step.uiBgFill.setScale(1);
				step.uiCheck.setVisible(true);
				step.uiLevel.setVisible(false);
			}
			else
			{
				step.uiBgFill.setVisible(false);
				step.uiCheck.setVisible(false);
				step.uiLevel.setVisible(true);
				areAllStepsFinished = false;
			}

			if(this.savedData.flow == TUTO_FLOW_OLD)
			{
				// skip button
				if(isStart && tutorialStep.id === step.startStep)
				{
					// show skip button after 2s
					step.uiSkipButton.runAction(cc.sequence(
						cc.delayTime(2),
						cc.show()
					));
				}
				else if(!isStart && tutorialStep.id === step.endStep)
					step.uiSkipButton.setVisible(false);
			}

		}
		
		// show/hide entire progress
		if(areAllStepsFinished && this.tutorialProgressList.isVisible())
			this.showTutorialProgress(false, true);
		else if(hasStartedStep && !this.tutorialProgressList.isVisible() && !tutorialStep.hideProgress)
			this.showTutorialProgress(true);
		if(isStart && tutorialStep.hideProgress && this.tutorialProgressList.isVisible())
			this.showTutorialProgress(false);
	},
	
	showTutorialProgress:function(show, isFinished)//web showTutorialProgress:function(show = true, isFinished = false)
	{
		if(show === undefined)
			show = true;
		if(isFinished === undefined)
			isFinished = false;
		
		if(show)
		{
			// move in
			var pos = this.tutorialProgressListPos;
			this.tutorialProgressList.stopAllActions();
			this.tutorialProgressList.setPosition(pos.x, pos.y + 150);
			this.tutorialProgressList.runAction(cc.sequence(
				cc.show(),
				cc.moveTo(0.5, pos).easing(cc.easeSineOut())
			));
		}
		else
		{
			// move out
			var pos = this.tutorialProgressListPos;
			this.tutorialProgressList.stopAllActions();
			this.tutorialProgressList.runAction(cc.sequence(
				//cc.delayTime(1),
				cc.moveTo(0.5, cc.p(pos.x, pos.y + 150)).easing(cc.easeSineIn()),
				cc.hide(),
				cc.callFunc(function() {if(isFinished) FWUI.hideWidget(Tutorial.tutorialProgressWidget);})
			));
		}
	},
	
	onSkipTutorialProgress:function(sender)
	{
		if(!this.currentStep)
			return;
		
		this.delaySaving = true;
		this.saveAfterDelay = false;
		
		// list of steps to skip
		var currentStepId = this.currentStep.id;
		var skipStepIds = [];
		var skipProgressId = null;
		for(var i=0; i<this.tutorialProgressSteps.length; i++)
		{
			var progressStep = this.tutorialProgressSteps[i];
			if(progressStep.startStep <= currentStepId && progressStep.endStep >= currentStepId)
			{
				for(var j=0; j<this.remainSteps.length; j++)
				{
					if(this.remainSteps[j].id >= currentStepId && this.remainSteps[j].id <= progressStep.endStep)
						skipStepIds.push(this.remainSteps[j].id);
				}
				skipProgressId = progressStep.id;
				break;
			}
		}
		
		sender.setVisible(false);
		
		// skip steps
		cc.log("Tutorial::onSkipTutorialProgress: skipStepIds=" + JSON.stringify(skipStepIds));
		this.isSkippingTutorialProgress = true;
		var delay = 0;
		for(var i=0; i<skipStepIds.length; i++, delay += 0)
		{
			var stepId = skipStepIds[i];
			
			// simulate user action to skip
			if(stepId === TUTO_STEP_05B_HARVEST2)
			{
				if(this.currentCloudFloorSlot)
					this.currentCloudFloorSlot.onCloseMenu();

				var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlantHarvest);
				pk.pack([0, 0, 0, 0, 0, 0], [0, 1, 2, 3, 4, 5]);
				network.connector.client.sendPacket(pk);
			}
			else if(stepId === TUTO_STEP_08B_PLANT2)
			{
				if(this.currentCloudFloorSlot)
					this.currentCloudFloorSlot.onCloseMenu();
				
				var time = Game.getGameTimeInSeconds();
				var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlant);
				pk.pack("T1", [0, 0, 0, 0, 0, 0], [0, 1, 2, 3, 4, 5], [time, time, time, time, time, time]);
				network.connector.client.sendPacket(pk);		
			}
			else if(stepId === TUTO_STEP_11B_BUG2)
			{
				if(this.currentCloudFloorSlot)
					this.currentCloudFloorSlot.onCloseMenu();
				
				var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlantCatchBug);
				pk.pack([0], [0], [Game.getGameTimeInSeconds()]);
				network.connector.client.sendPacket(pk);	
			}
			else if(stepId === TUTO_STEP_13B_UNLOCK_MACHINE)
			{
				if(gv.userMachine.popupMachineUnlock && gv.userMachine.popupMachineUnlock.widget.isVisible())
					gv.userMachine.popupMachineUnlock.hide();

				gv.userMachine.requestUnlockMachine("MA0");
			}
			else if(stepId === TUTO_STEP_14_SKIP_TIME_MACHINE)
			{
				Game.onCloseSkipTime(null);
				
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {gv.userMachine.requestSkipMachineUnlockTime("MA0", 0);}, delay, 0, 0, false);
			}
			else if(stepId === TUTO_STEP_14B_TOUCH_MACHINE)
			{
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {gv.userMachine.getMachineByFloor(0).onTouchEnded(null, null, true);}, 1 + delay, 0, 0, false);
			}
			else if(stepId === TUTO_STEP_17_PRODUCE)
			{
				if(gv.userMachine.popupMachineProduce && gv.userMachine.popupMachineProduce.widget.isVisible())
					gv.userMachine.popupMachineProduce.hide();
				
				gv.userMachine.requestProduce("MA0", "R0");
			}
			else if(stepId == TUTO_STEP_18_SKIP_TIME_PRODUCE)
			{
				if(gv.userMachine.popupMachineProduce && gv.userMachine.popupMachineProduce.widget.isVisible())
					gv.userMachine.popupMachineProduce.hide();
				
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {gv.userMachine.requestSkipMachineProduceTime("MA0", 0);}, delay, 0, 0, false);
			}
			else if(stepId === TUTO_STEP_19_COLLECT)
			{
				if(gv.userMachine.popupMachineProduce && gv.userMachine.popupMachineProduce.widget.isVisible())
					gv.userMachine.popupMachineProduce.hide();
				
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {gv.userMachine.requestHarvest("MA0");}, delay, 0, 0, false);
			}
			else if(stepId === TUTO_STEP_22_LETTER)
			{
				if(this.letter)
				{
					Game.gameScene.showFocusPointer("tutor", false);
					this.letter.uninit();
					this.letter = null;
				}
			}
			else if(stepId === TUTO_STEP_24_ORDER)
			{
				if(FWUI.isShowing(UI_ORDER))
					Orders.hide();
				
				var orderList = Orders.updateOrderList();
				for(var j=0; j<orderList.length; j++)
				{
					if(orderList[j])
					{
						Orders.onDeliver3(orderList[j]);
						break;
					}
				}
			}
			else if(stepId === TUTO_STEP_25B_OWL_APPEAR)
			{
				cc.director.getScheduler().scheduleCallbackForTarget(this, function()
				{
					Orders.onReceiveRewards();
					Orders.onDeliveryFinished();
				}, delay, 0, 0, false);
			}

			else if(stepId === TUTO2_STEP_10_LETTER7)
			{
				cc.director.getScheduler().scheduleCallbackForTarget(this, function()
				{
					Orders.onReceiveRewards();
					Orders.onDeliveryFinished();
				}, delay, 0, 0, false);
			}
			
			this.finishStepById(stepId);
		}
		
		this.isSkippingTutorialProgress = false;
		this.onGameEvent(EVT_FINISH_TUTO_STEP, skipStepIds[skipStepIds.length - 1]);
		
		this.delaySaving = false;
		if(this.saveAfterDelay)
		{
			this.saveAfterDelay = false;
			this.save(skipProgressId);
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	RequestTutorialSave:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TUTORIAL_SAVE);},
		pack:function(data, skipProgressId, flow)//web pack:function(data, skipProgressId = null)
		{
			if(skipProgressId === undefined)
				skipProgressId = null;
			if(flow === undefined)
				flow = null;
			
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_DATA, data);
			if(skipProgressId !== null)
				PacketHelper.putInt(this, KEY_UID, skipProgressId);
			
			if(flow !== null)
				PacketHelper.putInt(this, KEY_TUTORIAL_FLOW, flow);
			addPacketFooter(this);
		},
	}),
	
	ResponseTutorialSave:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function() {}
	}),					
	
	tutorialStepStatus:true,
	tutorialLastLoggedStep:null,
	tutorialLastLoggedStepCount:0,
	RequestTutorialStep:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TUTORIAL_STEP);},
		pack:function(step,flow)
		{
if(flow === undefined)
flow = null;
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_DATA, step);
			PacketHelper.putBoolean(this, KEY_STATUS, Tutorial.tutorialStepStatus);

			if(flow !== null)
				PacketHelper.putInt(this, KEY_TUTORIAL_FLOW, flow);
			addPacketFooter(this);
			Tutorial.tutorialStepStatus = false;
		},
	}),
};

network.packetMap[gv.CMD.TUTORIAL_SAVE] = Tutorial.ResponseTutorialSave;


