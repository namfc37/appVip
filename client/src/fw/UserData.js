/**
 * Created by KienVN on 10/19/2015.
 */
var storage = storage || cc.sys.localStorage;


fr.UserData = {

    getString: function (key, defaultValue) {
        var val = cc.sys.localStorage.getItem(key);
        if(this.isInvalid(val))
            return defaultValue;
        else{
            return val;
        }
    },

    setString:function(key, value) {
        cc.sys.localStorage.setItem(key, value);
    },

    getNumber:function(key, defaultValue) {
        var val = cc.sys.localStorage.getItem(key);
        if(this.isInvalid(val))
            return defaultValue;
        else
            return Number(val);
    },

    setNumber:function(key, value) {
        cc.sys.localStorage.setItem(key, value);
    },

    getBoolean:function(key, defaultValue) {
        var val = cc.sys.localStorage.getItem(key);
        if(this.isInvalid(val))
            return defaultValue;
        else{
            return val == 1;
        }

    },

    setBoolean:function(key, value) {
        var numVal = value ? 1 : 0;
        cc.sys.localStorage.setItem(key, numVal);
    },
    isInvalid:function(val)
    {
        return _.isNull(val)|| _.isNaN(val) || _.isEmpty(val);
    }
};