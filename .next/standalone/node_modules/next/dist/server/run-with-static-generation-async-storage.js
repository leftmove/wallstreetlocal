"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.runWithStaticGenerationAsyncStorage = runWithStaticGenerationAsyncStorage;
function runWithStaticGenerationAsyncStorage(staticGenerationAsyncStorage, { pathname , renderOpts  }, callback) {
    /**
   * Rules of Static & Dynamic HTML:
   *
   *    1.) We must generate static HTML unless the caller explicitly opts
   *        in to dynamic HTML support.
   *
   *    2.) If dynamic HTML support is requested, we must honor that request
   *        or throw an error. It is the sole responsibility of the caller to
   *        ensure they aren't e.g. requesting dynamic HTML for an AMP page.
   *
   * These rules help ensure that other existing features like request caching,
   * coalescing, and ISR continue working as intended.
   */ const isStaticGeneration = renderOpts.supportsDynamicHTML !== true && !renderOpts.isBot;
    const store = {
        isStaticGeneration,
        pathname,
        incrementalCache: renderOpts.incrementalCache,
        isRevalidate: renderOpts.isRevalidate
    };
    return staticGenerationAsyncStorage.run(store, callback);
}

//# sourceMappingURL=run-with-static-generation-async-storage.js.map