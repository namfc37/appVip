
//web var fr = fr||{};
var PMPK_INFO_CONFIG_KEY = "PMPK_INFO_CONFIG"
b64_table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
fr.PaymentInfo = {
    loadInfo:function(packageName)
    {
        var txt = cc.sys.localStorage.setItem(PMPK_INFO_CONFIG_KEY,"");
        if(txt != null && txt.length > 0)
        {
            this.setConfig(JSON.parse(txt));
			googleIap.init();
        }
        var os;
        if (cc.sys.os === cc.sys.OS_ANDROID)
            os = "google";
        else if(cc.sys.os === cc.sys.OS_IOS)
            os = "apple";
        else
            return;

        var url, params;

        if (COUNTRY == COUNTRY_BRAZIL) {
            url = "https://brazil-login.zingplay.com/";
            params = {
                service_name: 'get_config_iap',
                gameId: GAME_ID,
                package_name: packageName,
                os: os
            };
            params.mac = md5(params.os + params.package_name + params.gameId + PUBLIC_KEY);
        } else {
            url = "https://zplogin.g6.zing.vn/";
            params = {
                service_name: 'get_config_iap',
                environment: false,   
                package_name: packageName,
                os: os   
            };
        }

        sendHttpGet(url, function(result, response)
        {   
            if (result) {
                cc.log("get_config_iap", result, JSON.stringify(response));
                if (response.error == 0 || response.error == null) {
                    fr.PaymentInfo.setConfig(response, true);
                    googleIap.init();
                }
            } else {
                cc.log("get_config_iap", result, response);
            }
        }, params, true);
    },
    getProductID:function(pkgKey)
    {
        if (FWClientConfig.environment.useTestVerifyGoogle)
        {
            return pkgKey;
        }
        if(this.config && this.config.packages)
        {
            return this.config.packages[pkgKey];
        }        
        return "";
    },
    getLicenseKey:function()
    {
        if(this.config)
        {
            return this.config.license_key;
        }
        return "";
    },
    setConfig:function(config, isSave)
    {
        this.config = config;
        if(isSave && this.config) {
            var txt = JSON.stringify(this.config);
			cc.sys.localStorage.setItem(PMPK_INFO_CONFIG_KEY, txt);
        }
        this.unloadLicenseKey();
    },

    unloadLicenseKey:function()
    {
        if(this.config && this.config.license_key != null && this.config.license_key != ""){
            this.config.license_key = this.decodeXOR(this.config.license_key,"g$n_secret_n0!");
        }
    },        
    decodeXOR:function (data, key) {
        data = this.b64_decode(data);
        return this.xor_decrypt(key, data);
    },
    b64_decode:function(data) {
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, result = [];
        if (!data) { return data; }
        data += "";
        do {
            h1 = b64_table.indexOf(data.charAt(i++));
            h2 = b64_table.indexOf(data.charAt(i++));
            h3 = b64_table.indexOf(data.charAt(i++));
            h4 = b64_table.indexOf(data.charAt(i++));
            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
            o1 = bits >> 16 & 0xff;
            o2 = bits >> 8 & 0xff;
            o3 = bits & 0xff;
            result.push(o1);
            if (h3 !== 64) {
                result.push(o2);
                if (h4 !== 64) {
                    result.push(o3);
                }
            }
        } while (i < data.length);
        return result;
    },
    xor_decrypt:function(key, data) {
        var self = this;
        var str = "";
        for(var i = 0; i < data.length; i++)
        {
            str +=  String.fromCharCode( data[i] ^ self.keyCharAt(key, i) );
        }
        return str;
    },
    keyCharAt:function(key, i) {
        return key.charCodeAt( Math.floor(i % key.length) );
    }
};
