package data;
import java.util.*;
import util.collection.*;
import util.Time;
import java.util.concurrent.ThreadLocalRandom;

public class MiscInfo
{
  public static MiscInfo instance;

  private int DO_USER_LEVEL; //level unlock order daily
  public static int DO_USER_LEVEL() { return instance.DO_USER_LEVEL; }

  private int HOUR_RESET_DAILY; //thời gian reset hằng ngày
  public static int HOUR_RESET_DAILY() { return instance.HOUR_RESET_DAILY; }

  private int ORDER_TIME_DELIVERY;
  public static int ORDER_TIME_DELIVERY() { return instance.ORDER_TIME_DELIVERY; }

  private int ORDER_TIME_WAIT_PAID_ORDER;
  public static int ORDER_TIME_WAIT_PAID_ORDER() { return instance.ORDER_TIME_WAIT_PAID_ORDER; }

  private int[] EXP_PER_DIAMOND;
  public static int EXP_PER_DIAMOND_SIZE() { return instance.EXP_PER_DIAMOND.length; }
  public static int EXP_PER_DIAMOND(int index) { return instance.EXP_PER_DIAMOND[index]; }
  public static int EXP_PER_DIAMOND(int index, int defaultValue) { return (index < 0 || index >= instance.EXP_PER_DIAMOND.length) ? defaultValue : instance.EXP_PER_DIAMOND[index]; }

  private Set<String> IBSHOP_ALLOW_PRICE_TYPE;
  public static boolean IBSHOP_ALLOW_PRICE_TYPE(String id) { return instance.IBSHOP_ALLOW_PRICE_TYPE.contains(id); }
  public static int IBSHOP_ALLOW_PRICE_TYPE_SIZE() { return instance.IBSHOP_ALLOW_PRICE_TYPE.size(); }

  private int TOM_USER_LEVEL; //level unlock Tom
  public static int TOM_USER_LEVEL() { return instance.TOM_USER_LEVEL; }

  private int MAIL_EXPIRE_DAY; //Ngày hết hạn trữ mail
  public static int MAIL_EXPIRE_DAY() { return instance.MAIL_EXPIRE_DAY; }

  private int MAIL_LIMIT_RESPONSE; //giới hạn số mail trả về cho client
  public static int MAIL_LIMIT_RESPONSE() { return instance.MAIL_LIMIT_RESPONSE; }

  private int MAIL_LIMIT_STORE; //giới hạn số mail lưu trữ
  public static int MAIL_LIMIT_STORE() { return instance.MAIL_LIMIT_STORE; }

  private int BUILDING_GAME_USER_LEVEL; //level unlock nhà cổ tích
  public static int BUILDING_GAME_USER_LEVEL() { return instance.BUILDING_GAME_USER_LEVEL; }

  private int RATE_X2_REPAIR_FRIEND_MACHINE; //phần trăm X2 độ bền giảm máy bọ nhà bạn / jack
  public static int RATE_X2_REPAIR_FRIEND_MACHINE() { return instance.RATE_X2_REPAIR_FRIEND_MACHINE; }

  private int RATE_PRICE_REPAIR_FRIEND_MACHINE; //Giá vàng sửa máy nhà bạn/Jack chia cho số này
  public static int RATE_PRICE_REPAIR_FRIEND_MACHINE() { return instance.RATE_PRICE_REPAIR_FRIEND_MACHINE; }

  private int FRIEND_SUGGEST_NUM; //số lượng bạn đề nghị
  public static int FRIEND_SUGGEST_NUM() { return instance.FRIEND_SUGGEST_NUM; }

  private int FRIEND_SUGGEST_MIN_LEVEL; //động chênh lệch tối thiểu của bạn đề nghị
  public static int FRIEND_SUGGEST_MIN_LEVEL() { return instance.FRIEND_SUGGEST_MIN_LEVEL; }

  private int FRIEND_SUGGEST_MAX_LEVEL; //động chênh lệch tối đa của bạn đề nghị
  public static int FRIEND_SUGGEST_MAX_LEVEL() { return instance.FRIEND_SUGGEST_MAX_LEVEL; }

  private int FRIEND_SUGGEST_TIME_WAIT; //thời gian reset danh sách đề nghị
  public static int FRIEND_SUGGEST_TIME_WAIT() { return instance.FRIEND_SUGGEST_TIME_WAIT; }

  private int FRIEND_SUGGEST_TIME_RETRY; //thời gian chờ khi không tìm được bạn đề nghị
  public static int FRIEND_SUGGEST_TIME_RETRY() { return instance.FRIEND_SUGGEST_TIME_RETRY; }

  private int FRIEND_CACHE_LEVEL; //level cache
  public static int FRIEND_CACHE_LEVEL() { return instance.FRIEND_CACHE_LEVEL; }

  private int FRIEND_CACHE_TIME; //thời gian cache thông tin bạn
  public static int FRIEND_CACHE_TIME() { return instance.FRIEND_CACHE_TIME; }

  private boolean FRIEND_ACTIVE; //active friend list
  public static boolean FRIEND_ACTIVE() { return instance.FRIEND_ACTIVE; }

  private int FRIEND_LIMIT; //limit friend
  public static int FRIEND_LIMIT() { return instance.FRIEND_LIMIT; }

  private boolean CLOUD_SKIN_ACTIVE; //ACTIVE SKIN
  public static boolean CLOUD_SKIN_ACTIVE() { return instance.CLOUD_SKIN_ACTIVE; }

  private int CLOUD_SKIN_USER_LEVEL; //level có thể dùng skin tầng mây
  public static int CLOUD_SKIN_USER_LEVEL() { return instance.CLOUD_SKIN_USER_LEVEL; }

  private int FRIEND_LIMIT_REQUEST; //limit friend
  public static int FRIEND_LIMIT_REQUEST() { return instance.FRIEND_LIMIT_REQUEST; }

  private boolean ACHIEVEMENT_ACTIVE; //active achievement
  public static boolean ACHIEVEMENT_ACTIVE() { return instance.ACHIEVEMENT_ACTIVE; }

  private int ACHIEVEMENT_USER_LEVEL; //limit achievement
  public static int ACHIEVEMENT_USER_LEVEL() { return instance.ACHIEVEMENT_USER_LEVEL; }

  private boolean CONVERT_OLD_USER; //tặng quà cho user cũ
  public static boolean CONVERT_OLD_USER() { return instance.CONVERT_OLD_USER; }

  private boolean OFFER_ACTIVE; //active offer
  public static boolean OFFER_ACTIVE() { return instance.OFFER_ACTIVE; }

  private boolean NOTIFY_MANAGER_ACTIVE; //active tính năng notify
  public static boolean NOTIFY_MANAGER_ACTIVE() { return instance.NOTIFY_MANAGER_ACTIVE; }

  private int OFFER_DURATION_BUFFER; //thời gian buffer cho offer
  public static int OFFER_DURATION_BUFFER() { return instance.OFFER_DURATION_BUFFER; }

  private int LEVEL_FREE_SKIP_TIME; //level cho phép chỉnh giá skip time bằng 0
  public static int LEVEL_FREE_SKIP_TIME() { return instance.LEVEL_FREE_SKIP_TIME; }

  private int PACKET_UID_CLIENT_STEP; //DO NOT EDIT
  public static int PACKET_UID_CLIENT_STEP() { return instance.PACKET_UID_CLIENT_STEP; }

  private int PACKET_UID_SERVER_STEP; //DO NOT EDIT
  public static int PACKET_UID_SERVER_STEP() { return instance.PACKET_UID_SERVER_STEP; }

  private int FANPAGE_EVENT_TIME_END; //Thời gian kết thúc fanpage event
  public static int FANPAGE_EVENT_TIME_END() { return instance.FANPAGE_EVENT_TIME_END; }

  private int LEVEL_TUTORIAL_UPGRADE_POT; //level cho phép upgrade chậu đất thành hồng ngọc (1 lần)
  public static int LEVEL_TUTORIAL_UPGRADE_POT() { return instance.LEVEL_TUTORIAL_UPGRADE_POT; }

  private int FANPAGE_EVENT_TIME_END_TH; //Thời gian kết thúc fanpage event
  public static int FANPAGE_EVENT_TIME_END_TH() { return instance.FANPAGE_EVENT_TIME_END_TH; }

  private int POSM_TIME_EXPIRED_IN_DATA_USER; //số ngày tồn tại thông tin posmm trong data user sau khi event kết thúc
  public static int POSM_TIME_EXPIRED_IN_DATA_USER() { return instance.POSM_TIME_EXPIRED_IN_DATA_USER; }

  private int POSM_TIME_EXPIRED_ITEM; //Thời gian tồn tại item POSM sau event
  public static int POSM_TIME_EXPIRED_ITEM() { return instance.POSM_TIME_EXPIRED_ITEM; }

  private int PS_USER_LEVEL; //level unlock Pivate shop
  public static int PS_USER_LEVEL() { return instance.PS_USER_LEVEL; }

  private int PS_NUM_FREE_SLOT; //số lượng slot miễn phí
  public static int PS_NUM_FREE_SLOT() { return instance.PS_NUM_FREE_SLOT; }

  private int PS_NUM_FRIEND_SLOT; //số lượng slot mở bằng số bạn
  public static int PS_NUM_FRIEND_SLOT() { return instance.PS_NUM_FRIEND_SLOT; }

  private int PS_NUM_BUY_SLOT; //số lượng slot mua bằng xu
  public static int PS_NUM_BUY_SLOT() { return instance.PS_NUM_BUY_SLOT; }

  private int PS_DURATION_AD; //thời gian quảng cáo
  public static int PS_DURATION_AD() { return instance.PS_DURATION_AD; }

  private int PS_COUNTDOWN_AD; //thời gian chờ quảng cáo miễn phí
  public static int PS_COUNTDOWN_AD() { return instance.PS_COUNTDOWN_AD; }

  private int[] PS_REQUIRED_FRIEND; //số lượng bạn để mở slot
  public static int PS_REQUIRED_FRIEND_SIZE() { return instance.PS_REQUIRED_FRIEND.length; }
  public static int PS_REQUIRED_FRIEND(int index) { return instance.PS_REQUIRED_FRIEND[index]; }
  public static int PS_REQUIRED_FRIEND(int index, int defaultValue) { return (index < 0 || index >= instance.PS_REQUIRED_FRIEND.length) ? defaultValue : instance.PS_REQUIRED_FRIEND[index]; }

  private int[] PS_PRICE_SLOTS; //giá xu để mua slot
  public static int PS_PRICE_SLOTS_SIZE() { return instance.PS_PRICE_SLOTS.length; }
  public static int PS_PRICE_SLOTS(int index) { return instance.PS_PRICE_SLOTS[index]; }
  public static int PS_PRICE_SLOTS(int index, int defaultValue) { return (index < 0 || index >= instance.PS_PRICE_SLOTS.length) ? defaultValue : instance.PS_PRICE_SLOTS[index]; }

  private int PS_PRICE_CANCEL; //giá xu để hủy bán hàng
  public static int PS_PRICE_CANCEL() { return instance.PS_PRICE_CANCEL; }

  private int PS_NUM_ITEM_PER_SLOT; //số lượng item tối đa trong mỗi slot
  public static int PS_NUM_ITEM_PER_SLOT() { return instance.PS_NUM_ITEM_PER_SLOT; }

  private int NB_PRIVATE_SHOP_USER_LEVEL; //level unlock bảng tin private shop
  public static int NB_PRIVATE_SHOP_USER_LEVEL() { return instance.NB_PRIVATE_SHOP_USER_LEVEL; }

  private int NB_AIRSHIP_USER_LEVEL; //level unlock bảng tin air ship
  public static int NB_AIRSHIP_USER_LEVEL() { return instance.NB_AIRSHIP_USER_LEVEL; }

  private int NB_COUNTDOWN_TIME; //thời gian chờ refresh miễn phí
  public static int NB_COUNTDOWN_TIME() { return instance.NB_COUNTDOWN_TIME; }

  private int NB_PRICE_REFRESH; //giá refresh bằng xu
  public static int NB_PRICE_REFRESH() { return instance.NB_PRICE_REFRESH; }

  private int NB_NUM_ITEM; //số lượng item trong bảng tin
  public static int NB_NUM_ITEM() { return instance.NB_NUM_ITEM; }

  private int AS_UNLOCK_LEVEL; //level unlock
  public static int AS_UNLOCK_LEVEL() { return instance.AS_UNLOCK_LEVEL; }

  private MapItem AS_UNLOCK_REQUIRE_ITEMS; //Item cần để unlock tính năng
  public static MapItem AS_UNLOCK_REQUIRE_ITEMS() { return instance.AS_UNLOCK_REQUIRE_ITEMS; }

  private int AS_UNLOCK_TIME; //Thời gian chờ để unlock tính năng
  public static int AS_UNLOCK_TIME() { return instance.AS_UNLOCK_TIME; }

  private int AS_LEAVE_DURATION_MIN; //Khoảng thời gian rời đi tối thiểu của KKC
  public static int AS_LEAVE_DURATION_MIN() { return instance.AS_LEAVE_DURATION_MIN; }

  private int AS_INCREASE_STEP; //Bước tăng thời gian rời đi của KKC
  public static int AS_INCREASE_STEP() { return instance.AS_INCREASE_STEP; }

  private int AS_LEAVE_DURATION_MAX; //Khoảng thời gian rời đi tối đa của KKC
  public static int AS_LEAVE_DURATION_MAX() { return instance.AS_LEAVE_DURATION_MAX; }

  private int AS_REQUEST_LIMIT_PER_AIRSHIP; //Giới hạn nhờ bạn đóng thùng trong 1 chuyến KKC
  public static int AS_REQUEST_LIMIT_PER_AIRSHIP() { return instance.AS_REQUEST_LIMIT_PER_AIRSHIP; }

  private int AS_HELP_LIMIT_PER_AIRSHIP; //Giới hạn giúp bạn đóng thùng trong 1 chuyến KKC
  public static int AS_HELP_LIMIT_PER_AIRSHIP() { return instance.AS_HELP_LIMIT_PER_AIRSHIP; }

  private int[] TOM_HIRE_DAY; //first use, pack 1, pack 2, pack 3
  public static int TOM_HIRE_DAY_SIZE() { return instance.TOM_HIRE_DAY.length; }
  public static int TOM_HIRE_DAY(int index) { return instance.TOM_HIRE_DAY[index]; }
  public static int TOM_HIRE_DAY(int index, int defaultValue) { return (index < 0 || index >= instance.TOM_HIRE_DAY.length) ? defaultValue : instance.TOM_HIRE_DAY[index]; }

  private int[] TOM_HIRE_PRICE; //first use, pack 1, pack 2, pack 3. NẾU ĐỔI GIÁ THÌ NHỚ SỬA TRONG FILE EVENT
  public static int TOM_HIRE_PRICE_SIZE() { return instance.TOM_HIRE_PRICE.length; }
  public static int TOM_HIRE_PRICE(int index) { return instance.TOM_HIRE_PRICE[index]; }
  public static int TOM_HIRE_PRICE(int index, int defaultValue) { return (index < 0 || index >= instance.TOM_HIRE_PRICE.length) ? defaultValue : instance.TOM_HIRE_PRICE[index]; }

  private int TOM_LONG_REST_DURATION; //Thời gian nghỉ của Tôm sau khi được mua hàng
  public static int TOM_LONG_REST_DURATION() { return instance.TOM_LONG_REST_DURATION; }

  private int TOM_SHORT_REST_DURATION; //Thời gian nghỉ của Tôm khi không được mua hàng
  public static int TOM_SHORT_REST_DURATION() { return instance.TOM_SHORT_REST_DURATION; }

  private int TOM_LIMIT_REST_DURATION; //Thời gian nghỉ tối thiểu, không được dùng item để skip
  public static int TOM_LIMIT_REST_DURATION() { return instance.TOM_LIMIT_REST_DURATION; }

  private int TOM_SALE_OFF_PERCENT;
  public static int TOM_SALE_OFF_PERCENT() { return instance.TOM_SALE_OFF_PERCENT; }

  private int[][] TOM_SALE_DURATION;
  public static boolean isInTomSaleDuration() { return Time.isInDuration(instance.TOM_SALE_DURATION); }
  public static boolean isFinishTomSaleDuration(int timeStart) { return Time.isFinish(instance.TOM_SALE_DURATION, timeStart); }
  public static int getTimeOpenTomSaleDuration() { return Time.getTimeOpenDuration(instance.TOM_SALE_DURATION); }
  public static int getTimeEndTomSaleDuration(int timeStart) { return Time.getTimeEndDuration(instance.TOM_SALE_DURATION, timeStart); }

  private String TOM_X2_ITEM; //item dùng x2 của tom
  public static String TOM_X2_ITEM() { return instance.TOM_X2_ITEM; }

  private String TOM_REDUCE_TIME_ITEM; //item dùng để giảm thời gian nghỉ của tom
  public static String TOM_REDUCE_TIME_ITEM() { return instance.TOM_REDUCE_TIME_ITEM; }

  private int TOM_REDUCE_TIME_VALUE; //giảm thời gian nghỉ của tom
  public static int TOM_REDUCE_TIME_VALUE() { return instance.TOM_REDUCE_TIME_VALUE; }

  private Set<String> TOM_ITEMS;
  public static boolean TOM_ITEMS(String id) { return instance.TOM_ITEMS.contains(id); }
  public static int TOM_ITEMS_SIZE() { return instance.TOM_ITEMS.size(); }

  private int SPIN_USER_LEVEL; //level unlock vòng quay
  public static int SPIN_USER_LEVEL() { return instance.SPIN_USER_LEVEL; }

  private int[] SPIN_PRICE_TURN; //giá xu từng lượt quay
  public static int SPIN_PRICE_TURN_SIZE() { return instance.SPIN_PRICE_TURN.length; }
  public static int SPIN_PRICE_TURN(int index) { return instance.SPIN_PRICE_TURN[index]; }
  public static int SPIN_PRICE_TURN(int index, int defaultValue) { return (index < 0 || index >= instance.SPIN_PRICE_TURN.length) ? defaultValue : instance.SPIN_PRICE_TURN[index]; }

  private int SPIN_PLANT_SLOT; //số lượng slot Plant
  public static int SPIN_PLANT_SLOT() { return instance.SPIN_PLANT_SLOT; }

  private int SPIN_PRODUCT_SLOT; //số lượng slot Product
  public static int SPIN_PRODUCT_SLOT() { return instance.SPIN_PRODUCT_SLOT; }

  private int SPIN_MATERIAL_SLOT; //số lượng slot Material (nâng cấp kho)
  public static int SPIN_MATERIAL_SLOT() { return instance.SPIN_MATERIAL_SLOT; }

  private int SPIN_GOLD_SLOT; //số lượng slot Gold
  public static int SPIN_GOLD_SLOT() { return instance.SPIN_GOLD_SLOT; }

  private int SPIN_POT_SLOT; //số lượng slot Pot
  public static int SPIN_POT_SLOT() { return instance.SPIN_POT_SLOT; }

  private int SPIN_DECOR_SLOT; //số lượng slot Décor
  public static int SPIN_DECOR_SLOT() { return instance.SPIN_DECOR_SLOT; }

  private int SPIN_COIN_SLOT; //số lượt slot Diamond
  public static int SPIN_COIN_SLOT() { return instance.SPIN_COIN_SLOT; }

  private int SPIN_X2_SLOT; //số lượt slot X2
  public static int SPIN_X2_SLOT() { return instance.SPIN_X2_SLOT; }

  private int SPIN_PLANT_RECEIVE_NUM; //số lượng nhận Plant khi quay trúng
  public static int SPIN_PLANT_RECEIVE_NUM() { return instance.SPIN_PLANT_RECEIVE_NUM; }

  private int SPIN_PRODUCT_RECIEVE_NUM; //số lượng nhận Product khi quay trúng
  public static int SPIN_PRODUCT_RECIEVE_NUM() { return instance.SPIN_PRODUCT_RECIEVE_NUM; }

  private int SPIN_POT_RECIEVE_NUM; //số lượng nhận Pot khi quay trúng
  public static int SPIN_POT_RECIEVE_NUM() { return instance.SPIN_POT_RECIEVE_NUM; }

  private int SPIN_DECOR_RECIEVE_NUM; //số lượng nhận Decor khi quay trúng
  public static int SPIN_DECOR_RECIEVE_NUM() { return instance.SPIN_DECOR_RECIEVE_NUM; }

  private int SPIN_MATERIAL_RECIEVE_NUM; //số lượng nhận Material khi quay trúng
  public static int SPIN_MATERIAL_RECIEVE_NUM() { return instance.SPIN_MATERIAL_RECIEVE_NUM; }

  private int SPIN_COIN_RECIEVE_NUM; //số lượng nhận Diamond khi quay trúng
  public static int SPIN_COIN_RECIEVE_NUM() { return instance.SPIN_COIN_RECIEVE_NUM; }

  private int[] SPIN_EVENT_ITEM_ADD; //số lượng item sự kiện nhận kèm các lượt quay
  public static int SPIN_EVENT_ITEM_ADD_SIZE() { return instance.SPIN_EVENT_ITEM_ADD.length; }
  public static int SPIN_EVENT_ITEM_ADD(int index) { return instance.SPIN_EVENT_ITEM_ADD[index]; }
  public static int SPIN_EVENT_ITEM_ADD(int index, int defaultValue) { return (index < 0 || index >= instance.SPIN_EVENT_ITEM_ADD.length) ? defaultValue : instance.SPIN_EVENT_ITEM_ADD[index]; }

  private int SPIN_MARK_GROUP_COIN; //số lần quay trả phí mà không nhận được kim cương
  public static int SPIN_MARK_GROUP_COIN() { return instance.SPIN_MARK_GROUP_COIN; }

  private int SPIN_GROUP_NORMAL;
  public static int SPIN_GROUP_NORMAL() { return instance.SPIN_GROUP_NORMAL; }

  private int SPIN_GROUP_COIN;
  public static int SPIN_GROUP_COIN() { return instance.SPIN_GROUP_COIN; }

  private int SPIN_GROUP_X2;
  public static int SPIN_GROUP_X2() { return instance.SPIN_GROUP_X2; }

  private int[] SPIN_RESET_HOURS; //các mốc giờ reset trong ngày
  public static int SPIN_RESET_HOURS_SIZE() { return instance.SPIN_RESET_HOURS.length; }
  public static int SPIN_RESET_HOURS(int index) { return instance.SPIN_RESET_HOURS[index]; }
  public static int SPIN_RESET_HOURS(int index, int defaultValue) { return (index < 0 || index >= instance.SPIN_RESET_HOURS.length) ? defaultValue : instance.SPIN_RESET_HOURS[index]; }

  private int BLACKSMITH_USER_LEVEL; //level unlock đúc chậu
  public static int BLACKSMITH_USER_LEVEL() { return instance.BLACKSMITH_USER_LEVEL; }

  private int BLACKSMITH_POT_MATERIAL_MIN; //số chậu nguyên liệu tối thiểu
  public static int BLACKSMITH_POT_MATERIAL_MIN() { return instance.BLACKSMITH_POT_MATERIAL_MIN; }

  private int BLACKSMITH_POT_MATERIAL_MAX; //số chậu nguyên liệu tối đa
  public static int BLACKSMITH_POT_MATERIAL_MAX() { return instance.BLACKSMITH_POT_MATERIAL_MAX; }

  private float BLACKSMITH_POT_RATE_UNIT; //tỉ lệ chậu nguyên liệu
  public static float BLACKSMITH_POT_RATE_UNIT() { return instance.BLACKSMITH_POT_RATE_UNIT; }

  private float BLACKSMITH_POT_SET_RATE_UNIT; //tỉ lệ bộ chậu nguyên liệu
  public static float BLACKSMITH_POT_SET_RATE_UNIT() { return instance.BLACKSMITH_POT_SET_RATE_UNIT; }

  private float BLACKSMITH_VIOLET_GRASS_RATE_UNIT; //tỉ lệ cỏ tím
  public static float BLACKSMITH_VIOLET_GRASS_RATE_UNIT() { return instance.BLACKSMITH_VIOLET_GRASS_RATE_UNIT; }

  private float BLACKSMITH_GLOVES_RATE_UNIT; //tỉ lệ găng tay
  public static float BLACKSMITH_GLOVES_RATE_UNIT() { return instance.BLACKSMITH_GLOVES_RATE_UNIT; }

  private int DICE_USER_LEVEL; //level unlock xúc xắc
  public static int DICE_USER_LEVEL() { return instance.DICE_USER_LEVEL; }

  private int DICE_SPIN_SIZE; //số ô trong vòng quay
  public static int DICE_SPIN_SIZE() { return instance.DICE_SPIN_SIZE; }

  private int[] DICE_DAILY_PRICE; //Mốc tiêu kim cương tích lũy nhận xúc xắc
  public static int DICE_DAILY_PRICE_SIZE() { return instance.DICE_DAILY_PRICE.length; }
  public static int DICE_DAILY_PRICE(int index) { return instance.DICE_DAILY_PRICE[index]; }
  public static int DICE_DAILY_PRICE(int index, int defaultValue) { return (index < 0 || index >= instance.DICE_DAILY_PRICE.length) ? defaultValue : instance.DICE_DAILY_PRICE[index]; }

  private int[] DICE_DAILY_ADD; //Số xúc xắc nhận được tương ứng mốc tiêu
  public static int DICE_DAILY_ADD_SIZE() { return instance.DICE_DAILY_ADD.length; }
  public static int DICE_DAILY_ADD(int index) { return instance.DICE_DAILY_ADD[index]; }
  public static int DICE_DAILY_ADD(int index, int defaultValue) { return (index < 0 || index >= instance.DICE_DAILY_ADD.length) ? defaultValue : instance.DICE_DAILY_ADD[index]; }

  private int[] DICE_EVENT_PRICE; //Mốc tiêu kim cương tích lũy nhận xúc xắc
  public static int DICE_EVENT_PRICE_SIZE() { return instance.DICE_EVENT_PRICE.length; }
  public static int DICE_EVENT_PRICE(int index) { return instance.DICE_EVENT_PRICE[index]; }
  public static int DICE_EVENT_PRICE(int index, int defaultValue) { return (index < 0 || index >= instance.DICE_EVENT_PRICE.length) ? defaultValue : instance.DICE_EVENT_PRICE[index]; }

  private int[] DICE_EVENT_ADD; //Số xúc xắc nhận được tương ứng mốc tiêu
  public static int DICE_EVENT_ADD_SIZE() { return instance.DICE_EVENT_ADD.length; }
  public static int DICE_EVENT_ADD(int index) { return instance.DICE_EVENT_ADD[index]; }
  public static int DICE_EVENT_ADD(int index, int defaultValue) { return (index < 0 || index >= instance.DICE_EVENT_ADD.length) ? defaultValue : instance.DICE_EVENT_ADD[index]; }

  private int[][] DICE_EVENT_DURATION; //Khung thời gian reset xúc xắc khi bật thành sự kiện .CHÚ Ý: LUÔN ĐỂ GIỜ TRÙNG VỚI THỜI GIAN RESET HẰNG NGÀY
  public static boolean isInDiceEventDuration() { return Time.isInDuration(instance.DICE_EVENT_DURATION); }
  public static boolean isFinishDiceEventDuration(int timeStart) { return Time.isFinish(instance.DICE_EVENT_DURATION, timeStart); }
  public static int getTimeOpenDiceEventDuration() { return Time.getTimeOpenDuration(instance.DICE_EVENT_DURATION); }
  public static int getTimeEndDiceEventDuration(int timeStart) { return Time.getTimeEndDuration(instance.DICE_EVENT_DURATION, timeStart); }

  private int GACHA_USER_LEVEL; //level unlock gacha
  public static int GACHA_USER_LEVEL() { return instance.GACHA_USER_LEVEL; }

  private int MINE_USER_LEVEL; //level unlock mỏ
  public static int MINE_USER_LEVEL() { return instance.MINE_USER_LEVEL; }

  private int MINE_DURATION_SECONDS; //Thời gian đào mỏ
  public static int MINE_DURATION_SECONDS() { return instance.MINE_DURATION_SECONDS; }

  private int MINE_DISPLAY_WIDTH; //Số ô mỗi hàng
  public static int MINE_DISPLAY_WIDTH() { return instance.MINE_DISPLAY_WIDTH; }

  private int MINE_DISPLAY_HEIGHT; //Số ô mỗi cột
  public static int MINE_DISPLAY_HEIGHT() { return instance.MINE_DISPLAY_HEIGHT; }

  private int MINE_EASY_TYPES_REQUIRE_MIN; //Số loại item easy tối thiểu
  public static int MINE_EASY_TYPES_REQUIRE_MIN() { return instance.MINE_EASY_TYPES_REQUIRE_MIN; }

  private int MINE_EASY_TYPES_REQUIRE_MAX; //Số loại item easy tối đa
  public static int MINE_EASY_TYPES_REQUIRE_MAX() { return instance.MINE_EASY_TYPES_REQUIRE_MAX; }

  private int MINE_MEDIUM_TYPES_REQUIRE_MIN; //Số loại item medium tối thiểu
  public static int MINE_MEDIUM_TYPES_REQUIRE_MIN() { return instance.MINE_MEDIUM_TYPES_REQUIRE_MIN; }

  private int MINE_MEDIUM_TYPES_REQUIRE_MAX; //Số loại item medium tối đa
  public static int MINE_MEDIUM_TYPES_REQUIRE_MAX() { return instance.MINE_MEDIUM_TYPES_REQUIRE_MAX; }

  private int MINE_REFRESH_SECONDS; //thời gian cập nhật lại require item và rewards của mỏ (Seconds)
  public static int MINE_REFRESH_SECONDS() { return instance.MINE_REFRESH_SECONDS; }

  private int DAILY_GIFT_USER_LEVEL; //level unlock Daily Login
  public static int DAILY_GIFT_USER_LEVEL() { return instance.DAILY_GIFT_USER_LEVEL; }

  private int DAILY_GIFT_NEW_USER_DURATION;
  public static int DAILY_GIFT_NEW_USER_DURATION() { return instance.DAILY_GIFT_NEW_USER_DURATION; }

  private int[][] DAILY_GIFT_EVENT_DURATION; //Khung thời gian reset xúc xắc khi bật thành sự kiện .CHÚ Ý: LUÔN ĐỂ GIỜ TRÙNG VỚI THỜI GIAN RESET HẰNG NGÀY
  public static boolean isInDailyGiftEventDuration() { return Time.isInDuration(instance.DAILY_GIFT_EVENT_DURATION); }
  public static boolean isFinishDailyGiftEventDuration(int timeStart) { return Time.isFinish(instance.DAILY_GIFT_EVENT_DURATION, timeStart); }
  public static int getTimeOpenDailyGiftEventDuration() { return Time.getTimeOpenDuration(instance.DAILY_GIFT_EVENT_DURATION); }
  public static int getTimeEndDailyGiftEventDuration(int timeStart) { return Time.getTimeEndDuration(instance.DAILY_GIFT_EVENT_DURATION, timeStart); }

  private boolean DAILY_GIFT_CIRCLE_ACTIVE;
  public static boolean DAILY_GIFT_CIRCLE_ACTIVE() { return instance.DAILY_GIFT_CIRCLE_ACTIVE; }

  private String DAILY_GIFT_CIRCLE_TITLE;
  public static String DAILY_GIFT_CIRCLE_TITLE() { return instance.DAILY_GIFT_CIRCLE_TITLE; }

  private String DAILY_GIFT_CIRCLE_CONTENT;
  public static String DAILY_GIFT_CIRCLE_CONTENT() { return instance.DAILY_GIFT_CIRCLE_CONTENT; }

  private int EV01_USER_LEVEL; //level tham gia event
  public static int EV01_USER_LEVEL() { return instance.EV01_USER_LEVEL; }

  private String EV01_TYPE; //Loại event
  public static String EV01_TYPE() { return instance.EV01_TYPE; }

  private String EV01_ID; //Mã đánh dấu độc nhất của mỗi event
  public static String EV01_ID() { return instance.EV01_ID; }

  private String EV01_TITLE; //Tên event
  public static String EV01_TITLE() { return instance.EV01_TITLE; }

  private String EV01_TIME_START; //Thời điểm bắt đầu event
  public static String EV01_TIME_START() { return instance.EV01_TIME_START; }

  private String EV01_TIME_END; //Thời điểm kết thúc event
  public static String EV01_TIME_END() { return instance.EV01_TIME_END; }

  private String EV01_POINT; //tên event point (Túi thực phẩm)
  public static String EV01_POINT() { return instance.EV01_POINT; }

  private String EV01_PLANT; //tên cây event (Cây Bắp Cải)
  public static String EV01_PLANT() { return instance.EV01_PLANT; }

  private String EV01_DROP_ITEM; //item rớt ra trong Feature Drop
  public static String EV01_DROP_ITEM() { return instance.EV01_DROP_ITEM; }

  private String EVENT_LOGIN_NEWDAY_TITLE; //Tiêu đề của mail
  public static String EVENT_LOGIN_NEWDAY_TITLE() { return instance.EVENT_LOGIN_NEWDAY_TITLE; }

  private String EVENT_LOGIN_NEWDAY_CONTENT; //Nội dung của mail
  public static String EVENT_LOGIN_NEWDAY_CONTENT() { return instance.EVENT_LOGIN_NEWDAY_CONTENT; }

  private String EV01_REWARD_TITLE; //Tiêu đề của mail đổi quà event
  public static String EV01_REWARD_TITLE() { return instance.EV01_REWARD_TITLE; }

  private String EV01_REWARD_CONTENT; //Nội dung của mail đổi quà event
  public static String EV01_REWARD_CONTENT() { return instance.EV01_REWARD_CONTENT; }

  private String EV01_PUZ_REWARD_TITLE; //Tiêu đề của mail đổi quà puzzle
  public static String EV01_PUZ_REWARD_TITLE() { return instance.EV01_PUZ_REWARD_TITLE; }

  private String EV01_PUZ_REWARD_CONTENT; //Nội dung của mail đổi quà puzzle
  public static String EV01_PUZ_REWARD_CONTENT() { return instance.EV01_PUZ_REWARD_CONTENT; }

  private int EV02_USER_LEVEL; //level tham gia event
  public static int EV02_USER_LEVEL() { return instance.EV02_USER_LEVEL; }

  private String EV02_TYPE; //Loại event
  public static String EV02_TYPE() { return instance.EV02_TYPE; }

  private String EV02_ID; //Mã đánh dấu độc nhất của mỗi event
  public static String EV02_ID() { return instance.EV02_ID; }

  private String EV02_TITLE; //Tên event
  public static String EV02_TITLE() { return instance.EV02_TITLE; }

  private String EV02_TIME_START; //Thời điểm bắt đầu event
  public static String EV02_TIME_START() { return instance.EV02_TIME_START; }

  private String EV02_TIME_END; //Thời điểm kết thúc event
  public static String EV02_TIME_END() { return instance.EV02_TIME_END; }

  private String EV02_POINT; //tên event point (sách, điện thoại, gối ngủ, trà sữa, Laptop)
  public static String EV02_POINT() { return instance.EV02_POINT; }

  private String EV02_PLANT; //tên cây event (Cây Tình Yêu), điền tên cây evt trong file Plant
  public static String EV02_PLANT() { return instance.EV02_PLANT; }

  private String EV02_DROP_ITEM; //item rớt ra trong Feature Drop, điền tên cây evt trong file Plant
  public static String EV02_DROP_ITEM() { return instance.EV02_DROP_ITEM; }

  private String EV02_REWARD_TITLE; //Tiêu đề của mail đổi quà puzzle
  public static String EV02_REWARD_TITLE() { return instance.EV02_REWARD_TITLE; }

  private String EV02_REWARD_CONTENT; //Nội dung của mail đổi quà puzzle
  public static String EV02_REWARD_CONTENT() { return instance.EV02_REWARD_CONTENT; }

  private int FRIEND_BUG_USER_LEVEL; //level unlock tính năng bắt bọ
  public static int FRIEND_BUG_USER_LEVEL() { return instance.FRIEND_BUG_USER_LEVEL; }

  private boolean GIFTCODE_ACTIVE; //active gift code
  public static boolean GIFTCODE_ACTIVE() { return instance.GIFTCODE_ACTIVE; }

  private boolean QUEST_BOOK_ACTIVE; //active quest book
  public static boolean QUEST_BOOK_ACTIVE() { return instance.QUEST_BOOK_ACTIVE; }

  private int QUEST_BOOK_USER_LEVEL; //level unlock quest book
  public static int QUEST_BOOK_USER_LEVEL() { return instance.QUEST_BOOK_USER_LEVEL; }

  private int QUEST_BOOK_LIST_NUM; //Số lượng quest cố định hiển thị trên giao diện
  public static int QUEST_BOOK_LIST_NUM() { return instance.QUEST_BOOK_LIST_NUM; }

  private int QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MIN; //Số lượng quest tối thiểu user cần hoàn thành để có tỷ lệ nhận quà đặc biệt
  public static int QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MIN() { return instance.QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MIN; }

  private int QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MAX; //Số lượng quest tối đa user cần hoàn thành để có tỷ lệ nhận quà đặc biệt
  public static int QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MAX() { return instance.QUEST_BOOK_SPECIAL_REWARD_REQUIRE_MAX; }

  private int QUEST_BOOK_SPECIAL_REWARD_RATE; //Tỷ lệ phần trăm nhận quà đặc biệt, tăng dần đến 100%
  public static int QUEST_BOOK_SPECIAL_REWARD_RATE() { return instance.QUEST_BOOK_SPECIAL_REWARD_RATE; }

  private int QUEST_BOOK_WAIT_TO_REFRESH; //Thời gian chờ để nhận quest mới (tính bằng giây)
  public static int QUEST_BOOK_WAIT_TO_REFRESH() { return instance.QUEST_BOOK_WAIT_TO_REFRESH; }

  private boolean RATING_ACTIVE; //active rating
  public static boolean RATING_ACTIVE() { return instance.RATING_ACTIVE; }

  private MapItem RATING_REWARD; //quà rating
  public static MapItem RATING_REWARD() { return instance.RATING_REWARD; }

  private boolean RANKING_BOARD_ACTIVE; //active feature ranking
  public static boolean RANKING_BOARD_ACTIVE() { return instance.RANKING_BOARD_ACTIVE; }

  private boolean TOP_LEVEL_ACTIVE; //active top level
  public static boolean TOP_LEVEL_ACTIVE() { return instance.TOP_LEVEL_ACTIVE; }

  private boolean TOP_EVENT_ACTIVE; //active top event
  public static boolean TOP_EVENT_ACTIVE() { return instance.TOP_EVENT_ACTIVE; }

  private boolean TOP_APPRAISAL_ACTIVE; //active top appraisal
  public static boolean TOP_APPRAISAL_ACTIVE() { return instance.TOP_APPRAISAL_ACTIVE; }

  private boolean TOP_ACTION_ACTIVE; //active top action
  public static boolean TOP_ACTION_ACTIVE() { return instance.TOP_ACTION_ACTIVE; }

  private int RANKING_BOARD_LEVEL; //level unlock Bảng Xếp Hạng
  public static int RANKING_BOARD_LEVEL() { return instance.RANKING_BOARD_LEVEL; }

  private String TOP_PLANT_HARVEST;
  public static String TOP_PLANT_HARVEST() { return instance.TOP_PLANT_HARVEST; }

  private String TOP_MACHINE_HARVEST;
  public static String TOP_MACHINE_HARVEST() { return instance.TOP_MACHINE_HARVEST; }

  private String TOP_ORDER_DELIVERY;
  public static String TOP_ORDER_DELIVERY() { return instance.TOP_ORDER_DELIVERY; }

  private String TOP_AIRSHIP_DELIVERY;
  public static String TOP_AIRSHIP_DELIVERY() { return instance.TOP_AIRSHIP_DELIVERY; }

  private String TOP_POT_UPGRADE;
  public static String TOP_POT_UPGRADE() { return instance.TOP_POT_UPGRADE; }

  private String TOP_CATCH_BUG;
  public static String TOP_CATCH_BUG() { return instance.TOP_CATCH_BUG; }

  private String TOP_MACHINE_REPAIR;
  public static String TOP_MACHINE_REPAIR() { return instance.TOP_MACHINE_REPAIR; }

  private String TOP_MINE;
  public static String TOP_MINE() { return instance.TOP_MINE; }

  private String TOP_AIRSHIP_FRIEND_PACK;
  public static String TOP_AIRSHIP_FRIEND_PACK() { return instance.TOP_AIRSHIP_FRIEND_PACK; }

  private String TOP_TRUCK_DELIVERY;
  public static String TOP_TRUCK_DELIVERY() { return instance.TOP_TRUCK_DELIVERY; }

  private String TOP_LEVEL;
  public static String TOP_LEVEL() { return instance.TOP_LEVEL; }

  private String TOP_APPRAISAL;
  public static String TOP_APPRAISAL() { return instance.TOP_APPRAISAL; }

  private String TOP_ACTION;
  public static String TOP_ACTION() { return instance.TOP_ACTION; }

  private String TOP_EVENT;
  public static String TOP_EVENT() { return instance.TOP_EVENT; }

  private byte TOP_LEVEL_INDEX;
  public static byte TOP_LEVEL_INDEX() { return instance.TOP_LEVEL_INDEX; }

  private byte TOP_APPRAISAL_INDEX;
  public static byte TOP_APPRAISAL_INDEX() { return instance.TOP_APPRAISAL_INDEX; }

  private byte TOP_ACTION_INDEX;
  public static byte TOP_ACTION_INDEX() { return instance.TOP_ACTION_INDEX; }

  private byte TOP_EVENT_INDEX;
  public static byte TOP_EVENT_INDEX() { return instance.TOP_EVENT_INDEX; }

  private byte TOP_NUM;
  public static byte TOP_NUM() { return instance.TOP_NUM; }

  private byte RANKING_BOARD_ITEM_NUM; //kích thước bảng xếp hạng cache
  public static byte RANKING_BOARD_ITEM_NUM() { return instance.RANKING_BOARD_ITEM_NUM; }

  private byte RANKING_BOARD_VIEW_NUM; //kích thước bảng xếp hạng ở client
  public static byte RANKING_BOARD_VIEW_NUM() { return instance.RANKING_BOARD_VIEW_NUM; }

  private byte RANKING_BOARD_STATUS_OPEN;
  public static byte RANKING_BOARD_STATUS_OPEN() { return instance.RANKING_BOARD_STATUS_OPEN; }

  private byte RANKING_BOARD_STATUS_CLOSE;
  public static byte RANKING_BOARD_STATUS_CLOSE() { return instance.RANKING_BOARD_STATUS_CLOSE; }

  private String TOP_LEVEL_TITLE;
  public static String TOP_LEVEL_TITLE() { return instance.TOP_LEVEL_TITLE; }

  private String TOP_APPRAISAL_TITLE;
  public static String TOP_APPRAISAL_TITLE() { return instance.TOP_APPRAISAL_TITLE; }

  private String TOP_ACTION_TITLE;
  public static String TOP_ACTION_TITLE() { return instance.TOP_ACTION_TITLE; }

  private String TOP_EVENT_TITLE;
  public static String TOP_EVENT_TITLE() { return instance.TOP_EVENT_TITLE; }

  private int TOP_APPRAISAL_REFRESH_TIME; //số giây cập nhật chỉ số vườn cá nhân
  public static int TOP_APPRAISAL_REFRESH_TIME() { return instance.TOP_APPRAISAL_REFRESH_TIME; }

  private int[] RANKING_UPDATE_HOURS; //giờ update bảng ranking mỗi ngày
  public static int RANKING_UPDATE_HOURS_SIZE() { return instance.RANKING_UPDATE_HOURS.length; }
  public static int RANKING_UPDATE_HOURS(int index) { return instance.RANKING_UPDATE_HOURS[index]; }
  public static int RANKING_UPDATE_HOURS(int index, int defaultValue) { return (index < 0 || index >= instance.RANKING_UPDATE_HOURS.length) ? defaultValue : instance.RANKING_UPDATE_HOURS[index]; }

  private int RANKING_UPDATE_DELAY; //số giây delay trước khi load cache
  public static int RANKING_UPDATE_DELAY() { return instance.RANKING_UPDATE_DELAY; }

  private int RANKING_TIME_SHOW_BOARD; //số giây hiển thị bxh sau khi kết thúc event
  public static int RANKING_TIME_SHOW_BOARD() { return instance.RANKING_TIME_SHOW_BOARD; }

  private boolean FLIPPINGCARDS_ACTIVE; //Active Game Lật Hình
  public static boolean FLIPPINGCARDS_ACTIVE() { return instance.FLIPPINGCARDS_ACTIVE; }

  private int FLIPPINGCARDS_USER_LEVEL; //level tham gia Lật Hình
  public static int FLIPPINGCARDS_USER_LEVEL() { return instance.FLIPPINGCARDS_USER_LEVEL; }

  private String FLIPPINGCARDS_TICKET; //Tên hoặc Id của Item dùng làm vé tham gia Lật Hình
  public static String FLIPPINGCARDS_TICKET() { return instance.FLIPPINGCARDS_TICKET; }

  private int FLIPPINGCARDS_TICKET_LIMIT_NUM; //Số lượng Item tối đa mà hệ thống tự động sinh ra
  public static int FLIPPINGCARDS_TICKET_LIMIT_NUM() { return instance.FLIPPINGCARDS_TICKET_LIMIT_NUM; }

  private int FLIPPINGCARDS_TICKET_COOLDOWN; //Hệ thống tự động cộng thêm 1 Vé Trò Chơi Lật Hình sau mỗi 900s
  public static int FLIPPINGCARDS_TICKET_COOLDOWN() { return instance.FLIPPINGCARDS_TICKET_COOLDOWN; }

  private String FLIPPINGCARDS_REWARD_TITLE; //Tiêu đề của mail đổi quà event
  public static String FLIPPINGCARDS_REWARD_TITLE() { return instance.FLIPPINGCARDS_REWARD_TITLE; }

  private String FLIPPINGCARDS_REWARD_CONTENT; //Nội dung của mail đổi quà event
  public static String FLIPPINGCARDS_REWARD_CONTENT() { return instance.FLIPPINGCARDS_REWARD_CONTENT; }

  private int FLIPPINGCARDS_BOARD_REQUIRE_TICKET; //Số lượng token user cần spent để tham gia 1 ván chơi
  public static int FLIPPINGCARDS_BOARD_REQUIRE_TICKET() { return instance.FLIPPINGCARDS_BOARD_REQUIRE_TICKET; }

  private int FLIPPINGCARDS_BOARD_LEVEL_MIN; //số cặp hình tối thiểu
  public static int FLIPPINGCARDS_BOARD_LEVEL_MIN() { return instance.FLIPPINGCARDS_BOARD_LEVEL_MIN; }

  private int FLIPPINGCARDS_BOARD_LEVEL_MAX; //số cặp hình tối đa
  public static int FLIPPINGCARDS_BOARD_LEVEL_MAX() { return instance.FLIPPINGCARDS_BOARD_LEVEL_MAX; }

  private int FLIPPINGCARDS_BOARD_PLAY_DURATION; //Thời  gian tối đa cho phép hoàn thành màn chơi để tính điểm, tính bằng giây
  public static int FLIPPINGCARDS_BOARD_PLAY_DURATION() { return instance.FLIPPINGCARDS_BOARD_PLAY_DURATION; }

  private int FLIPPINGCARDS_BOARD_REVIEW_DURATION; //Thời gian để user nhìn trước màn chơi (tính nằng giây)
  public static int FLIPPINGCARDS_BOARD_REVIEW_DURATION() { return instance.FLIPPINGCARDS_BOARD_REVIEW_DURATION; }

  private int FLIPPINGCARDS_BOARD_MOVEMENT_COUNTDOWN; //Thời gian đếm ngược để màn chơi tự động di chuyển 1 cặp hình bất kì
  public static int FLIPPINGCARDS_BOARD_MOVEMENT_COUNTDOWN() { return instance.FLIPPINGCARDS_BOARD_MOVEMENT_COUNTDOWN; }

  private int FLIPPINGCARDS_BOARD_MATCH_POINT; //Hệ số tính theo số cặp ghép đúng
  public static int FLIPPINGCARDS_BOARD_MATCH_POINT() { return instance.FLIPPINGCARDS_BOARD_MATCH_POINT; }

  private int FLIPPINGCARDS_BOARD_MISS_POINT; //Hệ số tính theo số cặp ghép sai
  public static int FLIPPINGCARDS_BOARD_MISS_POINT() { return instance.FLIPPINGCARDS_BOARD_MISS_POINT; }

  private int FLIPPINGCARDS_BOARD_GOLD_REWARD; //hệ số Phần thưởng Vàng mặc định
  public static int FLIPPINGCARDS_BOARD_GOLD_REWARD() { return instance.FLIPPINGCARDS_BOARD_GOLD_REWARD; }

  private int FLIPPINGCARDS_BOARD_EXP_REWARD; //hệ số Phần thưởng kinh nghiệm mặc định
  public static int FLIPPINGCARDS_BOARD_EXP_REWARD() { return instance.FLIPPINGCARDS_BOARD_EXP_REWARD; }

  private String FLIPPINGCARDS_BOARD_ITEM1_ID; //Mắt Soi
  public static String FLIPPINGCARDS_BOARD_ITEM1_ID() { return instance.FLIPPINGCARDS_BOARD_ITEM1_ID; }

  private int FLIPPINGCARDS_BOARD_ITEM1_EFFECT; //Lật tạm thời toàn bộ hình trong 2s
  public static int FLIPPINGCARDS_BOARD_ITEM1_EFFECT() { return instance.FLIPPINGCARDS_BOARD_ITEM1_EFFECT; }

  private String FLIPPINGCARDS_BOARD_ITEM2_ID; //Đóng Băng
  public static String FLIPPINGCARDS_BOARD_ITEM2_ID() { return instance.FLIPPINGCARDS_BOARD_ITEM2_ID; }

  private int FLIPPINGCARDS_BOARD_ITEM2_EFFECT; //Tạm ngưng xáo bài trong 5s
  public static int FLIPPINGCARDS_BOARD_ITEM2_EFFECT() { return instance.FLIPPINGCARDS_BOARD_ITEM2_EFFECT; }

  private String FLIPPINGCARDS_BOARD_ITEM3_ID; //Giải Cứu
  public static String FLIPPINGCARDS_BOARD_ITEM3_ID() { return instance.FLIPPINGCARDS_BOARD_ITEM3_ID; }

  private int FLIPPINGCARDS_BOARD_ITEM3_EFFECT; //Lật dùm 1 cặp hình
  public static int FLIPPINGCARDS_BOARD_ITEM3_EFFECT() { return instance.FLIPPINGCARDS_BOARD_ITEM3_EFFECT; }

  private boolean QUEST_MISSION_ACTIVE; //active mission
  public static boolean QUEST_MISSION_ACTIVE() { return instance.QUEST_MISSION_ACTIVE; }

  private int QUEST_MISSION_USER_LEVEL_MIN; //level unlock mission
  public static int QUEST_MISSION_USER_LEVEL_MIN() { return instance.QUEST_MISSION_USER_LEVEL_MIN; }

  private int QUEST_MISSION_USER_LEVEL_MAX; //level lock mission
  public static int QUEST_MISSION_USER_LEVEL_MAX() { return instance.QUEST_MISSION_USER_LEVEL_MAX; }

  private int CONSUME_USER_LEVEL; //level tham gia event
  public static int CONSUME_USER_LEVEL() { return instance.CONSUME_USER_LEVEL; }

  private int CONSUME_TIME_START; //Thời gian bắt đầu mở consume event
  public static int CONSUME_TIME_START() { return instance.CONSUME_TIME_START; }

  private int CONSUME_TIME_END; //Thời gian kết thúc consume event
  public static int CONSUME_TIME_END() { return instance.CONSUME_TIME_END; }

  private boolean GUILD_ACTIVE;
  public static boolean GUILD_ACTIVE() { return instance.GUILD_ACTIVE; }

  private int GUILD_USER_LEVEL; //level unlock nông hội
  public static int GUILD_USER_LEVEL() { return instance.GUILD_USER_LEVEL; }

  private int GUILD_CREATE_REQUIRE_COIN; //coin cần để tạo hội
  public static int GUILD_CREATE_REQUIRE_COIN() { return instance.GUILD_CREATE_REQUIRE_COIN; }

  private MapItem GUILD_CREATE_REQUIRE_ITEMS; //Item cần để tạo hội
  public static MapItem GUILD_CREATE_REQUIRE_ITEMS() { return instance.GUILD_CREATE_REQUIRE_ITEMS; }

  private int GUILD_CREATE_REQUIRE_APPRAISAL; //Giá trị vườn yêu cầu để có thể tạo hội, lớn hơn hoặc bằng số này
  public static int GUILD_CREATE_REQUIRE_APPRAISAL() { return instance.GUILD_CREATE_REQUIRE_APPRAISAL; }

  private int GUILD_CREATE_LEVEL_MIN; //Số level cộng thêm - Min
  public static int GUILD_CREATE_LEVEL_MIN() { return instance.GUILD_CREATE_LEVEL_MIN; }

  private int GUILD_CREATE_LEVEL_MAX; //Số level cộng thêm - Max
  public static int GUILD_CREATE_LEVEL_MAX() { return instance.GUILD_CREATE_LEVEL_MAX; }

  private int GUILD_NAME_LENGHT; //Giới hạn độ dài Tên Hội
  public static int GUILD_NAME_LENGHT() { return instance.GUILD_NAME_LENGHT; }

  private int GUILD_INTRO_LENGHT; //Giới hạn độ dài Giới thiệu của Hội
  public static int GUILD_INTRO_LENGHT() { return instance.GUILD_INTRO_LENGHT; }

  private int GUILD_DASHBOARD_LENGHT; //Giới hạn độ dài Bản tin
  public static int GUILD_DASHBOARD_LENGHT() { return instance.GUILD_DASHBOARD_LENGHT; }

  private int GUILD_PRESIDENT_OFF_DAY; //Số ngày offline liên tục của chủ hội, quá số này sẽ mất quyền chủ hội
  public static int GUILD_PRESIDENT_OFF_DAY() { return instance.GUILD_PRESIDENT_OFF_DAY; }

  private int GUILD_MEMBER_OFF_DAY; //Số ngày offline liên tục của thành viên, quá thời gian sẽ bị kick khỏi hội
  public static int GUILD_MEMBER_OFF_DAY() { return instance.GUILD_MEMBER_OFF_DAY; }

  private int GUILD_SUGGEST_SIZE; //Số lượng hội nằm trong danh sách đề nghị
  public static int GUILD_SUGGEST_SIZE() { return instance.GUILD_SUGGEST_SIZE; }

  private int GUILD_SUGGEST_COOLDOWN; //Thời gian update lại danh sách gợi ý hội mới
  public static int GUILD_SUGGEST_COOLDOWN() { return instance.GUILD_SUGGEST_COOLDOWN; }

  private int GUILD_SUGGEST_CACHE; //Số lượng bang hội trong cache
  public static int GUILD_SUGGEST_CACHE() { return instance.GUILD_SUGGEST_CACHE; }

  private int GUILD_LEAVE_PENALTY; //Thời gian chờ để User có thể gia nhập hội khác sau khi tự rời 1 hội nào đó
  public static int GUILD_LEAVE_PENALTY() { return instance.GUILD_LEAVE_PENALTY; }

  private int GUILD_KICK_PENALTY; //Thời gian chờ để User có thể gửi yêu cầu gia nhập hội bất kì nếu bị đá ra
  public static int GUILD_KICK_PENALTY() { return instance.GUILD_KICK_PENALTY; }

  private int GUILD_INBOX_DURATION; //Thời gian lưu trữ tin nhắn trong hộp thư
  public static int GUILD_INBOX_DURATION() { return instance.GUILD_INBOX_DURATION; }

  private int GUILD_DONATE_TURN_LIMIT; //Số lần tối đa được phép yêu cầu vật phẩm trong ngày
  public static int GUILD_DONATE_TURN_LIMIT() { return instance.GUILD_DONATE_TURN_LIMIT; }

  private int GUILD_DONATE_ITEM_LIMIT; //Số lượng giới hạn tổng donate vật phẩm trong ngày
  public static int GUILD_DONATE_ITEM_LIMIT() { return instance.GUILD_DONATE_ITEM_LIMIT; }

  private int GUILD_DONATE_DURATION; //Yêu cầu nếu không được donate đủ quá thời gian này sẽ tự động biến mất
  public static int GUILD_DONATE_DURATION() { return instance.GUILD_DONATE_DURATION; }

  private int GUILD_DONATE_COOLDOWN; //Thời gian chờ đến lượt yêu cầu vật phẩm tiếp theo
  public static int GUILD_DONATE_COOLDOWN() { return instance.GUILD_DONATE_COOLDOWN; }

  private String GUILD_DONATE_MAIL_TITLE;
  public static String GUILD_DONATE_MAIL_TITLE() { return instance.GUILD_DONATE_MAIL_TITLE; }

  private String GUILD_DONATE_MAIL_DESC;
  public static String GUILD_DONATE_MAIL_DESC() { return instance.GUILD_DONATE_MAIL_DESC; }

  private String GUILD_DONATE_FAIL_MAIL_DESC; //nội dung thư donate khi không có người donate
  public static String GUILD_DONATE_FAIL_MAIL_DESC() { return instance.GUILD_DONATE_FAIL_MAIL_DESC; }

  private String GUILD_ACCEPT_JOIN_MAIL_CONTENT; //nội dung thư chào mừng thành viên mới
  public static String GUILD_ACCEPT_JOIN_MAIL_CONTENT() { return instance.GUILD_ACCEPT_JOIN_MAIL_CONTENT; }

  private String GUILD_INVITE_MAIL_CONTENT; //nội dung thư mời vào guild
  public static String GUILD_INVITE_MAIL_CONTENT() { return instance.GUILD_INVITE_MAIL_CONTENT; }

  private String GUILD_KICK_MAIL_CONTENT; //nội dung thư mời ra khỏi guild
  public static String GUILD_KICK_MAIL_CONTENT() { return instance.GUILD_KICK_MAIL_CONTENT; }

  private String GUILD_DISBAND_MAIL_CONTENT; //nội dung thư mời giải tán guild
  public static String GUILD_DISBAND_MAIL_CONTENT() { return instance.GUILD_DISBAND_MAIL_CONTENT; }

  private String GUILD_DISBAND_MAIL_NOT_ENOUGHT_MEMBER; //nội dung thư mời giải tán guild khi không đủ thành viên
  public static String GUILD_DISBAND_MAIL_NOT_ENOUGHT_MEMBER() { return instance.GUILD_DISBAND_MAIL_NOT_ENOUGHT_MEMBER; }

  private String GUILD_DISBAND_MAIL_DONT_ACTIVE; //nội dung thư mời giải tán guild khi hội không active
  public static String GUILD_DISBAND_MAIL_DONT_ACTIVE() { return instance.GUILD_DISBAND_MAIL_DONT_ACTIVE; }

  private int GUILD_CHAT_LINE_LIMIT; //Giới hạn tối đa dòng chat lưu trữ trên chatbox
  public static int GUILD_CHAT_LINE_LIMIT() { return instance.GUILD_CHAT_LINE_LIMIT; }

  private int GUILD_CHAT_ITEM_LENGTH; //Giới hạn độ dài tin nhắn trong Chatbox
  public static int GUILD_CHAT_ITEM_LENGTH() { return instance.GUILD_CHAT_ITEM_LENGTH; }

  private int GUILD_OFFLINE_TIME; //Tự động hủy hội nếu bang không được active (tất cả thành viên đều off)
  public static int GUILD_OFFLINE_TIME() { return instance.GUILD_OFFLINE_TIME; }

  private int GUILD_WARNING_TIME; //Tự động hủy hội nếu không đủ số thành viên tối thiểu
  public static int GUILD_WARNING_TIME() { return instance.GUILD_WARNING_TIME; }

  private int GUILD_WARNING_MEMBER; //Không đủ số thành viên tối thiểu này, hội sẽ tự giải tán sau  x ngày
  public static int GUILD_WARNING_MEMBER() { return instance.GUILD_WARNING_MEMBER; }

  private int GUILD_DISBAND_DELAY; //Thời gian chuẩn bị để hủy hội
  public static int GUILD_DISBAND_DELAY() { return instance.GUILD_DISBAND_DELAY; }

  private int GUILD_CACHE_KEY_SIZE; //số lượng bang lưu trong 1 key
  public static int GUILD_CACHE_KEY_SIZE() { return instance.GUILD_CACHE_KEY_SIZE; }

  private int GUILD_CACHE_PERIOD_SAVE; //chu kỳ save
  public static int GUILD_CACHE_PERIOD_SAVE() { return instance.GUILD_CACHE_PERIOD_SAVE; }

  private int GUILD_WAITING_TIME_EXPIRE; //thời gian expire danh sách chờ
  public static int GUILD_WAITING_TIME_EXPIRE() { return instance.GUILD_WAITING_TIME_EXPIRE; }

  private int GUILD_WAITING_LIMIT_SIZE; //giới hạn danh sách chờ
  public static int GUILD_WAITING_LIMIT_SIZE() { return instance.GUILD_WAITING_LIMIT_SIZE; }

  private String GUILD_MSG_PRESIDENT_SET; //nội dung tin nhắn khi đổi bang chủ
  public static String GUILD_MSG_PRESIDENT_SET() { return instance.GUILD_MSG_PRESIDENT_SET; }

  private String GUILD_MSG_DEPUTY_ADD; //nội dung tin nhắn khi thêm phó bang
  public static String GUILD_MSG_DEPUTY_ADD() { return instance.GUILD_MSG_DEPUTY_ADD; }

  private String GUILD_MSG_DEPUTY_REMOVE; //nội dung tin nhắn khi bỏ phó bang
  public static String GUILD_MSG_DEPUTY_REMOVE() { return instance.GUILD_MSG_DEPUTY_REMOVE; }

  private String GUILD_MSG_MEMBER_JOIN; //nội dung tin nhắn khi có member mới
  public static String GUILD_MSG_MEMBER_JOIN() { return instance.GUILD_MSG_MEMBER_JOIN; }

  private String GUILD_MSG_MEMBER_LEAVE; //nội dung tin nhắn khi có member rời khỏi
  public static String GUILD_MSG_MEMBER_LEAVE() { return instance.GUILD_MSG_MEMBER_LEAVE; }

  private boolean GUILD_JOIN_CHECK_APPRAISAL; //có kiểm tra giá trị vườn khi gia nhập hay không
  public static boolean GUILD_JOIN_CHECK_APPRAISAL() { return instance.GUILD_JOIN_CHECK_APPRAISAL; }

  private boolean DERBY_ACTIVE;
  public static boolean DERBY_ACTIVE() { return instance.DERBY_ACTIVE; }

  private int DERBY_JOIN_MEMBER_REQUIRE; //Hội phải đủ số thành viên này mới được tham gia derby, lưu ý chỉnh lại khi release
  public static int DERBY_JOIN_MEMBER_REQUIRE() { return instance.DERBY_JOIN_MEMBER_REQUIRE; }

  private String DERBY_WEEKLY_START_AT_DAY; //Ngày bắt đầu
  public static String DERBY_WEEKLY_START_AT_DAY() { return instance.DERBY_WEEKLY_START_AT_DAY; }

  private int DERBY_WEEKLY_START_AT_HOUR; //Giờ bắt đầu
  public static int DERBY_WEEKLY_START_AT_HOUR() { return instance.DERBY_WEEKLY_START_AT_HOUR; }

  private int DERBY_DURATION; //Tổng thời gian diễn ra derby
  public static int DERBY_DURATION() { return instance.DERBY_DURATION; }

  private int DERBY_GROUP_SIZE; //Số hội cùng rank được chọn vào một bảng đấu
  public static int DERBY_GROUP_SIZE() { return instance.DERBY_GROUP_SIZE; }

  private int DERBY_GUILD_LEVEL_MIN; //Số Level chênh lệch tối thiểu của hội để chọn vào bảng đấu
  public static int DERBY_GUILD_LEVEL_MIN() { return instance.DERBY_GUILD_LEVEL_MIN; }

  private int DERBY_GUILD_LEVEL_MAX; //Số Level chênh lệch tối đa của hội để chọn vào bảng đấu
  public static int DERBY_GUILD_LEVEL_MAX() { return instance.DERBY_GUILD_LEVEL_MAX; }

  private int DERBY_CHAMPION_LEAGUE_WEEK; //Số tuần gần nhất để tổng kết và xếp hạng hội leo rank kim cương toàn server
  public static int DERBY_CHAMPION_LEAGUE_WEEK() { return instance.DERBY_CHAMPION_LEAGUE_WEEK; }

  private int DERBY_TASK_NUMBER; //Số task cố định
  public static int DERBY_TASK_NUMBER() { return instance.DERBY_TASK_NUMBER; }

  private int DERBY_TASK_PICK_COOLDOWN; //Thời gian cooldown để nhận task mới khi thành viên chọn task
  public static int DERBY_TASK_PICK_COOLDOWN() { return instance.DERBY_TASK_PICK_COOLDOWN; }

  private int DERBY_TASK_REMOVE_COOLDOWN; //Thời gian cooldown để nhận task mới sau khi chủ/phó hội hủy
  public static int DERBY_TASK_REMOVE_COOLDOWN() { return instance.DERBY_TASK_REMOVE_COOLDOWN; }

  private int DERBY_MEMBER_TASK_EXTRA_NUMBER; //Số extra task mỗi thành viên được phép mua thêm, sau khi hoàn thành xong giới hạn của mình
  public static int DERBY_MEMBER_TASK_EXTRA_NUMBER() { return instance.DERBY_MEMBER_TASK_EXTRA_NUMBER; }

  private int DERBY_MEMBER_TASK_EXTRA_PRICE; //Số kim cương để mua thêm 1 extra task
  public static int DERBY_MEMBER_TASK_EXTRA_PRICE() { return instance.DERBY_MEMBER_TASK_EXTRA_PRICE; }

  private int DERBY_MEMBER_REWARD_NUMBER; //Số rewards sẽ random từ danh sách rewards ở milestone
  public static int DERBY_MEMBER_REWARD_NUMBER() { return instance.DERBY_MEMBER_REWARD_NUMBER; }

  private int DERBY_MEMBER_REWARD_CHANGE_PRICE; //Giá tiền random lại các rewards từ danh sách rewards ở milestone
  public static int DERBY_MEMBER_REWARD_CHANGE_PRICE() { return instance.DERBY_MEMBER_REWARD_CHANGE_PRICE; }

  private int DERBY_MEMBER_REWARD_COUNTDOWN; //Đếm ngược thời gian chọn và đổi quà
  public static int DERBY_MEMBER_REWARD_COUNTDOWN() { return instance.DERBY_MEMBER_REWARD_COUNTDOWN; }

  private String DERBY_MEMBER_REWARD_MAIL_TITLE; //Tiêu đề mail quà mà user đã chọn từ danh sách quà cuối derby
  public static String DERBY_MEMBER_REWARD_MAIL_TITLE() { return instance.DERBY_MEMBER_REWARD_MAIL_TITLE; }

  private String DERBY_MEMBER_REWARD_MAIL_DESC; //Nội dung mail quà mà user
  public static String DERBY_MEMBER_REWARD_MAIL_DESC() { return instance.DERBY_MEMBER_REWARD_MAIL_DESC; }

  private String DERBY_LEAGUE_GLOBAL; //Key chứa danh sách hội top toàn server
  public static String DERBY_LEAGUE_GLOBAL() { return instance.DERBY_LEAGUE_GLOBAL; }

  private int DERBY_POINT_RATIO; //Lấy điểm cống hiến cột data DERBY_POINT chia cho hệ số này để ra derby point thực tế
  public static int DERBY_POINT_RATIO() { return instance.DERBY_POINT_RATIO; }

  private int DERBY_TASK_LEVEL_DIF; //Level task nhận được <= Level max user trong guild + DERBY_TASK_LEVEL_DIF
  public static int DERBY_TASK_LEVEL_DIF() { return instance.DERBY_TASK_LEVEL_DIF; }

  private int GACHAPONPON_USER_LEVEL; //level unlock gacha
  public static int GACHAPONPON_USER_LEVEL() { return instance.GACHAPONPON_USER_LEVEL; }

  private int GACHAPON_TICKET_REQ; //ticket cần cho 1 lượt quay
  public static int GACHAPON_TICKET_REQ() { return instance.GACHAPON_TICKET_REQ; }

  private int GACHAPON_ORDER_DELIVERY_TICKET; //ticket nhận được khi giao đơn hàng
  public static int GACHAPON_ORDER_DELIVERY_TICKET() { return instance.GACHAPON_ORDER_DELIVERY_TICKET; }

  private int GACHAPON_AIRSHIP_DELIVERY_TICKET; //ticket nhận được khi giao khinh khí cầu
  public static int GACHAPON_AIRSHIP_DELIVERY_TICKET() { return instance.GACHAPON_AIRSHIP_DELIVERY_TICKET; }

  private int GACHAPON_MINE_FINISH_TICKET; //ticket nhận được khi hoàn thành đào mỏ
  public static int GACHAPON_MINE_FINISH_TICKET() { return instance.GACHAPON_MINE_FINISH_TICKET; }

  private int GACHAPON_TRUCK_DELIVERY_TICKET; //ticket nhận được khi giao xe hàng
  public static int GACHAPON_TRUCK_DELIVERY_TICKET() { return instance.GACHAPON_TRUCK_DELIVERY_TICKET; }

  private int[] GACHAPON_TICKET_OPEN_TURN; //Số lần cho phép User mở cùng 1 lúc, hiển thị trên UI
  public static int GACHAPON_TICKET_OPEN_TURN_SIZE() { return instance.GACHAPON_TICKET_OPEN_TURN.length; }
  public static int GACHAPON_TICKET_OPEN_TURN(int index) { return instance.GACHAPON_TICKET_OPEN_TURN[index]; }
  public static int GACHAPON_TICKET_OPEN_TURN(int index, int defaultValue) { return (index < 0 || index >= instance.GACHAPON_TICKET_OPEN_TURN.length) ? defaultValue : instance.GACHAPON_TICKET_OPEN_TURN[index]; }

  private int FISHING_USER_LEVEL; //Level unlock tính năng (sự kiện vẫn là Lv11)
  public static int FISHING_USER_LEVEL() { return instance.FISHING_USER_LEVEL; }

  private boolean FISHING_ACTIVE;
  public static boolean FISHING_ACTIVE() { return instance.FISHING_ACTIVE; }

  private int FISHING_COOLDOWN; //Thời gian cooldown để chờ lượt cá tiếp theo
  public static int FISHING_COOLDOWN() { return instance.FISHING_COOLDOWN; }

  private String FISHING_BAIT; //mồi câu cá
  public static String FISHING_BAIT() { return instance.FISHING_BAIT; }

  private int FISHING_NUM_SLOT_FREE; //số slot chế tạo lưỡi câu free
  public static int FISHING_NUM_SLOT_FREE() { return instance.FISHING_NUM_SLOT_FREE; }

  private int[] FISHING_SLOTS_PRICE; //giá thuê thêm slot chế lưỡi câu trong ngày
  public static int FISHING_SLOTS_PRICE_SIZE() { return instance.FISHING_SLOTS_PRICE.length; }
  public static int FISHING_SLOTS_PRICE(int index) { return instance.FISHING_SLOTS_PRICE[index]; }
  public static int FISHING_SLOTS_PRICE(int index, int defaultValue) { return (index < 0 || index >= instance.FISHING_SLOTS_PRICE.length) ? defaultValue : instance.FISHING_SLOTS_PRICE[index]; }

  private String FISHING_DEFAULT_DROP_ITEM;
  public static String FISHING_DEFAULT_DROP_ITEM() { return instance.FISHING_DEFAULT_DROP_ITEM; }

  private int FISHING_NUM_FISH_F1; //Số cá xám diễn trong hồ
  public static int FISHING_NUM_FISH_F1() { return instance.FISHING_NUM_FISH_F1; }

  private int EV03_USER_LEVEL; //level tham gia event
  public static int EV03_USER_LEVEL() { return instance.EV03_USER_LEVEL; }

  private String EV03_TYPE; //Loại event
  public static String EV03_TYPE() { return instance.EV03_TYPE; }

  private String EV03_ID; //Mã đánh dấu độc nhất của mỗi event
  public static String EV03_ID() { return instance.EV03_ID; }

  private String EV03_TITLE; //Tên event
  public static String EV03_TITLE() { return instance.EV03_TITLE; }

  private String EV03_TIME_START; //Thời điểm bắt đầu event
  public static String EV03_TIME_START() { return instance.EV03_TIME_START; }

  private String EV03_TIME_END; //Thời điểm kết thúc event
  public static String EV03_TIME_END() { return instance.EV03_TIME_END; }

  private String EV03_POINT; //tên event point (số kg cá)
  public static String EV03_POINT() { return instance.EV03_POINT; }

  private String EV03_PLANT; //tên cây event (Cây Đồng Tiền)
  public static String EV03_PLANT() { return instance.EV03_PLANT; }

  private String EV03_DROP_ITEM; //item rớt ra trong Feature Drop
  public static String EV03_DROP_ITEM() { return instance.EV03_DROP_ITEM; }

  private String EV03_REWARD_TITLE; //Tiêu đề của mail đổi quà puzzle
  public static String EV03_REWARD_TITLE() { return instance.EV03_REWARD_TITLE; }

  private String EV03_REWARD_CONTENT; //Nội dung của mail đổi quà puzzle
  public static String EV03_REWARD_CONTENT() { return instance.EV03_REWARD_CONTENT; }

  private int PIG_UNLOCK_LEVEL; //level unlock sự kiện heo đất
  public static int PIG_UNLOCK_LEVEL() { return instance.PIG_UNLOCK_LEVEL; }

  private boolean PIG_ACTIVE; //active tính năng heo đất
  public static boolean PIG_ACTIVE() { return instance.PIG_ACTIVE; }

  private int PIG_MILESTONE_MIN; //Mốc điểm thấp nhất để đập heo
  public static int PIG_MILESTONE_MIN() { return instance.PIG_MILESTONE_MIN; }

  private int PIG_MILESTONE_MAX; //Mốc điểm tối đa để đập heo
  public static int PIG_MILESTONE_MAX() { return instance.PIG_MILESTONE_MAX; }

  private int PIG_PRICE; //Giá nạp VND để đập heo, cần đồng nhất với giá OFFER_PIG_BANK ở file 25.Payment (tab OfferInfo), chỉnh trong tất cả các file payment
  public static int PIG_PRICE() { return instance.PIG_PRICE; }

  private int[][] PIG_DURATION;
  public static boolean isInPigDuration() { return Time.isInDuration(instance.PIG_DURATION); }
  public static boolean isFinishPigDuration(int timeStart) { return Time.isFinish(instance.PIG_DURATION, timeStart); }
  public static int getTimeOpenPigDuration() { return Time.getTimeOpenDuration(instance.PIG_DURATION); }
  public static int getTimeEndPigDuration(int timeStart) { return Time.getTimeEndDuration(instance.PIG_DURATION, timeStart); }

  private int PIG_ORDER_DELIVERY_DIAMOND; //Kim cương tích lũy vào heo khi giao đơn hàng
  public static int PIG_ORDER_DELIVERY_DIAMOND() { return instance.PIG_ORDER_DELIVERY_DIAMOND; }

  private int PIG_AIRSHIP_DELIVERY_DIAMOND; //Kim cương tích lũy vào heo khi giao khinh khí cầu
  public static int PIG_AIRSHIP_DELIVERY_DIAMOND() { return instance.PIG_AIRSHIP_DELIVERY_DIAMOND; }

  private int PIG_MINE_FINISH_DIAMOND; //Kim cương tích lũy vào heo khi hoàn thành đào mỏ
  public static int PIG_MINE_FINISH_DIAMOND() { return instance.PIG_MINE_FINISH_DIAMOND; }

  private int PIG_TRUCK_DELIVERY_DIAMOND; //Kim cương tích lũy vào heo khi giao xe hàng
  public static int PIG_TRUCK_DELIVERY_DIAMOND() { return instance.PIG_TRUCK_DELIVERY_DIAMOND; }

  private int VIP_UNLOCK_LEVEL; //level unlock tính năng VIP
  public static int VIP_UNLOCK_LEVEL() { return instance.VIP_UNLOCK_LEVEL; }

  private boolean VIP_ACTIVE; //active tính năng VIP
  public static boolean VIP_ACTIVE() { return instance.VIP_ACTIVE; }

  private int TRUCK_UNLOCK_LEVEL; //level unlock
  public static int TRUCK_UNLOCK_LEVEL() { return instance.TRUCK_UNLOCK_LEVEL; }

  private MapItem TRUCK_UNLOCK_REQUIRE_ITEMS; //Item cần để unlock tính năng
  public static MapItem TRUCK_UNLOCK_REQUIRE_ITEMS() { return instance.TRUCK_UNLOCK_REQUIRE_ITEMS; }

  private int TRUCK_UNLOCK_TIME; //Thời gian chờ để unlock tính năng
  public static int TRUCK_UNLOCK_TIME() { return instance.TRUCK_UNLOCK_TIME; }

  private int TRUCK_LEAVE_DURATION_MIN; //Khoảng thời gian rời đi tối thiểu của xe
  public static int TRUCK_LEAVE_DURATION_MIN() { return instance.TRUCK_LEAVE_DURATION_MIN; }

  private int TRUCK_INCREASE_STEP; //Bước tăng thời gian rời đi của xe
  public static int TRUCK_INCREASE_STEP() { return instance.TRUCK_INCREASE_STEP; }

  private int TRUCK_LEAVE_DURATION_MAX; //Khoảng thời gian rời đi tối đa của xe
  public static int TRUCK_LEAVE_DURATION_MAX() { return instance.TRUCK_LEAVE_DURATION_MAX; }

  private int TRUCK_MIN_EASY_ITEM_TYPE; //Số loại item dễ yêu cầu tối thiểu
  public static int TRUCK_MIN_EASY_ITEM_TYPE() { return instance.TRUCK_MIN_EASY_ITEM_TYPE; }

  private int TRUCK_MAX_EASY_ITEM_TYPE; //Số loại item dễ yêu cầu tối đa
  public static int TRUCK_MAX_EASY_ITEM_TYPE() { return instance.TRUCK_MAX_EASY_ITEM_TYPE; }

  private int TRUCK_MIN_MEDIUM_ITEM_TYPE; //Số loại item vừa yêu cầu tối thiểu
  public static int TRUCK_MIN_MEDIUM_ITEM_TYPE() { return instance.TRUCK_MIN_MEDIUM_ITEM_TYPE; }

  private int TRUCK_MAX_MEDIUM_ITEM_TYPE; //Số loại item vừa yêu cầu tối đa
  public static int TRUCK_MAX_MEDIUM_ITEM_TYPE() { return instance.TRUCK_MAX_MEDIUM_ITEM_TYPE; }

  private boolean ACCUMULATE_ACTIVE; //Bật tắt tính năng
  public static boolean ACCUMULATE_ACTIVE() { return instance.ACCUMULATE_ACTIVE; }

  private int ACCUMULATE_USER_LEVEL; //level unlock sự kiện
  public static int ACCUMULATE_USER_LEVEL() { return instance.ACCUMULATE_USER_LEVEL; }

  private int ACCUMULATE_COIN_TO_TOKEN; //Token = Kim Cương Nạp Gốc / 50
  public static int ACCUMULATE_COIN_TO_TOKEN() { return instance.ACCUMULATE_COIN_TO_TOKEN; }

  private String ACCUMULATE_TIME_START; //Thời điểm bắt đầu event
  public static String ACCUMULATE_TIME_START() { return instance.ACCUMULATE_TIME_START; }

  private String ACCUMULATE_TIME_END; //Thời điểm kết thúc event
  public static String ACCUMULATE_TIME_END() { return instance.ACCUMULATE_TIME_END; }

  private String ACCUMULATE_TOKEN_ID; //Token tích lũy
  public static String ACCUMULATE_TOKEN_ID() { return instance.ACCUMULATE_TOKEN_ID; }

  private String ACCUMULATION_REWARD_TITLE; //title mail nhận mốc tích lũy
  public static String ACCUMULATION_REWARD_TITLE() { return instance.ACCUMULATION_REWARD_TITLE; }

  private String ACCUMULATION_REWARD_CONTENT; //nội dung mail nhận mốc tích lũy
  public static String ACCUMULATION_REWARD_CONTENT() { return instance.ACCUMULATION_REWARD_CONTENT; }

  private String ACCUMULATION_STORE_TITLE; //title mail đổi quà
  public static String ACCUMULATION_STORE_TITLE() { return instance.ACCUMULATION_STORE_TITLE; }

  private String ACCUMULATION_STORE_CONTENT; //nội dung mail đổi quà
  public static String ACCUMULATION_STORE_CONTENT() { return instance.ACCUMULATION_STORE_CONTENT; }

  private String ACCUMULATE_MAIL_REMOVE_TOKEN_TITLE; //title mail đổi token thành vàng
  public static String ACCUMULATE_MAIL_REMOVE_TOKEN_TITLE() { return instance.ACCUMULATE_MAIL_REMOVE_TOKEN_TITLE; }

  private String ACCUMULATE_MAIL_REMOVE_TOKEN_DESC; //nội dung mail đổi token thành vàng
  public static String ACCUMULATE_MAIL_REMOVE_TOKEN_DESC() { return instance.ACCUMULATE_MAIL_REMOVE_TOKEN_DESC; }

}
