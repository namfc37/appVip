package service.udp;

import bitzero.server.entities.User;
import bitzero.util.ExtensionUtility;
import service.chat.ChatHandler;
import util.Common;

public class MsgSendChatUser extends AbstractMessage
{
    public int    toUser;
    public short  msgCmd;
    public byte   msgError;
    public String msgData;

    public MsgSendChatUser (int toUser, short msgCmd, byte msgError, byte[] msgData)
    {
        super(CMD_SEND_CHAT_USER);
        this.toUser = toUser;
        this.msgCmd = msgCmd;
        this.msgError = msgError;
        this.msgData = Common.encodeBase64(msgData);
    }

    @Override
    public void handle ()
    {
        User user = ExtensionUtility.globalUserManager.getUserById(toUser);
        if (user != null)
            ChatHandler.send(user, msgCmd, msgError, Common.decodeBase64(msgData));
    }
}
