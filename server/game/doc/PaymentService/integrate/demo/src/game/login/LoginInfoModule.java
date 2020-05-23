package game.login;


import bitzero.server.entities.User;
import bitzero.server.extensions.BaseClientRequestHandler;
import bitzero.server.extensions.data.DataCmd;
import bitzero.util.common.business.CommonHandle;
import com.gsn.broker.Broker;

public class LoginInfoModule extends BaseClientRequestHandler {
    public static final short MULTI_IDS = 1000;
    public LoginInfoModule() {
        super();
    }

    @Override
    public void init() {
        initConfig();
    }

    private void initConfig() {
        // TODO: init config here
    }

    //------------------------------------------------------------------------------------------------------------------
    @Override
    public void handleClientRequest(User user, DataCmd data) {
        // TODO: handle client request here

    }

    //------------------------------------------------------------------------------------------------------------------
    private void processRequestPlayerInfo(User user, DataCmd data) {
        // TODO: send base info to user

        // send check payment request to payment service lib
            try {
                Broker.getInstance().sendCheckPayment("" + user.getId(), user.getIpAddress());
            } catch (Exception e) {
                CommonHandle.writeErrLog(e);
            }
    }

}
