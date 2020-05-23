package extension;


import bitzero.engine.sessions.ISession;
import bitzero.server.entities.User;
import bitzero.server.entities.data.ISFSObject;
import bitzero.server.extensions.BZExtension;
import bitzero.server.extensions.data.DataCmd;
import bitzero.util.ExtensionUtility;
import bitzero.util.common.business.Debug;
import bitzero.util.socialcontroller.bean.UserInfo;
import cmd.receive.chat.RequestLoginChat;
import model.MapDeviceId;
import service.chat.ChatHandler;
import util.Common;
import util.Time;
import util.metric.MetricLog;

import java.net.InetSocketAddress;
import java.util.List;


public class ChatExtension extends BZExtension
{
    public static InetSocketAddress address;

    private static boolean       isRunning;
    public static  ChatExtension gameExt;

    public ChatExtension ()
    {
        super();
        setName(GameExtension.EXTENSION_ID);

        gameExt = this;
    }

    @Override
    public void init ()
    {
        try
        {
            isRunning = true;
            EnvConfig.start();

            addRequestHandler(GameExtension.CHAT_MULTI_IDS, ChatHandler.class);

            EnvConfig.markRunning();
        }
        catch (Exception e)
        {
            MetricLog.console(e);
            MetricLog.exception(e);
            System.exit(1);
        }
    }

    @Override
    public void destroy ()
    {
        isRunning = false;
        EnvConfig.markStopping();

        List<User> allUser = ExtensionUtility.globalUserManager.getAllUsers();
        for (User user : allUser)
            ChatHandler.logout(user);

        EnvConfig.stop();
    }

    @Override
    public void doLogin (ISession iSession, ISFSObject isfsObject)
    {

    }

    @Override
    public void doLogin (short cmdId, ISession session, DataCmd objData)
    {
        try
        {
            RequestLoginChat request = new RequestLoginChat(objData);
            UserInfo userInfo = getUserInfo(request);
            if (userInfo == null)
                return;
            ChatHandler.kick(userInfo.getUsername());

            User user = ExtensionUtility.instance().canLogin(userInfo, request.sessionPortal, session);
            if (user == null)
                return;
            ChatHandler.login(session, request, userInfo, user);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static boolean isRunning ()
    {
        return isRunning;
    }

    private UserInfo getUserInfo (RequestLoginChat request) throws Exception
    {
        if (EnvConfig.getUser().useLoginPortal())
            return ExtensionUtility.getUserInfoFormPortal(request.sessionPortal);

        int userId = Common.stringToInt(request.userId, 0);

        if (userId > 0)
        {
            Debug.info("Login by old userId");
            return createGuest(userId);
        }

        int mapId = MapDeviceId.get(request.deviceId);
        if (mapId > 0)
        {
            Debug.info("Login by MapDeviceId");
            return createGuest(mapId);
        }

        Debug.info("Login by new userId");
        return createGuest(0);
    }

    private UserInfo createGuest (int userId)
    {
        if (userId <= 0)
            userId = Time.getUnixTime();

        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(Integer.toString(userId));
        userInfo.setUsername("Guest_" + userId);
        return userInfo;
    }

}
