
const GAME_DISTRIBUTION = "";
const CLIENT_INFO = "";

const ZPLOGIN_ERROR_CONNECTION = -1;
const ZPLOGIN_ERROR_FACEBOOK = -2;
const ZPLOGIN_ERROR_GOOGLE = -3;
const ZPLOGIN_ERROR_COUNTRY = -4;
const ZPLOGIN_ERROR_FAIL = -5;

const ZPLOGIN_SKIP_LOGIN = true;

const ZPLOGIN_ZINGME = "zingme";
const ZPLOGIN_FACEBOOK = "facebook";
const ZPLOGIN_GOOGLE = "google";
const ZPLOGIN_ZACC = "zacc";

var ZPLogin =
{
	callback: null,
	noLogin: false,
	usePortal: false,
	sessionKey: "",
	sessionSocial: "",
	
	// returns true:
	// - session key exists => connect to game server
	// - game waits for callback
	// returns false:
	// - session key not exists
	// - game asks player to login/register
	quickLogin:function(callback)
	{			
		if(ZPLOGIN_SKIP_LOGIN === true && (fr.platformWrapper.getOsName() === "Win32" || !cc.sys.isNative))//web if(ZPLOGIN_SKIP_LOGIN === true && fr.platformWrapper.getOsName() === "Win32")
		{
			cc.director.getScheduler().scheduleCallbackForTarget(this, function() {callback(0);}, 0, 0, 0, false);
			return true;
		}		
		
		if (this.usePortal) {
			if(cc.sys.isNative) //native
			{
				this.sessionKey = fr.NativePortal.getInstance().getSessionKey();
				this.sessionSocial = fr.NativePortal.getInstance().getSocialType();
			}
			else if(fr.NativePortal) //web portal
			{
				this.sessionKey = fr.NativePortal.getSessionKey();
				this.sessionSocial = fr.NativePortal.getSocialType();
			}
			
		} else {
			this.sessionKey = cc.sys.localStorage.getItem(this.idSessionKey());
			this.sessionSocial = cc.sys.localStorage.getItem(this.idSessionSocial());			
		}

		FWClientConfig.socialType = this.sessionSocial;
		cc.log("sessionKey", "portal", this.sessionKey);
		cc.log("sessionSocial", "portal", this.sessionSocial);
		if(!this.sessionKey)
			return false;

		this.callback = callback;		
		this.getGameServerList();
		return true;
	},
	
	// log out
	logout:function()
	{
		cc.sys.localStorage.removeItem(this.idSessionKey());
		cc.sys.localStorage.removeItem(this.idSessionSocial());
		
		// clean up
		delete gv.userData;
		delete gv.userStorages;
		delete gv.jackMachine;
		delete gv.jackShop;
	},

	// login zing play
	loginZP:function(userName, password, callback)
	{
		this.callback = callback;
		var md5password = md5(password);

		switch (COUNTRY)	
		{
			case COUNTRY_VIETNAM:			
				var url = null;
if(cc.sys.isNative)
				url = "http://myplay.apps.zing.vn/sso3/login.php";
else
				url = "https://myplay.apps.zing.vn/sso3/login.php";
				var data = {					
					gameId: GAME_ID,
					username: userName,
					password: md5password,
					mac: md5(GAME_ID + userName + md5password + PUBLIC_KEY),
					v: '2'
				};	
				this.httpGetRequest(url, this.onLoginZpVnResponse.bind(this), data);
				break;

			case COUNTRY_GLOBAL:
			case COUNTRY_THAILAND:
			case COUNTRY_MYANMAR:
			case COUNTRY_PHILIPPINE:
				var url = "https://login.zingplay.com/";				
				var data = {	
					service_name: 'zacc_login',
					gameId: GAME_ID,
					username: userName,
					password: md5password
				};	
				this.httpGetRequest(url, this.onLoginZpSeaResponse.bind(this), data);
				break;					
			
			default:
				this.callback(ZPLOGIN_ERROR_COUNTRY);
		}
	},
	
	onLoginZpVnResponse:function(response)
	{
		if(!response)
		{
			this.callback(ZPLOGIN_ERROR_CONNECTION);
			return;
		}
		
		var obj = JSON.parse(response);
		var accessToken = obj.sessionKey;
		if(accessToken)
		{
			//var userId = obj.userid; // not used
			this.getSessionKeyFromAccessToken(accessToken, ZPLOGIN_ZINGME);
		}
		else
			this.callback(ZPLOGIN_ERROR_FAIL);
	},

	onLoginZpSeaResponse:function(response)
	{
		if(!response)
		{
			this.callback(ZPLOGIN_ERROR_CONNECTION);
			return;
		}
		
		var obj = JSON.parse(response);
		if (obj.status == 3)
		{
			//var userId = obj.userid; // not used
			this.getSessionKeyFromAccessToken(obj.data.sid, ZPLOGIN_ZACC);
		}
		else
			this.callback(obj.status);
	},
	
	// register zing play
	registerZP:function(userName, password, callback)
	{
		this.registerName = userName;
		this.registerPass = password;
		this.callback = callback;
		var md5password = md5(password);

		switch (COUNTRY)	
		{	
			case COUNTRY_VIETNAM:			
				var url = null;
if(cc.sys.isNative)
				url = "http://myplay.apps.zing.vn/sso3/register.php";
else
				url = "https://myplay.apps.zing.vn/sso3/register.php";
				var data = {					
					gameId: GAME_ID,
					username: userName,
					password: md5password,
					dob: "01-01-2000",
					mac: md5(GAME_ID + userName + md5password + PUBLIC_KEY),
					v: '2'
				};	
				this.httpGetRequest(url, this.onRegisterZpVnResponse.bind(this), data);
				break;

			case COUNTRY_GLOBAL:
			case COUNTRY_THAILAND:
			case COUNTRY_MYANMAR:
			case COUNTRY_PHILIPPINE:
				var url = "https://login.zingplay.com/";				
				var data = {	
					service_name: 'zacc_register',
					gameId: GAME_ID,
					username: userName,
					password: md5password				
				};	
				this.httpGetRequest(url, this.onRegisterZpSeaResponse.bind(this), data);
				break;
			
			default:
				this.callback(ZPLOGIN_ERROR_COUNTRY);
		}		
	},
	
	onRegisterZpVnResponse:function(response)
	{
		if(!response)
		{
			this.callback(ZPLOGIN_ERROR_CONNECTION);
			return;
		}
		
		var obj = JSON.parse(response);
		if(obj.error === 0)
		{
			// registration success => login
			this.loginZP(this.registerName, this.registerPass, this.callback);
		}
		else
			this.callback(ZPLOGIN_ERROR_FAIL);
	},

	onRegisterZpSeaResponse:function(response)
	{
		if(!response)
		{
			this.callback(ZPLOGIN_ERROR_CONNECTION);
			return;
		}
		
		var obj = JSON.parse(response);
		if ((obj.status == 3 && obj.data && obj.data.sid) || (obj.status == 12 && this.hasQuickGuestLogin()))
		{
			this.loginZP(this.registerName, this.registerPass, this.callback);
		}
		else
			this.callback(ZPLOGIN_ERROR_FAIL);
	},
	
	// login facebook
	isFBPluginLoaded: false,
	loginFacebook:function(callback)
	{
		this.callback = callback;
		if(cc.sys.isNative || this.isFBPluginLoaded)
		{
			fr.facebook.init();
			fr.facebook.login(this.onLoginFacebookResponse.bind(this));
		}
		else
		{
			// web
            cc.loader.loadJs('', [
                "res/plugin/facebook_sdk.js",
                "res/plugin/facebook.js"
            ], function() {
				this.isFBPluginLoaded = true;
				fr.facebook.init();
				fr.facebook.login(this.onLoginFacebookResponse.bind(this));
            }.bind(this));
		}
	},
	
	onLoginFacebookResponse:function(result, data)
	{
		if(result)
			this.getSessionKeyFromAccessToken(data, ZPLOGIN_FACEBOOK);
		else
			this.callback(ZPLOGIN_ERROR_FACEBOOK);
	},

	// login google
	isGGPluginLoaded: false,
	loginGoogle:function(callback)
	{
		this.callback = callback;
		if(cc.sys.isNative || this.isGGPluginLoaded)
		{
			fr.google.init();
			fr.google.login(this.onLoginGoogleResponse.bind(this));
		}
		else
		{
			// web
            cc.loader.loadJs('', [
                "res/plugin/google_sdk.js",
                "res/plugin/google.js"
		])}
	},
	
	//web
	loginGoogle2:function()
	{
		this.isGGPluginLoaded = true;
		
		fr.google.init();
		fr.google.login(this.onLoginGoogleResponse.bind(this));
	},
	
	onLoginGoogleResponse:function(result, data)
	{
		cc.log("onLoginGoogleResponse", result);
		if(result)
			this.getSessionKeyFromAccessToken(data, ZPLOGIN_GOOGLE);
		else if(this.callback)
			this.callback(ZPLOGIN_ERROR_GOOGLE);
	},
	
	getSessionKeyFromAccessToken:function(accessToken, social)
	{
		this.sessionSocial = social;
		FWClientConfig.socialType = social;
		cc.log("sessionSocial", this.sessionSocial);	
		switch (COUNTRY)	
		{
			case COUNTRY_BRAZIL:
				var url = "https://brazil-login.zingplay.com/";
				var data = {
					service_name: 'getSessionKey',
					gameId: GAME_ID,
					clientInfo: CLIENT_INFO,
					social: social,
					accessToken: accessToken,
					deviceId: fr.platformWrapper.getDeviceID()
				};
				data.mac = md5(data.social + data.accessToken + data.clientInfo + data.deviceId + data.gameId + PUBLIC_KEY);
	
				this.httpGetRequest(url, this.onGetSessionKeyResponse.bind(this), data);
				break;
			
			case COUNTRY_GLOBAL:
			case COUNTRY_THAILAND:
			case COUNTRY_MYANMAR:
			case COUNTRY_PHILIPPINE:
				var url = "https://login.zingplay.com/";
				var data = {
					service_name: 'getSessionKey',
					gameId: GAME_ID,
					distribution: GAME_DISTRIBUTION,
					clientInfo: CLIENT_INFO,
					social: social,
					accessToken: accessToken,
					deviceId: fr.platformWrapper.getDeviceID()
				};				
	
				this.httpGetRequest(url, this.onGetSessionKeyResponse.bind(this), data);
				break;					

			case COUNTRY_VIETNAM:			
				var url = null;
if(cc.sys.isNative)
				url = "http://zplogin.g6.zing.vn/";
else
				url = "https://zplogin.g6.zing.vn/";
				var data = {
					service_name: 'getSessionKey',
					gameId: GAME_ID,
					distribution: GAME_DISTRIBUTION,
					clientInfo: CLIENT_INFO,
					social: social,
					accessToken: accessToken				
				};
	
				this.httpGetRequest(url, this.onGetSessionKeyResponse.bind(this), data);
				break;
			
			default:
				this.callback(ZPLOGIN_ERROR_COUNTRY);
		}				
	},

	onGetSessionKeyResponse:function(response)
	{
		if(!response)
		{
			this.callback(ZPLOGIN_ERROR_CONNECTION);
			return;
		}
		
		var obj = JSON.parse(response);
		this.sessionKey = obj.sessionKey;
		if(this.sessionKey)
		{
			//var openId = obj.openId; // not used
			cc.sys.localStorage.setItem(this.idSessionKey(), this.sessionKey);
			cc.sys.localStorage.setItem(this.idSessionSocial(), this.sessionSocial);
			this.balancerRetriesCount = 0;
			this.getGameServerList();
		}
		else
			this.callback(obj.error ? obj.error : ZPLOGIN_ERROR_CONNECTION);
	},
	
	serverList: null,
	useBalancer: false,
	balancerRetriesCount: 0,
	getUrlBalanceGame:function()
	{
		var url;
		if (cc.sys.isNative)
			url = FWClientConfig.environment.balancer.http;
		else
			url = FWClientConfig.environment.balancer.https;

		url += "&service=GAME&code=" + FWClientConfig.scriptVersion;
		return url;		
	},
	getGameServerList:function()
	{
		// server list
		this.serverList = [];
		this.useBalancer = false;	
		
		// balancer
		this.httpRequest(this.getUrlBalanceGame(), this.onReceivedBalancerInfo.bind(this));
	},	
	onReceivedBalancerInfo:function(response)
	{
		if(response)
		{
			var obj = JSON.parse(response);
			cc.log("[balance] response: " + obj.error + ", msg: " + obj.msg);
			if (obj.error == 0)
			{				
				if(obj.GAME)
				{
					this.useBalancer = true;
					this.serverList = [];
					this.serverList.push(obj.GAME);
					this.callback(0);

					cc.director.getScheduler().scheduleCallbackForTarget(this, this.refreshBalanceGame, 0, 0, 600, false);
				}
			}
			else if (obj.forceUpdate)
			{				
				this.callback(LOADING_STATE_FORCE_UPDATE, obj.msg);
			}
			else
			{
				this.callback(LOADING_STATE_MAINTENANCE, obj.msg);
			}			
		}
		else
		{
			this.balancerRetriesCount++;
			if(this.balancerRetriesCount <= 3)
				cc.director.getScheduler().scheduleCallbackForTarget(this, this.getGameServerList, 0, 0, 0.5, false);
			else 
			{
				//this.callback(LOADING_STATE_BALANCE_FAIL);
				this.useBalancer = false;
				this.serverList = FWClientConfig.environment.gameInfo;
				this.callback(0);
			}
		}				
	},
	refreshBalanceGame:function()
	{
		cc.log("refreshBalanceGame");
		this.httpRequest(this.getUrlBalanceGame(), this.handleRefreshBalanceGame.bind(this));
	},
	handleRefreshBalanceGame:function(response)
	{
		cc.log("handleRefreshBalanceGame");
		var isSuccess = false;
		if(response)
		{
			var obj = JSON.parse(response);
			cc.log("[balance] response: " + obj.error + ", msg: " + obj.msg);
			if (obj.error == 0)
			{				
				if(obj.GAME)
				{
					this.serverList = [];
					this.serverList.push(obj.GAME);

					cc.director.getScheduler().scheduleCallbackForTarget(this, this.refreshBalanceGame, 0, 0, 600, false);
					isSuccess = true;
				}
			}
		}

		if (!isSuccess)
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.refreshBalanceGame, 0, 0, 60, false);
	},
	
	// return balanced server info
	getNextServerInfo:function()
	{
		if(ZPLOGIN_SKIP_LOGIN === true && (fr.platformWrapper.getOsName() === "Win32" || !cc.sys.isNative))//web if(ZPLOGIN_SKIP_LOGIN === true && fr.platformWrapper.getOsName() === "Win32")
		{
			return {ip:"127.0.0.1", port:8001, domain:"127.0.0.1", portWebSocket:8301};
		}
		
		if(this.useBalancer)
		{
			this.useBalancer = false;
			return this.serverList[this.serverList.length - 1];	
		}
		return this.serverList[_.random(0, this.serverList.length - 1)];
	},
	
	// returns session key
	getCurrentSessionKey:function()
	{
		if(ZPLOGIN_SKIP_LOGIN === true && (fr.platformWrapper.getOsName() === "Win32" || !cc.sys.isNative))//web if(ZPLOGIN_SKIP_LOGIN === true && fr.platformWrapper.getOsName() === "Win32")
			return "NoSessionAtAll";
		
		return this.sessionKey;
	},
	
	// returns error message from error code
	getErrorMessage:function(code)
	{		
		if(code === 0)
			return "";

		switch (COUNTRY)	
		{
			case COUNTRY_BRAZIL:
				return this.getErrorMessageSea(code);
			
			case COUNTRY_GLOBAL:
			case COUNTRY_THAILAND:
			case COUNTRY_MYANMAR:
			case COUNTRY_PHILIPPINE:
				return this.getErrorMessageSea(code);

			case COUNTRY_VIETNAM:			
				return this.getErrorMessageVietNam(code);
			
			default:
				return this.getErrorMessageVietNam(code);
		}
	},

	getErrorMessageSea:function(code)
	{	
		
		var msg = "";
		if(code == 30)
			msg = "TXT_LOADING_ERROR_INVALID_PASS";
		else if(code == 12)
			msg = "TXT_LOADING_ERROR_ACC_EXIST";	
		else if(code == 13)
			msg = "TXT_LOADING_ERROR_INVALID_ACC";	
				
		
		// custom error
		else if(code == ZPLOGIN_ERROR_CONNECTION)
			msg = "TXT_LOADING_ERROR_CONNECTION";
		else
			msg = "Error " + code; 
		
		return FWLocalization.text(msg);
	},	

	getErrorMessageVietNam:function(code)
	{
		var msg = "";
		// zing play error
		if(code === 4)
			msg = "TXT_LOADING_ERROR_INVALID_PASS";
		else if(code === 5)
			msg = "TXT_LOADING_ERROR_ACC_EXIST";
		else if(code === 6)
			msg = "TXT_LOADING_ERROR_INVALID_ACC";
		else if(code === 7)
			msg = "Invalid Game ID";
		else if(code === 8)
			msg = "Invalid MAC";
		else if(code === 20)
			msg = "Age restriction";
		
		// custom error
		else if(code === ZPLOGIN_ERROR_CONNECTION)
			msg = "TXT_LOADING_ERROR_CONNECTION";
		else
			return cc.formatStr(FWLocalization.text("TXT_LOGIN_ERROR"), code);
		
		return FWLocalization.text(msg);
	},
	httpGetRequest:function(url, callback, params) {
		var isFirst = true;
		for (var key in params) {
		  if (isFirst) {
			url += '?';
			isFirst = false;
		  } else {
			url += '&';
		  }
		  url += key + '=' + params[key];
		}
		this.httpRequest(url, callback, null);
	},	
	httpPostRequest:function(url, callback, params) {		
		this.httpRequest(url, callback, JSON.stringify(params));
	},	
	httpRequest:function(url, callback, data)//web httpRequest:function(url, callback, data = null)
	{
		if(data === undefined)
			data = null;
		
		cc.log("ZPLogin::httpRequest url=" + url);
		
		var xhr = cc.loader.getXMLHttpRequest();
		if (data) {		
			xhr.open("POST", url, true);
			cc.log("Use POST");
		} else {
			xhr.open("GET", url, true);
			cc.log("Use GET");
		}
		xhr.setRequestHeader("Content-Type", "text/plain");
		xhr.hasResponse = false;
		//xhr.timeout = 2000; time out event not triggered
		xhr.onreadystatechange = function()
		{
			if(xhr.readyState === 4)
			{
				xhr.hasResponse = true;
				cc.log("ZPLogin::httpRequest: response: status=" + xhr.status);
				cc.log("ZPLogin::httpRequest: response: responseText=" + xhr.responseText);
				callback(xhr.responseText);
			}
		};
		xhr.onloadend = function()
		{
			if(!xhr.hasResponse)
			{
				cc.log("ZPLogin::httpRequest: no response");
				callback(null);
			}
		};
		if (data)
			xhr.send(data);
		else
			xhr.send();
	},
	isLoginFacebook:function() {
		return this.sessionSocial === ZPLOGIN_FACEBOOK;
	},
	isLoginZingme:function() {
		return this.sessionSocial === ZPLOGIN_ZINGME;
	},
	isLoginGoogle:function() {
		return this.sessionSocial === ZPLOGIN_GOOGLE;
	},
	idSessionKey:function() {
		return fr.platformWrapper.getPackageName() + "_sessionKey";
	},
	idSessionSocial:function() {
		return fr.platformWrapper.getPackageName() + "_sessionSocial";
	},
	
	// feedback
	hasGuestLogin:function()
	{
		//if(cc.sys.isNative)
			//return (COUNTRY === COUNTRY_THAILAND);
		//else
			return true;
	},

	hasQuickGuestLogin:function()
	{
		//if(cc.sys.isNative)
			//return (COUNTRY === COUNTRY_THAILAND);
		//else
			return false;
	},

	getQuickGuestkAccount:function()
	{
		return fr.platformWrapper.getDeviceID().replace('-', '');
	},

	isValidUserName:function(username)
	{
		var regex = /^[a-z0-9_.-]{3,24}$/;
		return !username || username.match(regex);
	},
};

