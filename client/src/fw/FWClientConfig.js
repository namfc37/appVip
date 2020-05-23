/**
 * Created by KienVN on 5/27/2015.
 */

FWClientConfig = {
        _selectResource:null,
        _isFirstSetSearchPath:true,
        scriptVersion:'',
        socialType:'',
        environment:null,
        init:function()
        {
            var self = this;
            var fileName = "config.json";
            this._configData = cc.loader.getRes(fileName);
            if (this._configData == null) {
                cc.log("Load client config error");
            }

            fr.portalState.init();
            this.scriptVersion = this.getScriptVersion();
            if (fr && fr.NativePortal)
            {
                if(cc.sys.isNative) //native
                    this.socialType = fr.NativePortal.getInstance().getSocialType();
                else if(fr.NativePortal) //web portal
                    this.socialType = fr.NativePortal.getSocialType();
            }

            this.environment = cc.loader.getRes("environment.json");		
        },
        detectResourceFromScreenSize:function()
        {
            var frameSize = cc.view.getFrameSize();
			
            var wScale = frameSize.width / this._configData.widthDesign;
            var hScale = frameSize.height / this._configData.heightDesign;
            var frameScale = wScale < hScale ? wScale : hScale;
            var m_ImageScale;
            var list = this._configData.resources;
            //tinh imageScale, chon resource anh
            for (var i = 0; i< list.length;i++){

                var s = list[i];
                var  scale = frameScale/s.scale;
                if ((1 / scale >= 1) || (i == list.length - 1 && 1 / scale <= 1)){
                    m_ImageScale = scale;
                    this._selectResource = list[i];
                    break;
                }
                cc.log("sds: %d, %d", i, list.length);
                if (i < list.length - 1){
                    var nextSize = list[i + 1];
                    var nextScale = frameScale / nextSize.scale;
                    if (1 / nextScale>1){
                        var avgScale = 1 / scale + (1 / nextScale - 1 / scale)*this._configData.selectScale;
                        if (avgScale>1){
                            m_ImageScale = scale;
                            this._selectResource = list[i];
                        }
                        else{
                            m_ImageScale = nextScale;
                            this._selectResource = list[i + 1];
                        }
                        break;
                    }
                }
            }

        },
        updateResourceSearchPath:function()
        {
            if(!cc.sys.isNative)
            {
                return;
            }
            var listSearch = [];            
            var updatePath = fr.NativeService.getFolderUpdateAssets();
            var listSearchOfLang = FWLocalization.getInstance().getFolderSearchPath();
            cc.log("### updatePath: " + updatePath);            
            
            listSearch.push(updatePath);
            listSearch.push(updatePath + "/res");
            listSearch.push(updatePath + "/res/common");
            listSearch.push(updatePath + "/res/sound");
            listSearch.push(updatePath + "/" + this._selectResource.folder);
            for (var i in listSearchOfLang)
                listSearch.push(updatePath + "/" + listSearchOfLang[i]);

            //multiscreen
            listSearch.push("res");
            listSearch.push("res/common");
            listSearch.push("res/sound");
            
            //only use to dev                        
            listSearch.push(this._selectResource.folder);
            
            //localization            
            for (var i in listSearchOfLang)
                listSearch.push(listSearchOfLang[i]);

            //original
            if (this._isFirstSetSearchPath)
            {
                this._originPath = jsb.fileUtils.getSearchPaths();
                this._isFirstSetSearchPath = false;
            }
            for (var i in this._originPath)
            {
                listSearch.push(this._originPath[i]);
            }
            jsb.fileUtils.setSearchPaths(listSearch);
        },
        getPathFromResource:function(path)
        {
            var newPath = this._selectResource.folder + "/" + path;
            return newPath;
        },
        getResourceScale:function()
        {
            return this._selectResource.scale;
        },
        getDesignResolutionSize:function()
        {
            return cc.size(this._configData.widthDesign, this._configData.heightDesign);
        },
		getVersion:function()
        {
            return this._configData.version;
        },
        getScriptVersion:function() {
			
			//web
			if(!cc.sys.isNative)
            {
                var versionInfo = cc.loader.getRes("version.json");
                if (versionInfo == null) {
                    cc.log("script_version", "load error");
                    return '0';
                } else {
                    cc.log("script_version", versionInfo.script_version);
                    return versionInfo.script_version;
                }
            }
			
            var version;

            version = this.getScriptVersionByPath(fr.NativeService.getFolderUpdateAssets() + '/project.manifest');
            if (version != null)
                return version;

            version = this.getScriptVersionByPath('project.manifest');
            if (version != null)
                return version;

            version = this.getScriptVersionByPath(fr.NativeService.getFolderUpdateAssets() + '/project.dat');
            if (version != null)
                return version;

            version = this.getScriptVersionByPath('project.dat');
            if (version != null)
                return version;            
            
            return '0';
        },
        getScriptVersionByPath:function(path) { 
            var version = null;
            var data = jsb.fileUtils.getStringFromFile(path);
            cc.log("getScriptVersion", "path", path, data);

            if (data != undefined && data != "") {
                try {                
                    version = JSON.parse(data).version;
                } catch(e) {
                }
            }  
            return version;
        },
        isBuildLive:function(){
            if (this.environment && this.environment.build)
                return this.environment.build == 'release';
            return false;
        }        
    };
    