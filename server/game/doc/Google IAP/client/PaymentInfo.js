
var fr = fr||{};
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
        var url = "https://zplogin.g6.zing.vn/?service_name=get_config_iap&environment=false&os=";
        if( sys.os === sys.OS_ANDROID)
        {
             url = url + "google&package_name=" + packageName;
        }
        else if(sys.os === sys.OS_IOS)
        {
             url = url + "apple&package_name=" + packageName;
        }else {
            return;
        }
        this.requestJsonGet(url, function(result, response)
        {
            if(result && (response.error == 0 || response.error == null)) {
                fr.PaymentInfo.setConfig(response, true);
            }
        })
    },
    getProductID:function(pkgKey)
    {
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
    xmlHttpRequestGet: function(urlRequest, callbackFunc){
        var timeout = setTimeout(function()
        {
            cc.log("xmlHttpRequestGet:request time out");
            if(callbackFunc != undefined)
            {
                callbackFunc(false, "Request time out!");
            }
        }, 15000);
        var callBack = function(result, data)
        {
            clearTimeout(timeout);
            if(callbackFunc != undefined)
            {
                callbackFunc(result, data);
            }
        };
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                callBack(true, xhr.responseText);
            }
            else{
                if(!cc.sys.isNative && (xhr.status == 200 || xhr.status == 0))
                {
                    return;
                }
                callBack(false, "error: " + xhr.readyState + "," + xhr.status);
            }
        };
        xhr.onerror = function(){
            cc.log("Request error!");
            callBack(false, "onerror");
        };
        xhr.ontimeout = function(){
            cc.log("Request time out!");
            callBack(false, "ontimeout");
        };
        xhr.onabort = function () {
            cc.log("Request aborted!");
            callBack(false, "ontimeout");
        };
        xhr.timeout = 10000;
        xhr.open("GET", urlRequest, true);
        xhr.send();
    },
    requestJsonGet:function(urlRequest, callbackFunc)
    {
        this.xmlHttpRequestGet(urlRequest, function(result, response)
        {
            if(result)
            {
                var data = JSON.parse(response);
                if(data) {
                    callbackFunc(true, data);
                }else{
                    callbackFunc(false,"parse error: " + urlRequest + " : " + response);
                }
            }
            else
            {
                callbackFunc(false,response);
            }
        });
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