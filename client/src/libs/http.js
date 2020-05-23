function sendHttpGet (url, callback, params, isResponseJson) {//web function sendHttpGet (url, callback, params, isResponseJson = false) {
	
	if(isResponseJson === undefined)
		isResponseJson = false;
	
    if (params) {
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
    }
    sendHttp(url, callback, isResponseJson);
}

function sendHttpPostJson (url, callback, params, isResponseJson) {		//web function sendHttpPostJson (url, callback, params, isResponseJson = false) {		

	if(isResponseJson === undefined)
		isResponseJson = fale;
	
    sendHttp(url, callback, isResponseJson, "text/plain", JSON.stringify(params));
}

function sendHttp (url, callbackFunc, isResponseJson, contentType, dataPost) {//web function sendHttp (url, callbackFunc, isResponseJson = false, contentType = null, dataPost = null) {
	
	if(isResponseJson === undefined)
		isResponseJson = false;
	if(contentType === undefined)
		contentType = null;
	if(dataPost === undefined)
		dataPost = null;
	
    var timeout = setTimeout(function() {
        cc.log("sendHttp:request time out");
        if(callbackFunc != undefined) {
            callbackFunc(false, "Request time out!");
        }
    }, 15000);
    var callBack = function(result, data) {
        clearTimeout(timeout);
        if (callbackFunc != undefined) {
            if (isResponseJson) {
                var jsonRes = null;
                try {                
                    jsonRes = JSON.parse(data);
                } catch(e) {
                }                
                if (jsonRes) {
                    callbackFunc(true, jsonRes);
                }else{
                    callbackFunc(false,"Parse json fail: " + data);
                }
            } else {
                callbackFunc(result, data);
            }
        }
    };
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            callBack(true, xhr.responseText);
        } else {
            if(!cc.sys.isNative && (xhr.status == 200 || xhr.status == 0)) {
                return;
            }
            callBack(false, "error: " + xhr.readyState + "," + xhr.status);
        }
    };
    xhr.onerror = function(){
        cc.log("sendHttp:Request error!");
        callBack(false, "onerror: " + xhr.status);
    };
    xhr.ontimeout = function(){
        cc.log("sendHttp:Request time out!");
        callBack(false, "ontimeout");
    };
    xhr.onabort = function () {
        cc.log("sendHttp:Request aborted!");
        callBack(false, "ontimeout");
    };
    xhr.timeout = 10000;
    if (contentType)
        xhr.setRequestHeader("Content-Type", contentType);
    if (dataPost) {		
        cc.log("sendHttp:POST:", url, dataPost);
        xhr.open("POST", url, true);            
        xhr.send(dataPost);
    } else {
        cc.log("sendHttp:GET:", url);
        xhr.open("GET", url, true);
        xhr.send();
    }        
}
