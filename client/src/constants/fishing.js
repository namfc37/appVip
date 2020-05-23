var g_FISHING = {};
g_FISHING.FISH_RATES = {1:{FISH_NUM_MIN:5,FISH_NUM_MAX:7,FISH_RATE:{F2:45,F3:35,F4:20}},5:{FISH_NUM_MIN:7,FISH_NUM_MAX:9,FISH_RATE:{F2:40,F3:35,F4:25}},10:{FISH_NUM_MIN:9,FISH_NUM_MAX:12,FISH_RATE:{F2:30,F3:40,F4:30}},15:{FISH_NUM_MIN:12,FISH_NUM_MAX:15,FISH_RATE:{F2:25,F3:40,F4:35}}};
g_FISHING.FISHING_REWARD = {F3:{40:[{reward:{P47:1},rate:100},{reward:{P48:1},rate:50},{reward:{P49:1},rate:25}],70:[{reward:{P47:1},rate:100},{reward:{P48:1},rate:50},{reward:{P49:1},rate:25},{reward:{P50:1},rate:13}],100:[{reward:{P48:1},rate:100},{reward:{P49:1},rate:50},{reward:{P50:1},rate:25}]},F4:{35:[{reward:{P47:1},rate:100},{reward:{P48:1},rate:50},{reward:{P49:1},rate:25},{reward:{P50:1},rate:13}],65:[{reward:{P48:1},rate:100},{reward:{P49:1},rate:50},{reward:{P50:1},rate:25}],100:[{reward:{P48:1},rate:100},{reward:{P49:1},rate:50},{reward:{P50:1},rate:25},{reward:{P53:1},rate:13}]}};
g_FISHING.FISHING_MINIGAME_BAR = [{TYPE:'GREY',AREA_MIN:30,AREA_MAX:35,APPEAR_TIME:5,SLIDER_SPEED:80,GFX:'item_event03_weight_01'},{TYPE:'BRONZE',AREA_MIN:25,AREA_MAX:30,APPEAR_TIME:6,SLIDER_SPEED:100,GFX:'item_event03_weight_02'},{TYPE:'SILVER',AREA_MIN:15,AREA_MAX:20,APPEAR_TIME:7,SLIDER_SPEED:120,GFX:'item_event03_weight_03'},{TYPE:'GOLD',AREA_MIN:10,AREA_MAX:15,APPEAR_TIME:8,SLIDER_SPEED:140,GFX:'item_event03_weight_04'}];
g_FISHING.FISHING_MINIGAME_BAR_RATE = {0:[25,25,25,25],20:[20,30,25,25],50:[20,20,30,30],80:[15,25,30,30],120:[15,20,30,35]};
g_FISHING.FISH_WEIGHT = {GOLD:{F1:{MIN:1.6,MAX:2.0},F2:{MIN:5.5,MAX:6.3},F3:{MIN:7.5,MAX:8.3},F4:{MIN:9.5,MAX:10.3}},BRONZE:{F1:{MIN:0.6,MAX:0.9},F2:{MIN:3.5,MAX:4.3},F3:{MIN:5.5,MAX:6.3},F4:{MIN:7.5,MAX:8.3}},SILVER:{F1:{MIN:1.0,MAX:1.5},F2:{MIN:4.5,MAX:5.3},F3:{MIN:6.5,MAX:7.3},F4:{MIN:8.5,MAX:9.3}},GREY:{F1:{MIN:0.2,MAX:0.5},F2:{MIN:2.5,MAX:3.3},F3:{MIN:4.5,MAX:5.3},F4:{MIN:6.5,MAX:7.3}}};
g_FISHING.FISH_REWARD = {F1:{1:{GOLD:-1,EXP:25},21:{GOLD:-1,EXP:40},51:{GOLD:-1,EXP:60},81:{GOLD:-1,EXP:125},151:{GOLD:-1,EXP:250}},F2:{1:{GOLD:20,EXP:-1},21:{GOLD:40,EXP:-1},51:{GOLD:100,EXP:-1},81:{GOLD:200,EXP:-1},151:{GOLD:300,EXP:-1}},F3:{1:{GOLD:23,EXP:26},21:{GOLD:46,EXP:53},51:{GOLD:115,EXP:132},81:{GOLD:230,EXP:265},151:{GOLD:345,EXP:397}},F4:{1:{GOLD:26,EXP:30},21:{GOLD:53,EXP:61},51:{GOLD:132,EXP:152},81:{GOLD:265,EXP:305},151:{GOLD:397,EXP:457}}};
g_FISHING.FEATURE_DROP_LIST = {rules:{AIRSHIP_PACK:{rate:1.0,quantity:1.0,dailyLimit:-1.0,dropItemID:'HT1'},ORDER_GET_REWARD:{rate:1.0,quantity:2.0,dailyLimit:-1.0,dropItemID:'HT2'},ORDER_GET_REWARD_ORDER_DAILY_FREE:{rate:1.0,quantity:1.0,dailyLimit:-1.0,dropItemID:'HT1'},AIRSHIP_DELIVERY:{rate:1.0,quantity:5.0,dailyLimit:-1.0,dropItemID:'HT3'},TRUCK_PACK:{rate:1.0,quantity:1.0,dailyLimit:-1.0,dropItemID:'HT1'},TRUCK_DELIVERY:{rate:1.0,quantity:2.0,dailyLimit:-1.0,dropItemID:'HT3'},ORDER_GET_REWARD_ORDER_DAILY_PAID:{rate:1.0,quantity:3.0,dailyLimit:-1.0,dropItemID:'HT2'},MINE_START:{rate:1.0,quantity:3.0,dailyLimit:-1.0,dropItemID:'HT2'}},dropItemID:'HT1'};
