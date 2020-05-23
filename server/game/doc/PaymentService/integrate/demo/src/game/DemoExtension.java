package game;

import bitzero.engine.sessions.ISession;
import bitzero.server.exceptions.BZException;
import bitzero.server.extensions.BZExtension;
import bitzero.server.extensions.data.DataCmd;
import com.gsn.broker.Broker;
import game.login.LoginInfoModule;
import game.payment.PaymentModule;


public class DemoExtension extends BZExtension {
    private static DemoExtension myInstance = null;

    public DemoExtension() {
        super();
        this.setName("demo");
        myInstance = this;
    }

    public static DemoExtension instance() {
        return myInstance;
    }

    //------------------------------------------------------------------------------------------------------------------

    @Override
    public void init() {
        initConfig();

        // init broker (payment service lib)
        Broker.getInstance().setProcess(PaymentModule.class, "processBrokerResponse");
        // end init

        // add request handler
        addRequestHandler(PaymentModule.MULTI_IDS, PaymentIndoModule.class);
        addRequestHandler(LoginInfoModule.MULTI_IDS, LoginInfoModule.class);
    }

    private void initConfig() {
        // TODO: reading config code
    }

    //------------------------------------------------------------------------------------------------------------------
    @Override
    public void doLogin(short cmdId, ISession session, DataCmd objData) throws BZException {
        // TODO: login logic
    }

}
