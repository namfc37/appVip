package util.metric;

import bitzero.util.config.bean.ConstantMercury;
import bitzero.util.logcontroller.business.LogController;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.CmdName;
import extension.EnvConfig;
import payment.billing.Card;
import user.UserControl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import util.Address;
import util.Time;
import util.collection.MapItem;
import util.pool.PoolStringBuilder;
import util.server.ServerConstant;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.LongAdder;

public class MetricLog
{
    private final static Logger loggerMetric  = LoggerFactory.getLogger("MetricLog");
    private final static Logger loggerConsole = LoggerFactory.getLogger("Console");

    public final static char   NEW_LINE       = '\n';
    public final static char   SEPARATOR_IFRS = ',';
    public final static String SEPARATOR_GAME = ServerConstant.IS_METRICLOG ? "|" : " | ";

    private final static DateTimeFormatter formatterMTO = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final LongAdder numException = new LongAdder();

    private static final PoolStringBuilder pool = new PoolStringBuilder(1024);

    public static StringBuilder getCharSequence (StringBuilder sb, String separator, Object... acs)
    {
        for (Object o : acs)
            sb.append(o).append(separator);
        return sb;
    }

    public static void console (Throwable cause, Object... acs)
    {
        exception(false, cause, acs);
    }

    public static void console (Object... acs)
    {
        final String LOG_CATEGORY = "CONSOLE";

        StringBuilder sb = createLogGame(LOG_CATEGORY);
        getCharSequence(sb, SEPARATOR_GAME, acs);

        loggerConsole.info(sb.toString());
    }

    public static void info (Object... acs)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "INFO";

        StringBuilder sb = createLogGame(LOG_CATEGORY);
        getCharSequence(sb, SEPARATOR_GAME, acs);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void exception (Throwable cause, Object... acs)
    {
        exception(ServerConstant.IS_METRICLOG, cause, acs);
    }

    private static void exception (boolean useMetricLog, Throwable cause, Object... acs)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "INFO";
        numException.increment();
        StringBuilder sb = createLogGame(LOG_CATEGORY);
        getCharSequence(sb, SEPARATOR_GAME, acs);

        sb.append(cause.toString()).append(NEW_LINE);
        for (StackTraceElement ste : cause.getStackTrace())
            sb.append(ste.toString()).append(NEW_LINE);

        writeLogGame(useMetricLog, LOG_CATEGORY, sb);
    }

    private static StringBuilder createLogGame (CharSequence category)
    {
    	StringBuilder sb = pool.get();
        if (ServerConstant.IS_METRICLOG)
            sb.append(Time.getTimeMillis()).append(SEPARATOR_GAME);
        else
            sb.append(category).append(SEPARATOR_GAME);
        
        return sb;
    }

    private static void writeLogGame (boolean useMetricLog, String category, StringBuilder sb)
    {
        if (useMetricLog)
        {
            if (EnvConfig.logAddNewLine())
                sb.append(NEW_LINE);
            LogController.GetController().writeLog(category, sb.toString());

        }
        else
            loggerMetric.info(sb.toString());

        pool.add(sb);
    }

    private static void writeLogGame (String category, StringBuilder sb)
    {
        writeLogGame(ServerConstant.IS_METRICLOG, category, sb);
    }

    public static void register (
            String country,
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            CharSequence vGameClientVersion,
            CharSequence vOSPlatform,
            CharSequence vOSVersion,
            CharSequence vDeviceID,
            CharSequence vDeviceName,
            CharSequence vConnectionType,
            CharSequence vDownloadSource,
            CharSequence vThirdPartySource,
            long iResult,
            Object... ao
                                )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "REGISTER";

        StringBuilder sb = logDefault (
        		LOG_CATEGORY,
        		vUserID,
        		sUserGSNID,
        		sUserSNS,
        		toPlatformID(vOSPlatform),
        		"COMMON",
        		"REGISTER",
        		0,
        		0,
        		0,
        		0
    		);
        
        sb.append(EnvConfig.zone()).append('.').append(country).append(SEPARATOR_GAME)
        .append(vGameClientVersion).append(SEPARATOR_GAME)
        .append(vOSVersion).append(SEPARATOR_GAME)
        .append(vDeviceID).append(SEPARATOR_GAME)
        .append(vDeviceName).append(SEPARATOR_GAME)
        .append(vConnectionType).append(SEPARATOR_GAME)
        .append(vDownloadSource).append(SEPARATOR_GAME)
        .append(vThirdPartySource).append(SEPARATOR_GAME)
        .append(iResult).append(SEPARATOR_GAME);
        
        getCharSequence(sb, SEPARATOR_GAME, ao);

        writeLogGame(LOG_CATEGORY, sb);
        
        gsn_register (vUserID, sUserGSNID, sUserSNS, vOSPlatform);
    }

    private static void gsn_register (
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            CharSequence vOSPlatform)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "GSN_REGISTER";

        StringBuilder sb = logDefault (
        		LOG_CATEGORY,
        		vUserID,
        		sUserGSNID,
        		sUserSNS,
        		toPlatformID(vOSPlatform),
        		"Info",
        		"NewUser",
        		0,
        		0,
        		0,
        		0
    		);

        writeLogGame(LOG_CATEGORY, sb);
    }
    
    public static void convertOldData (
            int userId,
            String userName,
            int oldUserId,
            String facebookId,
            long coinCash,
            long coinPromo,
            int level,
            long exp,
            long gold,
            int reputation
                                      )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "CONVERT_OLD_DATA";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(userId).append(SEPARATOR_GAME)
                .append(userName).append(SEPARATOR_GAME)
                .append(oldUserId).append(SEPARATOR_GAME)
                .append(facebookId).append(SEPARATOR_GAME)
                .append(coinCash).append(SEPARATOR_GAME)
                .append(coinPromo).append(SEPARATOR_GAME)
                .append(level).append(SEPARATOR_GAME)
                .append(exp).append(SEPARATOR_GAME)
                .append(gold).append(SEPARATOR_GAME)
                .append(reputation).append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void login (
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            CharSequence vGameClientVersion,
            CharSequence vOSPlatform,
            CharSequence vOSVersion,
            CharSequence vDeviceID,
            CharSequence vDeviceName,
            CharSequence vConnectionType,
            int iLevel,
            long iExp,
            long iCoinBalance,
            Object vSessionID,
            int iResult,
            CharSequence vClientIP,
            boolean isResetDaily,
            long gold,
            CharSequence serviceIp,
            int serviceGroup,
            int reputation,
            CharSequence simOperator,
            CharSequence country,
            int numSim,
            int statusLocalShop,
            CharSequence packageName,
            CharSequence phone)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "LOGIN";

        StringBuilder sb = logDefault (
        		LOG_CATEGORY,
        		vUserID,
        		sUserGSNID,
        		sUserSNS,
        		toPlatformID(vOSPlatform),
        		"COMMON",
        		"LOGIN",
        		iCoinBalance,
        		0,
        		gold,
        		0
    		);
        
        sb.append(EnvConfig.zone()).append('.').append(country).append(SEPARATOR_GAME)
        .append(vGameClientVersion).append(SEPARATOR_GAME)
        .append(vOSVersion).append(SEPARATOR_GAME)
        .append(vDeviceID).append(SEPARATOR_GAME)
        .append(vDeviceName).append(SEPARATOR_GAME)
        .append(vConnectionType).append(SEPARATOR_GAME)
        .append(iLevel).append(SEPARATOR_GAME)
        .append(iExp).append(SEPARATOR_GAME)
        .append(vSessionID).append(SEPARATOR_GAME)
        .append(iResult).append(SEPARATOR_GAME)
        .append(vClientIP).append(SEPARATOR_GAME)
        .append(isResetDaily).append(SEPARATOR_GAME)
        .append(serviceIp).append(SEPARATOR_GAME)
        .append(serviceGroup).append(SEPARATOR_GAME)
        .append(reputation).append(SEPARATOR_GAME)
        .append(simOperator).append(SEPARATOR_GAME)
        .append(country).append(SEPARATOR_GAME)
        .append(numSim).append(SEPARATOR_GAME)
        .append(statusLocalShop).append(SEPARATOR_GAME)
        .append(packageName).append(SEPARATOR_GAME)
        .append(phone).append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
        
        gsn_login (vUserID, sUserGSNID, sUserSNS, vOSPlatform, iExp, iCoinBalance, vClientIP, gold);
        gsn_device (vUserID, sUserGSNID, sUserSNS, vOSPlatform, vOSVersion, vDeviceID, vDeviceName, iLevel, iCoinBalance, gold);
    }

    private static void gsn_login (
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            CharSequence vOSPlatform,
            long iExp,
            long iCoinBalance,
            CharSequence vClientIP,
            long gold)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "GSN_LOGIN";

        StringBuilder sb = logDefault (
        		LOG_CATEGORY,
        		vUserID,
        		sUserGSNID,
        		sUserSNS,
        		toPlatformID(vOSPlatform),
        		"Info",
        		"PlayerInfoLogin",
        		iCoinBalance,
        		0,
        		gold,
        		0
    		);
        
        sb.append(vClientIP).append(SEPARATOR_GAME)
        .append(iExp).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append("").append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }
    
    private static void gsn_device (
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            CharSequence vOSPlatform,
            CharSequence vOSVersion,
            CharSequence vDeviceID,
            CharSequence vDeviceName,
            int iLevel,
            long iCoinBalance,
            long gold)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "GSN_DEVICE";

        StringBuilder sb = logDefault (
        		LOG_CATEGORY,
        		vUserID,
        		sUserGSNID,
        		sUserSNS,
        		toPlatformID(vOSPlatform),
        		"Info",
        		"LogMobile",
        		iCoinBalance,
        		0,
        		gold,
        		0
    		);
        
        sb.append(vDeviceID).append(SEPARATOR_GAME)
        .append(vDeviceName).append(SEPARATOR_GAME)
        .append(vOSVersion).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(iLevel).append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }
    
    public static void logout (
            String country,
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            int iLevel,
            long iExp,
            long iCoinBalance,
            long iGold,
            CharSequence vSessionID,
            long iTotalOnlineSecond,
            int iResult,
            Object... ao
                              )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "LOGOUT";

        StringBuilder sb = logDefault (
    		LOG_CATEGORY,
    		vUserID,
    		sUserGSNID,
    		"",
    		(short) -1,
    		"COMMON",
    		"LOGOUT",
    		iCoinBalance,
    		0,
    		iGold,
    		0
		);
        		
        sb.append(EnvConfig.zone()).append('.').append(country).append(SEPARATOR_GAME)
        .append(iLevel).append(SEPARATOR_GAME)
        .append(iExp).append(SEPARATOR_GAME)
        .append(vSessionID).append(SEPARATOR_GAME)
        .append(iTotalOnlineSecond).append(SEPARATOR_GAME)
        .append(iResult).append(SEPARATOR_GAME);
        getCharSequence(sb, SEPARATOR_GAME, ao);

        writeLogGame(LOG_CATEGORY, sb);
        
        gsn_logout (vUserID, sUserGSNID, sUserSNS, iExp, iCoinBalance, iGold);
    }

    private static void gsn_logout (
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            long iExp,
            long iCoinBalance,
            long iGold)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "GSN_LOGOUT";

        StringBuilder sb = logDefault (
        		LOG_CATEGORY,
        		vUserID,
        		sUserGSNID,
        		sUserSNS,
        		-1,
        		"Info",
        		"PlayerInfo_disconnect",
        		iCoinBalance,
        		0,
        		iGold,
        		0
    		);
        
        sb.append("").append(SEPARATOR_GAME)
        .append(iExp).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append(0).append(SEPARATOR_GAME)
        .append("").append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }
    
    public static void levelUp (
            String country,
            Object vUserID,
            CharSequence sUserGSNID,
            CharSequence sUserSNS,
            int iOldLevel,
            int iNewLevel,
            long iExp,
            long iCoinBalance,
            long iGold,
            CharSequence vTransactionID,
            MapItem vItemReceivedList,
            Object... ao
                               )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "LEVEL_UP";

        StringBuilder sb = logDefault (
    		LOG_CATEGORY,
    		vUserID,
    		sUserGSNID,
    		sUserSNS,
    		(short) -1,
    		"COMMON",
    		"LEVEL_UP",
    		iCoinBalance,
    		0,
    		iGold,
    		0
		);

        sb.append(EnvConfig.zone()).append('.').append(country).append(SEPARATOR_GAME)
        .append(iOldLevel).append(SEPARATOR_GAME)
        .append(iNewLevel).append(SEPARATOR_GAME)
        .append(iExp).append(SEPARATOR_GAME)
        .append(vTransactionID).append(SEPARATOR_GAME);
        getCharSequence(sb, SEPARATOR_GAME, ao);
        
        items (vItemReceivedList, "ADD", vTransactionID, "LEVEL_UP");
        
        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void actionUser (
		String country,
        short cmd,
        int iPlatfromID,
        Object iUserID,
        String sUserGSNID,
        String sUserSNS,
        short iLevel,
        String sTransactionID,
        MapItem miRemove,
        MapItem miAdd,
        byte iResult,
        long iCoin,
        int iCoinChange,
        long iGold,
        int iGoldChange,
        Object ... ao)
    {
        actionUser(
	        country,
	        CmdName.get(cmd),
	        iPlatfromID,
	        iUserID,
	        sUserGSNID,
	        sUserSNS,
	        iLevel,
	        sTransactionID,
	        miRemove,
	        miAdd,
	        iResult,
	        iCoin,
	        iCoinChange,
	        iGold,
	        iGoldChange,
	        ao
        );
    }
    
    public static void actionUser (CharSequence cmd, Object iUserID, short iLevel, CharSequence sTransactionID, MapItem miRemove, MapItem miAdd, byte iResult, Object ... ao)
    {
        actionUser("", cmd, -1, iUserID, "", "", iLevel, sTransactionID, miRemove, miAdd, iResult, 0, 0, 0, 0, ao);
    }
    
    public static void actionUser (
        short cmd,
        Object iUserID,
        short iLevel,
        CharSequence sTransactionID,
        MapItem miRemove,
        MapItem miAdd,
        byte iResult,
        Object ... ao)
    {
        actionUser(
	        "",
	        CmdName.get(cmd),
	        -1,
	        iUserID,
	        "",
	        "",
	        iLevel,
	        sTransactionID,
	        miRemove,
	        miAdd,
	        iResult,
	        0,
	        0,
	        0,
	        0,
	        ao
        );
    }
    
    public static void actionUser (
		CharSequence country,
		CharSequence sActionName,
        int iPlatfromID,
        Object iUserID,
        CharSequence sUserGSNID,
        CharSequence sUserSNS,
        short iLevel,
        CharSequence sTransactionID,
        MapItem miRemove,
        MapItem miAdd,
        byte iResult,
        long iCoin,
        int iCoinChange,
        long iGold,
        int iGoldChange,
        Object ... ao)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "ACTION_" + sActionName;

        StringBuilder sb = logDefault (
    		LOG_CATEGORY,
            iUserID, sUserGSNID, sUserSNS,
            iPlatfromID,
            "ACTION", sActionName,
            iCoin, iCoinChange,
            iGold, iGoldChange
		);

        sb.append(EnvConfig.zone()).append('.').append(country).append(SEPARATOR_GAME)
          .append(iLevel).append(SEPARATOR_GAME)
          .append(sTransactionID).append(SEPARATOR_GAME)
          .append(iResult).append(SEPARATOR_GAME);
        
        getCharSequence(sb, SEPARATOR_GAME, ao);
        
        writeLogGame(LOG_CATEGORY, sb);
        
        items (miRemove, "REMOVE", sTransactionID, sActionName);
        items (miAdd, "ADD", sTransactionID, sActionName);
    }
	
    public static StringBuilder logDefault (
    	CharSequence category,
        Object iUserID,
        CharSequence sUserGSNID,
        CharSequence sUserSNS,
        int iPlatfromID,
        CharSequence sActionGroup,
        CharSequence sActionName,
        long iCoin,
        int iCoinChange,
        long iGold,
        int iGoldChange)
    {
        StringBuilder sb = createLogGame(category)
            .append(iUserID).append(SEPARATOR_GAME)
            .append(sUserGSNID).append(SEPARATOR_GAME)
            .append(sUserSNS).append(SEPARATOR_GAME)
            .append("").append(SEPARATOR_GAME)				// partner code
            .append("").append(SEPARATOR_GAME)				// reference code or market
            .append(iPlatfromID).append(SEPARATOR_GAME)		// ["web", "iOS", "androidC", "androidJS", "Windows Phone"]
            .append("").append(SEPARATOR_GAME)				// tracking source
            .append(sActionGroup).append(SEPARATOR_GAME)	// group action name
            .append(sActionName).append(SEPARATOR_GAME)
            .append(iGold).append(SEPARATOR_GAME)
            .append(iCoin).append(SEPARATOR_GAME)
            .append(iGoldChange).append(SEPARATOR_GAME)
            .append(iCoinChange).append(SEPARATOR_GAME);
           
        return sb;
    }
    
    public static StringBuilder logDefault (
        	String category,
            Object iUserID,
            String sActionGroup,
            String sActionName)
    {
        StringBuilder sb = createLogGame(category)
            .append(iUserID).append(SEPARATOR_GAME)
            .append("").append(SEPARATOR_GAME)
            .append("").append(SEPARATOR_GAME)
            .append("").append(SEPARATOR_GAME)
            .append("").append(SEPARATOR_GAME)
            .append(-1).append(SEPARATOR_GAME)
            .append("").append(SEPARATOR_GAME)
            .append(sActionGroup).append(SEPARATOR_GAME)
            .append(sActionName).append(SEPARATOR_GAME)
            .append(0).append(SEPARATOR_GAME)
            .append(0).append(SEPARATOR_GAME)
            .append(0).append(SEPARATOR_GAME)
            .append(0).append(SEPARATOR_GAME);
           
        return sb;
    }
    
    public static void items (MapItem items, CharSequence logType, CharSequence sTransactionID)
    {
    	items (items, logType, sTransactionID, "");
    }
    
    public static void items (MapItem items, CharSequence logType, CharSequence sTransactionID, CharSequence sAction)
    {
        if (items == null || items.isEmpty())
        	return;
        
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "ITEM";

        for (MapItem.Entry e : items)
        {
        	if (e.value() == 0)
        		continue;
        	
            StringBuilder sb = createLogGame(LOG_CATEGORY)
        		.append(logType).append(SEPARATOR_GAME)
        		.append(sTransactionID).append(SEPARATOR_GAME)
        		.append(e.key()).append(SEPARATOR_GAME)
        		.append(e.value()).append(SEPARATOR_GAME)
        		.append(sAction);
        		
        	writeLogGame(LOG_CATEGORY, sb);
        }
    }

    public static long getNumException ()
    {
        return numException.sum();
    }

    public static String toString (List<MapItem> items)
    {
        if (items == null || items.isEmpty())
            return "";
        StringBuilder sb = pool.get();
        for (MapItem m : items)
            for (MapItem.Entry e : m)
            {
                if (sb.length() > 0)
                    sb.append(',');
                sb.append(e.key()).append(':').append(e.value());
            }
        String msg = sb.toString();
        pool.add(sb);
        return msg;

    }

    public static String toString (MapItem mapItem)
    {
        if (mapItem == null || mapItem.isEmpty())
            return "";
        StringBuilder sb = pool.get();
        for (MapItem.Entry e : mapItem)
        {
            if (sb.length() > 0)
                sb.append(',');
            sb.append(e.key()).append(':').append(e.value());
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;
    }

    public static String toString (JsonObject mapItem)
    {
        if (mapItem == null || mapItem.size() == 0)
            return "";
        StringBuilder sb = pool.get();
        for (Map.Entry<String, JsonElement> e : mapItem.entrySet())
        {
            if (sb.length() > 0)
                sb.append(',');
            sb.append(e.getKey()).append(':').append(e.getValue().toString());
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;
    }

    public static String toString (String itemId, int num)
    {
        if (itemId == null || itemId.isEmpty())
            return "";
        StringBuilder sb = pool.get();
        sb.append(itemId).append(':').append(num);
        String msg = sb.toString();
        pool.add(sb);
        return msg;
    }

    public static String toString (byte[] ab)
    {
        if (ab == null || ab.length == 0)
            return "";
        StringBuilder sb = pool.get();
        for (int i = 0, len = ab.length; i < len; i++)
        {
            if (i > 0)
                sb.append(',');
            sb.append(ab[i]);
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;

    }

    public static String listIntToString (List<Integer> ab)
    {
        if (ab == null || ab.isEmpty())
            return "";
        StringBuilder sb = pool.get();
        for (int i = 0, len = ab.size(); i < len; i++)
        {
            if (i > 0)
                sb.append(',');
            sb.append(ab.get(i));
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;
    }
    
    public static String setIntToString (Set<Integer> ab)
    {
        if (ab == null || ab.isEmpty())
            return "";
        StringBuilder sb = pool.get();
        int i = 0;
        for (Integer v : ab)
        {
            if (i > 0)
                sb.append(',');
            sb.append(v);
            i += 1;
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;
    }

    public static String toString (int[] ab)
    {
        if (ab == null || ab.length == 0)
            return "";
        StringBuilder sb = pool.get();
        for (int i = 0, len = ab.length; i < len; i++)
        {
            if (i > 0)
                sb.append(',');
            sb.append(ab[i]);
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;

    }

    public static String toString (String[] ab)
    {
        if (ab == null || ab.length == 0)
            return "";
        StringBuilder sb = pool.get();
        for (int i = 0, len = ab.length; i < len; i++)
        {
            if (i > 0)
                sb.append(',');
            sb.append(ab[i]);
        }
        String msg = sb.toString();
        pool.add(sb);
        return msg;

    }
    
	public static int toPlatformID (CharSequence osName)
	{
//		Check client src: PlatformWrapper.getOsName
		switch (osName.toString())
		{
			case "Win32":			return -1;
			case "Android":			return 3;
			case "IOS":				return 1;
			case "WindowPhone8":	return 4;
		}
		
//		Web
		return 0;
	}
	
    public static MapItem toMapItem (JsonObject json)
    {
        if (json == null || json.size() == 0)
            return null;
        
        MapItem mapItem = new MapItem ();
        for (Map.Entry<String, JsonElement> e : json.entrySet())
            mapItem.increase(e.getKey(), e.getValue().getAsInt());
        
        return mapItem;
    }

    public static void gm (
            String vActionName,
            CharSequence admin,
            CharSequence remoteAddress,
            CharSequence reason,
            Object vUserID,
            int result,
            Object... ao
                          )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "GM_" + vActionName;

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(vUserID).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME)
                .append(admin).append(SEPARATOR_GAME)
                .append(remoteAddress).append(SEPARATOR_GAME)
                .append(reason).append(SEPARATOR_GAME)
                .append(result).append(SEPARATOR_GAME);
        getCharSequence(sb, SEPARATOR_GAME, ao);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void monitorSystem (int currentUser,
                                      int currentConnection,
                                      long cpuProcess,
                                      long cpuSystem,
                                      long ramProcess,
                                      long ramFree,
                                      long inBytes,
                                      long outBytes,
                                      long numException,
                                      int numItemAirship,
                                      int numItemPrivateShop,
                                      int numFriend,
                                      int numCacheGuild,
                                      int numSocket,
                                      int numWebSocket
                                     )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "MONITOR_SYSTEM";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(Address.PRIVATE_HOST).append(SEPARATOR_GAME)
                .append(EnvConfig.group()).append(SEPARATOR_GAME)
                .append(EnvConfig.environment()).append(SEPARATOR_GAME)
                .append(EnvConfig.service()).append(SEPARATOR_GAME)
                .append(currentUser).append(SEPARATOR_GAME)
                .append(currentConnection).append(SEPARATOR_GAME)
                .append(cpuProcess).append(SEPARATOR_GAME)
                .append(cpuSystem).append(SEPARATOR_GAME)
                .append(ramProcess).append(SEPARATOR_GAME)
                .append(ramFree).append(SEPARATOR_GAME)
                .append(inBytes).append(SEPARATOR_GAME)
                .append(outBytes).append(SEPARATOR_GAME)
                .append(numException).append(SEPARATOR_GAME)
                .append(numItemAirship).append(SEPARATOR_GAME)
                .append(numItemPrivateShop).append(SEPARATOR_GAME)
                .append(numFriend).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME)
                .append(numCacheGuild).append(SEPARATOR_GAME)
                .append(numSocket).append(SEPARATOR_GAME)
                .append(numWebSocket).append(SEPARATOR_GAME)
                ;

        getCharSequence(sb, SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void monitorService (
            CharSequence status
                                      )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "MONITOR_SERVICE";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(Address.PRIVATE_HOST).append(SEPARATOR_GAME)
                .append(EnvConfig.group()).append(SEPARATOR_GAME)
                .append(EnvConfig.environment()).append(SEPARATOR_GAME)
                .append(EnvConfig.service()).append(SEPARATOR_GAME)
                .append(status).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME);

        getCharSequence(sb, SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void billing (
            Object vUserID,
            int result,
            long remain,
            long deltaTime,
            CharSequence request,
            CharSequence response
                               )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "BILLING";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(vUserID).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME)
                .append(result).append(SEPARATOR_GAME)
                .append(remain).append(SEPARATOR_GAME)
                .append(deltaTime).append(SEPARATOR_GAME)
                .append(request).append(SEPARATOR_GAME)
                .append(response).append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void tutorial (String country, int vUserID, short level, int step, boolean isStart, int repeat, int flowTutorial)
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "TUTORIAL_STEP";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(vUserID).append(SEPARATOR_GAME)
                .append(level).append(SEPARATOR_GAME)
                .append(step).append(SEPARATOR_GAME)
                .append(isStart).append(SEPARATOR_GAME)
                .append(repeat).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append('.').append(country).append(SEPARATOR_GAME)
                .append(flowTutorial).append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static String replaceNewLine (String input, String mark)
    {
        if (input == null || input.isEmpty())
            return input;
        return input.replaceAll("\r\n|\\r\\n|\n|\\n|\r|\\r", mark);
    }

    public static void actionSystem (
            String vActionName,
            Object vTransactionID,
            Object result,
            Object... ao
                                    )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + vActionName;

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME)
                .append(vTransactionID).append(SEPARATOR_GAME)
                .append(result).append(SEPARATOR_GAME);
        getCharSequence(sb, SEPARATOR_GAME, ao);

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void loginChat (
            Object vUserID,
            CharSequence vGameClientVersion,
            CharSequence vDeviceID,
            Object vSessionID,
            int iResult,
            CharSequence vClientIP,
            String country,
            String packageName,
            int guild
                             )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "LOGIN_CHAT";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(vUserID).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME)
                .append(vGameClientVersion).append(SEPARATOR_GAME)
                .append(vDeviceID).append(SEPARATOR_GAME)
                .append(vSessionID).append(SEPARATOR_GAME)
                .append(iResult).append(SEPARATOR_GAME)
                .append(vClientIP).append(SEPARATOR_GAME)
                .append(country).append(SEPARATOR_GAME)
                .append(packageName).append(SEPARATOR_GAME)
                .append(guild).append(SEPARATOR_GAME)
        ;

        writeLogGame(LOG_CATEGORY, sb);
    }

    public static void logoutChat (
            Object vUserID,
            CharSequence vSessionID,
            int iResult
                              )
    {
        final String LOG_CATEGORY = ConstantMercury.PREFIX_SNSGAME_GENERAL + "LOGOUT_CHAT";

        StringBuilder sb = createLogGame(LOG_CATEGORY)
                .append(vUserID).append(SEPARATOR_GAME)
                .append(EnvConfig.zone()).append(SEPARATOR_GAME)
                .append(vSessionID).append(SEPARATOR_GAME)
                .append(iResult).append(SEPARATOR_GAME);

        writeLogGame(LOG_CATEGORY, sb);
    }
}
