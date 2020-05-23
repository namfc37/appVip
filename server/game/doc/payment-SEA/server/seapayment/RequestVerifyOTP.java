package modules.seapayment ;

import bitzero.server.extensions.data.BaseCmd ;
import bitzero.server.extensions.data.DataCmd ;

import bitzero.util.common.business.CommonHandle ;

import general.cmd.RequestVerifyOtpIndo ;

import java.nio.ByteBuffer ;

public class RequestVerifyOTP extends BaseCmd {
    public String otp = "";
    public String transId = "";
    public String refId = "";
    public int paymenttype = 0;
    public int productId = 0;
    
    public RequestVerifyOTP(DataCmd dataCmd) {
        super(dataCmd);
        unpackData();
    }

    @Override
    public void unpackData() {
        ByteBuffer bf = makeBuffer();
        try {
            otp = readString(bf);
            transId = readString(bf);
            refId = readString(bf);
            paymenttype = readInt(bf);
            productId = readInt(bf);
        } catch (Exception e) {
            CommonHandle.writeErrLog(e);
        }
    }
}
