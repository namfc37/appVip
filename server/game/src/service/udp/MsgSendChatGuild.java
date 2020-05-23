package service.udp;

import service.chat.RoomManager;
import util.Common;

import java.util.Set;

public class MsgSendChatGuild extends AbstractMessage
{
    public int          toGuild;
    public short        msgCmd;
    public byte         msgError;
    public String       msgData;
    public Set<Integer> blacklist;

    public MsgSendChatGuild (int toGuild, short msgCmd, byte msgError, byte[] msgData, Set<Integer> blacklist)
    {
        super(CMD_SEND_CHAT_GUILD);
        this.toGuild = toGuild;
        this.msgCmd = msgCmd;
        this.msgError = msgError;
        this.msgData = Common.encodeBase64(msgData);
        this.blacklist = blacklist;
    }

    @Override
    public void handle ()
    {
        RoomManager.sendGuild(toGuild, msgCmd, msgError, Common.decodeBase64(msgData), blacklist);
    }
}
