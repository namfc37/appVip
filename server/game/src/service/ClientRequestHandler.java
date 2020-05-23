package service;

import bitzero.server.entities.User;
import bitzero.server.extensions.BaseClientRequestHandler;
import bitzero.server.extensions.data.DataCmd;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePing;
import data.CmdDefine;
import user.UserControl;
import util.Constant;

public abstract class ClientRequestHandler extends BaseClientRequestHandler
{
    @Override
    public void handleClientRequest (User user, DataCmd dataCmd)
    {
        if (dataCmd.getId() == CmdDefine.PING)
        {
            Message msg = new ResponsePing(dataCmd.getId(), ErrorConst.SUCCESS).packData();
            send(msg, user);
        }
        else
        {
            handleCommand(user, dataCmd);
        }
    }

    protected void send (Message msg, User user)
    {
        send(msg.toBaseMessage(), user);
    }

    public void handleCommand (User user, short cmd)
    {
        UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);

        if (userControl != null)
            userControl.handleSystemCommand(cmd);
    }

    public void handleCommand (User user, DataCmd dataCmd)
    {
        UserControl userControl = (UserControl) user.getProperty(Constant.PROPERTY_USER_CONTROL);

        if (userControl != null)
            userControl.handleUserCommand(this, dataCmd);
    }

    public abstract void handleSystemCommand (String transactionId, UserControl userControl, UserControl.QueueCommand action) throws Exception;

    public abstract void handleUserCommand (String transactionId, UserControl userControl, UserControl.QueueCommand action) throws Exception;
}
