var g_QUEST_BOOK = {};
g_QUEST_BOOK.QUESTS = {ACTION_PLANT:{ACTION:'ACTION_PLANT',ACTION_ID:23,MIN:0,MAX:1,RATE:35,RATIO:1.0,QUEST_ITEMS:[{TARGET:'T1',LEVEL:1,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:2,EXP:3}},{TARGET:'T2',LEVEL:6,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:2,EXP:3}},{TARGET:'T3',LEVEL:9,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:4,EXP:5}},{TARGET:'T4',LEVEL:12,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:6,EXP:7}},{TARGET:'T5',LEVEL:15,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:6,EXP:7}},{TARGET:'T6',LEVEL:17,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:6,EXP:7}},{TARGET:'T7',LEVEL:20,RATE:25,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'T8',LEVEL:25,RATE:25,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'T9',LEVEL:33,RATE:25,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T10',LEVEL:35,RATE:25,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T11',LEVEL:37,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T12',LEVEL:40,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T13',LEVEL:46,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T14',LEVEL:49,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T15',LEVEL:58,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:12,EXP:14}},{TARGET:'T16',LEVEL:62,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:12,EXP:14}},{TARGET:'T17',LEVEL:74,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'T18',LEVEL:83,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'T19',LEVEL:95,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:16,EXP:18}},{TARGET:'T20',LEVEL:106,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:16,EXP:18}}]},ACTION_PLANT_HARVEST:{ACTION:'ACTION_PLANT_HARVEST',ACTION_ID:1,MIN:1,MAX:2,RATE:40,RATIO:1.5,QUEST_ITEMS:[{TARGET:'T1',LEVEL:1,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:2,EXP:3}},{TARGET:'T2',LEVEL:6,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:2,EXP:3}},{TARGET:'T3',LEVEL:9,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:4,EXP:5}},{TARGET:'T4',LEVEL:12,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:6,EXP:7}},{TARGET:'T5',LEVEL:15,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:6,EXP:7}},{TARGET:'T6',LEVEL:17,RATE:10,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:6,EXP:7}},{TARGET:'T7',LEVEL:20,RATE:25,REQUIRE_MIN:20,REQUIRE_MAX:25,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'T8',LEVEL:25,RATE:25,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'T9',LEVEL:33,RATE:25,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T10',LEVEL:35,RATE:25,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T11',LEVEL:37,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T12',LEVEL:40,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T13',LEVEL:46,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T14',LEVEL:49,RATE:30,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'T15',LEVEL:58,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:12,EXP:14}},{TARGET:'T16',LEVEL:62,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:12,EXP:14}},{TARGET:'T17',LEVEL:74,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'T18',LEVEL:83,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'T19',LEVEL:95,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:16,EXP:18}},{TARGET:'T20',LEVEL:106,RATE:30,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:16,EXP:18}}]},ACTION_MACHINE_PRODUCE:{ACTION:'ACTION_MACHINE_PRODUCE',ACTION_ID:24,MIN:1,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{TARGET:'R0',LEVEL:2,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'R1',LEVEL:6,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'R2',LEVEL:8,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'R3',LEVEL:9,RATE:10,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:16,EXP:18}},{TARGET:'R4',LEVEL:13,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'R5',LEVEL:14,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:18,EXP:20}},{TARGET:'R6',LEVEL:16,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'R7',LEVEL:18,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:18,EXP:20}},{TARGET:'R8',LEVEL:19,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'R9',LEVEL:20,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:24,EXP:27}},{TARGET:'R10',LEVEL:24,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'R11',LEVEL:28,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:36,EXP:40}},{TARGET:'R12',LEVEL:29,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:44,EXP:49}},{TARGET:'R13',LEVEL:30,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'R14',LEVEL:34,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'R15',LEVEL:35,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R16',LEVEL:35,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:44,EXP:49}},{TARGET:'R17',LEVEL:36,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:22,EXP:25}},{TARGET:'R18',LEVEL:37,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R19',LEVEL:38,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:44,EXP:49}},{TARGET:'R20',LEVEL:40,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:22,EXP:25}},{TARGET:'R21',LEVEL:42,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R22',LEVEL:43,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R23',LEVEL:44,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:46,EXP:51}},{TARGET:'R24',LEVEL:48,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:46,EXP:51}},{TARGET:'R25',LEVEL:49,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R26',LEVEL:50,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:36,EXP:40}},{TARGET:'R27',LEVEL:51,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:30,EXP:33}},{TARGET:'R28',LEVEL:52,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:42,EXP:47}},{TARGET:'R29',LEVEL:54,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:54,EXP:60}},{TARGET:'R30',LEVEL:56,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:74,EXP:82}},{TARGET:'R31',LEVEL:59,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:94,EXP:104}},{TARGET:'R32',LEVEL:60,RATE:25,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:46,EXP:51}},{TARGET:'R33',LEVEL:61,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:42,EXP:47}},{TARGET:'R34',LEVEL:63,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:78,EXP:86}},{TARGET:'R35',LEVEL:65,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:58,EXP:64}},{TARGET:'R36',LEVEL:66,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:100,EXP:110}},{TARGET:'R37',LEVEL:69,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:184,EXP:203}},{TARGET:'R38',LEVEL:70,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:106,EXP:117}},{TARGET:'R39',LEVEL:73,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:38,EXP:42}},{TARGET:'R40',LEVEL:74,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:88,EXP:97}},{TARGET:'R41',LEVEL:76,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:50,EXP:55}},{TARGET:'R42',LEVEL:77,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:40,EXP:44}},{TARGET:'R43',LEVEL:80,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}},{TARGET:'R44',LEVEL:81,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:60,EXP:66}},{TARGET:'R45',LEVEL:82,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:38,EXP:42}},{TARGET:'R46',LEVEL:84,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:158,EXP:174}},{TARGET:'R47',LEVEL:85,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:204,EXP:225}},{TARGET:'R48',LEVEL:87,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:216,EXP:238}},{TARGET:'R49',LEVEL:88,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:58,EXP:64}},{TARGET:'R50',LEVEL:89,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:156,EXP:172}},{TARGET:'R51',LEVEL:90,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:224,EXP:247}},{TARGET:'R52',LEVEL:96,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:142,EXP:157}},{TARGET:'R53',LEVEL:91,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:50,EXP:55}},{TARGET:'R54',LEVEL:94,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:84,EXP:93}},{TARGET:'R55',LEVEL:97,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:72,EXP:80}},{TARGET:'R56',LEVEL:98,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:98,EXP:108}},{TARGET:'R57',LEVEL:98,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:92,EXP:102}},{TARGET:'R58',LEVEL:100,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:134,EXP:148}},{TARGET:'R59',LEVEL:101,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:320,EXP:352}},{TARGET:'R60',LEVEL:102,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:184,EXP:203}},{TARGET:'R61',LEVEL:103,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:58,EXP:64}},{TARGET:'R62',LEVEL:104,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:470,EXP:517}},{TARGET:'R63',LEVEL:105,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:174,EXP:192}},{TARGET:'R64',LEVEL:106,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:82,EXP:91}},{TARGET:'R65',LEVEL:107,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:938,EXP:1032}},{TARGET:'R66',LEVEL:109,RATE:35,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:230,EXP:253}},{TARGET:'R67',LEVEL:111,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:314,EXP:346}},{TARGET:'R68',LEVEL:113,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:108,EXP:119}},{TARGET:'R69',LEVEL:114,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:158,EXP:174}},{TARGET:'R70',LEVEL:115,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:450,EXP:495}},{TARGET:'R71',LEVEL:117,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:746,EXP:821}},{TARGET:'R72',LEVEL:120,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:1970,EXP:2167}},{TARGET:'R73',LEVEL:122,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:166,EXP:183}},{TARGET:'R74',LEVEL:124,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:804,EXP:885}},{TARGET:'R75',LEVEL:126,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:206,EXP:227}},{TARGET:'R76',LEVEL:128,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:646,EXP:711}},{TARGET:'R77',LEVEL:135,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:2400,EXP:2640}},{TARGET:'A0',LEVEL:23,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:18,EXP:20}},{TARGET:'A1',LEVEL:25,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'A2',LEVEL:27,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'A3',LEVEL:33,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:76,EXP:84}},{TARGET:'A4',LEVEL:41,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:102,EXP:113}},{TARGET:'A5',LEVEL:53,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:124,EXP:137}},{TARGET:'A6',LEVEL:55,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:508,EXP:559}}]},ACTION_MACHINE_HARVEST:{ACTION:'ACTION_MACHINE_HARVEST',ACTION_ID:2,MIN:1,MAX:2,RATE:45,RATIO:1.5,QUEST_ITEMS:[{TARGET:'R0',LEVEL:2,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'R1',LEVEL:6,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'R2',LEVEL:8,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:8,EXP:9}},{TARGET:'R3',LEVEL:9,RATE:10,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:16,EXP:18}},{TARGET:'R4',LEVEL:13,RATE:10,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:10,EXP:11}},{TARGET:'R5',LEVEL:14,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:18,EXP:20}},{TARGET:'R6',LEVEL:16,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'R7',LEVEL:18,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:18,EXP:20}},{TARGET:'R8',LEVEL:19,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:14,EXP:16}},{TARGET:'R9',LEVEL:20,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:24,EXP:27}},{TARGET:'R10',LEVEL:24,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'R11',LEVEL:28,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:36,EXP:40}},{TARGET:'R12',LEVEL:29,RATE:20,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:44,EXP:49}},{TARGET:'R13',LEVEL:30,RATE:20,REQUIRE_MIN:4,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'R14',LEVEL:34,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'R15',LEVEL:35,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R16',LEVEL:35,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:44,EXP:49}},{TARGET:'R17',LEVEL:36,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:22,EXP:25}},{TARGET:'R18',LEVEL:37,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R19',LEVEL:38,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:44,EXP:49}},{TARGET:'R20',LEVEL:40,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:22,EXP:25}},{TARGET:'R21',LEVEL:42,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R22',LEVEL:43,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R23',LEVEL:44,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:46,EXP:51}},{TARGET:'R24',LEVEL:48,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:46,EXP:51}},{TARGET:'R25',LEVEL:49,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'R26',LEVEL:50,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:36,EXP:40}},{TARGET:'R27',LEVEL:51,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:30,EXP:33}},{TARGET:'R28',LEVEL:52,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:42,EXP:47}},{TARGET:'R29',LEVEL:54,RATE:25,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:54,EXP:60}},{TARGET:'R30',LEVEL:56,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:74,EXP:82}},{TARGET:'R31',LEVEL:59,RATE:25,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:94,EXP:104}},{TARGET:'R32',LEVEL:60,RATE:25,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:46,EXP:51}},{TARGET:'R33',LEVEL:61,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:42,EXP:47}},{TARGET:'R34',LEVEL:63,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:78,EXP:86}},{TARGET:'R35',LEVEL:65,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:58,EXP:64}},{TARGET:'R36',LEVEL:66,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:100,EXP:110}},{TARGET:'R37',LEVEL:69,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:184,EXP:203}},{TARGET:'R38',LEVEL:70,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:106,EXP:117}},{TARGET:'R39',LEVEL:73,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:38,EXP:42}},{TARGET:'R40',LEVEL:74,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:88,EXP:97}},{TARGET:'R41',LEVEL:76,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:50,EXP:55}},{TARGET:'R42',LEVEL:77,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:40,EXP:44}},{TARGET:'R43',LEVEL:80,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}},{TARGET:'R44',LEVEL:81,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:60,EXP:66}},{TARGET:'R45',LEVEL:82,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:38,EXP:42}},{TARGET:'R46',LEVEL:84,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:158,EXP:174}},{TARGET:'R47',LEVEL:85,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:204,EXP:225}},{TARGET:'R48',LEVEL:87,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:216,EXP:238}},{TARGET:'R49',LEVEL:88,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:58,EXP:64}},{TARGET:'R50',LEVEL:89,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:156,EXP:172}},{TARGET:'R51',LEVEL:90,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:224,EXP:247}},{TARGET:'R52',LEVEL:96,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:142,EXP:157}},{TARGET:'R53',LEVEL:91,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:50,EXP:55}},{TARGET:'R54',LEVEL:94,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:84,EXP:93}},{TARGET:'R55',LEVEL:97,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:72,EXP:80}},{TARGET:'R56',LEVEL:98,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:98,EXP:108}},{TARGET:'R57',LEVEL:98,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:92,EXP:102}},{TARGET:'R58',LEVEL:100,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:134,EXP:148}},{TARGET:'R59',LEVEL:101,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:320,EXP:352}},{TARGET:'R60',LEVEL:102,RATE:30,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:184,EXP:203}},{TARGET:'R61',LEVEL:103,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:58,EXP:64}},{TARGET:'R62',LEVEL:104,RATE:30,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:470,EXP:517}},{TARGET:'R63',LEVEL:105,RATE:30,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:174,EXP:192}},{TARGET:'R64',LEVEL:106,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:82,EXP:91}},{TARGET:'R65',LEVEL:107,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:938,EXP:1032}},{TARGET:'R66',LEVEL:109,RATE:35,REQUIRE_MIN:3,REQUIRE_MAX:4,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:230,EXP:253}},{TARGET:'R67',LEVEL:111,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:314,EXP:346}},{TARGET:'R68',LEVEL:113,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:108,EXP:119}},{TARGET:'R69',LEVEL:114,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:158,EXP:174}},{TARGET:'R70',LEVEL:115,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:450,EXP:495}},{TARGET:'R71',LEVEL:117,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:746,EXP:821}},{TARGET:'R72',LEVEL:120,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:1970,EXP:2167}},{TARGET:'R73',LEVEL:122,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:166,EXP:183}},{TARGET:'R74',LEVEL:124,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:804,EXP:885}},{TARGET:'R75',LEVEL:126,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:206,EXP:227}},{TARGET:'R76',LEVEL:128,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:646,EXP:711}},{TARGET:'R77',LEVEL:135,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:2400,EXP:2640}},{TARGET:'A0',LEVEL:23,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:18,EXP:20}},{TARGET:'A1',LEVEL:25,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:28,EXP:31}},{TARGET:'A2',LEVEL:27,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:34,EXP:38}},{TARGET:'A3',LEVEL:33,RATE:35,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:76,EXP:84}},{TARGET:'A4',LEVEL:41,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:102,EXP:113}},{TARGET:'A5',LEVEL:53,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:124,EXP:137}},{TARGET:'A6',LEVEL:55,RATE:35,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:508,EXP:559}}]},ACTION_ORDER_DAILY_DELIVERY:{ACTION:'ACTION_ORDER_DAILY_DELIVERY',ACTION_ID:25,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:10,RATE:100,REQUIRE_MIN:5,REQUIRE_MAX:10,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_ORDER_NORMAL_DELIVERY:{ACTION:'ACTION_ORDER_NORMAL_DELIVERY',ACTION_ID:26,MIN:0,MAX:1,RATE:45,RATIO:1.0,QUEST_ITEMS:[{LEVEL:3,RATE:100,REQUIRE_MIN:6,REQUIRE_MAX:12,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:90,EXP:99}}]},ACTION_AIRSHIP_PACK:{ACTION:'ACTION_AIRSHIP_PACK',ACTION_ID:27,MIN:0,MAX:1,RATE:45,RATIO:1.0,QUEST_ITEMS:[{LEVEL:9,RATE:100,REQUIRE_MIN:6,REQUIRE_MAX:12,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_AIRSHIP_DELIVERY:{ACTION:'ACTION_AIRSHIP_DELIVERY',ACTION_ID:11,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:10,RATE:100,REQUIRE_MIN:1,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:600,EXP:660}}]},ACTION_AIRSHIP_REQUEST_HELP:{ACTION:'ACTION_AIRSHIP_REQUEST_HELP',ACTION_ID:28,MIN:0,MAX:1,RATE:30,RATIO:1.0,QUEST_ITEMS:[{LEVEL:9,RATE:100,REQUIRE_MIN:7,REQUIRE_MAX:12,SKIP_PRICE_TYPE:'GOLD',SKIP_PRICE_NUM:-1,REWARD:{EXP:22}}]},ACTION_AIRSHIP_FRIEND_PACK:{ACTION:'ACTION_AIRSHIP_FRIEND_PACK',ACTION_ID:17,MIN:0,MAX:1,RATE:45,RATIO:1.0,QUEST_ITEMS:[{LEVEL:10,RATE:100,REQUIRE_MIN:8,REQUIRE_MAX:12,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_PLANT_CATCH_BUG:{ACTION:'ACTION_PLANT_CATCH_BUG',ACTION_ID:6,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:6,RATE:100,REQUIRE_MIN:8,REQUIRE_MAX:10,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:24,EXP:27}}]},ACTION_FRIEND_BUG_CATCH:{ACTION:'ACTION_FRIEND_BUG_CATCH',ACTION_ID:5,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:7,RATE:100,REQUIRE_MIN:6,REQUIRE_MAX:8,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:24,EXP:27}}]},ACTION_MACHINE_REPAIR:{ACTION:'ACTION_MACHINE_REPAIR',ACTION_ID:29,MIN:0,MAX:1,RATE:35,RATIO:1.0,QUEST_ITEMS:[{LEVEL:7,RATE:100,REQUIRE_MIN:8,REQUIRE_MAX:12,SKIP_PRICE_TYPE:'GOLD',SKIP_PRICE_NUM:-1,REWARD:{EXP:44}}]},ACTION_FRIEND_REPAIR_MACHINE:{ACTION:'ACTION_FRIEND_REPAIR_MACHINE',ACTION_ID:15,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:8,RATE:100,REQUIRE_MIN:10,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'GOLD',SKIP_PRICE_NUM:-1,REWARD:{EXP:22}}]},ACTION_PRIVATE_SHOP_PUT:{ACTION:'ACTION_PRIVATE_SHOP_PUT',ACTION_ID:30,MIN:0,MAX:1,RATE:35,RATIO:1.0,QUEST_ITEMS:[{LEVEL:6,RATE:100,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'GOLD',SKIP_PRICE_NUM:-1,REWARD:{EXP:22}}]},ACTION_PRIVATE_SHOP_FRIEND_BUY:{ACTION:'ACTION_PRIVATE_SHOP_FRIEND_BUY',ACTION_ID:31,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:8,RATE:100,REQUIRE_MIN:15,REQUIRE_MAX:20,SKIP_PRICE_TYPE:'GOLD',SKIP_PRICE_NUM:-1,REWARD:{EXP:44}}]},ACTION_POT_UPGRADE:{ACTION:'ACTION_POT_UPGRADE',ACTION_ID:32,MIN:0,MAX:1,RATE:5,RATIO:1.0,QUEST_ITEMS:[{LEVEL:8,RATE:100,REQUIRE_MIN:2,REQUIRE_MAX:3,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:225,EXP:248}}]},ACTION_MACHINE_UPGRADE:{ACTION:'ACTION_MACHINE_UPGRADE',ACTION_ID:33,MIN:0,MAX:1,RATE:25,RATIO:1.0,QUEST_ITEMS:[{LEVEL:10,RATE:100,REQUIRE_MIN:1,REQUIRE_MAX:1,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:600,EXP:660}}]},ACTION_TOM_FIND:{ACTION:'ACTION_TOM_FIND',ACTION_ID:34,MIN:0,MAX:1,RATE:30,RATIO:1.0,QUEST_ITEMS:[{LEVEL:12,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_LUCKY_SPIN:{ACTION:'ACTION_LUCKY_SPIN',ACTION_ID:13,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:14,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:6,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:30,EXP:33}}]},ACTION_GACHA_OPEN:{ACTION:'ACTION_GACHA_OPEN',ACTION_ID:19,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:8,RATE:100,REQUIRE_MIN:4,REQUIRE_MAX:6,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_DICE_SPIN:{ACTION:'ACTION_DICE_SPIN',ACTION_ID:12,MIN:0,MAX:1,RATE:35,RATIO:1.0,QUEST_ITEMS:[{LEVEL:17,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_MINE_START:{ACTION:'ACTION_MINE_START',ACTION_ID:18,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:30,RATE:100,REQUIRE_MIN:4,REQUIRE_MAX:8,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:120,EXP:132}}]},ACTION_MAKE_POT:{ACTION:'ACTION_MAKE_POT',ACTION_ID:36,MIN:0,MAX:1,RATE:5,RATIO:1.0,QUEST_ITEMS:[{LEVEL:80,RATE:100,REQUIRE_MIN:1,REQUIRE_MAX:1,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:75000,EXP:82500}}]},ACTION_STOCK_UPGRADE:{ACTION:'ACTION_STOCK_UPGRADE',ACTION_ID:35,MIN:0,MAX:1,RATE:30,RATIO:1.0,QUEST_ITEMS:[{LEVEL:10,RATE:100,REQUIRE_MIN:1,REQUIRE_MAX:2,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:800,EXP:880}}]},ACTION_FRIEND_VISIT:{ACTION:'ACTION_FRIEND_VISIT',ACTION_ID:16,MIN:0,MAX:1,RATE:20,RATIO:1.0,QUEST_ITEMS:[{LEVEL:6,RATE:100,REQUIRE_MIN:5,REQUIRE_MAX:7,SKIP_PRICE_TYPE:'REPU',SKIP_PRICE_NUM:-1,REWARD:{GOLD:20,EXP:22}}]},ACTION_FRIEND_SEND_REQUEST:{ACTION:'ACTION_FRIEND_SEND_REQUEST',ACTION_ID:14,MIN:0,MAX:1,RATE:15,RATIO:1.0,QUEST_ITEMS:[{LEVEL:7,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'REPU',SKIP_PRICE_NUM:-1,REWARD:{GOLD:40,EXP:44}}]},ACTION_FRIEND_ACCEPTED_REQUEST:{ACTION:'ACTION_FRIEND_ACCEPTED_REQUEST',ACTION_ID:10,MIN:0,MAX:1,RATE:15,RATIO:1.0,QUEST_ITEMS:[{LEVEL:7,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'REPU',SKIP_PRICE_NUM:-1,REWARD:{GOLD:40,EXP:44}}]},ACTION_DAILY_LOGIN:{ACTION:'ACTION_DAILY_LOGIN',ACTION_ID:37,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:7,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:7,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:600,EXP:660}}]},ACTION_COIN_CONSUME:{ACTION:'ACTION_COIN_CONSUME',ACTION_ID:38,MIN:0,MAX:1,RATE:30,RATIO:1.0,QUEST_ITEMS:[{LEVEL:11,RATE:100,REQUIRE_MIN:100,REQUIRE_MAX:100,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:80,EXP:88}}]},ACTION_TRUCK_PACK:{ACTION:'ACTION_TRUCK_PACK',ACTION_ID:49,MIN:0,MAX:1,RATE:40,RATIO:1.0,QUEST_ITEMS:[{LEVEL:9,RATE:100,REQUIRE_MIN:12,REQUIRE_MAX:15,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:48,EXP:53}}]},ACTION_TRUCK_DELIVERY:{ACTION:'ACTION_TRUCK_DELIVERY',ACTION_ID:50,MIN:0,MAX:1,RATE:45,RATIO:1.0,QUEST_ITEMS:[{LEVEL:10,RATE:100,REQUIRE_MIN:3,REQUIRE_MAX:5,SKIP_PRICE_TYPE:'COIN',SKIP_PRICE_NUM:-1,REWARD:{GOLD:180,EXP:198}}]}};
g_QUEST_BOOK.SPECIAL_REWARDS = [{RATE:15,REWARD:{M0:5,M3:5}},{RATE:20,REWARD:{M1:3,M4:3}},{RATE:15,REWARD:{M2:4,M5:4}},{RATE:20,REWARD:{M18:1,M22:3}},{RATE:20,REWARD:{GOLD:5000,M23:1}},{RATE:15,REWARD:{GOLD:5000,M19:1}},{RATE:10,REWARD:{GOLD:5000,M12:3}},{RATE:5,REWARD:{GOLD:5000,M13:3}},{RATE:5,REWARD:{GOLD:8000,D12:1}},{RATE:5,REWARD:{GOLD:8000,D13:1}},{RATE:5,REWARD:{GOLD:8000,D14:1}},{RATE:5,REWARD:{GOLD:8000,D15:1}},{RATE:10,REWARD:{GOLD:10000,P29:1}},{RATE:10,REWARD:{GOLD:10000,P30:1}},{RATE:5,REWARD:{GOLD:10000,P31:1}},{RATE:10,REWARD:{GOLD:10000,P35:1}},{RATE:5,REWARD:{GOLD:10000,P36:1}},{RATE:5,REWARD:{GOLD:10000,P37:1}}];
g_QUEST_BOOK.LEVEL_RATIO = {20:{EXP:1.3,GOLD:1.1},40:{EXP:1.4,GOLD:1.2},60:{EXP:1.5,GOLD:1.3},80:{EXP:1.6,GOLD:1.4},100:{EXP:1.8,GOLD:1.6},150:{EXP:2.0,GOLD:1.8},2147483647:{EXP:2.2,GOLD:2.0}};
