//web var gv = gv || {};

var ChatClient = cc.Class.extend({
    LOGTAG: "[ChatClient]",

    ctor: function () {
        this.tcpClient = fr.GsnClient.create();
        this.tcpClient.setFinishConnectListener(this.onConnected.bind(this));
        this.tcpClient.setDisconnectListener(this.onDisconnected.bind(this));
        this.tcpClient.setReceiveDataListener(this.onReceived.bind(this));

        this.packetFactory = new InPacketFactory();        
        this.packetFactory.addPacketMap(network.chatMap);        
        return true;
    },
    
    getNetwork: function () {
        return this.tcpClient;
    },

    connect: function () {
        if (this.isConnected)
            return;
        var serverInfo = FWClientConfig.environment.chatInfo;

        if (cc.sys.isNative) {
            this.serverHost = serverInfo.ip;
            this.serverPort = serverInfo.port;
			cc.log(this.LOGTAG, "Connect to server [CHAT]", this.serverHost + ":" + this.serverPort, "isSsl", false);
			this.tcpClient.connect(this.serverHost, this.serverPort);
        } else {
            this.serverHost = serverInfo.domain;
            this.serverPort = serverInfo.portWebSocket;            
			cc.log(this.LOGTAG, "Connect to server [CHAT]", this.serverHost + ":" + this.serverPort, "isSsl", !ZPLOGIN_SKIP_LOGIN);
			this.tcpClient.connect(this.serverHost, this.serverPort, !ZPLOGIN_SKIP_LOGIN);
        }
    },

    disconnect: function ()
    {
        var chatInfo = FWClientConfig.environment.chatInfo;
        cc.log(this.LOGTAG, "Disconnect to server chat", this.isConnected, chatInfo.host + ":" + chatInfo.port);

        if (!this.isConnected)
            return;
        
        this.isConnected = false;
        this.tcpClient.disconnect();        
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
            this.useReconect = true;
            this.timeWait = 0;            
            var packet = gv.chatClient.getOutPacket(network.chatBase.HandshakeRequest);
            packet.pack();
            gv.chatClient.getNetwork().send(packet);
            gv.poolObjects.push(packet);
        } else {
            this.isConnected = false;
            this.reconnect();            
        }
    },

    onDisconnected: function () {        
        cc.log(this.LOGTAG, "onDisconnected", "useReconect", this.useReconect);
        this.isConnected = false;        
        if (!this.useReconect)
            return;        
        this.reconnect();
    },
    
    useReconect : false,    
    timeWait : 0,    
    reconnect: function () {
        cc.log(this.LOGTAG, "Reconnect", "useReconect", this.useReconect);
        if (!this.useReconect)
            return;
        this.timeWait = Math.min(5000, this.timeWait + 1000);
        cc.log(this.LOGTAG, "Reconnect in:", this.timeWait);

        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(FWLoader.connectChat, this.timeWait);
    },

    onReceived: function (command, packet) {
        cc.log(this.LOGTAG, "onReceived", "command:", command, "packet: %j", packet);

        var inPacket = gv.chatClient.getInPacket(command, packet);        
        if (inPacket === null)
            cc.log(this.LOGTAG, "onReceived", "Unsupported command:", command);
            
        gv.poolObjects.push(packet);
    },
});


