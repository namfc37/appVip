//web var gv = gv || {};
gv.CONTROLLER_ID = {
    SPECIAL_CONTROLLER: 0
};

var GameClient = cc.Class.extend({
    LOGTAG: "[GameClient]",

    ctor: function () {

		// replaced by ZPLogin
        //this.loadConfig();

        this.tcpClient = fr.GsnClient.create();
        this.tcpClient.setFinishConnectListener(this.onConnected.bind(this));
        this.tcpClient.setDisconnectListener(this.onDisconnected.bind(this));
        this.tcpClient.setReceiveDataListener(this.onReceived.bind(this));

        this.receivePacketSignal = new signals.Signal();
        this.packetFactory = new InPacketFactory();

        return true;
    },
    
    /*loadConfig: function () {
        
        var fileName = "ipConfig.json";
        var jsonData = cc.loader.getRes(fileName);
        if (jsonData == null) {
            cc.log(this.LOGTAG, "Load ip config error");
        } else {

            this.serverHost = jsonData.server;
            this.serverPort = jsonData.port;

            if (fr.platformWrapper.getOsName() === "Win32")
            {
                this.serverHost = "127.0.0.1";
                this.serverPort = 8001;
            }
        }
    },*/
    
    getNetwork: function () {
        return this.tcpClient;
    },

    connect: function () {
		var serverInfo = ZPLogin.getNextServerInfo();	
        
        if (cc.sys.isNative) {
            this.serverHost = serverInfo.ip;
            this.serverPort = serverInfo.port;
			cc.log(this.LOGTAG, "Connect to server [GAME]", this.serverHost + ":" + this.serverPort, "isSsl", false);
			this.tcpClient.connect(this.serverHost, this.serverPort);
        } else {
            this.serverHost = serverInfo.domain;
            this.serverPort = serverInfo.portWebSocket;            
			cc.log(this.LOGTAG, "Connect to server [GAME]", this.serverHost + ":" + this.serverPort, "isSsl", !ZPLOGIN_SKIP_LOGIN);
			this.tcpClient.connect(this.serverHost, this.serverPort, !ZPLOGIN_SKIP_LOGIN);
        }
    },

    sendPacket: function (packet) {
        this.getNetwork().send(packet);
        gv.poolObjects.push(packet);
    },

    getInPacket: function (command, packet) {
        return this.packetFactory.createPacket(command, packet);
    },

    getOutPacket: function (objClass) {
        var packet = gv.poolObjects.get(objClass);
        packet.reset();
        return packet;
    },

    onConnected: function (success) {
        cc.log(this.LOGTAG, "onConnected:", this.serverHost + ":" + this.serverPort, "success:", success);
        if (success) {            
            this.isConnected = true;
            this.timeWait = 0;
            if (this.popupReconect)
				this.popupReconect.hide ();

            var packet = gv.gameClient.getOutPacket(network.base.HandshakeRequest);
            packet.pack();
            gv.gameClient.getNetwork().send(packet);
            gv.poolObjects.push(packet);
			FWUtils.disableAllTouches(false); // jira#5585
        } else {
			FWUtils.disableAllTouches(); // jira#5585
            this.isConnected = false;
            this.reconnect();            
        }
    },

    onDisconnected: function () {        
        cc.log(this.LOGTAG, "onDisconnected", "isKicked", this.isKicked);
        this.isConnected = false;
        if (this.isKicked)
            return;        
        if (Game.gameScene && cc.sys.isNative) // web: bug: cannot touch anything after reconnecting
            this.popupReconect = gv.miniPopup.showDisconnect();
		FWUtils.disableAllTouches(); // jira#5585
        this.reconnect();
    },
    
    isKicked : false,    
    timeWait : 0,    
    reconnect: function () {
        cc.log(this.LOGTAG, "Reconnect", "isKicked", this.isKicked);
        if (this.isKicked)
            return;
        this.timeWait = Math.min(5000, this.timeWait + 1000);
        cc.log(this.LOGTAG, "Reconnect in:", this.timeWait);

        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(FWLoader.connectServer, this.timeWait);
    },

    onReceived: function (command, packet) {
        cc.log(this.LOGTAG, "onReceived", "command:", command, "packet: %j", packet);

        var inPacket = gv.gameClient.getInPacket(command, packet);
        if (inPacket === null)
            return;

        this.onReceivedPacket(command, inPacket);
        gv.poolObjects.push(packet);
    },

    onReceivedPacket: function (command, packet) {
        this.receivePacketSignal.dispatch(command, packet);
    }
});