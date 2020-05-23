package util.server;

import bitzero.server.config.ConfigHandle;

public class ServerConstant
{
    public static final String GAME_ID    = ConfigHandle.instance().get("gameId");
    public static final String PRODUCT_ID = ConfigHandle.instance().get("productId"); //key "productId" được dùng trong framwork
    public static final String KEY_1      = ConfigHandle.instance().get("publicKey");
    public static final String KEY_2      = ConfigHandle.instance().get("secretKey");//key "secretKey" được dùng trong framwork

    public static final boolean IS_METRICLOG   = (ConfigHandle.instance().getLong("isMetriclog") == 1);
    public static final boolean ENABLE_PAYMENT = (ConfigHandle.instance().getLong("enable_payment") == 1);

    public static final String ENV_CONFIG  = ConfigHandle.instance().get("EnvConfig");
    public static final String ENV_SERVICE = ConfigHandle.instance().get("EnvService").toUpperCase();
    public static final long   ENV_GROUP   = ConfigHandle.instance().getLong("EnvGroup");

}
