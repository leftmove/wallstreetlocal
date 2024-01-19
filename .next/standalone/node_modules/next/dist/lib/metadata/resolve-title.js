"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mergeTitle = mergeTitle;
function resolveTitleTemplate(template, title) {
    return template ? template.replace(/%s/g, title) : title;
}
function mergeTitle(source, stashedTemplate) {
    const { title  } = source;
    let resolved;
    const template = typeof source.title !== "string" && source.title && "template" in source.title ? source.title.template : null;
    if (typeof title === "string") {
        resolved = resolveTitleTemplate(stashedTemplate, title);
    } else if (title) {
        if ("default" in title) {
            resolved = resolveTitleTemplate(stashedTemplate, title.default);
        }
        if ("absolute" in title && title.absolute) {
            resolved = title.absolute;
        }
    }
    const target = source;
    if (source.title && typeof source.title !== "string") {
        const targetTitle = source.title;
        targetTitle.template = template;
        targetTitle.absolute = resolved || "";
    } else {
        target.title = {
            absolute: resolved || source.title || "",
            template
        };
    }
}

//# sourceMappingURL=resolve-title.js.map