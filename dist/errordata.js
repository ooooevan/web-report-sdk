"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromiseErrorData = exports.getErrorData = exports.PromiseErrorData = exports.ErrorData = exports.Data = exports.DataType = void 0;
/**数据分类 */
var DataType;
(function (DataType) {
    /** 错误 */
    DataType[DataType["error"] = 0] = "error";
    /** 页面性能 */
    DataType[DataType["performance"] = 1] = "performance";
    /** 自定义事件 */
    DataType[DataType["track"] = 2] = "track";
    /** 页面访问信息 */
    DataType[DataType["page"] = 3] = "page";
})(DataType = exports.DataType || (exports.DataType = {}));
/**基础数据类 */
var Data = /** @class */ (function () {
    function Data(info) {
    }
    return Data;
}());
exports.Data = Data;
var ErrorData = /** @class */ (function (_super) {
    __extends(ErrorData, _super);
    function ErrorData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ErrorData;
}(Data));
exports.ErrorData = ErrorData;
var PromiseErrorData = /** @class */ (function (_super) {
    __extends(PromiseErrorData, _super);
    function PromiseErrorData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PromiseErrorData;
}(Data));
exports.PromiseErrorData = PromiseErrorData;
/**获取data数据 */
var getErrorData = function (data) {
    return new ErrorData(__assign(__assign({}, data), { type: DataType.error }));
};
exports.getErrorData = getErrorData;
var getPromiseErrorData = function (data) {
    return new PromiseErrorData(__assign(__assign({}, data), { type: DataType.error }));
};
exports.getPromiseErrorData = getPromiseErrorData;
