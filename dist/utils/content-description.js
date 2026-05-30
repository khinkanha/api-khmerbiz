"use strict";
// Parse the polymorphic Content.description JSON per content type
// Content types: 0=Article, 1=Photo, 2=Video, 3=Document, 4=News, 5=Map
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDescription = parseDescription;
exports.parseArticleDescription = parseArticleDescription;
exports.parseNewsDescription = parseNewsDescription;
exports.parseMapDescription = parseMapDescription;
exports.stringifyDescription = stringifyDescription;
function parseDescription(raw) {
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return { title: raw, description: '' };
    }
}
function parseArticleDescription(raw) {
    return parseDescription(raw);
}
function parseNewsDescription(raw) {
    return parseDescription(raw);
}
function parseMapDescription(raw) {
    return parseDescription(raw);
}
function stringifyDescription(data) {
    return JSON.stringify(data);
}
//# sourceMappingURL=content-description.js.map