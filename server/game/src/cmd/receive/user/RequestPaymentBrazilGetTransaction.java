package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPaymentBrazilGetTransaction extends Command
{
    public int    channel;
    public String item;
    public String offer;

    public String name;
    public String email;
    public String phone;
    public String document;
    public String token;
    public String maskedCardNumber;
    public String paymentTypeCode;

    public RequestPaymentBrazilGetTransaction (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        channel = readInt(KEY_CHANNEL);
        item = readString(KEY_ITEM_ID);
        offer = readString(KEY_OFFER);

        //flow 6
        name = readString(KEY_NAME);
        email = readString(KEY_MAIL_BOX);
        phone = readString(KEY_PHONE);
        document = readString(KEY_USER_ID);

        //flow 6 + 7
        token = readString(KEY_SIGN);
        maskedCardNumber = readString(KEY_CARD_SERIAL);
        paymentTypeCode = readString(KEY_CARD_CODE);
    }
}