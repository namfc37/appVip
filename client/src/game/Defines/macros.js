cc = cc || {};

cc.VEC2 = function () { return cc.p(0, 0) };
cc.VEC2_ONE = function () { return cc.p(1, 1) };

cc.ANCHOR_TOP_LEFT = function () { return cc.p(0, 1.0) };
cc.ANCHOR_TOP_CENTER = function () { return cc.p(0.5, 1.0) };
cc.ANCHOR_TOP_RIGHT = function () { return cc.p(1.0, 1.0) };

cc.ANCHOR_MIDDLE_LEFT = function () { return cc.p(0, 0.5) };
cc.ANCHOR_MIDDLE_RIGHT = function () { return cc.p(1.0, 0.5) };
cc.ANCHOR_CENTER = function () { return cc.p(0.5, 0.5) };

cc.ANCHOR_BOTTOM_LEFT = function () { return cc.p(0, 0) };
cc.ANCHOR_BOTTOM_CENTER = function () { return cc.p(0.5, 0) };
cc.ANCHOR_BOTTOM_RIGHT = function () { return cc.p(1.0, 0) };

cc.SPRITE_FRAME = function (name) { return new cc.Sprite("#" + name); };
cc.SPRITE_FILE = function (name) { return new cc.Sprite(name); };

cc.NODE_SIZE = function (node) { return node.getContentSize(); };

cc.PADD = function (lhs, rhs) { return cc.p(lhs.x + rhs.x, lhs.y + rhs.y) };
cc.PSUB = function (lhs, rhs) { return cc.p(lhs.x - rhs.x, lhs.y - rhs.y) };

cc.PLENGTH = function (vector) { return Math.sqrt(vector.x * vector.x + vector.y * vector.y) };

cc.formatStr = function () {

    var args = arguments;
    var l = args.length;
    if (l < 1)
        return "";

    var str = args[0];
    var needToFormat = true;
    if (typeof str === "object") {
        needToFormat = false;
    }

    for (var i = 1; i < l; ++i) {
        var arg = args[i];
        if (needToFormat) {
            while (true) {
                var result = null;
                if (typeof arg === "number") {
                    result = str.match(/(%d)|(%s)/);
                    if (result) {
                        str = str.replace(/(%d)|(%s)/, arg);
                        break;
                    }
                }
                if (typeof arg === "object") {
                    result = str.match(/(%j)|(%s)/);
                    if (result) {
                        str = str.replace(/(%j)|(%s)/, JSON.stringify(arg));
                        break;
                    }
                }
                result = str.match(/%s/);
                if (result)
                    str = str.replace(/%s/, arg);
                else
                    str += "    " + arg;
                break;
            }
        } else
            str += "    " + arg;
    }
    return str;
};