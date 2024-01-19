"use strict";

exports.__esModule = true;
exports.default = exports.ReactReduxContext = void 0;

var _react = require("react");

const ContextKey = Symbol.for(`react-redux-context-${_react.version}`);
const gT = globalThis;

function getContext() {
  let realContext = gT[ContextKey];

  if (!realContext) {
    realContext = (0, _react.createContext)(null);

    if (process.env.NODE_ENV !== 'production') {
      realContext.displayName = 'ReactRedux';
    }

    gT[ContextKey] = realContext;
  }

  return realContext;
}

const ReactReduxContext = /*#__PURE__*/new Proxy({}, /*#__PURE__*/new Proxy({}, {
  get(_, handler) {
    const target = getContext(); // @ts-ignore

    return (_target, ...args) => Reflect[handler](target, ...args);
  }

}));
exports.ReactReduxContext = ReactReduxContext;
var _default = ReactReduxContext;
exports.default = _default;