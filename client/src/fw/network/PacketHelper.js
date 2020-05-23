const TYPE_END_OBJECT = 0;
const TYPE_BOOLEAN_TRUE = 1;
const TYPE_BOOLEAN_FALSE = 2;
const TYPE_BYTE = 3;
const TYPE_SHORT = 4;
const TYPE_INT = 5;
const TYPE_LONG = 6;
const TYPE_FLOAT = 7;
const TYPE_DOUBLE = 8;
const TYPE_STRING = 9;
const TYPE_OBJECT = 10;
const TYPE_ARRAY_BOOLEAN = 11;
const TYPE_ARRAY_BYTE = 12;
const TYPE_ARRAY_SHORT = 13;
const TYPE_ARRAY_INT = 14;
const TYPE_ARRAY_LONG = 15;
const TYPE_ARRAY_STRING = 16;
const TYPE_ARRAY_OBJECT = 17;
const TYPE_MAP_ITEM = 18;
const TYPE_ZERO = 19;
const TYPE_ARRAY_MAP_ITEM = 20;

var PacketHelper = {
	parseObject: function (inPacket) {
		var object = new Object();
		var key, type, value, len;
		FOR_LOOP:
			for (; ;) {
				type = inPacket.getByte();
				if (type == TYPE_END_OBJECT)
					break;

				key = inPacket.getByte();


				switch (type) {
					case TYPE_BOOLEAN_TRUE:
						value = true;
						break;
					case TYPE_BOOLEAN_FALSE:
						value = false;
						break;
					case TYPE_ZERO:
						value = 0;
						break;
					case TYPE_BYTE:
						value = inPacket.getByte();
						break;
					case TYPE_SHORT:
						value = inPacket.getShort();
						break;
					case TYPE_INT:
						value = inPacket.getInt();
						break;
					case TYPE_LONG:
						value = Number(inPacket.getLong());
						break;
					case TYPE_FLOAT:
						value = inPacket.getFloat();
						break;
					case TYPE_DOUBLE:
						value = inPacket.getDouble();
						break;
					case TYPE_STRING:
						value = inPacket.getString();
						break;
					case TYPE_OBJECT:
						value = this.parseObject(inPacket);
						break;
					case TYPE_ARRAY_BOOLEAN:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = inPacket.getByte() == 0 ? false : true;
						break;
					case TYPE_ARRAY_BYTE:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = inPacket.getByte();
						break;
					case TYPE_ARRAY_SHORT:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = inPacket.getShort();
						break;
					case TYPE_ARRAY_INT:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = inPacket.getInt();
						break;
					case TYPE_ARRAY_LONG:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = inPacket.getLong();
						break;
					case TYPE_ARRAY_STRING:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = inPacket.getString();
						break;
					case TYPE_ARRAY_OBJECT:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
							value[i] = this.parseObject(inPacket);
						break;
					case TYPE_MAP_ITEM:
						len = inPacket.getShort();
						value = new Object();
						for (var i = 0; i < len; i++)
							value[inPacket.getString()] = inPacket.getInt();
						break;
					case TYPE_ARRAY_MAP_ITEM:
						len = inPacket.getShort();
						value = new Array();
						for (var i = 0; i < len; i++)
						{
							var map = new Object();							
							var mapSize = inPacket.getShort();							
							for (var j = 0; j < mapSize; j++)
								map[inPacket.getString()] = inPacket.getInt();
							value[i] = map;
						}
						break;

					default:
						cc.log("!!!WARNING!!! Unknown type: " + type);
						break FOR_LOOP;
				}
				object[key] = value;
			}

		return object;
	},

	putKey: function (outPacket, key, type) {
		outPacket.putByte(type);
		outPacket.putByte(key);
	},

	markEndObject: function (outPacket) {
		outPacket.putByte(TYPE_END_OBJECT);
	},

	putByte: function (outPacket, key, v) {
		if (v == 0) {			
			this.putKey(outPacket, key, TYPE_ZERO);
		} else {
			this.putKey(outPacket, key, TYPE_BYTE);
			outPacket.putByte(v);
		}
	},

	putBoolean: function (outPacket, key, v) {
		if (v)
			this.putKey(outPacket, key, TYPE_BOOLEAN_TRUE);
		else
			this.putKey(outPacket, key, TYPE_BOOLEAN_FALSE);
	},

	putShort: function (outPacket, key, v) {
		if (v == 0) {			
			this.putKey(outPacket, key, TYPE_ZERO);
		} else {
			this.putKey(outPacket, key, TYPE_SHORT);
			outPacket.putShort(v);
		}
	},

	putInt: function (outPacket, key, v) {
		if (v == 0) {			
			this.putKey(outPacket, key, TYPE_ZERO);
		} else {
			this.putKey(outPacket, key, TYPE_INT);
			outPacket.putInt(v);
		}
	},

	putLong: function (outPacket, key, v) {
		if (v == 0) {			
			this.putKey(outPacket, key, TYPE_ZERO);
		} else {
			this.putKey(outPacket, key, TYPE_LONG);
			outPacket.putLong(v);
		}
	},

	putFloat: function (outPacket, key, v) {
		if (v == 0) {			
			this.putKey(outPacket, key, TYPE_ZERO);
		} else {
			this.putKey(outPacket, key, TYPE_FLOAT);
			outPacket.putFloat(v);
		}
	},

	putDouble: function (outPacket, key, v) {
		if (v == 0) {			
			this.putKey(outPacket, key, TYPE_ZERO);
		} else {
			this.putKey(outPacket, key, TYPE_DOUBLE);
			outPacket.putDouble(v);
		}
	},

	putString: function (outPacket, key, v) {
		this.putKey(outPacket, key, TYPE_STRING);
		if (!v)
			v = '';
		outPacket.putString(v);
	},

	putMapItem: function (outPacket, key, v) {
		this.putKey(outPacket, key, TYPE_MAP_ITEM);
		var len = Object.keys(v).length;
		outPacket.putShort(len);
		for (var k in v) {
			outPacket.putString(k);
			outPacket.putInt(v[k]);
		}
	},

	putByteArray: function (outPacket, key, v) {
		this.putKey(outPacket, key, TYPE_ARRAY_BYTE);
		var len = v.length;
		outPacket.putShort(len);
		for (var i = 0; i < len; i++)
			outPacket.putByte(v[i]);
	},
	
	putIntArray: function (outPacket, key, v) {
		this.putKey(outPacket, key, TYPE_ARRAY_INT);
		var len = v.length;
		outPacket.putShort(len);
		for (var i = 0; i < len; i++)
			outPacket.putInt(v[i]);
	},
	
	putClientCoin:function(outPacket)
	{
		this.putInt(outPacket, KEY_CLIENT_COIN, gv.userData.clientCoin);		
	}
};