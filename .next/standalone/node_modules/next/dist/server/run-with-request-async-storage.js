"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.runWithRequestAsyncStorage = runWithRequestAsyncStorage;
var _appRouterHeaders = require("../client/components/app-router-headers");
var _appRender = require("./app-render");
function headersWithoutFlight(headers) {
    const newHeaders = {
        ...headers
    };
    for (const param of _appRouterHeaders.FLIGHT_PARAMETERS){
        delete newHeaders[param.toString().toLowerCase()];
    }
    return newHeaders;
}
function runWithRequestAsyncStorage(requestAsyncStorage, { req , res , renderOpts  }, callback) {
    const tryGetPreviewData = process.env.NEXT_RUNTIME === "edge" ? ()=>false : require("./api-utils/node").tryGetPreviewData;
    // Reads of this are cached on the `req` object, so this should resolve
    // instantly. There's no need to pass this data down from a previous
    // invoke, where we'd have to consider server & serverless.
    const previewData = renderOpts ? tryGetPreviewData(req, res, renderOpts.previewProps) : false;
    let cachedHeadersInstance;
    let cachedCookiesInstance;
    const store = {
        get headers () {
            if (!cachedHeadersInstance) {
                cachedHeadersInstance = new _appRender.ReadonlyHeaders(headersWithoutFlight(req.headers));
            }
            return cachedHeadersInstance;
        },
        get cookies () {
            if (!cachedCookiesInstance) {
                cachedCookiesInstance = new _appRender.ReadonlyRequestCookies({
                    headers: {
                        get: (key)=>{
                            if (key !== "cookie") {
                                throw new Error("Only cookie header is supported");
                            }
                            return req.headers.cookie;
                        }
                    }
                });
            }
            return cachedCookiesInstance;
        },
        previewData
    };
    return requestAsyncStorage.run(store, callback);
}

//# sourceMappingURL=run-with-request-async-storage.js.map