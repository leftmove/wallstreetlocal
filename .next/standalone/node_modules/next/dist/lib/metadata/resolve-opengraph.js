"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolveOpenGraph = resolveOpenGraph;
var _utils = require("./generate/utils");
const OgTypFields = {
    article: [
        "authors",
        "tags"
    ],
    song: [
        "albums",
        "musicians"
    ],
    playlist: [
        "albums",
        "musicians"
    ],
    radio: [
        "creators"
    ],
    video: [
        "actors",
        "directors",
        "writers",
        "tags"
    ],
    basic: [
        "emails",
        "phoneNumbers",
        "faxNumbers",
        "alternateLocale",
        "images",
        "audio",
        "videos", 
    ]
};
function getFieldsByOgType(ogType) {
    switch(ogType){
        case "article":
        case "book":
            return OgTypFields.article;
        case "music.song":
        case "music.album":
            return OgTypFields.song;
        case "music.playlist":
            return OgTypFields.playlist;
        case "music.radio_station":
            return OgTypFields.radio;
        case "video.movie":
        case "video.episode":
            return OgTypFields.video;
        default:
            return OgTypFields.basic;
    }
}
function resolveOpenGraph(openGraph) {
    const url = openGraph ? typeof openGraph.url === "string" ? new URL(openGraph.url) : openGraph.url : undefined;
    // TODO: improve typing
    const resolved = openGraph || {};
    function assignProps(og) {
        const ogType = og && "type" in og ? og.type : undefined;
        const keys = getFieldsByOgType(ogType);
        for (const k of keys){
            const key = k;
            if (key in og) {
                // TODO: fix typing inferring
                // @ts-ignore
                const value = (0, _utils).resolveAsArrayOrUndefined(og[key]);
                if (value != null) {
                    resolved[key] = value;
                }
            }
        }
    }
    if (openGraph) {
        assignProps(openGraph);
    }
    if (url) {
        resolved.url = url;
    }
    return resolved;
}

//# sourceMappingURL=resolve-opengraph.js.map