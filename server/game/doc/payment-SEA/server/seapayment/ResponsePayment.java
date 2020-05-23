package modules.seapayment ;

import bitzero.server.extensions.data.BaseMsg ;

import general.cmd.CmdDefine ;

import java.nio.ByteBuffer ;

public class ResponsePayment extends BaseMsg {

    public String result = "";
    
    public ResponsePayment() {
        super((short)32003);
    }

    @Override
    public byte[] createData() {
        ByteBuffer bf = makeBuffer();
        putStr ( bf , result );
        return packBuffer(bf);
    }
}
