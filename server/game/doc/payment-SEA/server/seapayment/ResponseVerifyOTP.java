package modules.seapayment ;

import bitzero.server.extensions.data.BaseMsg ;

import general.cmd.CmdDefine ;

import java.nio.ByteBuffer ;

public class ResponseVerifyOTP extends BaseMsg {    
    public ResponseVerifyOTP() {
        super((short)32004);
    }

    @Override
    public byte[] createData() {
        ByteBuffer bf = makeBuffer();
        return packBuffer(bf);
    }
}

