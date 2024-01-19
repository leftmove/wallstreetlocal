"use strict";
exports.id = 676;
exports.ids = [676];
exports.modules = {

/***/ 676:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["default"] = isError;
exports.getProperError = getProperError;
var _isPlainObject = __webpack_require__(8524);
function isError(err) {
    return typeof err === "object" && err !== null && "name" in err && "message" in err;
}
function getProperError(err) {
    if (isError(err)) {
        return err;
    }
    if (false) {}
    return new Error((0, _isPlainObject).isPlainObject(err) ? JSON.stringify(err) : err + "");
}

//# sourceMappingURL=is-error.js.map

/***/ })

};
;