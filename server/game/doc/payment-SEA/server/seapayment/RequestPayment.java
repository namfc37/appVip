package modules.seapayment ;

import bitzero.server.extensions.data.BaseCmd ;
import bitzero.server.extensions.data.DataCmd ;

import java.nio.ByteBuffer ;

public class RequestPayment extends BaseCmd {
    public int productID; 
    public int paymentType;
    public String countryID;
    public int amount;
    public String cardno;
    public String extradata;
    public RequestPayment(DataCmd dataCmd) {
        super(dataCmd);
        unpackData();
    }

    @Override
    public void unpackData() {
        ByteBuffer bf = makeBuffer();
        try {
            productID = readInt(bf);
            paymentType = readInt(bf);
            countryID = readString(bf);
            amount = readInt(bf);
            cardno = readString(bf);
            extradata = readString(bf);
        } catch (Exception e) {
        }
    }
}