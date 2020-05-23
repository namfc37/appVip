package extension;


import bitzero.engine.sessions.ISession;
import bitzero.server.entities.User;
import bitzero.server.entities.data.ISFSObject;
import bitzero.server.extensions.BZExtension;
import bitzero.server.extensions.data.DataCmd;
import bitzero.util.ExtensionUtility;
import bitzero.util.common.business.Debug;
import bitzero.util.socialcontroller.bean.UserInfo;
import cmd.ErrorConst;
import cmd.receive.authen.RequestLogin;
import data.MiscInfo;
import model.MapDeviceId;
import model.mail.MailManager;
import payment.local.CheckLocalPayment;
import service.GuildHandler;
import service.ServiceKickDaily;
import service.ServiceSaveUserData;
import service.UserHandler;
import service.guild.cache.CacheGuildClient;
import service.newsboard.NewsBoardClient;
import service.old.OldServer;
import user.UserControl;
import util.Common;
import util.Ip2Country;
import util.Time;
import util.metric.MetricLog;

import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;


public class GameExtension extends BZExtension
{
    public final static String EXTENSION_ID = "kvtm";

    public final static short USER_MULTI_IDS  = 1000;
    public final static short GUILD_MULTI_IDS = 2000;
    public final static short CHAT_MULTI_IDS  = 3000;

    private static boolean       isRunning;
    public static  GameExtension gameExt;
    public static  MailManager   mailManager;

    public GameExtension ()
    {
        super();
        setName(EXTENSION_ID);

        gameExt = this;
    }

    @Override
    public void init ()
    {
        try
        {
            isRunning = true;
            EnvConfig.start();

            if (MiscInfo.CONVERT_OLD_USER())
                OldServer.init();

            ServiceSaveUserData.start();
            ServiceKickDaily.start();
            MailManager.start();

            NewsBoardClient.start();
            CacheGuildClient.start();

            if (EnvConfig.useServiceCheckLocalPayment())
                CheckLocalPayment.start();
            else
                Ip2Country.load();

            addRequestHandler(USER_MULTI_IDS, UserHandler.class);
            addRequestHandler(GUILD_MULTI_IDS, GuildHandler.class);

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

        ServiceSaveUserData.stop();
        ServiceKickDaily.stop();
        MailManager.stop();
        NewsBoardClient.stop();
        CacheGuildClient.stop();
        CheckLocalPayment.stop();

        List<User> allUser = ExtensionUtility.globalUserManager.getAllUsers();
        for (User user : allUser)
            UserControl.logout(user);

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
            RequestLogin request = new RequestLogin(objData);
            UserInfo userInfo = getUserInfo(request);
            if (userInfo == null)
                return;
            UserControl.kick(userInfo.getUsername(), ErrorConst.ONLINE);

            User user = ExtensionUtility.instance().canLogin(userInfo, request.sessionPortal, session);
            if (user == null)
                return;
            UserControl.login(session, request, userInfo, user);
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

    private UserInfo getUserInfo (RequestLogin request) throws Exception
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
