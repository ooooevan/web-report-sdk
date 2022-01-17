"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errordata_1 = require("./errordata");
var utils_1 = require("./utils");
window.addEventListener('error', function (e) {
    if (e.target instanceof HTMLElement) {
        // 资源加载错误
        var ePath = e.path || e.composedPath() || [];
        var paths = utils_1.getElementPath(ePath);
    }
    else {
        // js运行时错误
        var info = {
            /*错误文件名*/
            filename: e.filename,
            /*错误信息*/
            message: e.message,
            /*错误行列*/
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error.stack,
        };
    }
}, true);
window.addEventListener('unhandledrejection', function (e) {
    // promise错误
    var info = new errordata_1.PromiseErrorData({});
    if (typeof e.reason === 'string') {
        //reject
        info.reason = e.reason;
    }
    else {
        // throw error
        info.reason = e.reason;
        info.stack = e.reason.stack;
        info.message = e.reason.message;
    }
});
