/**
 * Created by GSN on 9/30/2015.
 */

fr.google = {
    pluginUser:null,
    accessToken: null,
    /***
     *
     * @returns {boolean}
     */
    init:function()
    {
        if(plugin.PluginManager == null)
            return false;
        if(fr.google.pluginUser == null) {
            var pluginManager = plugin.PluginManager.getInstance();
			
			if(cc.sys.isNative)
				fr.google.pluginUser = pluginManager.loadPlugin("UserGoogle");
			else
				fr.google.pluginUser = fr.google.pluginUser || (window["plugin"] ? window["plugin"]["GoogleAgent"]["getInstance"]() : null); //web
			
			var data = {
            };
            if(fr.google.pluginUser != null) {
                fr.google.pluginUser.configDeveloperInfo(data);
            }
        }
        return true;
    },
    /***
     *
     * @param callback
     */
    login:function(callback)
    {
        if(fr.google.pluginUser == null)
        {
            callback(false,"");
            return;
        }        
        var self = this;
        cc.log("[Google.js] isLoggedIn", fr.google.pluginUser.isLoggedIn());
        cc.log("[Google.js] isLoginGoogle", ZPLogin.isLoginGoogle());
		if(cc.sys.isNative)
		{
			if(fr.google.pluginUser.isLoggedIn())
			{
				fr.google.pluginUser.logout(function()
				{
					self._login(callback);
				});

			}else
			{
				self._login(callback);
			}
		}
		else //web
			self._login(callback);
    },
    _login:function(callback)
    {
        cc.log("[Google.js] _login");
        var self = this;
        fr.google.pluginUser.login(function (type, msg) {
            cc.log("[Google.js] _login", "type", type);
            cc.log("[Google.js] _login", "msg", msg);
			if(cc.sys.isNative)
			{
				if(type == plugin.ProtocolUser.UserActionResultCode.LOGOUT_SUCCEED) {
					return;
				}
				var token = msg;
				if(type == plugin.ProtocolUser.UserActionResultCode.LOGIN_SUCCEED) {
					fr.google.pluginUser.logout();
					setTimeout(function(){
						self.accessToken = token;
						callback(true, self.accessToken)
					}, 100);
				}
				else{
					callback(false, "gg auth");
				}            
			}
			else //web
			{
				if(type === 0)
				{
					self.accessToken = msg;
					callback(true, self.accessToken);
				}
				else
					callback(false, msg);
			}
        });
    },
    logout:function() {
        cc.log("google.logout");        
        if (fr.google.pluginUser == null)
            this.init();        
        fr.google.pluginUser.logout();
    }
};
