package cmd.receive.user;

import bitzero.server.extensions.data.DataCmd;
import cmd.BinaryCommand;

public class RequestPaymentLibVerify extends BinaryCommand
{
    public String otp;
    public String transId;
    public String refId;
    public int    paymentType;
    public int    productId;

    public RequestPaymentLibVerify (DataCmd dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        otp = readString();
        transId = readString();
        refId = readString();
        paymentType = readInt();
        productId = readInt();
    }
}
