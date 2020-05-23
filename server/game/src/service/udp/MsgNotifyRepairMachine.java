package service.udp;

import data.CmdDefine;
import user.UserControl;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgNotifyRepairMachine extends AbstractMessage
{
    private int  userId;
    public  byte floor;

    public MsgNotifyRepairMachine (int userId, byte floor)
    {
        super(CMD_NOTIFY_REPAIR_MACHINE);
        this.userId = userId;
        this.floor = floor;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            userId
                           );
    }

    @Override
    public void handle ()
    {
        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
            return;
        userControl.handleSystemCommand(CmdDefine.NOTIFY_REPAIR_MACHINE, this);
    }
}
