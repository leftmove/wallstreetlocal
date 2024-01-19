"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AlternatesMetadata = AlternatesMetadata;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function AlternatesMetadata({ alternates  }) {
    if (!alternates) return null;
    return /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, alternates.canonical ? /*#__PURE__*/ _react.default.createElement("link", {
        rel: "canonical",
        href: alternates.canonical.toString()
    }) : null, Object.entries(alternates.languages).map(([locale, url])=>url ? /*#__PURE__*/ _react.default.createElement("link", {
            key: locale,
            rel: "alternate",
            hrefLang: locale,
            href: url.toString()
        }) : null), alternates.media ? Object.entries(alternates.media).map(([media, url])=>url ? /*#__PURE__*/ _react.default.createElement("link", {
            key: media,
            rel: "alternate",
            media: media,
            href: url.toString()
        }) : null) : null, alternates.types ? Object.entries(alternates.types).map(([type, url])=>url ? /*#__PURE__*/ _react.default.createElement("link", {
            key: type,
            rel: "alternate",
            type: type,
            href: url.toString()
        }) : null) : null);
}

//# sourceMappingURL=alternate.js.map