"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Meta = Meta;
exports.ExtendMeta = ExtendMeta;
exports.MultiMeta = MultiMeta;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function Meta({ name , property , content  }) {
    if (typeof content !== "undefined" && content !== null) {
        return /*#__PURE__*/ _react.default.createElement("meta", Object.assign({}, name ? {
            name
        } : {
            property
        }, {
            content: typeof content === "string" ? content : content.toString()
        }));
    }
    return null;
}
function ExtendMeta({ content , namePrefix , propertyPrefix  }) {
    const keyPrefix = namePrefix || propertyPrefix;
    if (!content) return null;
    return /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, Object.entries(content).map(([k, v], index)=>{
        return typeof v === "undefined" ? null : /*#__PURE__*/ _react.default.createElement(Meta, Object.assign({
            key: keyPrefix + ":" + k + "_" + index
        }, propertyPrefix ? {
            property: propertyPrefix + ":" + k
        } : {
            name: namePrefix + ":" + k
        }, {
            content: typeof v === "string" ? v : v == null ? void 0 : v.toString()
        }));
    }));
}
function MultiMeta({ propertyPrefix , namePrefix , contents  }) {
    if (typeof contents === "undefined" || contents === null) {
        return null;
    }
    const keyPrefix = propertyPrefix || namePrefix;
    return /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, contents.map((content, index)=>{
        if (typeof content === "string" || typeof content === "number" || content instanceof URL) {
            return /*#__PURE__*/ _react.default.createElement(Meta, Object.assign({
                key: keyPrefix + "_" + index
            }, propertyPrefix ? {
                property: propertyPrefix
            } : {
                name: namePrefix
            }, {
                content: content
            }));
        } else {
            return /*#__PURE__*/ _react.default.createElement(ExtendMeta, {
                namePrefix: namePrefix,
                propertyPrefix: propertyPrefix,
                content: content
            });
        }
    }));
}

//# sourceMappingURL=meta.js.map