package game.payment;

import bitzero.server.entities.User;
import bitzero.server.extensions.BaseClientRequestHandler;
import bitzero.server.extensions.data.DataCmd;

public class PaymentModule extends BaseClientRequestHandler {
    public static final short MULTI_IDS = 8000;
    private static PaymentModule module = null;
    public PaymentModule() {
        super();
        initConfig();
        module = this;
    }

    private void initConfig() {
        // TODO: reading config code
    }

    public static PaymentModule getInstance() {
        if (module == null) {
            new PaymentIndoModule();
        }
        return module;
    }

    @Override
    public void handleClientRequest(User user, DataCmd dataCmd) {
        // TODO: handle client request here
    }

    public void processMethod(String message){
        String[] contents = message.split("\\|");
        int uId = Integer.parseInt(contents[0]);
        boolean enable = Boolean.parseBoolean(contents[1]);

        // TODO: handle service response

    }
}
