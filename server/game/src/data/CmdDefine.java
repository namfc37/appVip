package data;

public interface CmdDefine
{
  short HAND_SHAKE = 0;
  short USER_LOGIN = 1;
  short REGISTER = 1000; //không dùng lệnh này
  short GET_USER_DATA = 1001; //lấy dữ liệu user
  short STOCK_UPGRADE = 1002; //nâng cấp kho
  short BUY_ITEM = 1003; //mua item bằng xu
  short FLOOR_UPGRADE = 1004; //mở tầng mây
  short POT_PUT = 1005; //đặt chậu lên tầng mây
  short POT_STORE = 1006; //cất chậu vào kho
  short POT_MOVE = 1007; //dời chậu
  short POT_UPGRADE = 1008; //nâng cấp chậu
  short PLANT = 1009; //trồng cây
  short PLANT_SKIP_TIME = 1010; //skip thời gian cây phát triển
  short PLANT_CATCH_BUG = 1011; //bắt sâu trên cây
  short PLANT_HARVEST = 1012; //thu hoạch cây
  short MACHINE_UNLOCK = 1013; //unlock máy
  short MACHINE_SKIP_TIME_UNLOCK = 1014; //skip thời chờ máy unlock
  short MACHINE_FINISH_UNLOCK = 1015; //kết thúc quá trình unlock
  short MACHINE_REPAIR = 1016; //sửa máy
  short MACHINE_UPGRADE = 1017; //nâng cấ máy
  short MACHINE_BUY_SLOT = 1018; //mua slot
  short MACHINE_BUY_WORKING_TIME = 1019; //mua thời gian sản xuất
  short MACHINE_PRODUCE = 1020; //sản xuất
  short MACHINE_HARVEST = 1021; //cất đồ từ kho tạm của máy vào kho
  short MACHINE_SKIP_TIME_PRODUCE = 1022; //skip thời gian chờ sản xuất
  short ORDER_DELIVERY = 1023; //giao hàng order
  short ORDER_GET_REWARD = 1024; //nhận thưởng
  short ORDER_CANCEL = 1025; //hủy order
  short ORDER_ACTIVE = 1026; //mua order daily
  short ORDER_SKIP_TIME = 1027; //skip time cancel
  short LEVEL_UP = 1028; //lệnh báo lên level, server chủ động gửi
  short BUY_IBSHOP = 1029; //mua đồ qua IB shop
  short SELL_FOR_JACK = 1030; //bán đồ cho Jack
  short PRIVATE_SHOP_SKIP_TIME = 1031; //skip time chờ quảng cáo
  short PRIVATE_SHOP_PUT = 1032; //đặt hàng lên kệ bán
  short PRIVATE_SHOP_AD = 1033; //đăng quảng cáo
  short PRIVATE_SHOP_CANCEL = 1034; //hủy hàng trên kệ
  short PRIVATE_SHOP_GET_MONEY = 1035; //nhận tiền bán hàng
  short PRIVATE_SHOP_UNLOCK_COIN = 1036; //mở slot bằng tiền
  short PRIVATE_SHOP_FRIEND_GET = 1037; //lấy data private shop của bạn
  short PRIVATE_SHOP_FRIEND_BUY = 1038; //mua đồ trong private shop của bạn
  short PRIVATE_SHOP_NEWS_BOARD = 1039; //lấy bảng tin private shop
  short UPDATE_COIN = 1040; //update coin mới nhất
  short AIRSHIP_UNLOCK = 1041; //unlock airship
  short AIRSHIP_SKIP_TIME_UNLOCK = 1042; //skip thời gian chờ unlock
  short AIRSHIP_SKIP_TIME_INACTIVE = 1043; //skip thời gian inactive
  short AIRSHIP_PACK = 1044; //đóng hàng
  short AIRSHIP_DELIVERY = 1045; //giao hàng airship
  short AIRSHIP_FRIEND_GET = 1046; //lấy data airship của bạn
  short AIRSHIP_FRIEND_PACK = 1047; //đóng hàng cho bạn
  short AIRSHIP_CANCEL = 1048; //hủy giao hàng airship
  short AIRSHIP_REQUEST_HELP = 1049; //nhờ bạn giúp
  short AIRSHIP_NEWS_BOARD = 1050; //lấy bảng tin airship
  short AIRSHIP_GET = 1051; //lấy lại data airship
  short TOM_HIRE = 1052; //thuê Tom
  short TOM_FIND = 1053; //nhờ tom tìm hàng
  short TOM_BUY = 1054; //mua hàng của Tom
  short TOM_CANCEL = 1055; //không mua hàng của tom
  short TOM_REDUCE_TIME = 1056; //giảm thời gian chờ của tom
  short LUCKY_SPIN = 1057; //quay vòng quay may mắn, nếu đầy kho sẽ không nhận được quà, phải dùng lệnh get reward để nhận
  short LUCKY_SPIN_GET_REWARD = 1058; //nhận quà vòng quay
  short MAIL_MARK_READ = 1059; //đánh dấu đã đọc mail
  short MAIL_DELETE = 1060; //xóa mail
  short MAIL_GET_REWARD = 1061; //nhận quà trong mail
  short BLACKSMITH_MAKE_POT = 1062; //request đúc chậu
  short MAIL_NOTIFY = 1063; //server update mail mới cho client
  short OPEN_BUILDING_GAME = 1064; //mở nhà game
  short DICE_SPIN = 1065; //quay vòng quay , nếu đầy kho sẽ không nhận được quà, phải dùng lệnh get reward để nhận
  short DICE_GET_REWARD = 1066; //nhận quà săn kho báu
  short DECOR_PUT = 1067; //đặt decor lên tầng mây
  short DECOR_STORE = 1068; //cất decor vào kho
  short PING = 1069; //ping để keep connection
  short EXPIRE_ITEM = 1070; //log item hết hạn
  short DAILY_GIFT_GET_REWARD = 1071; //nhận quà hằng ngày
  short MINE_GET_INFO = 1072; //lấy thông tin Đào mỏ hiện tại
  short MINE_START = 1073; //bắt đầu Đào mỏ
  short MINE_SKIP_TIME = 1074; //hoàn thành Đào mỏ ngay lập tức
  short MINE_RECEIVE_REWARDS = 1075; //nhận quà Đào mỏ
  short GACHA_GET_REWARD = 1076; //nhận quà gacha
  short MAIL_ADD = 1077; //thêm mail vào data user
  short PAYMENT_CARD_SUBMIT = 1078; //thanh toán qua card
  short PAYMENT_SMS_REG = 1079; //tạo nội dung tin nhắn thanh toán qua SMS
  short PAYMENT_ATM_REG = 1080; //tạo url thanh toán atm
  short PAYMENT_GOOGLE_CHECK = 1081; //kiểm tra limit IAP
  short PAYMENT_GOOGLE_SUBMIT = 1082; //thanh toán IAP
  short PAYMENT_PROCESS = 1083; //xử lý phần thưởng hoặc convert item
  short EVENT_MERGE_PUZZLE = 1084; //ghép mảnh
  short EVENT_01_RECEIVE_REWARDS = 1085; //nhận quà
  short EXPIRE_EVENT_ITEM = 1086; //xóa item event
  short MACHINE_GET = 1087; //lấy thông tin máy
  short GACHA_OPEN = 1088; //mở rương gacha
  short TUTORIAL_SAVE = 1089; //save tutorial
  short FRIEND_BUG_GET = 1090; //lấy thông tin bọ nhà bạn
  short FRIEND_BUG_CATCH = 1091; //bắt bọ nhà bạn
  short JACK_PRIVATE_SHOP_BUY = 1092; //mua đồ trong private shop của jack
  short JACK_MACHINE_REPAIR = 1093; //sửa máy nhà jack
  short KICK_USER = 1094; //kick user
  short PRIVATE_SHOP_GET = 1095; //lấy dât private shop
  short FRIEND_GET = 1096; //lấy danh sách bạn theo trang
  short FRIEND_ADD = 1097; //chấp nhận yêu cầu kết bạn
  short FRIEND_NOTIFY_ADD = 1098; //thông báo kết bạn
  short FRIEND_REMOVE = 1099; //xóa bạn đang có
  short FRIEND_NOTIFY_REMOVE = 1100; //thông bảo xóa bạn
  short FRIEND_SEND_REQUEST = 1101; //gửi yêu cầu kết bạn
  short FRIEND_NOTIFY_REQUEST = 1102; //thông báo yêu kết bạn
  short FRIEND_DENY_REQUEST = 1103; //xóa yêu cầu kết bạn
  short FRIEND_VISIT = 1104; //thăm bạn
  short FRIEND_REPAIR_MACHINE = 1105; //sửa máy nhà bạn
  short NOTIFY_REPAIR_MACHINE = 1106; //notify có bạn sửa máy
  short MACHINE_UPDATE_FRIEND_REPAIR = 1107; //update đồ bền sau khi bạn sửa
  short PRIVATE_SHOP_UNLOCK_FRIEND = 1108; //mở slot bằng số bạn
  short ACHIEVEMENT_SAVE = 1109; //save achievement
  short ACHIEVEMENT_FINISH = 1110; //kết thúc và nhận quà achievement
  short ACHIEVEMENT_TROPHY_REWARD = 1111; //nhận quà trophy
  short GIFTCODE_GET_REWARD = 1112; //nhận quà giftcode
  short NOTIFY_LOCAL_PAYMENT = 1113; //notify bật/tắt local payment
  short PAYMENT_GET = 1114; //update payment
  short PAYMENT_OFFER_ADD = 1115; //add offer
  short CLOUD_SKIN_APPLY = 1116; //đổi skin tầng mây
  short CLOUD_SKIN_CLEAR = 1117; //đổi skin tầng mây về skin mặc định
  short QUEST_BOOK_ADD = 1118; //thêm quest mới
  short QUEST_BOOK_GET = 1119; //lấy thông tin quest book
  short QUEST_BOOK_SAVE_PROGRESS = 1120; //client save tiến độ các quest
  short QUEST_BOOK_SKIP = 1121; //Hoàn thành nhanh
  short QUEST_BOOK_CLAIM_REWARD = 1122; //client nhận quà từ một quest đã hoàn thành
  short TUTORIAL_STEP = 1123; //save tutorial step
  short CONVERT_OLD_USER = 1124; //covert old user
  short PAYMENT_BRAZIL_CREATE = 1125; //thanh toán bước 1 qua service của Khoa
  short PAYMENT_BRAZIL_PROCESS = 1126; //thanh toán bước 2 qua service của Khoa
  short RATING_GET_REWARD = 1127; //nhận quà rating
  short RANKING_GET_TOP = 1128; //lấy thông tin bảng xếp hạng
  short RANKING_GET_PR = 1129; //lấy thành tích cá nhân
  short RANKING_CLAIM_REWARD_DEFAULT = 1130; //nhận quà mặc định
  short PIG_UPDATE_DIAMOND = 1131; //update kim cương Heo đất
  short PAYMENT_SEA_ASK_PHONE = 1132; //check xem có cần hỏi số điện thoại của user không
  short PAYMENT_SEA_CREATE = 1133; //tạo giao dịch thanh toán
  short PAYMENT_SEA_VERIFY = 1134; //verify OTP
  short FLIPPINGCARDS_GET = 1135; //lấy thông tin mini game Lập Hình
  short FLIPPINGCARDS_UPDATE = 1136; //cập nhật số vé
  short FLIPPINGCARDS_CLAIM_CHECKPOINT = 1137; //nhận quà ở checkpoint
  short FLIPPINGCARDS_GAME_START = 1138; //bắt đầu chơi Lập Hình
  short FLIPPINGCARDS_GAME_USE_ITEM = 1139; //nhận quà sau khi hoàn thành game Lập Hình
  short FLIPPINGCARDS_GAME_END = 1140; //kết thúc chơi Lập Hình
  short QUEST_MISSION_GET = 1141; //lấy thông tin quest book
  short QUEST_MISSION_SAVE_PROGRESS = 1142; //client save tiến độ các quest
  short QUEST_MISSION_CLAIM_REWARD = 1143; //Hoàn thành nhanh
  short TRUCK_GET = 1144; //lấy dữ liệu xe hàng
  short TRUCK_PACK = 1145; //đóng gói hàng
  short TRUCK_DELIVERY = 1146; //giao xe hàng
  short TRUCK_UNLOCK = 1147; //mở khóa xe hàng
  short TRUCK_UPGRADE = 1148; //nâng cấp xe hàng
  short TRUCK_SKIP_TIME_UNLOCK = 1149; //dùng kim cương bỏ qua thời gian chờ unlock
  short TRUCK_SKIP_TIME_INACTIVE = 1150; //dùng kim cương bỏ qua thời gian chờ xe hàng về
  short TRUCK_CANCEL = 1151; //hủy chuyến hàng
  short CONSUME_GET = 1152; //lấy thông tin Consume Event
  short CONSUME_SPIN = 1153; //Quay consume Event
  short CONSUME_CLAIM_REWARD = 1154; //Nhận quà sau khi quay
  short GUILD_GET = 2001; //Lấy thông tin guild theo id
  short GUILD_GET_USER_INFO = 2002; //lấy thông tin guild cơ bản của bản thân
  short GUILD_GET_MEMBERS = 2003; //Lấy danh sách thành viên
  short GUILD_GET_WAITING = 2004; //Lấy danh sách user muốn vào hội
  short GUILD_CREATE = 2005; //tạo nông hội mới
  short GUILD_DISBAND = 2006; //giải tán nông hội
  short GUILD_DISBAND_CANCEL = 2007; //hủy lệnh giải tán nông hội
  short GUILD_GET_SUGGEST = 2008; //lấy danh sách nông hội được đề cử
  short GUILD_SEARCH = 2009; //tìm kiếm nông hội theo tên hoặc id
  short GUILD_SET_PRESIDENT = 2010; //chủ hội chuyển quyền cho thành viên khác
  short GUILD_SET_DEPUTY = 2011; //chỉ định phó hội hoặc gỡ bỏ phó hội
  short GUILD_SET_SETTING = 2012; //thay đổi thiết lập trong hội, bảng tin, avatar, …
  short GUILD_SEND_MAIL = 2013; //gửi tin nhắn tới tất cả member trong hội
  short GUILD_MEMBER_ACCEPT = 2014; //đồng ý có user vào hội
  short GUILD_MEMBER_REJECT = 2015; //không cho user vào hội
  short GUILD_MEMBER_INVITE = 2016; //mời user vào hội
  short GUILD_MEMBER_JOIN = 2017; //user đăng ký vào hội
  short GUILD_MEMBER_KICK = 2018; //khai trừ member
  short GUILD_MEMBER_LEAVE = 2019; //member rời khỏi hội
  short GUILD_MEMBER_CHAT = 2020; //gửi message lên chat log của guild
  short GUILD_MEMBER_DONATE_GET = 2021; //cập nhật thông tin Donate của member nào đó
  short GUILD_MEMBER_DONATE_START = 2022; //nhờ thành viên trong guild hỗ trợ item gì đó
  short GUILD_MEMBER_DONATE = 2023; //gửi item hỗ trợ tới ai đó
  short GUILD_MEMBER_DONATE_END = 2024; //nhận item hỗ trợ
  short GUILD_SYSTEM_MEMBER_UPDATE = 2025; //cập nhật trạng thái các thành viên
  short GUILD_SYSTEM_DISBAND = 2026; //hủy hoàn toàn hội
  short GUILD_DERBY_GET = 2027; //lấy thông tin thi đua hiện tại
  short GUILD_DERBY_GET_GROUP = 2028; //lấy thông tin các guild trong group đang đua
  short GUILD_DERBY_TASK_GET = 2029; //lấy thông tin nhiệm vụ của guild
  short GUILD_DERBY_TASK_REMOVE = 2030; //hủy nhiệm vụ chưa có người nhận
  short GUILD_DERBY_TASK_SKIP_COOLDOWN = 2031; //bỏ thời gian cooldown của task
  short GUILD_DERBY_TASK_ACCEPT = 2032; //nhận nhiệm vụ
  short GUILD_DERBY_TASK_CANCEL = 2033; //hủy nhiệm nhiệm vụ đang làm
  short GUILD_DERBY_TASK_UPDATE_PROCESS = 2034; //cập nhật tiến độ nhiệm vụ
  short GUILD_DERBY_GET_GROUP_GLOBAL = 2035; //lấy danh sách top bang hội toàn server
  short GUILD_DERBY_REWARD_GET = 2036; //lấy thông tin quà cá nhân
  short GUILD_DERBY_REWARD_CLAIM = 2037; //nhận quà cá nhân
  short GUILD_DERBY_REWARD_CHOOSE = 2038; //đổi danh sách chọn quà
  short GUILD_DERBY_REWARD_CHANGE = 2039; //đổi danh sách quà khác
  short GUILD_DERBY_SYSTEM_MEMBER_UPDATE = 2040; //cập nhật trạng thái các thành viên trong derby
  short PAYMENT_LIB_CREATE = 32003; //tạo giao dịch thanh toán
  short PAYMENT_LIB_VERIFY = 32004; //verify OTP
  short CHAT_PING = 3000; //ping để keep connection
  short CHAT_KICK = 3001; //kick user khỏi room
  short CHAT_SEND_PRIVATE = 3002; //chat riêng
  short CHAT_SEND_GUILD = 3003; //chat guild
  short CHAT_ONLINE = 3004; //user online
  short CHAT_OFFLINE = 3005; //user offline
  short EVENT02_EXCHANGE_PACK = 1155; //đổi gói quà
  short EVENT_02_RECEIVE_REWARDS = 1156;
  short PAYMENT_BRAZIL_GET_FLOW = 1157; //lấy thông tin flow payment brazil
  short PAYMENT_BRAZIL_GET_TRANSACTION = 1158; //thực hiện giao dịch nạp tiền
  short GACHAPON_SPIN = 1159; //quay gachapon
  short GACHAPON_RECEIVE_REWARD = 1160; //nhận quà gachapon
  short FISHING_DROP_HOOK = 1161; //sử dụng lưỡi câu
  short FISHING_FISH = 1162; //câu cá (hoàn thành minigame)
  short FISHING_COLLECT_FISH = 1163; //nhận quà sau khi câu
  short FISHING_DROP_BAIT = 1164; //thả mồi dụ lượt cá mới
  short FISHING_GET = 1165; //lấy thông tin fishing
  short FISHING_HIRE_SLOT = 1166; //thuê slot chế lưỡi câu
  short FISHING_PRODUCE_HOOK = 1167;
  short FISHING_COLLECT_HOOK = 1168;
  short EVENT_03_RECEIVE_REWARDS = 1169; //nhận quà tích lũy kg cá
  short DAILY_GIFT_GET = 1170; //lấy dữ liệu daily gift
  short ACCUMULATE_GET = 1171; //lấy thông tin nạp tích lũy
  short ACCUMULATE_MILESTONE_REWARD = 1172; //nhận quà tích lũy
  short ACCUMULATE_STORE = 1173; //đổi quà tích lũy
  short EXPIRE_ACCUMULATE_ITEM = 1174; //đổi token thành vàng sau khi kết thúc nạp tích lũy
  short POSM_SET_USER_INFO = 1175; //cập nhật thông tin trao POSM của user
  short POSM_GET_USER_INFO = 1176; //lấy thông tin trao POSM của user
}
