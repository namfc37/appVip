package eventhandler;

import bitzero.server.core.BZEventParam;
import bitzero.server.core.IBZEvent;
import bitzero.server.entities.User;
import bitzero.server.exceptions.BZException;
import bitzero.server.extensions.BaseServerEventHandler;

/**
 * register event XU_UPDATE on DemoExtention.init()
 * addEventHandler(BZEventType.XU_UPDATE, XuUpdateHandler.class)
 */

public class XuUpdateHandler extends BaseServerEventHandler {
    public XuUpdateHandler() {
        super();
    }

    @Override
    public void handleServerEvent(IBZEvent iBZEvent) throws BZException {
        this.onXuUpdate((User) iBZEvent.getParameter(BZEventParam.USER));
    }
    
    private void onXuUpdate(User user) {
        // process xu update here
    }
}
