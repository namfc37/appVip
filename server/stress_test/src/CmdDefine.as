package  
{
	/**
	 * ...
	 * @author ducnh
	 */
	public class CmdDefine 
	{
		// Login
		public static const CMD_HAND_SHAKE:int 					= 0;
		public static const CMD_CUSTOM_LOGIN:int 				= 1;
		
		public static const REGISTER:int = 1000; //không dùng lệnh này
		public static const GET_USER_DATA:int = 1001; //lấy dữ liệu user
		public static const STOCK_UPGRADE:int = 1002; //nâng cấp kho
		public static const BUY_ITEM:int = 1003; //mua item bằng xu
		public static const FLOOR_UPGRADE:int = 1004; //mở tầng mây
		public static const POT_PUT:int = 1005; //đặt chậu lên tầng mây
		public static const POT_STORE:int = 1006; //cất chậu vào kho
		public static const POT_MOVE:int = 1007; //dời chậu
		public static const POT_UPGRADE:int = 1008; //nâng cấp chậu
		public static const PLANT:int = 1009; //trồng cây
		public static const PLANT_SKIP_TIME:int = 1010; //skip thời gian cây phát triển
		public static const PLANT_CATCH_BUG:int = 1011; //bắt sâu trên cây
		public static const PLANT_HARVEST:int = 1012; //thu hoạch cây
		public static const MACHINE_UNLOCK:int = 1013; //unlock máy
		public static const MACHINE_SKIP_TIME_UNLOCK:int = 1014; //skip thời chờ máy unlock
		public static const MACHINE_FINISH_UNLOCK:int = 1015; //kết thúc quá trình unlock
		public static const MACHINE_REPAIR:int = 1016; //sửa máy
		public static const MACHINE_UPGRADE:int = 1017; //nâng cấ máy
		public static const MACHINE_BUY_SLOT:int = 1018; //mua slot
		public static const MACHINE_BUY_WORKING_TIME:int = 1019; //mua thời gian sản xuất
		public static const MACHINE_PRODUCE:int = 1020; //sản xuất
		public static const MACHINE_HARVEST:int = 1021; //cất đồ từ kho tạm của máy vào kho
		public static const MACHINE_SKIP_TIME_PRODUCE:int = 1022; //skip thời gian chờ sản xuất
		public static const ORDER_DELIVERY:int = 1023; //giao hàng order
		public static const ORDER_GET_REWARD:int = 1024; //nhận thưởng
		public static const ORDER_CANCEL:int = 1025; //hủy order
		public static const ORDER_ACTIVE:int = 1026; //mua order daily
		public static const ORDER_SKIP_TIME:int = 1027; //skip time cancel
		public static const LEVEL_UP:int = 1028; //lệnh báo lên level, server chủ động gửi
		public static const BUY_IBSHOP:int = 1029; //mua đồ qua IB shop
		public static const SELL_FOR_JACK:int = 1030; //bán đồ cho Jack
		public static const PRIVATE_SHOP_SKIP_TIME:int = 1031; //skip time chờ quảng cáo
		public static const PRIVATE_SHOP_PUT:int = 1032; //đặt hàng lên kệ bán
		public static const PRIVATE_SHOP_AD:int = 1033; //đăng quảng cáo
		public static const PRIVATE_SHOP_CANCEL:int = 1034; //hủy hàng trên kệ
		public static const PRIVATE_SHOP_GET_MONEY:int = 1035; //nhận tiền bán hàng
		public static const PRIVATE_SHOP_UNLOCK_COIN:int = 1036; //mở slot bằng tiền
		public static const PRIVATE_SHOP_FRIEND_GET:int = 1037; //lấy data private shop của bạn
		public static const PRIVATE_SHOP_FRIEND_BUY:int = 1038; //mua đồ trong private shop của bạn
		public static const PRIVATE_SHOP_NEWS_BOARD:int = 1039; //lấy bảng tin private shop
		public static const UPDATE_COIN:int = 1040; //update coin mới nhất
		public static const AIRSHIP_UNLOCK:int = 1041; //unlock airship
		public static const AIRSHIP_SKIP_TIME_UNLOCK:int = 1042; //skip thời gian chờ unlock
		public static const AIRSHIP_SKIP_TIME_INACTIVE:int = 1043; //skip thời gian inactive
		public static const AIRSHIP_PACK:int = 1044; //đóng hàng
		public static const AIRSHIP_DELIVERY:int = 1045; //giao hàng airship
		public static const AIRSHIP_FRIEND_GET:int = 1046; //lấy data airship của bạn
		public static const AIRSHIP_FRIEND_PACK:int = 1047; //đóng hàng cho bạn
		public static const AIRSHIP_CANCEL:int = 1048; //hủy giao hàng airship
		public static const AIRSHIP_REQUEST_HELP:int = 1049; //nhờ bạn giúp
		public static const AIRSHIP_NEWS_BOARD:int = 1050; //lấy bảng tin airship
		public static const AIRSHIP_GET:int = 1051; //lấy lại data airship
		public static const TOM_HIRE:int = 1052; //thuê Tom
		public static const TOM_FIND:int = 1053; //nhờ tom tìm hàng
		public static const TOM_BUY:int = 1054; //mua hàng của Tom
		public static const TOM_CANCEL:int = 1055; //không mua hàng của tom
		public static const TOM_REDUCE_TIME:int = 1056; //giảm thời gian chờ của tom
		public static const LUCKY_SPIN:int = 1057; //quay vòng quay may mắn, nếu đầy kho sẽ không nhận được quà, phải dùng lệnh get reward để nhận
		public static const LUCKY_SPIN_GET_REWARD:int = 1058; //nhận quà vòng quay
		public static const MAIL_MARK_READ:int = 1059; //đánh dấu đã đọc mail
		public static const MAIL_DELETE:int = 1060; //xóa mail
		public static const MAIL_GET_REWARD:int = 1061; //nhận quà trong mail
		public static const BLACKSMITH_MAKE_POT:int = 1062; //request đúc chậu
		public static const MAIL_NOTIFY:int = 1063; //server update mail mới cho client
		public static const OPEN_BUILDING_GAME:int = 1064; //mở nhà game
		public static const DICE_SPIN:int = 1065; //quay vòng quay , nếu đầy kho sẽ không nhận được quà, phải dùng lệnh get reward để nhận
		public static const DICE_GET_REWARD:int = 1066; //nhận quà săn kho báu
		public static const DECOR_PUT:int = 1067; //đặt decor lên tầng mây
		public static const DECOR_STORE:int = 1068; //cất decor vào kho
		public static const PING:int = 1069; //ping để keep connection
		public static const EXPIRE_ITEM:int = 1070; //log item hết hạn
		public static const DAILY_GIFT_GET_REWARD:int = 1071; //nhận quà hằng ngày
		public static const MINE_GET_INFO:int = 1072; //lấy thông tin Đào mỏ hiện tại
		public static const MINE_START:int = 1073; //bắt đầu Đào mỏ
		public static const MINE_SKIP_TIME:int = 1074; //hoàn thành Đào mỏ ngay lập tức
		public static const MINE_RECEIVE_REWARDS:int = 1075; //nhận quà Đào mỏ
		public static const GACHA_GET_REWARD:int = 1076; //nhận quà gacha
		public static const MAIL_ADD:int = 1077; //thêm mail vào data user
		public static const PAYMENT_CARD_SUBMIT:int = 1078; //thanh toán qua card
		public static const PAYMENT_SMS_REG:int = 1079; //tạo nội dung tin nhắn thanh toán qua SMS
		public static const PAYMENT_ATM_REG:int = 1080; //tạo url thanh toán atm
		public static const PAYMENT_GOOGLE_CHECK:int = 1081; //kiểm tra limit IAP
		public static const PAYMENT_GOOGLE_SUBMIT:int = 1082; //thanh toán IAP
		public static const PAYMENT_PROCESS:int = 1083; //xử lý phần thưởng hoặc convert item
		public static const EVENT_MERGE_PUZZLE:int = 1084; //ghép mảnh
		public static const EVENT_01_RECEIVE_REWARDS:int = 1085; //nhận quà
		public static const EXPIRE_EVENT_ITEM:int = 1086; //xóa item event
		public static const MACHINE_GET:int = 1087; //lấy thông tin máy
		public static const GACHA_OPEN:int = 1088; //mở rương gacha
		public static const TUTORIAL_SAVE:int = 1089; //save tutorial
		public static const FRIEND_BUG_GET:int = 1090; //lấy thông tin bọ nhà bạn
		public static const FRIEND_BUG_CATCH:int = 1091; //bắt bọ nhà bạn
		public static const JACK_PRIVATE_SHOP_BUY:int = 1092; //mua đồ trong private shop của jack
		public static const JACK_MACHINE_REPAIR:int = 1093; //sửa máy nhà jack
		public static const KICK_USER:int = 1094; //kick user
		public static const PRIVATE_SHOP_GET:int = 1095; //lấy dât private shop
		public static const FRIEND_GET:int = 1096; //lấy danh sách bạn theo trang
		public static const FRIEND_ADD:int = 1097; //chấp nhận yêu cầu kết bạn
		public static const FRIEND_NOTIFY_ADD:int = 1098; //thông báo kết bạn
		public static const FRIEND_REMOVE:int = 1099; //xóa bạn đang có
		public static const FRIEND_NOTIFY_REMOVE:int = 1100; //thông bảo xóa bạn
		public static const FRIEND_SEND_REQUEST:int = 1101; //gửi yêu cầu kết bạn
		public static const FRIEND_NOTIFY_REQUEST:int = 1102; //thông báo yêu kết bạn
		public static const FRIEND_DENY_REQUEST:int = 1103; //xóa yêu cầu kết bạn
		public static const FRIEND_VISIT:int = 1104; //thăm bạn
		public static const FRIEND_REPAIR_MACHINE:int = 1105; //sửa máy nhà bạn
		public static const NOTIFY_REPAIR_MACHINE:int = 1106; //notify có bạn sửa máy
		public static const MACHINE_UPDATE_FRIEND_REPAIR:int = 1107; //update đồ bền sau khi bạn sửa
		
	}

}