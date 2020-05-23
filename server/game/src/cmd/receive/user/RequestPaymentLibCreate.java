package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.BinaryCommand;

public class RequestPaymentLibCreate extends BinaryCommand
{
    public int    productID;
    public int    paymentType;
    public String countryID;
    public int    amount;
    public String cardNo;
    public String extraData;

    public RequestPaymentLibCreate (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        productID = readInt();
        paymentType = readInt();
        countryID = readString();
        amount = readInt();
        cardNo = readString();
        extraData = readString();
    }
}
