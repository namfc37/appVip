/**
 * Created by GSN on 9/30/2015.
 */

var FB_ACCESS_TOKEN_KEY = "fb_access_token";
fr.facebook = {
    loginSuccess: 2,
    pluginUser: null,
    accessToken: null,
    sessionKey: null,

    init:function(){
        this.callback = null;
        if(plugin.PluginManager == null)
            return false;

        var pluginManager = plugin.PluginManager.getInstance();
        this.agent = plugin.FacebookAgent.getInstance();

		if(cc.sys.isNative)
			this.pluginUser = plugin.PluginManager.getInstance().loadPlugin("UserFacebook");
		else
			this.pluginUser = this.pluginUser || (window["plugin"] ? window["plugin"]["FacebookAgent"]["getInstance"]() : null); //web
        return true;
    },

    /**
     *
     * @param callback
     */
    login: function (callbackFunc) {
        if(!this.init()){
            console.log("Not Found Init Plugin Facebook");
            callbackFunc(false, "Not Found Init Plugin Facebook");
            return;
        }
        var self = this;
        if(this.pluginUser.isLoggedIn()) {
            this.pluginUser.logout(function () {
                self._requestLogin(callbackFunc);
            });
        }
        else{
            self._requestLogin(callbackFunc);
        }
    },
    _requestLogin:function(callbackFunc)
    {
        var self = this;
        this.pluginUser.login(function(result, response){
            if(result == plugin.FacebookAgent.CODE_SUCCEED){
                var data = null;
if(cc.sys.isNative)
                data = JSON.parse(response);
else
                data = response ;
                self.onLoginComplete(data, callbackFunc);
            }else if(cc.sys.isNative){
                if(result != plugin.ProtocolUser.UserActionResultCode.LOGOUT_SUCCEED) {
                    var error = response;
                    callbackFunc(false, "fb:" + error);
                }
            }
			else // web
				callbackFunc(false, "fb:" + response);
        });
    },
    onLoginComplete: function(response, callbackFunc){
        this.accessToken = response["accessToken"];
        fr.UserData.setString(FB_ACCESS_TOKEN_KEY, this.accessToken);
        callbackFunc(true, this.accessToken);
    },

    /**
     *
     * @returns {*|String}
     */
    getAccessToken: function () {
        if(!this.accessToken){
            this.accessToken = fr.UserData.getString(FB_ACCESS_TOKEN_KEY, null);
        }
        return this.accessToken;
    },

    getFriendsPlayedGame:function(callbackFunc)
    {
        var url = "https://graph.facebook.com/v3.2/me/friends?fields=id,name,picture.width(160).height(160)&limit=1000&access_token=" + this.getAccessToken();
        fr.Network.requestJsonGet(url, function(result, response)
        {
            if(result)
            {
                callbackFunc(true, response.data);
            }else
            {
                callbackFunc(false, "");
            }
        });
    },
    getFriendsNotPlayGame:function(callbackFunc)
    {
        var url = "https://graph.facebook.com/v3.2/me/invitable_friends?fields=id,name,picture.width(160).height(160)&limit=500&access_token=" + this.getAccessToken();
        fr.Network.requestJsonGet(url, function(result, response)
            {
                if(result)
                {
                    callbackFunc(true, response.data);

                }else
                {
                    callbackFunc(false, "");
                }
            }
        );
    },

    inviteRequest: function (toFriend, message, callbackFunc, title) {
        if (!toFriend) {
            if (callbackFunc != undefined) {
                callbackFunc(plugin.ProtocolShare.ShareResultCode.SHARE_FAIL, "List friend empty!")
            }
            return;
        }

        if (title == undefined) {
            title = "invite_install_zingplay";
        }
        var map = {
            "message": message,
            "title": title,
            "to": toFriend
        };
        plugin.FacebookAgent.getInstance().appRequest(map, function (result, response) {
            if (result == plugin.FacebookAgent.CODE_SUCCEED) {
                callbackFunc(plugin.ProtocolShare.ShareResultCode.SHARE_SUCCESS, "Success!");
            }
            else {

                callbackFunc(plugin.ProtocolShare.ShareResultCode.SHARE_FAIL, "Failed!");
            }
        });
    }
};
