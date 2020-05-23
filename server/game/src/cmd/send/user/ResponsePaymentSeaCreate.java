package cmd.send.user;

import cmd.Message;

public class ResponsePaymentSeaCreate extends Message
{
    public ResponsePaymentSeaCreate (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePaymentSeaCreate packData (String channel, String item, int flow, String phone, String syntax)
    {
        put(KEY_CHANNEL, channel);
        put(KEY_ITEM_ID, item);
        put(KEY_TYPE, flow);
        put(KEY_PHONE, phone);
        put(KEY_DATA, syntax);

        /*
        1. Phân loại trả trước trả sau
            - Kiểm xem trong payment có dữ liệu CHANNEL_PREPAID, CHANNEL_POSTPAID (hiện tại chỉ có bản Thái có phân loại)
        2. Client gửi lệnh PAYMENT_SEA_ASK_PHONE để kiểm xem có cần hiện của sổ hỏi số điện thoại người dùng không?
        3. Client gửi lệnh PAYMENT_SEA_CREATE.
            * Request
                - Nếu là dạng card thì hỏi số card trước rồi gửi chung với lệnh (flow SEA_PAYMENT_FLOW_VERIFY)
            * Response
                Flow SEA_PAYMENT_FLOW_SMS: client chuyển qua cửa sổ tin nhắn
                    - KEY_PHONE : đầu số
                    - KEY_DATA: nội dung tin nhắn

                Flow SEA_PAYMENT_FLOW_WEBVIEW: mở webview
                    - KEY_DATA: url

                Flow SEA_PAYMENT_FLOW_INSTRUCTION: hiện text box hướng dẫn
                    - KEY_DATA: nội dung hướng dẫn

                Flow SEA_PAYMENT_FLOW_OTP : user nhập OTP vào

                Flow SEA_PAYMENT_FLOW_VERIFY: không cần xử lý

         4. Client gửi lệnh PAYMENT_SEA_VERIFY nếu cần
            - Hiện tại chỉ có flow SEA_PAYMENT_FLOW_OTP cần gửi lệnh này
         */

        return this;
    }
}
