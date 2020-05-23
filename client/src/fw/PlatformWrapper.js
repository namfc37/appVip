/**
 * Created by KienVN on 10/23/2015.
 */

fr.platformWrapper = {
    init:function()
    {
        if(plugin.PluginManager == null) return false;
        if(fr.platformWrapper.pluginPlatform == null) {
            var pluginManager = plugin.PluginManager.getInstance();
            fr.platformWrapper.pluginPlatform = pluginManager.loadPlugin("PlatformWrapper");
        }
        return true;
    },

    getPhoneNumber:function()
    {
        if(this.pluginPlatform != null)
        {
           return this.pluginPlatform.callStringFuncWithParam("getPhoneNumber");
        }

        return "";
    },

    getMailAccount:function()
    {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getMailAccount");
        }
        return "";
    },

    getDeviceModel:function()
    {
		if(!cc.sys.isNative) {
			if (typeof uaDeviceName !== 'undefined')
				return uaDeviceName;
		}
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getDeviceModel");
        }
        return "";
    },

    getAvailableRAM:function()
    {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getAvailableRAM");
        }
        return -1;
    },

    getVersionCode:function() {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getVersionCode");
        }
        return -1;
    },

    getOSVersion:function() {
		if(!cc.sys.isNative) {
			if (typeof uaOsVersion !== 'undefined')
				return uaOsVersion;
		}
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getOSVersion");
        }
        return "";
    },
    //connection type 0: ko co mang, 1: 3g, 2: wifi
    getConnectionStatus:function() {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getConnectionStatus");
        }
        return -1;
    },

    hasNetwork: function(){
        if(fr.platformWrapper.getConnectionStatus() == CONNECTION_STATUS.NO_NETWORK){
            return false;
        }
        else return true;
    },

    getConnectionStatusName:function() {
        var connectionType =  this.getConnectionStatus();
        switch (connectionType) {
            case 0:
                return "unknown";
            case 1:
                return "3g";
            case 2:
                return "wifi";
        }
        return "";
    },

    getOsName:function() {
		
		//web
		var sys = cc.sys; 
		if(!cc.sys.isNative) {
			if (typeof uaOsPlatform !== 'undefined')
				return uaOsPlatform;
			return "Web";
		}
		
        if(sys.platform == sys.WIN32) {
            return "Win32";
        }
        if(sys.platform == sys.ANDROID) {
            return "Android";
        }
        if(sys.platform == sys.IPAD || sys.platform == sys.IPHONE) {
            return "IOS";
        }
        if(sys.platform == sys.WP8) {
            return "WindowPhone8";
        }
        return "";
    },

    toPlatformID:function ()
	{
        //["web", "iOS", "androidC", "androidJS", "Windows Phone"]
		var sys = cc.sys; 
        if(sys.platform == sys.ANDROID)
            return 3;
        if(sys.platform == sys.IPAD || sys.platform == sys.IPHONE)
            return 1;
        if(sys.platform == sys.WP8)
            return 4;
        if(!cc.sys.isNative) //Web
            return 0;
        return -1;
	},

    getClientVersion:function() {
        if(this.pluginPlatform != null)
        {
            return this.pluginPlatform.callStringFuncWithParam("getAppVersion");
        }
        return "1.0";
    },
	
    getExternalDataPath:function() {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getExternalDataPath");
        }
        return jsb.fileUtils.getWritablePath();
    },

    addNotify:function(notify) {
        if(this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("addNotify",
               new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(notify)));
        }
    },

    showNotify:function() {
        if(this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("showNotify" ,null);
        }
    },

    cancelAllNotification:function() {
        if(this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("cancelAllNotification",null);
        }
    },

    getDeviceID:function() {
		if(!cc.sys.isNative) {
			if (typeof uaDeviceId !== 'undefined')
				return uaDeviceId;
		}
        if(this.pluginPlatform != null) {
            var deviceID =  this.pluginPlatform.callStringFuncWithParam("getDeviceID");
            if(deviceID == "")
            {
                return this.getMailAccount();
            }
            return deviceID;
        }
        return "";
    },

    //accountType: google , zingme , facebook , zalo
    //openAccount: socialID, voi zingme la username
    trackLoginGSN:function(_accountId, _accountType, _openAccount, _zingName) {
        cc.log("trackLoginGSN", "_accountId", _accountId, "_accountType", _accountType, "_openAccount", _openAccount, "_zingName", _zingName);
        if(cc.sys.isNative) {
            if(this.pluginPlatform != null) {
                var data = {
                    accountId: _accountId,
                    accountType: _accountType,
                    openAccount: _openAccount,
                    zingName: _zingName
                };

                this.pluginPlatform.callFuncWithParam("trackLoginGSN",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
            }else{
                cc.error("trackLoginGSN-pluginPlatform is null");
            }
        } else {
            if (typeof gsntracker !== 'undefined') {
                gsntracker['login'].call(null, _accountId, _accountType, _openAccount, _zingName);
            }else{
                cc.error("trackLoginGSN-gsntracker is null");
            }
        }
    },

    //zalo uri = "com.zing.zalo";
    isInstalledApp:function(url) {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("isInstalledApp",
               new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, url));
        }
        return 0;
    },

    isInstalledFacebookApp:function() {
        return this.isInstalledApp("com.facebook.katana");
    },

    isInstalledZaloApp:function() {
        return this.isInstalledApp("com.zing.zalo");
    },

    getSimOperator: function(){
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getSimOperator").toLowerCase();
        }
        return "";
    },
    getThirdPartySource: function(){
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getThirdPartySource");
        }
        return "";
    },

    getPhoneCount: function(){
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getPhoneCount");
        }

        return 0;
    },

    getNetworkOperator: function(){
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getNetworkOperator").toLowerCase();
        }
        return "";
    },

    getSimState: function(){
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getSimState");
        }
        return 0;
    },
    getTotalUpdateAssetMemorySize:function()
    {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getTotalUpdateAssetMemorySize");
        }
        return -1;
    },
    getAvailableUpdateAssetMemorySize:function()
    {
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getAvailableUpdateAssetMemorySize");
        }
        return -1;
    },
    getAvailableInternalMemorySize: function(){
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getAvailableInternalMemorySize");
        }
        return -1;
    },

    getTotalInternalMemorySize: function(){
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getTotalInternalMemorySize");
        }
        return -1;
    },

    getAvailableExternalMemorySize: function(){
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getAvailableExternalMemorySize");
        }
        return -1;
    },

    getTotalExternalMemorySize: function(){
        if(this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getTotalExternalMemorySize");
        }
        return 1;
    },
    getPackageName:function()
    {
        if(this.pluginPlatform)
        {
            return this.pluginPlatform.callStringFuncWithParam("getPackageName");
        }
        return "";
    },
    sendSMS:function(content, serviceNumber)
    {
		if(cc.sys.isNative)
		{
			if(this.pluginPlatform != null)
			{
				var data = {
					message:content,
					recipent:serviceNumber
				};
				this.pluginPlatform.callFuncWithParam("sendMessage",
					new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
			}
		}
		else
		{
			//web
			if(navigator.userAgent.match(/Android/i) && /Win32/.test(navigator.platform) == false)
				window.open("sms:" + serviceNumber + "?body=" + content, "_self");
			else if(/iPhone/.test(navigator.platform))
				window.open("sms:" + serviceNumber + "&body=" + content, "_self");
			//else //window
				//hiện pop up & copy sẵn nội dung tin nhắn vào clipboard
		}
    },
	/**
     * Log lại các bước trong game
     * @param data
     * - stepName : step muốn track
     * - startOrEnd : step bắt đầu hoặc kết thúc (START, END ...)
     * - stepStatus: trạng thái của step (SUCC, FAIL ...)
     * - duration : thời gian xử lí step
     * - extraData : thông tin thêm
     */
    logGameStep:function(stepName, startOrEnd, stepStatus, duration, extraData)
    {
		cc.log("logGameStep", stepName, startOrEnd, stepStatus, duration, extraData);
        if(this.pluginPlatform == null)
            return;
        if(stepStatus == null)
        {
            stepStatus = "SUCC";
        }
        if(duration == null)
        {
            duration = 0;
        }
        if(extraData == null)
        {
            extraData = "";
        }
        var data = {
            stepName: stepName,
            startOrEnd: startOrEnd,
            stepStatus: stepStatus,
            duration: duration,
            extraData: extraData
        };
        this.pluginPlatform.callFuncWithParam("logGameStep", new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
    },
};

var SIM_STATE = {
    UNKNOWN: 0,
    ABSENT: 1,
    PIN_REQUIRED:2,
    PUK_REQUIRED: 3,
    NETWORK_LOCKED: 4,
    READY: 5,
};

var CONNECTION_STATUS = {
    NO_NETWORK: 0,
    CELULAR_DATA: 1,
    WIFI: 2
};