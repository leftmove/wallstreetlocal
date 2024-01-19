"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolveMetadata = resolveMetadata;
exports.resolveFileBasedMetadataForLoader = resolveFileBasedMetadataForLoader;
var _defaultMetadata = require("./default-metadata");
var _resolveOpengraph = require("./resolve-opengraph");
var _resolveTitle = require("./resolve-title");
var _utils = require("./generate/utils");
const viewPortKeys = {
    width: "width",
    height: "height",
    initialScale: "initial-scale",
    minimumScale: "minimum-scale",
    maximumScale: "maximum-scale",
    viewportFit: "viewport-fit"
};
const resolveViewport = (viewport)=>{
    let resolved = null;
    if (typeof viewport === "string") {
        resolved = viewport;
    } else if (viewport) {
        resolved = "";
        for(const viewportKey_ in viewPortKeys){
            const viewportKey = viewportKey_;
            if (viewport[viewportKey]) {
                if (resolved) resolved += ", ";
                resolved += `${viewPortKeys[viewportKey]}=${viewport[viewportKey]}`;
            }
        }
    }
    return resolved;
};
const resolveVerification = (verification)=>{
    const google = (0, _utils).resolveAsArrayOrUndefined(verification == null ? void 0 : verification.google);
    const yahoo = (0, _utils).resolveAsArrayOrUndefined(verification == null ? void 0 : verification.yahoo);
    let other;
    if (verification == null ? void 0 : verification.other) {
        other = {};
        for(const key in verification.other){
            const value = (0, _utils).resolveAsArrayOrUndefined(verification.other[key]);
            if (value) other[key] = value;
        }
    }
    return {
        google,
        yahoo,
        other
    };
};
function isStringOrURL(icon) {
    return typeof icon === "string" || icon instanceof URL;
}
function resolveIcon(icon) {
    if (isStringOrURL(icon)) return {
        url: icon
    };
    else if (Array.isArray(icon)) return icon;
    return icon;
}
const IconKeys = [
    "icon",
    "shortcut",
    "apple",
    "other"
];
const TwitterBasicInfoKeys = [
    "site",
    "siteId",
    "creator",
    "creatorId",
    "description", 
];
const resolveIcons = (icons)=>{
    if (!icons) {
        return null;
    }
    const resolved = {};
    if (Array.isArray(icons)) {
        resolved.icon = icons.map(resolveIcon).filter(Boolean);
    } else if (isStringOrURL(icons)) {
        resolved.icon = [
            resolveIcon(icons)
        ];
    } else {
        for (const key of IconKeys){
            const values = (0, _utils).resolveAsArrayOrUndefined(icons[key]);
            if (values) resolved[key] = values.map(resolveIcon);
        }
    }
    return resolved;
};
const resolveAppleWebApp = (appWebApp)=>{
    var ref;
    if (!appWebApp) return null;
    if (appWebApp === true) {
        return {
            capable: true
        };
    }
    const startupImages = (ref = (0, _utils).resolveAsArrayOrUndefined(appWebApp.startupImage)) == null ? void 0 : ref.map((item)=>typeof item === "string" ? {
            url: item
        } : item);
    return {
        capable: "capable" in appWebApp ? !!appWebApp.capable : true,
        title: appWebApp.title || null,
        startupImage: startupImages || null,
        statusBarStyle: appWebApp.statusBarStyle || "default"
    };
};
const resolveTwitter = (twitter)=>{
    var ref;
    if (!twitter) return null;
    const resolved = {
        title: twitter.title
    };
    for (const infoKey of TwitterBasicInfoKeys){
        resolved[infoKey] = twitter[infoKey] || null;
    }
    resolved.images = (ref = (0, _utils).resolveAsArrayOrUndefined(twitter.images)) == null ? void 0 : ref.map((item)=>{
        if (isStringOrURL(item)) return {
            url: item.toString()
        };
        else {
            return {
                url: item.url.toString(),
                alt: item.alt
            };
        }
    });
    if ("card" in twitter) {
        resolved.card = twitter.card;
        switch(twitter.card){
            case "player":
                {
                    // @ts-ignore
                    resolved.players = (0, _utils).resolveAsArrayOrUndefined(twitter.players) || [];
                    break;
                }
            case "app":
                {
                    // @ts-ignore
                    resolved.app = twitter.app || {};
                    break;
                }
            default:
                break;
        }
    } else {
        resolved.card = "summary";
    }
    return resolved;
};
const resolveAppLinks = (appLinks)=>{
    if (!appLinks) return null;
    for(const key in appLinks){
        // @ts-ignore // TODO: type infer
        appLinks[key] = (0, _utils).resolveAsArrayOrUndefined(appLinks[key]);
    }
    return appLinks;
};
const resolveRobotsValue = (robots)=>{
    if (!robots) return null;
    if (typeof robots === "string") return robots;
    const values = [];
    if (robots.index) values.push("index");
    else if (typeof robots.index === "boolean") values.push("noindex");
    if (robots.follow) values.push("follow");
    else if (typeof robots.follow === "boolean") values.push("nofollow");
    if (robots.noarchive) values.push("noarchive");
    if (robots.nosnippet) values.push("nosnippet");
    if (robots.noimageindex) values.push("noimageindex");
    if (robots.nocache) values.push("nocache");
    return values.join(", ");
};
const resolveRobots = (robots)=>{
    if (!robots) return null;
    return {
        basic: resolveRobotsValue(robots),
        googleBot: typeof robots !== "string" ? resolveRobotsValue(robots.googleBot) : null
    };
};
// Merge the source metadata into the resolved target metadata.
function merge(target, source, templateStrings) {
    for(const key_ in source){
        const key = key_;
        switch(key){
            case "title":
                {
                    if (source.title) {
                        target.title = source.title;
                        (0, _resolveTitle).mergeTitle(target, templateStrings.title);
                    }
                    break;
                }
            case "openGraph":
                {
                    if (typeof source.openGraph !== "undefined") {
                        target.openGraph = (0, _resolveOpengraph).resolveOpenGraph(source.openGraph);
                        if (source.openGraph) {
                            (0, _resolveTitle).mergeTitle(target.openGraph, templateStrings.openGraph);
                        }
                    } else {
                        target.openGraph = null;
                    }
                    break;
                }
            case "twitter":
                {
                    target.twitter = resolveTwitter(source.twitter);
                    if (target.twitter) {
                        (0, _resolveTitle).mergeTitle(target.twitter, templateStrings.twitter);
                    }
                    break;
                }
            case "verification":
                target.verification = resolveVerification(source.verification);
                break;
            case "viewport":
                {
                    target.viewport = resolveViewport(source.viewport);
                    break;
                }
            case "icons":
                {
                    target.icons = resolveIcons(source.icons);
                    break;
                }
            case "appleWebApp":
                target.appleWebApp = resolveAppleWebApp(source.appleWebApp);
                break;
            case "appLinks":
                target.appLinks = resolveAppLinks(source.appLinks);
                break;
            case "robots":
                {
                    target.robots = resolveRobots(source.robots);
                    break;
                }
            case "archives":
            case "assets":
            case "bookmarks":
            case "keywords":
            case "authors":
                {
                    // FIXME: type inferring
                    // @ts-ignore
                    target[key] = (0, _utils).resolveAsArrayOrUndefined(source[key]) || null;
                    break;
                }
            // directly assign fields that fallback to null
            case "applicationName":
            case "description":
            case "generator":
            case "themeColor":
            case "creator":
            case "publisher":
            case "category":
            case "classification":
            case "referrer":
            case "colorScheme":
            case "itunes":
            case "alternates":
            case "formatDetection":
            case "other":
                // @ts-ignore TODO: support inferring
                target[key] = source[key] || null;
                break;
            default:
                break;
        }
    }
}
async function resolveMetadata(metadataItems) {
    const resolvedMetadata = (0, _defaultMetadata).createDefaultMetadata();
    let committedTitleTemplate = null;
    let committedOpenGraphTitleTemplate = null;
    let committedTwitterTitleTemplate = null;
    let lastLayer = 0;
    // from root layout to page metadata
    for(let i = 0; i < metadataItems.length; i++){
        const item = metadataItems[i];
        const isLayout = item.type === "layout";
        const isPage = item.type === "page";
        if (isLayout || isPage) {
            let layerMod = await item.mod();
            // Layer is a client component, we just skip it. It can't have metadata
            // exported. Note that during our SWC transpilation, it should check if
            // the exports are valid and give specific error messages.
            if ("$$typeof" in layerMod && layerMod.$$typeof === Symbol.for("react.module.reference")) {
                continue;
            }
            if (layerMod.metadata && layerMod.generateMetadata) {
                throw new Error(`A ${item.type} is exporting both metadata and generateMetadata which is not supported. If all of the metadata you want to associate to this ${item.type} is static use the metadata export, otherwise use generateMetadata. File: ` + item.path);
            }
            // If we resolved all items in this layer, commit the stashed titles.
            if (item.layer >= lastLayer) {
                var ref, ref1, ref2, ref3, ref4;
                committedTitleTemplate = ((ref = resolvedMetadata.title) == null ? void 0 : ref.template) || null;
                committedOpenGraphTitleTemplate = ((ref1 = resolvedMetadata.openGraph) == null ? void 0 : (ref2 = ref1.title) == null ? void 0 : ref2.template) || null;
                committedTwitterTitleTemplate = ((ref3 = resolvedMetadata.twitter) == null ? void 0 : (ref4 = ref3.title) == null ? void 0 : ref4.template) || null;
                lastLayer = item.layer;
            }
            if (layerMod.metadata) {
                merge(resolvedMetadata, layerMod.metadata, {
                    title: committedTitleTemplate,
                    openGraph: committedOpenGraphTitleTemplate,
                    twitter: committedTwitterTitleTemplate
                });
            } else if (layerMod.generateMetadata) {
                merge(resolvedMetadata, await layerMod.generateMetadata(// TODO: Rewrite this to pass correct params and resolving metadata value.
                {}, Promise.resolve(resolvedMetadata)), {
                    title: committedTitleTemplate,
                    openGraph: committedOpenGraphTitleTemplate,
                    twitter: committedTwitterTitleTemplate
                });
            }
        }
    }
    return resolvedMetadata;
}
async function resolveFileBasedMetadataForLoader(_layer, _dir) {
    let metadataCode = "";
    // const files = await fs.readdir(path.normalize(dir))
    // for (const file of files) {
    //   // TODO: Get a full list and filter out directories.
    //   if (file === 'icon.svg') {
    //     metadataCode += `{
    //       type: 'icon',
    //       layer: ${layer},
    //       path: ${JSON.stringify(path.join(dir, file))},
    //     },`
    //   } else if (file === 'icon.jsx') {
    //     metadataCode += `{
    //       type: 'icon',
    //       layer: ${layer},
    //       mod: () => import(/* webpackMode: "eager" */ ${JSON.stringify(
    //         path.join(dir, file)
    //       )}),
    //       path: ${JSON.stringify(path.join(dir, file))},
    //     },`
    //   }
    // }
    return metadataCode;
}

//# sourceMappingURL=resolve-metadata.js.map