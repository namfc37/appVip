/**
 * Created by KienVN on 5/27/2015.
 */
var g_localization = null;
var FWLocalization = cc.Class.extend(
	{
		DEFAULT_DEVICE_LANGUAGE_CODE: "vn",
		ctor: function () {
			this._dataConfig = this._loadConfig();
		},
		_loadConfig: function () {

			var commonData = {};
			var fileName = "localize/config.json";
			commonData = cc.loader.getRes(fileName);
			if (commonData == null) {
				cc.log("Load localization config error");
			}
			return commonData;
		},
		loadDefaultLanguage: function () {
			var defaultLangID = this._dataConfig.defaultLanguageCode;			

			if (!defaultLangID) {
				defaultLangID = cc.sys.language;
				var isExistLang = false;
				for (var i in this._dataConfig.list) {
					var data = this._dataConfig.list[i];
					if (data.code == defaultLangID) {
						isExistLang = true;
						break;
					}
				}
				if (!isExistLang) {
					defaultLangID = this.DEFAULT_DEVICE_LANGUAGE_CODE;
				}
			}
			this.setCurrentLanguage(defaultLangID);
		},
		setCurrentLanguage: function (code) {
			for (var i = 0; i < this._dataConfig.list.length; i++) {
				var data = this._dataConfig.list[i];
				if (data.code == code) {
					if (this._currentLang != data) {
						this._currentLang = data;
						//clear
						// FontAtlasCache::purgeCachedData();

						FWClientConfig.updateResourceSearchPath();
						this._loadTextForCurrentLanguage();
					}
					return;
				}
			}
			cc.log("ERROR: FWLocalization::setCurrentLanguage: %s FALL!", code);
		},
		_loadTextForCurrentLanguage: function () {
			this._localizedStrings = {};
			cc.log(" folder:" + this._currentLang.folder);
			var contents = cc.loader.getRes(this.getPathFileLang(this._currentLang.folder));
			var lines = contents.split('\n');
			//cc.log("lines:" + lines);
			for (var i in lines) {
				var line = lines[i];
				if (line.indexOf("/*", 0) == -1 &&
					line.indexOf("//", 0) == -1 &&
					line.indexOf("*/", 0) == -1) //filter the valid string of one line
				{
					var validPos = line.indexOf('=', 0);
					if (validPos != -1) {
						var keyStr = line.substring(0, validPos - 1);
						// get valid string
						var subStr = line.substring(validPos + 1, line.length - 1);

						//trim space
						keyStr = keyStr.slice(this.findFirstNotOf(keyStr, " \t"));
						keyStr = keyStr.slice(0, this.findLastNotOf(keyStr, " \t") + 1);

						subStr = subStr.slice(this.findFirstNotOf(subStr, " \t"));
						subStr = subStr.slice(0, this.findLastNotOf(subStr, " \t") + 1);

						//trim \"
						keyStr = keyStr.slice(this.findFirstNotOf(keyStr, "\""));
						keyStr = keyStr.slice(0, this.findLastNotOf(keyStr, "\"") + 1);
						var findPosition = subStr.indexOf('\"', 0);
						subStr = subStr.slice(this.findFirstNotOf(subStr, "\""));

						//trim ; character and last \" character
						subStr = subStr.slice(0, this.findLastNotOf(subStr, ";") + 1);
						subStr = subStr.slice(0, this.findLastNotOf(subStr, "\"") + 1);

						//replace line feed with \n
						subStr = subStr.replace(/\\n/g, "\n");

						this._localizedStrings[keyStr] = subStr;
					}
				}
			}

		},
		getText: function (key) {
			if (key in this._localizedStrings) {
				return this._localizedStrings[key];
			}
			//cc.log("---- FWLocalization text not found: " + key);
			return key;
		},
		getCurrentLanguageName: function () {
			return this._currentLang.name;
		},
		getCurrentLanguageCode: function () {
			return this._currentLang.code;
		},
		getCountOfLanguages: function () {
			return this._dataConfig.list.length;
		},
		getLanguageNameAt: function (idx) {
			return this._dataConfig.list[idx].name;
		},
		getLanguageCodeAt: function (idx) {
			return this._dataConfig.list[idx].code;
		},
		getPathFileLang: function (code) {
			cc.log("code:" + code);
			return "localize/" + code + ".txt";
		},
		getFolderSearchPath: function () {
			var listPath = [];
			var folderFont = "font/";
			folderFont = folderFont + this._currentLang.folder;
			listPath.push(FWClientConfig.getPathFromResource(folderFont));

			var folderGraphics = "";
			folderGraphics = folderGraphics + this._currentLang.folder;
			listPath.push(folderGraphics);

			return listPath;
		},
		findLastNotOf: function (strSource, text) {
			var sourceLen = strSource.length;
			var strLen = text.length;
			if (strLen > sourceLen) {
				return -1;
			}
			var i = sourceLen - 1;
			while (i >= 0) {
				var result = false;
				for (var k = 0; k < strLen; k++) {
					if (text[k] == strSource[i]) {
						result = true;
						break;
					}
				}
				if (result) {
					i -= 1;
				}
				else {
					return i;
				}
			}
			return -1;
		},
		findFirstNotOf: function (strSource, text) {
			var sourceLen = strSource.length;
			var strLen = text.length;
			var i = 0;
			while (i < sourceLen - 1) {
				var result = false;
				for (var k = 0; k < strLen; k++) {
					if (text[k] == strSource[i]) {
						result = true;
						break;
					}
				}
				if (result) {
					i += 1;
				} else {
					return i;
				}

			}
			return -1;
		}
	}
);

FWLocalization.getInstance = function () {
	if (g_localization == null) {
		g_localization = new FWLocalization();
		g_localization.loadDefaultLanguage();
	}
	return g_localization;
};

FWLocalization.text = function (key, searchStr, replaceStr) {
	var returnText = FWLocalization.getInstance().getText(key);
	if (searchStr && replaceStr) {
		return returnText.replace(/searchStr/g, replaceStr);
	}
	return returnText;
};

FWLocalization.ccsText = function (text) {
	if (text.indexOf("lang_") == 0)
		return FWLocalization.text(text);
	return text;
};