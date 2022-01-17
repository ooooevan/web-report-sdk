"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookies = exports.getElementPath = void 0;
var config_1 = require("./config");
/** 获取元素路径 */
var getElementPath = function (ePath) {
    var paths = [];
    for (var i = 0; i < ePath.length; i++) {
        var p = ePath[i];
        if (!p.tagName)
            break;
        var tag = p.tagName.toLowerCase();
        if (p.id) {
            paths.unshift(tag + "#" + p.id);
        }
        else if (p.classList.length) {
            var cls = [].reduce.call(p.classList, function (cls, c) { return cls + "." + c; }, '');
            paths.unshift("" + tag + cls);
        }
        else {
            paths.unshift("" + tag);
        }
    }
    return paths;
};
exports.getElementPath = getElementPath;
/** 获取自身cookies */
function getCookies() {
    var cookies = {};
    document.cookie.split(/;\s?/).forEach(function (item) {
        if (item.startsWith(config_1.COOKIE_PREFIX)) {
            var kv = item.split('=');
            cookies[kv[0]] = kv[1];
        }
    });
}
exports.getCookies = getCookies;
