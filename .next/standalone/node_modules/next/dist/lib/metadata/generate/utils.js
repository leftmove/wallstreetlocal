"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolveAsArrayOrUndefined = resolveAsArrayOrUndefined;
function resolveAsArrayOrUndefined(value) {
    if (typeof value === "undefined" || value === null) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value;
    }
    return [
        value
    ];
}

//# sourceMappingURL=utils.js.map